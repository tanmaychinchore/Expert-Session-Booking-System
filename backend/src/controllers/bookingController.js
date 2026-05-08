import mongoose from "mongoose";
import { io } from "../server.js";
import { Booking } from "../models/Booking.js";
import { Expert } from "../models/Expert.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
const allowedStatuses = ["Pending", "Confirmed", "Completed"];

const normalizeBookingInput = (body) => ({
  expert: body.expert,
  name: body.name?.trim(),
  email: body.email?.trim().toLowerCase(),
  phone: body.phone?.trim(),
  date: body.date?.trim(),
  timeSlot: body.timeSlot?.trim(),
  notes: body.notes?.trim() || "",
});

const validateBookingInput = (booking) => {
  const errors = {};

  if (!booking.expert || !mongoose.Types.ObjectId.isValid(booking.expert)) {
    errors.expert = "Valid expert id is required";
  }

  if (!booking.name || booking.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!booking.email || !emailRegex.test(booking.email)) {
    errors.email = "Valid email is required";
  }

  if (!booking.phone || !phoneRegex.test(booking.phone)) {
    errors.phone = "Valid phone number is required";
  }

  if (!booking.date) {
    errors.date = "Date is required";
  }

  if (!booking.timeSlot) {
    errors.timeSlot = "Time slot is required";
  }

  if (booking.notes.length > 500) {
    errors.notes = "Notes cannot exceed 500 characters";
  }

  return errors;
};

const ensureSlotExists = async ({ expert, date, timeSlot }) => {
  const expertDoc = await Expert.findOne({
    _id: expert,
    availableSlots: {
      $elemMatch: {
        date,
        slots: timeSlot,
      },
    },
  });

  return expertDoc;
};

export const createBooking = async (req, res, next) => {
  try {
    const bookingInput = normalizeBookingInput(req.body);
    const errors = validateBookingInput(bookingInput);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const expert = await ensureSlotExists(bookingInput);

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert or selected time slot not found",
      });
    }

    const booking = await Booking.create(bookingInput);
    await booking.populate("expert", "name category experience rating price");

    io.emit("slotBooked", {
      expert: booking.expert._id,
      expertId: booking.expert._id,
      date: booking.date,
      timeSlot: booking.timeSlot,
      bookingId: booking._id,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This slot has already been booked",
      });
    }

    next(error);
  }
};

export const getBookingsByEmail = async (req, res, next) => {
  try {
    const email = req.query.email?.trim().toLowerCase();

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email query parameter is required",
      });
    }

    const bookings = await Booking.find({ email })
      .populate("expert", "name category experience rating price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body.status?.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Pending, Confirmed, or Completed",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("expert", "name category experience rating price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    io.emit("bookingStatusUpdated", {
      bookingId: booking._id,
      status: booking.status,
    });

    res.json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
