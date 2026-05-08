import express from "express";
import {
  createBooking,
  getBookingsByEmail,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/", getBookingsByEmail);
router.post("/", createBooking);
router.patch("/:id/status", updateBookingStatus);

export default router;
