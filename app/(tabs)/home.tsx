import React, { useEffect, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { db } from "../../firebaseConfig";
import { collection, getDocs, onSnapshot, doc } from "firebase/firestore";
import { useColorScheme } from "nativewind";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "~/lib/icons/ChevronDown";
import { auth } from "~/firebaseConfig"; // already imported

type Transaction = {
  id: string;
  date: string;
  transaction_type: string;
  description: string;
  amount: number;
  wallet_balance: number;
  status: string;
  category?: string;
};

type CategoryTotals = {
  [category: string]: number;
};

const monthOptions = [
  { label: "January", value: 0 },
  { label: "February", value: 1 },
  { label: "March", value: 2 },
  { label: "April", value: 3 },
  { label: "May", value: 4 },
  { label: "June", value: 5 },
  { label: "July", value: 6 },
  { label: "August", value: 7 },
  { label: "September", value: 8 },
  { label: "October", value: 9 },
  { label: "November", value: 10 },
  { label: "December", value: 11 },
];

const yearOptions = [2023, 2024, 2025];

type Badge = {
  id: string;
  label: string;
  icon: string; // use emojis or custom images
  condition: (total: number, categories: CategoryTotals) => boolean;
};

const badgeDefinitions: Badge[] = [
  {
    id: "starter",
    label: "Budget Starter 💼",
    icon: "💼",
    condition: (total) => total > 0,
  },
  {
    id: "saver50",
    label: "Saved RM50 💰",
    icon: "💰",
    condition: (total) => total >= 50,
  },
  {
    id: "saver100",
    label: "Saved RM100 🏅",
    icon: "🏅",
    condition: (total) => total >= 100,
  },
  {
    id: "multiCategory",
    label: "Multi-Category Spender 📊",
    icon: "📊",
    condition: (_total, categories) => Object.keys(categories).length >= 3,
  },
];

const getBudgetEmoji = (progress: number) => {
  if (progress < 0.5) return "😊";
  if (progress < 0.8) return "😬";
  if (progress <= 1) return "😰";
  return "😱"; // Over budget
};

export default function Home() {
  const { colorScheme } = useColorScheme();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotals>({});
  const [totalSpending, setTotalSpending] = useState(0);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const data: Transaction[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];

        setTransactions(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const thisMonthTxns = transactions.filter((txn) => {
      const [day, month, year] = txn.date.split("/").map(Number);
      const txnDate = new Date(year, month - 1, day);
      return (
        txnDate.getMonth() === selectedMonth &&
        txnDate.getFullYear() === selectedYear
      );
    });

    const categoryMap: CategoryTotals = {};
    let total = 0;

    thisMonthTxns.forEach((txn) => {
      const category = txn.category || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + txn.amount;
      total += txn.amount;
    });

    const newEarned: Badge[] = badgeDefinitions.filter((badge) =>
      badge.condition(total, categoryMap)
    );

    setEarnedBadges(newEarned);
    setCategoryTotals(categoryMap);
    setTotalSpending(total);
  }, [transactions, selectedMonth, selectedYear]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const monthKey = `${selectedYear}_${selectedMonth + 1}`;
    const docRef = doc(db, "budgets", uid);

    // Immediately reset budget to prevent visual mismatch
    setBudgets({});

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      setBudgets(data[monthKey] || {});
    });

    return () => unsubscribe(); // Clean up listener on unmount or when month changes
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 32,
        }}
      >
        <Text className="text-2xl font-bold mb-2 text-foreground">
          📊 Monthly Dashboard
        </Text>

        {/* Month and Year Dropdowns */}
        <View className="flex flex-row justify-between gap-2 mb-4">
          {/* Month Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TouchableOpacity className="flex flex-row items-center bg-gray-100 dark:bg-zinc-800 p-2 rounded-lg">
                <Text className="text-foreground mr-2">
                  {monthOptions[selectedMonth].label}
                </Text>
                <ChevronDown className="text-foreground" />
              </TouchableOpacity>
            </DropdownMenuTrigger>
            <DropdownMenuContent style={{ maxHeight: 300 }}>
              <ScrollView>
                {monthOptions.map((month) => (
                  <DropdownMenuItem
                    key={month.value}
                    onPress={() => setSelectedMonth(month.value)}
                  >
                    <Text className="text-foreground px-2 py-1">
                      {month.label}
                    </Text>
                  </DropdownMenuItem>
                ))}
              </ScrollView>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Year Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TouchableOpacity className="flex flex-row items-center bg-gray-100 dark:bg-zinc-800 p-2 rounded-lg">
                <Text className="text-foreground mr-2">{selectedYear}</Text>
                <ChevronDown className="text-foreground" />
              </TouchableOpacity>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {yearOptions.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onPress={() => {
                    setSelectedYear(year);
                  }}
                >
                  <Text className="text-foreground px-2 py-1">{year}</Text>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        <View className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg mb-4">
          <Text className="text-lg font-semibold text-foreground">
            Total Spending:
          </Text>
          <Text className="text-red-600 text-xl font-bold">
            RM {totalSpending.toFixed(2)}
          </Text>
        </View>

        <Text className="text-lg font-semibold mb-2 text-foreground">
          Spending by Category:
        </Text>
        {Object.entries(categoryTotals).map(([category, amount]) => {
          const budget = budgets[category];
          const progress = budget ? Math.min(amount / budget, 1) : null;
          const isOverBudget = budget && amount > budget;

          return (
            <View
              key={category}
              className="bg-white dark:bg-zinc-900 p-3 rounded-lg border dark:border-zinc-700 mb-3"
            >
              <Text className="text-base text-foreground mb-1">{category}</Text>
              <Text
                className={`font-semibold ${
                  isOverBudget ? "text-red-600" : "text-red-500"
                }`}
              >
                Spent: RM {amount.toFixed(2)}
                {budget && ` / RM ${budget.toFixed(2)}`}
              </Text>

              {typeof progress === "number" && (
                <>
                  <View className="flex-row items-center mt-2">
                    {/* Progress Bar */}
                    <View className="flex-1 h-3 bg-gray-300 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <View
                        style={{ width: `${progress * 100}%` }}
                        className={`h-full rounded-full ${
                          isOverBudget ? "bg-red-600" : "bg-green-500"
                        }`}
                      />
                    </View>

                    {/* Emoji & % */}
                    <View className="flex-row items-center ml-2">
                      <Text className="text-lg mr-1">
                        {getBudgetEmoji(progress)}
                      </Text>
                      <Text className="text-sm text-foreground">
                        {Math.round(progress * 100)}%
                      </Text>
                    </View>
                  </View>

                  {isOverBudget && (
                    <Text className="text-xs text-red-600 mt-1">
                      ⚠️ Over Budget
                    </Text>
                  )}
                </>
              )}
            </View>
          );
        })}

        {earnedBadges.length > 0 && (
          <>
            <Text className="text-lg font-semibold mt-4 mb-2 text-foreground">
              🎖️ Your Badges:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {earnedBadges.map((badge) => (
                <View
                  key={badge.id}
                  className="bg-white dark:bg-zinc-900 p-3 rounded-lg border dark:border-zinc-700 mr-2 items-center"
                >
                  <Text className="text-2xl">{badge.icon}</Text>
                  <Text className="text-sm text-center text-foreground">
                    {badge.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
