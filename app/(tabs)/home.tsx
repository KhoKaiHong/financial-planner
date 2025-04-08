"use client";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "~/lib/icons/ChevronDown";
import { auth } from "~/firebaseConfig";
import { useRouter } from "expo-router";
import { PieChart } from "react-native-svg-charts";
import {
  Card,
  SectionTitle,
  Badge,
  ProgressBar,
  Button,
} from "~/components/ui-elements";
import { Award } from "~/lib/icons/Award";
import { Calendar } from "~/lib/icons/Calendar";
import { TrendingUp } from "~/lib/icons/TrendingUp";
import { BarChart2 } from "~/lib/icons/BarChart2";

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

type BadgeType = {
  id: string;
  label: string;
  icon: string;
  condition: (total: number, categories: CategoryTotals) => boolean;
};

const badgeDefinitions: BadgeType[] = [
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

const categoryColors: Record<string, string> = {
  Food: "#FFCE56",
  Shopping: "#FF6384",
  Entertainment: "#36A2EB",
  Transportation: "#4BC0C0",
  Bills: "#9966FF",
  Uncategorized: "#FF9F40",
};

const getCategoryColor = (category: string) => {
  return categoryColors[category] || "#999999"; // fallback color
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotals>({});
  const [totalSpending, setTotalSpending] = useState(0);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [xpGainAmount, setXpGainAmount] = useState<number | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [levelUpAnim] = useState(new Animated.Value(0));
  const [showLevelUpText, setShowLevelUpText] = useState(false);
  const [showCircleChart, setShowCircleChart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const triggerXpAnimation = (amount: number) => {
    setXpGainAmount(amount);
    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setXpGainAmount(null);
    });
  };

  const triggerLevelUpAnimation = () => {
    setShowLevelUpText(true);
    levelUpAnim.setValue(1);

    Animated.timing(levelUpAnim, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      setShowLevelUpText(false);
    });
  };

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
        txnDate.getFullYear() === selectedYear &&
        txn.amount < 0
      );
    });

    const categoryMap: CategoryTotals = {};
    let total = 0;

    thisMonthTxns.forEach((txn) => {
      const category = txn.category || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + txn.amount;
      total += txn.amount;
    });

    const newEarned: BadgeType[] = badgeDefinitions.filter((badge) =>
      badge.condition(total, categoryMap)
    );

    setEarnedBadges(newEarned);
    setCategoryTotals(categoryMap);
    setTotalSpending(total);
  }, [transactions, selectedMonth, selectedYear]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
  
    const docRef = doc(db, "budgets", uid);
  
    setBudgets({});
  
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      setBudgets(data["global"] || {});
    });
  
    return () => unsubscribe();
  }, []);  

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = doc(db, "users", uid);

    const updateLoginStreak = async () => {
      const now = Date.now();

      const snap = await getDoc(userRef);
      const data = snap.exists() ? snap.data() : {};

      const lastLogin = data.lastLogin || 0;
      const currentXp = data.xp || 0;
      const currentStreak = data.streak || 0;
      const currentLevel = data.level || 1;

      const timeSinceLastLogin = now - lastLogin;

      if (timeSinceLastLogin < 30_000) {
        setXp(currentXp);
        setLevel(currentLevel);
        setStreak(currentStreak);
        return;
      }

      const newXp = currentXp + 10;
      var newLevel =
        newXp >= currentLevel * 100 ? currentLevel + 1 : currentLevel;
      if (newXp >= currentLevel * 100) {
        newLevel += 1;
        triggerLevelUpAnimation();
      }

      const newStreak = timeSinceLastLogin < 60_000 ? currentStreak + 1 : 1;

      await setDoc(
        userRef,
        {
          lastLogin: now,
          xp: newXp,
          level: newLevel,
          streak: newStreak,
        },
        { merge: true }
      );

      setXp(newXp);
      triggerXpAnimation(10);
      setStreak(newStreak);
      setLevel(newLevel);
    };

    updateLoginStreak();

    const interval = setInterval(updateLoginStreak, 10_000);

    return () => clearInterval(interval);
  }, []);

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
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Stats Card */}
        <Card>
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                <Text className="text-xl">👤</Text>
              </View>
              <View>
                <Text className="text-lg font-semibold text-foreground">
                  Level {level}
                </Text>
                <View className="flex-row items-center">
                  <Calendar size={14} className="text-indigo-500 mr-1" />
                  <Text className="text-sm text-muted-foreground">
                    {streak} day streak
                  </Text>
                </View>
              </View>
            </View>

            {xpGainAmount !== null && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                }}
              >
                <Badge label={`+${xpGainAmount} XP`} color="green" />
              </Animated.View>
            )}
          </View>

          <View className="mb-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-muted-foreground">XP Progress</Text>
              <Text className="text-sm font-medium text-foreground">
                {xp % 100} / 100
              </Text>
            </View>
            <ProgressBar progress={(xp % 100) / 100} color="indigo" />
          </View>
        </Card>

        {showLevelUpText && (
          <Animated.View
            style={{
              position: "absolute",
              top: 100,
              left: 0,
              right: 0,
              alignItems: "center",
              opacity: levelUpAnim,
              transform: [
                {
                  scale: levelUpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1.2],
                  }),
                },
              ],
              zIndex: 10,
            }}
            pointerEvents="none"
          >
            <View className="px-6 py-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg border border-yellow-300 dark:border-yellow-700 shadow-md">
              <Text className="text-yellow-800 dark:text-yellow-200 font-bold text-lg">
                🎉 Level Up! You're now Level {level}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Month Selector */}
        <View className="flex-row justify-between items-center mb-4 w-full">
          {/* Left: Icon + Title */}
          <View className="flex-row flex-1 items-center">
            <BarChart2 size={20} className="text-indigo-500 mr-2" />
            <SectionTitle>Monthly Dashboard</SectionTitle>
          </View>

          {/* Right: Month + Year */}
          <View className="flex-row w-[140px] justify-between">
            {/* Month Dropdown */}
            <View style={{ width: 80 }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TouchableOpacity className="flex-row items-center bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg mr-2">
                    <Text
                      className="text-foreground text-sm mr-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {monthOptions[selectedMonth].label}
                    </Text>
                    <ChevronDown size={14} className="text-foreground" />
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
            </View>

            {/* Year Dropdown */}
            <View style={{ width: 60 }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TouchableOpacity className="flex-row items-center bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
                    <Text className="text-foreground text-sm mr-1">
                      {selectedYear}
                    </Text>
                    <ChevronDown size={14} className="text-foreground" />
                  </TouchableOpacity>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {yearOptions.map((year) => (
                    <DropdownMenuItem
                      key={year}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text className="text-foreground px-2 py-1">{year}</Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>
        </View>

        {/* Total Spending Card */}
        <Card>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-muted-foreground mb-1">
                Total Spending
              </Text>
              <Text className="text-red-600 text-2xl font-bold">
                RM {Math.abs(totalSpending).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowCircleChart(!showCircleChart)}
              className="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900"
            >
              <Text className="text-indigo-700 dark:text-indigo-200 text-sm font-medium">
                {showCircleChart ? "List View" : "Chart View"}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Spending by Category */}
        <View className="mb-4">
          <SectionTitle>
            <View className="flex-row items-center">
              <TrendingUp size={18} className="text-indigo-500 mr-2" />
              <Text>Spending by Category</Text>
            </View>
          </SectionTitle>

          {showCircleChart ? (
            <Card>
              <PieChart
                style={{ height: 200 }}
                data={Object.entries(categoryTotals).map(
                  ([category, amount]) => ({
                    key: category,
                    value: Math.abs(amount),
                    svg: {
                      fill: getCategoryColor(category),
                      onPress: () => setSelectedCategory(category),
                    },
                    arc: { outerRadius: "100%", cornerRadius: 5 },
                  })
                )}
                innerRadius="40%"
                outerRadius="95%"
              />

              {selectedCategory && (
                <View className="mt-4 items-center">
                  <Text className="text-lg font-semibold text-foreground">
                    {selectedCategory}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {(
                      (Math.abs(categoryTotals[selectedCategory]) /
                        Math.abs(totalSpending)) *
                      100
                    ).toFixed(1)}
                    % — RM{" "}
                    {Math.abs(categoryTotals[selectedCategory]).toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Legend */}
              <View className="flex-row flex-wrap mt-4 justify-center">
                {Object.entries(categoryTotals).map(([category, amount]) => (
                  <View
                    key={category}
                    className="flex-row items-center mr-4 mb-2"
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: getCategoryColor(category),
                        marginRight: 4,
                      }}
                    />
                    <Text className="text-xs text-foreground">{category}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : (
            Object.entries(categoryTotals).map(([category, amount]) => {
              const budget = budgets[category];
              const progress = budget
                ? Math.min(Math.abs(amount) / budget, 1)
                : null;
              const isOverBudget = budget && Math.abs(amount) > budget;

              return (
                <Card key={category}>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-medium text-foreground">
                      {category}
                    </Text>
                    {isOverBudget ? (
                      <Badge label="Over Budget" color="red" />
                    ) : budget ? (
                      <Badge label="Within Budget" color="green" />
                    ) : null}
                  </View>

                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-muted-foreground text-sm">Spent</Text>
                    <Text
                      className={`font-semibold ${
                        isOverBudget ? "text-red-600" : "text-foreground"
                      }`}
                    >
                      RM {Math.abs(amount).toFixed(2)}
                      {budget && ` / RM ${budget.toFixed(2)}`}
                    </Text>
                  </View>

                  {typeof progress === "number" && (
                    <View className="mt-2">
                      <ProgressBar
                        progress={progress}
                        color={isOverBudget ? "red" : "green"}
                      />
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-xs text-muted-foreground">
                          {Math.round(progress * 100)}% used
                        </Text>
                        <Text className="text-lg">
                          {getBudgetEmoji(progress)}
                        </Text>
                      </View>
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>

        {/* Badges Section */}
        {earnedBadges.length > 0 && (
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Award size={18} className="text-indigo-500 mr-2" />
                <SectionTitle>Your Badges</SectionTitle>
              </View>

              <Button
                onPress={() => router.push("/(tabs)/badges")}
                variant="outline"
                size="sm"
              >
                View All
              </Button>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {earnedBadges.map((badge) => (
                <Card
                  key={badge.id}
                  style={{
                    marginRight: 12,
                    width: 100,
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <Text className="text-3xl mb-2">{badge.icon}</Text>
                  <Text className="text-xs text-center text-foreground">
                    {badge.label}
                  </Text>
                </Card>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
