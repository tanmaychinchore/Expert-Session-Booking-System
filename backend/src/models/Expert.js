import mongoose from "mongoose";

const availableSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    slots: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { _id: false }
);

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    availableSlots: {
      type: [availableSlotSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const Expert = mongoose.model("Expert", expertSchema);
