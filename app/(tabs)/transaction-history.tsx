import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { db } from "../../firebaseConfig"; // Ensure correct path to firebaseConfig.ts
import { collection, getDocs } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
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

  useEffect(() => {
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

        setTransactions(transactionList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Function to detect abnormal spending using K-Means clustering
  const detectAbnormalSpending = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {};
  
    transactions.forEach((txn) => {
      if (!grouped[txn.category!]) grouped[txn.category!] = [];
      grouped[txn.category!].push(txn);
    });
  
    Object.keys(grouped).forEach((category) => {
      const amounts = grouped[category].map((txn) => txn.amount);
      if (amounts.length < 3) return; // Need at least 3 transactions per category
  
      // Calculate Mean (Average)
      const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  
      // Calculate Standard Deviation
      const squaredDiffs = amounts.map((val) => (val - mean) ** 2);
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
  
      // Define threshold for abnormal spending (1.5 standard deviations above mean)
      const threshold = mean + 1.5 * stdDev;
  
      // Mark transactions as abnormal if they exceed the threshold
      grouped[category].forEach((txn) => {
        if (txn.amount > threshold) {
          txn.isAbnormal = true;
        }
      });
    });
  
    return transactions;
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Transaction History
      </Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
            <Text>Balance: RM {item.wallet_balance.toFixed(2)}</Text>
            <Text
              style={{ color: item.status === "Success" ? "green" : "red" }}
            >
              {item.status}
            </Text>

            {/* Category Picker */}
            {/* <Picker
              selectedValue={item.category}
              onValueChange={(value) => updateCategory(item.id, value)}
            >
              <Picker.Item label="Select Category" value="Uncategorized" />
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Entertainment" value="Entertainment" />
              <Picker.Item label="Transportation" value="Transportation" />
              <Picker.Item label="Shopping" value="Shopping" />
              <Picker.Item label="Bills" value="Bills" />
            </Picker> */}

            {/* Display warning if abnormal spending detected */}
            {item.isAbnormal && (
              <Text style={{ color: "red", fontWeight: "bold" }}>
                ⚠️ High Spending Detected!
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
