import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "~/firebaseConfig";

type Budget = {
  bills: number;
  food: number;
  entertainment: number;
  transport: number;
  others: number;
};

async function setBudget(budget: Budget) {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("No user ID");
  }

  const budgetRef = doc(db, "budgets", userId);

  await setDoc(budgetRef, budget);
}

export function useSetBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setBudget,
    mutationKey: ["useSetBudget"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useBudget"] });
    },
  });
}
