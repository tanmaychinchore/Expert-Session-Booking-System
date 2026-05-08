import { Expert } from "../models/Expert.js";
import { Booking } from "../models/Booking.js";

const getBookedSlotKeys = async (expertId) => {
  const bookings = await Booking.find({ expert: expertId }).select("date timeSlot");

  return new Set(
    bookings.map((booking) => `${booking.date}|${booking.timeSlot}`)
  );
};

const mapSlotsWithBookingStatus = (availableSlots, bookedSlotKeys) =>
  availableSlots.map((group) => ({
    date: group.date,
    slots: group.slots.map((time) => ({
      time,
      isBooked: bookedSlotKeys.has(`${group.date}|${time}`),
    })),
  }));

export const getExperts = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 20);
    const skip = (page - 1) * limit;
    const { search, category } = req.query;

    const filters = {};

    if (search) {
      filters.name = { $regex: search.trim(), $options: "i" };
    }

    if (category) {
      filters.category = category.trim();
    }

    const [experts, total] = await Promise.all([
      Expert.find(filters)
        .select("name category experience rating bio price")
        .sort({ rating: -1, name: 1 })
        .skip(skip)
        .limit(limit),
      Expert.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id);

    if (!expert) {
      return res.status(404).json({
        success: false,
        message: "Expert not found",
      });
    }

    const bookedSlotKeys = await getBookedSlotKeys(expert._id);
    const expertData = expert.toObject();

    res.json({
      success: true,
      data: {
        ...expertData,
        slotGroups: mapSlotsWithBookingStatus(
          expertData.availableSlots,
          bookedSlotKeys
        ),
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      error.statusCode = 400;
      error.message = "Invalid expert id";
    }

    next(error);
  }
};
