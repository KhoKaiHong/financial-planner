import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAchievementTitle(category, amount) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Suggest exactly 5 short and creative achievement titles (no emojis, no numbering) for someone trying to spend less than RM${amount} on ${category} this month. 
Respond with only a plain list, one title per line, no extra formatting.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Normalize and clean each line
  const suggestions = text
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-*•\d.]+\s*/, "") // Remove bullets, asterisks, dashes, numbers, etc.
        .replace(/\*/g, "") // Remove markdown bold/italic asterisks
        .trim()
    )
    .filter((line) => line.length > 0)
    .slice(0, 5); // Ensure max 5 titles

  console.log("🤖 Raw Gemini output:\n", text);
  return suggestions;
}
