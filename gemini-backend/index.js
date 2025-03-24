import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateAchievementTitle } from "./gemini.js";

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
