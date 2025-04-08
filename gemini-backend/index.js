import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateAchievementTitle, generateAIAnalysis } from "./gemini.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/generate-title", async (req, res) => {
  const { category, amount } = req.body;

  if (!category || !amount) {
    return res.status(400).json({ error: "Missing category or amount" });
  }

  try {
    const title = await generateAchievementTitle(category, amount);
    res.json({ title });
  } catch (error) {
    console.error("🔥 Error generating title:", error);
    res.status(500).json({ error: "Could not generate title" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Add new endpoint for AI-based asset prediction
app.post("/ai-analysis", async (req, res) => {
  const { income, expenses, dependents } = req.body;

  if (income === undefined || expenses === undefined || !dependents) {
    return res.status(400).json({ error: "Missing income, expenses or dependents" });
  }

  try {
    const analysis = await generateAIAnalysis(income, expenses, dependents);
    res.json({ analysis });
  } catch (error) {
    console.error("🔥 Error generating AI analysis:", error);
    res.status(500).json({ error: "Could not generate analysis" });
  }
});

