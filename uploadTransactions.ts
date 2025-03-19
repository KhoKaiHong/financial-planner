import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import transactions from "./transactions.json";

const uploadTransactions = async () => {
  const transactionsRef = collection(db, "transactions");

  try {
    for (const transaction of transactions) {
      await addDoc(transactionsRef, transaction);
    }
    console.log("Transactions uploaded successfully!");
  } catch (error) {
    console.error("Error uploading transactions: ", error);
  }
};

uploadTransactions();
