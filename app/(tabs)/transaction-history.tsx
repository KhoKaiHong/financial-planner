import { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { db } from "../../firebaseConfig"; // Ensure correct path to firebaseConfig.ts
import { collection, getDocs } from "firebase/firestore";

// Define TypeScript type for transactions
type Transaction = {
  id: string;
  date: string;
  transaction_type: string;
  description: string;
  amount: number;
  wallet_balance: number;
  status: string;
};

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const transactionList: Transaction[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Transaction, "id">; // Remove 'id' from Firestore data
          return { id: doc.id, ...data }; // Manually set 'id' from Firestore doc
        });
        setTransactions(transactionList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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
          </View>
        )}
      />
    </View>
  );
}
