import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "~/firebaseConfig";

async function changeBudget({
  amount,
  category,
}: {
  amount: number;
  category: string;
}) {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("No user ID");
  }

  const budgetRef = doc(db, "budgets", userId);

  await updateDoc(budgetRef, {
    [category]: amount,
  });
}

export function useChangeBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeBudget,
    mutationKey: ["useChangeBudget"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["useBudget"] });
    },
  });
}
