"use client";

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";
import { useState, useEffect } from "react";
import { useColorScheme } from "~/lib/useColorScheme";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, SectionTitle, Button } from "~/components/ui-elements";
import {
  Calculator,
  TrendingUp,
  Lightbulb,
  Sparkles,
  DollarSign,
  Calendar,
  BarChart,
  Percent,
} from "lucide-react-native";

export default function PlaygroundScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const placeholderColor = isDarkColorScheme ? "#a1a1aa" : "#52525b";

  // Inputs
  const [monthlySaving, setMonthlySaving] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState<string>("");

  // ROI Range
  const [roiMin, setRoiMin] = useState("4");
  const [roiMax, setRoiMax] = useState("8");
  const [includeROI, setIncludeROI] = useState(true);

  // Salary Increment Range
  const [salaryIncrementMin, setSalaryIncrementMin] = useState("10");
  const [salaryIncrementMax, setSalaryIncrementMax] = useState("30");
  const [incrementFrequency, setIncrementFrequency] = useState("2");
  const [includeSalaryIncrement, setIncludeSalaryIncrement] = useState(true);

  const [years, setYears] = useState("10");
  const [result, setResult] = useState<number | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [investmentAllocation, setInvestmentAllocation] = useState("60"); // % of net asset for investment
  const [salaryCapYears, setSalaryCapYears] = useState("5"); // years until salary increment stops

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const calculateFutureSaving = () => {
    const monthly = Number.parseFloat(monthlySaving);
    const totalYears = Number.parseInt(years);
    const incrementFreq = Number.parseInt(incrementFrequency);

    if (isNaN(monthly) || isNaN(totalYears)) {
      alert("Please fill all required fields correctly.");
      return;
    }

    const expensesValue = Number.parseFloat(monthlyExpenses);
    if (isNaN(expensesValue)) {
      alert("Please enter a valid Monthly Expenses.");
      return;
    }

    let total = 0;
    let currentSaving = monthly;

    for (let year = 1; year <= totalYears; year++) {
      const annualROI = includeROI
        ? randomInRange(Number.parseFloat(roiMin), Number.parseFloat(roiMax)) /
          100
        : 0;

      for (let month = 1; month <= 12; month++) {
        total += currentSaving - expensesValue;
        total += total * (annualROI / 12);
      }

      if (includeSalaryIncrement && year % incrementFreq === 0) {
        const incrementRate =
          randomInRange(
            Number.parseFloat(salaryIncrementMin),
            Number.parseFloat(salaryIncrementMax)
          ) / 100;

        currentSaving += currentSaving * incrementRate;
      }
    }

    setResult(total);
  };

  const runAIAnalysis = async () => {
    try {
      const monthly = Number.parseFloat(monthlySaving);
      const totalYears = Number.parseInt(years);

      if (isNaN(monthly) || isNaN(totalYears)) {
        alert("Please fill all required fields correctly.");
        return;
      }

      const expensesValue = Number.parseFloat(monthlyExpenses);
      if (isNaN(expensesValue)) {
        alert("Please enter a valid Monthly Expenses.");
        return;
      }

      setLoadingAI(true);
      const dependents = "spouse, parents, children";

      const safeMonthlySaving = Number.parseFloat(monthlySaving) || 0;
      const safeRoiMin = Number.parseFloat(roiMin) || 0;
      const safeRoiMax = Number.parseFloat(roiMax) || 0;
      const safeSalaryIncrementMin = Number.parseFloat(salaryIncrementMin) || 0;
      const safeSalaryIncrementMax = Number.parseFloat(salaryIncrementMax) || 0;
      const safeIncrementFrequency = Number.parseInt(incrementFrequency) || 0;
      const safeInvestmentAllocation =
        Number.parseFloat(investmentAllocation) || 0;
      const safeSalaryCapYears = Number.parseInt(salaryCapYears) || 0;
      // const expensesValue = Number.parseFloat(monthlyExpenses);

      console.log("🔥 AI Analysis Payload:", {
        monthlySaving: safeMonthlySaving,
        expenses: expensesValue,
        dependents,
        roiRange: `${safeRoiMin}% - ${safeRoiMax}%`,
        salaryIncrement: `${safeSalaryIncrementMin}% - ${safeSalaryIncrementMax}% every ${safeIncrementFrequency} years`,
      });

    //   const response = await axios.post(
    //     "http://192.168.1.202:3000/ai-analysis",
    //     {
    //       income: safeMonthlySaving.toFixed(2),
    //       expenses: expensesValue.toFixed(2),
    //       dependents,
    //       roiMin: safeRoiMin,
    //       roiMax: safeRoiMax,
    //       salaryIncrementMin: safeSalaryIncrementMin,
    //       salaryIncrementMax: safeSalaryIncrementMax,
    //       incrementFrequency: safeIncrementFrequency,
    //       investmentAllocation: safeInvestmentAllocation,
    //       salaryCapYears: safeSalaryCapYears,
    //     }
    //   );

      setAiAnalysis("Placeholder AI analysis");
    } catch (error) {
      console.error("Error running AI analysis:", error);
      alert("Failed to generate AI analysis. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 p-5 bg-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center mb-4">
        <Calculator size={20} className="text-indigo-500 mr-2" />
        <SectionTitle>Future Savings Calculator</SectionTitle>
      </View>

      <Card>
        <Text className="text-sm text-muted-foreground mb-4">
          Predict your future savings based on your current financial situation
          and expected growth.
        </Text>

        {/* Monthly Saving */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            <DollarSign size={16} className="text-indigo-500 mr-1" />
            Monthly Saving (RM)
          </Text>
          <TextInput
            keyboardType="numeric"
            value={monthlySaving}
            onChangeText={setMonthlySaving}
            placeholder="e.g., 500"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
          />
        </View>

        {/* Auto Expenses */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">
            <DollarSign size={16} className="text-indigo-500 mr-1" />
            Monthly Expenses (RM)
          </Text>
          <TextInput
            keyboardType="numeric"
            value={monthlyExpenses}
            onChangeText={setMonthlyExpenses}
            placeholder="e.g., 3000"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
          />
        </View>

        {/* Total Years */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Calendar size={16} className="text-indigo-500 mr-2 -mb-0.5" />
            <Text className="text-sm font-medium text-foreground">
              Projection Period (Years)
            </Text>
          </View>

          <TextInput
            keyboardType="numeric"
            value={years}
            onChangeText={setYears}
            placeholder="e.g., 10"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
          />
        </View>
      </Card>

      {/* ROI Section */}
      <Card>
        <TouchableOpacity
          onPress={() => setIncludeROI(!includeROI)}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-5 h-5 rounded mr-2 items-center justify-center ${
              includeROI ? "bg-indigo-500" : "bg-gray-300 dark:bg-zinc-700"
            }`}
          >
            {includeROI && <Text className="text-white">✓</Text>}
          </View>
          <Text className="text-foreground font-medium">
            Include Return on Investment
          </Text>
        </TouchableOpacity>

        {includeROI && (
          <>
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                <Percent size={16} className="text-indigo-500 mr-1" />
                Annual ROI Range (%)
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  keyboardType="numeric"
                  value={roiMin}
                  onChangeText={setRoiMin}
                  placeholder="Min e.g., 4"
                  placeholderTextColor={placeholderColor}
                  className="flex-1 border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                />
                <TextInput
                  keyboardType="numeric"
                  value={roiMax}
                  onChangeText={setRoiMax}
                  placeholder="Max e.g., 8"
                  placeholderTextColor={placeholderColor}
                  className="flex-1 border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                <BarChart size={16} className="text-indigo-500 mr-1" />
                Investment Allocation (% of net assets)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={investmentAllocation}
                onChangeText={setInvestmentAllocation}
                placeholder="e.g., 60"
                placeholderTextColor={placeholderColor}
                className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
              />
            </View>
          </>
        )}
      </Card>

      {/* Salary Increment Section */}
      <Card>
        <TouchableOpacity
          onPress={() => setIncludeSalaryIncrement(!includeSalaryIncrement)}
          className="flex-row items-center mb-3"
        >
          <View
            className={`w-5 h-5 rounded mr-2 items-center justify-center ${
              includeSalaryIncrement
                ? "bg-indigo-500"
                : "bg-gray-300 dark:bg-zinc-700"
            }`}
          >
            {includeSalaryIncrement && <Text className="text-white">✓</Text>}
          </View>
          <Text className="text-foreground font-medium">
            Include Salary Increment
          </Text>
        </TouchableOpacity>

        {includeSalaryIncrement && (
          <>
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <TrendingUp
                  size={16}
                  className="text-indigo-500 mr-2 -mb-0.5"
                />
                <Text className="text-sm font-medium text-foreground">
                  Salary Increment Range (%)
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  keyboardType="numeric"
                  value={salaryIncrementMin}
                  onChangeText={setSalaryIncrementMin}
                  placeholder="Min e.g., 10"
                  placeholderTextColor={placeholderColor}
                  className="flex-1 border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                />
                <TextInput
                  keyboardType="numeric"
                  value={salaryIncrementMax}
                  onChangeText={setSalaryIncrementMax}
                  placeholder="Max e.g., 30"
                  placeholderTextColor={placeholderColor}
                  className="flex-1 border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                />
              </View>
            </View>

            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Calendar size={16} className="text-indigo-500 mr-2 -mb-0.5" />
                <Text className="text-sm font-medium text-foreground">
                  Increment Frequency (Years)
                </Text>
              </View>

              <TextInput
                keyboardType="numeric"
                value={incrementFrequency}
                onChangeText={setIncrementFrequency}
                placeholder="e.g., 2"
                placeholderTextColor={placeholderColor}
                className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                <Calendar size={16} className="text-indigo-500 mr-1" />
                Salary Increment Cap (Years)
              </Text>
              <TextInput
                keyboardType="numeric"
                value={salaryCapYears}
                onChangeText={setSalaryCapYears}
                placeholder="e.g., 5"
                placeholderTextColor={placeholderColor}
                className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
              />
            </View>
          </>
        )}
      </Card>

      {/* Action Buttons */}
      <View className="flex-row gap-2 mt-4 mb-6">
        <Button
          onPress={calculateFutureSaving}
          variant="primary"
          fullWidth
          className="flex-1"
        >
          <View className="flex-row items-center">
            <Calculator size={16} className="text-white mr-2" />
            <Text>Calculate</Text>
          </View>
        </Button>

        <Button
          onPress={runAIAnalysis}
          variant="secondary"
          fullWidth
          className="flex-1"
        >
          <View className="flex-row items-center">
            <Sparkles size={16} className="text-indigo-500 mr-2" />
            <Text>AI Analysis</Text>
          </View>
        </Button>
      </View>

      {/* Results */}
      {result !== null && (
        <Card>
          <View className="flex-row items-center mb-2">
            <Calculator size={18} className="text-indigo-500 mr-2" />
            <Text className="text-lg font-semibold text-foreground">
              Calculation Result
            </Text>
          </View>

          <View className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg">
            <Text className="text-sm text-indigo-700 dark:text-indigo-200 mb-1">
              Projected Future Savings:
            </Text>
            <Text className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">
              RM {result.toFixed(2)}
            </Text>
          </View>
        </Card>
      )}

      {/* AI Analysis */}
      {loadingAI && (
        <View className="items-center py-4">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-muted-foreground mt-2">
            Generating AI analysis...
          </Text>
        </View>
      )}

      {aiAnalysis && (
        <Card>
          <View className="flex-row items-center mb-3">
            <Lightbulb size={18} className="text-indigo-500 mr-2" />
            <Text className="text-lg font-semibold text-foreground">
              AI Financial Analysis
            </Text>
          </View>

          <View className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <Text className="text-blue-800 dark:text-blue-200 leading-5">
              {aiAnalysis}
            </Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}