import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useColorScheme } from "~/lib/useColorScheme";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlaygroundScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const placeholderColor = isDarkColorScheme ? "#a1a1aa" : "#52525b";

  // Inputs
  const [monthlySaving, setMonthlySaving] = useState("");
  const [autoExpenses, setAutoExpenses] = useState<number | null>(null);

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
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // Auto-fetch expenses from Firestore
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const expenses = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((txn: any) => txn.amount < 0); // only expenses

        const totalExpense = expenses.reduce(
          (sum: number, txn: any) => sum + Math.abs(txn.amount),
          0
        );

        const uniqueMonths = new Set(
          expenses.map(
            (txn: any) => txn.date.split("/")[1] + "/" + txn.date.split("/")[2]
          )
        ).size;

        const averageMonthlyExpense =
          uniqueMonths > 0 ? totalExpense / uniqueMonths : 0;

        setAutoExpenses(averageMonthlyExpense);
        setLoadingExpenses(false);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, []);

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const calculateFutureSaving = () => {
    let monthly = parseFloat(monthlySaving);
    let totalYears = parseInt(years);
    let incrementFreq = parseInt(incrementFrequency);

    if (isNaN(monthly) || isNaN(totalYears)) {
      alert("Please fill all required fields correctly.");
      return;
    }

    if (autoExpenses === null) {
      alert("Still calculating expenses. Please wait.");
      return;
    }

    let total = 0;
    let currentSaving = monthly;

    for (let year = 1; year <= totalYears; year++) {
      // Random annual ROI if enabled
      const annualROI = includeROI
        ? randomInRange(parseFloat(roiMin), parseFloat(roiMax)) / 100
        : 0;

      for (let month = 1; month <= 12; month++) {
        total += currentSaving - autoExpenses;
        total += total * (annualROI / 12); // compound monthly interest
      }

      // Salary increment if enabled
      if (includeSalaryIncrement && year % incrementFreq === 0) {
        const incrementRate =
          randomInRange(
            parseFloat(salaryIncrementMin),
            parseFloat(salaryIncrementMax)
          ) / 100;

        currentSaving += currentSaving * incrementRate;
      }
    }

    setResult(total);
  };

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 p-5 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Text className="text-2xl font-bold mb-4 text-foreground">
        Future Savings Calculator
      </Text>

      {/* Monthly Saving */}
      <Text className="text-foreground mb-1">Monthly Saving (RM):</Text>
      <TextInput
        keyboardType="numeric"
        value={monthlySaving}
        onChangeText={setMonthlySaving}
        placeholder="e.g., 500"
        placeholderTextColor={placeholderColor}
        className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
      />

      {/* Auto Expenses */}
      <Text className="text-foreground mb-1">
        Auto-calculated Monthly Expenses:
      </Text>
      {loadingExpenses ? (
        <ActivityIndicator size="small" color="#007AFF" className="mb-4" />
      ) : (
        <Text className="text-foreground mb-4">
          RM {autoExpenses?.toFixed(2)} (based on past transactions)
        </Text>
      )}

      {/* ROI Section */}
      <TouchableOpacity
        onPress={() => setIncludeROI(!includeROI)}
        className="mb-2 bg-zinc-200 dark:bg-zinc-800 rounded-md p-2"
      >
        <Text className="text-foreground font-semibold">
          {includeROI ? "✅ " : "⬜ "} Include ROI Calculation
        </Text>
      </TouchableOpacity>

      {includeROI && (
        <>
          <Text className="text-foreground mb-1">Annual ROI Range (%):</Text>
          <TextInput
            keyboardType="numeric"
            value={roiMin}
            onChangeText={setRoiMin}
            placeholder="Min e.g., 4"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-2 text-foreground"
          />
          <TextInput
            keyboardType="numeric"
            value={roiMax}
            onChangeText={setRoiMax}
            placeholder="Max e.g., 8"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
          />
        </>
      )}

      {/* Salary Increment Section */}
      <TouchableOpacity
        onPress={() => setIncludeSalaryIncrement(!includeSalaryIncrement)}
        className="mb-2 bg-zinc-200 dark:bg-zinc-800 rounded-md p-2"
      >
        <Text className="text-foreground font-semibold">
          {includeSalaryIncrement ? "✅ " : "⬜ "} Include Salary Increment
        </Text>
      </TouchableOpacity>

      {includeSalaryIncrement && (
        <>
          <Text className="text-foreground mb-1">
            Salary Increment Range (%):
          </Text>
          <TextInput
            keyboardType="numeric"
            value={salaryIncrementMin}
            onChangeText={setSalaryIncrementMin}
            placeholder="Min e.g., 10"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-2 text-foreground"
          />
          <TextInput
            keyboardType="numeric"
            value={salaryIncrementMax}
            onChangeText={setSalaryIncrementMax}
            placeholder="Max e.g., 30"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
          />
          <Text className="text-foreground mb-1">
            Increment Frequency (Years):
          </Text>
          <TextInput
            keyboardType="numeric"
            value={incrementFrequency}
            onChangeText={setIncrementFrequency}
            placeholder="e.g., 2"
            placeholderTextColor={placeholderColor}
            className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
          />
        </>
      )}

      {/* Total Years */}
      <Text className="text-foreground mb-1">Total Years:</Text>
      <TextInput
        keyboardType="numeric"
        value={years}
        onChangeText={setYears}
        placeholder="e.g., 10"
        placeholderTextColor={placeholderColor}
        className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
      />

      {/* Calculate Button */}
      <TouchableOpacity
        onPress={calculateFutureSaving}
        className="bg-green-600 rounded-md py-2 mb-4"
      >
        <Text className="text-white text-center font-semibold">Calculate</Text>
      </TouchableOpacity>

      {/* Result */}
      {result !== null && (
        <Text className="text-xl text-foreground font-bold">
          Estimated Future Saving: RM {result.toFixed(2)}
        </Text>
      )}
    </ScrollView>
  );
}
