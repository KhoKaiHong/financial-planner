import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "~/firebaseConfig";

type Budget = {
  bills?: number;
  food?: number;
  entertainment?: number;
  transport?: number;
  others?: number;
};

async function fetchBudget() {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("No user ID");
  }

  const budgetRef = await getDoc(doc(db, "budgets", userId));

  if (budgetRef.exists()) {
    return budgetRef.data() as Budget;
  } else {
    return null;
  }
}

export function useBudget() {
  return useQuery({
    queryFn: fetchBudget,
    queryKey: ["useBudget"],
  });
}
