import "dotenv/config";
import { connectDB } from "../config/db.js";
import { Expert } from "../models/Expert.js";

const experts = [
  {
    name: "Dr. Ananya Sharma",
    category: "Career Coaching",
    experience: 9,
    rating: 4.8,
    bio: "Career strategist helping students and early professionals choose practical growth paths.",
    price: 1200,
  },
  {
    name: "Rahul Mehta",
    category: "Software Engineering",
    experience: 11,
    rating: 4.9,
    bio: "Senior engineering mentor focused on full-stack interviews, system design, and project reviews.",
    price: 1500,
  },
  {
    name: "Priya Nair",
    category: "UI/UX Design",
    experience: 7,
    rating: 4.7,
    bio: "Product designer mentoring learners in portfolios, user research, and design systems.",
    price: 1100,
  },
  {
    name: "Arjun Kapoor",
    category: "Business Strategy",
    experience: 13,
    rating: 4.6,
    bio: "Startup advisor supporting founders with market validation, pricing, and business planning.",
    price: 1800,
  },
  {
    name: "Neha Verma",
    category: "Data Science",
    experience: 8,
    rating: 4.8,
    bio: "Data science mentor specializing in ML projects, analytics portfolios, and interview prep.",
    price: 1400,
  },
  {
    name: "Kabir Sinha",
    category: "Marketing",
    experience: 10,
    rating: 4.5,
    bio: "Growth marketer helping teams plan campaigns, content funnels, and brand positioning.",
    price: 1000,
  },
];

const availability = [
  {
    date: "2026-05-09",
    slots: ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
  },
  {
    date: "2026-05-10",
    slots: ["09:30 AM", "12:00 PM", "03:00 PM", "05:00 PM"],
  },
  {
    date: "2026-05-11",
    slots: ["10:30 AM", "01:00 PM", "03:30 PM", "06:00 PM"],
  },
];

const seedExperts = async () => {
  try {
    await connectDB();
    await Expert.deleteMany();
    await Expert.insertMany(
      experts.map((expert) => ({
        ...expert,
        availableSlots: availability,
      }))
    );

    console.log("Experts seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedExperts();
