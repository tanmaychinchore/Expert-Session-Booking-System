import express from "express";
import { getExpertById, getExperts } from "../controllers/expertController.js";

const router = express.Router();

router.get("/", getExperts);
router.get("/:id", getExpertById);

export default router;
