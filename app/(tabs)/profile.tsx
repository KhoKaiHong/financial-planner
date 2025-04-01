import { View, TextInput, Alert } from "react-native";
import { Text } from "~/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth, db } from "~/firebaseConfig";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { TouchableOpacity } from "react-native";
import { ChevronDown } from "~/lib/icons/ChevronDown";

const categoryOptions = ["Food", "Transport", "Shopping", "Bills", "Others"];

export default function Profile() {
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");

  // Load existing budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!uid) return;
      const docSnap = await getDoc(doc(db, "budgets", uid));
      if (docSnap.exists()) {
        setBudgets(docSnap.data() as Record<string, number>);
      }
    };
    fetchBudgets();
  }, [uid]);

  const saveBudget = async () => {
    if (!uid || !selectedCategory) return;
  
    const amount = parseFloat(amountInput);
    if (isNaN(amount)) {
      Alert.alert("Invalid input", "Please enter a valid number.");
      return;
    }
  
    const now = new Date();
    const monthKey = `${now.getFullYear()}_${now.getMonth()}`; // e.g. "2024_4"
  
    try {
      const docRef = doc(db, "budgets", uid);
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};
  
      const updatedMonth = {
        ...(existingData[monthKey] || {}),
        [selectedCategory]: amount,
      };
  
      await setDoc(docRef, {
        ...existingData,
        [monthKey]: updatedMonth,
      });
  
      Alert.alert("Success", `Budget for "${selectedCategory}" saved.`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save budget.");
    }
  };  

  const { mutate: signOutMutate } = useMutation({
    mutationFn: () => signOut(auth),
    onError(error) {
      console.log(error);
    },
  });

  return (
    <SafeAreaView className="flex-1">
      <View className="px-8 flex flex-col gap-4">
        <Text className="py-16 text-5xl self-center font-inter-thin">Profile</Text>

        {/* 🔽 Category Dropdown */}
        <Text className="text-xl font-semibold mb-1">📂 Set Your Budget</Text>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TouchableOpacity className="flex flex-row items-center bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg">
              <Text className="text-foreground mr-2">
                {selectedCategory || "Select Category"}
              </Text>
              <ChevronDown className="text-foreground" />
            </TouchableOpacity>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {categoryOptions.map((cat) => (
              <DropdownMenuItem
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setAmountInput(budgets[cat]?.toString() || "");
                }}
              >
                <Text className="text-foreground px-2 py-1">{cat}</Text>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 💸 Budget Input */}
        {selectedCategory && (
          <>
            <Text className="text-foreground mt-4 mb-1">
              💰 Monthly Budget for {selectedCategory}:
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg text-foreground"
              placeholder="Enter amount (RM)"
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
            />

            <Button className="mt-4" onPress={saveBudget}>
              <Text>💾 Save Budget</Text>
            </Button>
          </>
        )}

        {/* 🔐 Sign Out */}
        <Button
          variant="destructive"
          className="mt-10"
          onPress={() =>
            signOutMutate(undefined, {
              onSuccess: () => {
                router.dismissAll();
                router.replace("/");
              },
            })
          }
        >
          <Text>🚪 Sign out</Text>
        </Button>

        <Text className="mt-4 text-center text-zinc-400">
          {auth.currentUser?.email}
        </Text>
      </View>
    </SafeAreaView>
  );
}
