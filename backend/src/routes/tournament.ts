import express from "express";
import Tournament from "../models/Tournament";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    const tournament = new Tournament({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      participants: [],
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
