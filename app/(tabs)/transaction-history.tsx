import { useEffect, useState, memo } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Text } from "~/components/ui/text";
import { db } from "../../firebaseConfig"; // Ensure correct path to firebaseConfig.ts
import { addDoc, collection, getDocs } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu"; // ✅ Import if not already
// import * as tf from "@tensorflow/tfjs"; // TensorFlow.js for K-Means

// Define TypeScript type for transactions
type Transaction = {
  id: string;
  date: string;
  transaction_type: string;
  description: string;
  amount: number;
  wallet_balance: number;
  status: string;
  category?: string;
  isAbnormal?: boolean; // New field for anomaly detection
};

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inputDate, setInputDate] = useState("");
  const [inputCategory, setInputCategory] = useState("Food");
  const [inputDescription, setInputDescription] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [plannedTransactionType, setPlannedTransactionType] =
    useState("Expense");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const fetchTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "transactions"));
      let transactionList: Transaction[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Transaction, "id">;
        return {
          id: doc.id,
          category: data.category || "Uncategorized",
          isAbnormal: false, // Initialize anomaly flag
          ...data,
        }; // Default category
      });

      // Detect abnormal spending
      transactionList = detectAbnormalSpending(transactionList);

      transactionList.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/").map(Number);
        const [dayB, monthB, yearB] = b.date.split("/").map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB.getTime() - dateA.getTime();
      });

      setTransactions(transactionList);
      const tips = generateCostCuttingTips(transactionList);
      setRecommendations(tips);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Function to detect abnormal spending using K-Means clustering
  const detectAbnormalSpending = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((txn) => {
      if (txn.amount >= 0) return; // ✅ Only consider expenses
      if (!grouped[txn.category!]) grouped[txn.category!] = [];
      grouped[txn.category!].push(txn);
    });

    Object.keys(grouped).forEach((category) => {
      const amounts = grouped[category].map((txn) => Math.abs(txn.amount)); // ✅ Use absolute values

      if (amounts.length < 3) {
        // console.log(
        //   `🟡 Category "${category}" skipped (only ${amounts.length} items)`
        // );
        return;
      }

      // ✅ Calculate Mean (Average)
      const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;

      // ✅ Calculate Standard Deviation
      const squaredDiffs = amounts.map((val) => (val - mean) ** 2);
      const variance =
        squaredDiffs.reduce((sum, val) => sum + val, 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      const threshold = mean + 1.5 * stdDev;

      // console.log(`📊 Debug - Category: "${category}"`);
      // console.log(`   Amounts: ${amounts.join(", ")}`);
      // console.log(`   Mean: ${mean.toFixed(2)}`);
      // console.log(`   StdDev: ${stdDev.toFixed(2)}`);
      // console.log(`   Threshold: ${threshold.toFixed(2)}`);

      grouped[category].forEach((txn) => {
        if (Math.abs(txn.amount) > threshold) {
          txn.isAbnormal = true;
          // console.log(
          //   `   🚨 Abnormal detected: ${txn.description} (RM ${txn.amount})`
          // );
        }
      });
    });

    return transactions;
  };

  const generateCostCuttingTips = (transactions: Transaction[], budgets: Record<string, number> = {}) => {
    const tips: string[] = [];
    const categoryTotals: { [category: string]: number } = {};
    let smallTransactionCount = 0;
    let totalSpending = 0;
  
    transactions.forEach((txn) => {
      if (txn.amount >= 0) return; // Only expenses
  
      const category = txn.category || "Uncategorized";
      const amountAbs = Math.abs(txn.amount);
  
      categoryTotals[category] = (categoryTotals[category] || 0) + amountAbs;
      totalSpending += amountAbs;
  
      if (amountAbs < 10) smallTransactionCount += 1; // small txns < RM10
    });
  
    // Category-based analysis
    Object.entries(categoryTotals).forEach(([category, total]) => {
      const budget = budgets[category];
  
      if (budget && total > budget * 1.1) {
        tips.push(`🚨 Spending in "${category}" exceeded your budget of RM ${budget.toFixed(2)}.`);
      } else if (budget && total > budget * 0.8) {
        tips.push(`⚠️ You're nearing your budget in "${category}". Consider reviewing your spending.`);
      } else if (!budget && total > totalSpending * 0.3) {
        tips.push(`💡 You're spending a lot in "${category}" (RM ${total.toFixed(2)}). Consider reducing it.`);
      }
    });
  
    // Spending diversity
    if (Object.keys(categoryTotals).length <= 1 && totalSpending > 50) {
      tips.push("📊 Most of your spending is concentrated in one category. Diversify to balance your expenses.");
    }
  
    // Small transactions warning
    if (smallTransactionCount > 10) {
      tips.push("🔍 You have many small transactions. Review if some can be avoided to save money.");
    }
  
    // No spending at all
    if (totalSpending === 0) {
      tips.push("✅ No spending detected this month. Great job controlling your expenses!");
    }
  
    return tips;
  };  

  const updateCategory = async (transactionId: string, newCategory: string) => {
    try {
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, { category: newCategory });
      setTransactions((prevTransactions) =>
        prevTransactions.map((txn) =>
          txn.id === transactionId ? { ...txn, category: newCategory } : txn
        )
      );
    } catch (error) {
      console.error("Error updating category: ", error);
    }
  };

  const addTransaction = async () => {
    if (!inputDate || !inputAmount || !inputDescription) {
      alert("Please fill all fields.");
      return;
    }

    const amountValue = parseFloat(inputAmount);
    const isPlanned = plannedTransactionType === "Future Expense";

    try {
      if (!isPlanned) {
        // ✅ Step 1: Check for matching planned transaction
        const matchingPlannedTxn = transactions.find(
          (txn) =>
            txn.category === inputCategory &&
            txn.description.trim().toLowerCase() ===
              inputDescription.trim().toLowerCase() &&
            txn.date === inputDate &&
            txn.amount === -Math.abs(amountValue) && // planned expenses are saved as negative
            txn.status === "Planned"
        );

        if (matchingPlannedTxn) {
          // ✅ Step 2: Update existing planned transaction to completed
          const transactionRef = doc(db, "transactions", matchingPlannedTxn.id);
          await updateDoc(transactionRef, {
            status: "Completed",
          });

          alert("✅ You’ve completed your planned expense!");

          // Optional: Refresh transaction list
          setShowModal(false);
          return;
        }
      }

      // ✅ Step 3: Add new transaction if no match
      await addDoc(collection(db, "transactions"), {
        date: inputDate,
        transaction_type: plannedTransactionType,
        description: inputDescription,
        amount:
          plannedTransactionType === "Income"
            ? Math.abs(amountValue)
            : -Math.abs(amountValue),
        wallet_balance: 0,
        status: isPlanned ? "Planned" : "Success",
        category: inputCategory,
      });

      await fetchTransactions();

      alert("Transaction added successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error adding transaction: ", error);
      alert("Failed to add transaction.");
    }
  };

  const TransactionItem = memo(
    ({
      item,
      updateCategory,
    }: {
      item: Transaction;
      updateCategory: (id: string, category: string) => void;
    }) => {
      return (
        <View
          style={{
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {item.date} - {item.transaction_type}
          </Text>
          <Text>{item.description}</Text>
          <Text>Amount: RM {item.amount.toFixed(2)}</Text>
          <Text style={{ color: item.status === "Success" ? "green" : "red" }}>
            {item.status}
          </Text>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TouchableOpacity className="mt-2 px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-md self-start">
                <Text className="text-foreground text-sm">
                  {item.category || "Uncategorized"} ⌄
                </Text>
              </TouchableOpacity>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-background border border-border rounded-md">
              {[
                "Food",
                "Entertainment",
                "Transportation",
                "Shopping",
                "Bills",
              ].map((category) => (
                <DropdownMenuItem
                  key={category}
                  onPress={() => updateCategory(item.id, category)}
                >
                  <Text className="text-foreground px-2 py-1">{category}</Text>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Warnings */}
          {item.transaction_type === "Future Expense" &&
          item.status === "Completed" ? (
            <Text style={{ color: "green", fontWeight: "bold" }}>
              ✅ Planned Transaction Completed!
            </Text>
          ) : item.isAbnormal ? (
            <Text style={{ color: "red", fontWeight: "bold" }}>
              ⚠️ High Spending Detected!
            </Text>
          ) : null}
        </View>
      );
    }
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{
          backgroundColor: "#007AFF",
          padding: 10,
          borderRadius: 5,
          marginBottom: 20,
        }}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          + Add Transaction
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white dark:bg-zinc-900 p-6 rounded-lg w-80">
            <Text className="mb-4 text-lg font-bold">Add Transaction</Text>

            {/* Transaction Type */}
            <Text className="mb-2 text-foreground">Transaction Type:</Text>
            {["Expense", "Income", "Future Expense"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setPlannedTransactionType(type)}
                className={`px-3 py-2 rounded-md mb-2 ${
                  plannedTransactionType === type
                    ? "bg-blue-500"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <Text
                  className={`${
                    plannedTransactionType === type
                      ? "text-white"
                      : "text-foreground"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Date */}
            <TextInput
              placeholder="Date (dd/mm/yyyy)"
              value={inputDate}
              onChangeText={setInputDate}
              className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
              placeholderTextColor="#999"
            />

            {/* Category Dropdown */}
            <Text className="mb-2 text-foreground">Category:</Text>
            {[
              "Food",
              "Entertainment",
              "Transportation",
              "Shopping",
              "Bills",
            ].map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setInputCategory(category)}
                className={`px-3 py-2 rounded-md mb-2 ${
                  inputCategory === category
                    ? "bg-blue-500"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <Text
                  className={
                    inputCategory === category
                      ? "text-white"
                      : "text-foreground"
                  }
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Description */}
            <TextInput
              placeholder="Description"
              value={inputDescription}
              onChangeText={setInputDescription}
              className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
              placeholderTextColor="#999"
            />

            {/* Amount */}
            <TextInput
              placeholder="Amount (e.g. 25.50)"
              value={inputAmount}
              onChangeText={setInputAmount}
              keyboardType="numeric"
              className="border border-gray-300 dark:border-zinc-700 p-2 rounded mb-4 text-foreground"
              placeholderTextColor="#999"
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={addTransaction}
              className="bg-green-600 rounded-md py-2 mb-2"
            >
              <Text className="text-white text-center font-semibold">
                Submit
              </Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="bg-gray-400 rounded-md py-2"
            >
              <Text className="text-white text-center font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Transaction History
      </Text>

      {recommendations.length > 0 && (
        <View className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg mb-4">
          <TouchableOpacity
            onPress={() => setShowRecommendations(!showRecommendations)}
            className="flex-row justify-between items-center mb-2"
          >
            <Text className="text-yellow-800 dark:text-yellow-200 font-bold">
              💡 Cost Saving Tips
            </Text>
            <Text className="text-yellow-800 dark:text-yellow-200 font-bold">
              {showRecommendations ? "▲ Hide" : "▼ Show"}
            </Text>
          </TouchableOpacity>

          {showRecommendations &&
            recommendations.map((tip, index) => (
              <Text
                key={index}
                className="text-yellow-800 dark:text-yellow-200 mb-1"
              >
                {tip}
              </Text>
            ))}
        </View>
      )}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem item={item} updateCategory={updateCategory} />
        )}
        initialNumToRender={10} // ✅ Optional: Reduce initial render batch
        maxToRenderPerBatch={10} // ✅ Optional: Control render batches
        windowSize={5} // ✅ Optional: Windowing for performance
      />
    </View>
  );
}
