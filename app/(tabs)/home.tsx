import React, { useEffect, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useColorScheme } from "nativewind";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "~/lib/icons/ChevronDown";

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

export default function Home() {
  const { colorScheme } = useColorScheme();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotals>({});
  const [totalSpending, setTotalSpending] = useState(0);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

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

    setCategoryTotals(categoryMap);
    setTotalSpending(total);
  }, [transactions, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 px-6 pt-8 bg-background">
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
          <DropdownMenuContent>
            {monthOptions.map((month) => (
              <DropdownMenuItem key={month.value} onPress={() => {
                setSelectedMonth(month.value);
              }}>
                <Text className="text-foreground px-2 py-1">
                  {month.label}
                </Text>
              </DropdownMenuItem>
              
            ))}
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
              <DropdownMenuItem key={year} onPress={() => {
                setSelectedYear(year);
              }}>
                <Text className="text-foreground px-2 py-1">
                  {year}
                </Text>
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
      <FlatList
        data={Object.entries(categoryTotals)}
        keyExtractor={([category]) => category}
        renderItem={({ item }) => {
          const [category, amount] = item;
          return (
            <View className="bg-white dark:bg-zinc-900 p-3 rounded-lg border dark:border-zinc-700 mb-2">
              <Text className="text-base text-foreground">{category}</Text>
              <Text className="text-red-500 font-semibold">
                RM {amount.toFixed(2)}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
