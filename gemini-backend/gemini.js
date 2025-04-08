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

export async function generateAIAnalysis(
  income,
  expenses,
  dependents,
  roiMin,
  roiMax,
  salaryIncrementMin,
  salaryIncrementMax,
  incrementFrequency,
  investmentAllocation,
  salaryCapYears
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Act as an expert, concise personal finance AI advisor.

Data:
- Monthly Savings (user input): RM${income}
- Monthly Expenses (auto-calculated): RM${expenses}
- Dependents: ${dependents}
- Expected ROI Range: ${roiMin}% - ${roiMax}% annually
- Salary Increment: ${salaryIncrementMin}% - ${salaryIncrementMax}% every ${incrementFrequency} years
- Salary Increment Cap: Stop after ${salaryCapYears} years
- Investment Allocation: ${investmentAllocation}% of net assets invested

Important:
- Assume spouse and parents can contribute **income**.
- Children: dependents, no income.
- Parents and spouse: estimate realistic contributions (income minus personal expenses).
- Calculate household net balance monthly.

Your tasks:
1. Break down monthly expenses and contributions:
   - Children: RM amount
   - Parents: RM amount (net contribution)
   - Spouse: RM amount (net contribution)
   - Other: RM amount

2. Add up total monthly expenses.

3. Estimate monthly household net balance:
   - Start with: Monthly Saving (user) + Contributions (parents & spouse) - Total Expenses
   - Then:
     - Apply salary increment (every ${incrementFrequency} years, stop after ${salaryCapYears} years).
     - Apply ROI returns based on investment allocation of ${investmentAllocation}% of net assets.
     - Show realistic range based on ${roiMin}% - ${roiMax}% ROI.

4. Estimate total 10-year future asset:
   - Use the net balance and investment returns to project total future assets over 10 years.
   - Show **both lower and upper range**.

5. Give exactly 2 short actionable tips to improve future financial outcome.

Response format:
---
📊 Contribution Breakdown:
- Parents: RM xxx (net contribution)
- Spouse: RM xxx (net contribution)

📊 Expenses Breakdown:
- Children: RM xxx
- Other: RM xxx
Total Monthly Expenses: RM xxx

💰 Estimated Monthly Net Balance (include salary increment & ROI):
RM lowerRange - RM upperRange

📈 Future Asset Projection (10 years):
Range: RM lowerRange - RM upperRange

💡 Tips:
- Tip 1
- Tip 2
---

Strictly follow this format. No extra text. There must be a range, and not two same numbers for Monthly Net Balance and Future Asset Projection, perform proper calculation.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log("🧩 AI Analysis:\n", text);
  return text;
}




