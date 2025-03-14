import express from "express";
import { Stats } from "../models/Stats.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

let initializationInProgress = {};

const defaultStats = [
  { name: "Creativity", xp: 0, color: "#3b82f6" },
  { name: "Healthfulness", xp: 0, color: "#278a58" },
  { name: "Kindness", xp: 0, color: "#f43f5e" },
  { name: "Intelligence", xp: 0, color: "#a88aed" },
  { name: "Sociability", xp: 0, color: "#f5c20b" },
  { name: "Skillfulness", xp: 0, color: "#876148" },
];

// Get all stats for the authenticated user
router.get("/", authenticateUser, async (req, res) => {
  try {
    const stats = await Stats.find({ userId: req.userId });
    res.json(stats);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.post("/initialize-stats", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    // Check if initialization is already in progress for this user
    if (initializationInProgress[userId]) {
      return res
        .status(409)
        .json({ message: "Initialization already in progress" });
    }

    initializationInProgress[userId] = true;

    // Check if stats already exist for this user
    const existingStats = await Stats.find({ userId });
    if (existingStats.length > 0) {
      initializationInProgress[userId] = false;
      return res.json(existingStats); // Return existing stats instead of error
    }

    // Create stats
    const statsToCreate = defaultStats.map((stat) => ({
      name: stat.name,
      xp: stat.xp,
      color: stat.color,
      userId,
    }));

    const newStats = await Stats.insertMany(statsToCreate);

    initializationInProgress[userId] = false;
    res.status(201).json(newStats);
  } catch (error) {
    const userId = req.userId;
    initializationInProgress[userId] = false;
    console.error("Error initializing stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Update stats upon task completion
router.put("/update", authenticateUser, async (req, res) => {
  try {
    const { statName, xpAmount } = req.body;
    const userId = req.userId;

    if (!statName || !xpAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the specific stat document
    const stat = await Stats.findOne({ userId, name: statName });

    if (!stat) {
      return res.status(404).json({ message: "Stat not found" });
    }

    // Update the XP
    stat.xp += xpAmount;
    await stat.save();

    console.log(`Updated ${statName} for user ${userId} by ${xpAmount} XP`);
    res.status(200).json(stat);
  } catch (error) {
    console.error("Error updating stat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get total XP and level for the authenticated user
router.get("/total-xp-level", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    // Aggregate total XP across all stats for the user
    const stats = await Stats.find({ userId });
    const totalXp = stats.reduce((sum, stat) => sum + stat.xp, 0);

    // Calculate level (every 500 XP = 1 level up)
    const totalLevel = Math.floor(totalXp / 500) + 1;

    res.json({ totalXp, totalLevel });
  } catch (error) {
    console.error("Error fetching total XP and level:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
