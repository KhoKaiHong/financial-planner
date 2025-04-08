"use client"

import { View, TextInput, Alert, ScrollView } from "react-native"
import { Text } from "~/components/ui/text"
import { SafeAreaView } from "react-native-safe-area-context"
import { signOut } from "firebase/auth"
import { auth, db } from "~/firebaseConfig"
import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "expo-router"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { TouchableOpacity } from "react-native"
import { ChevronDown, LogOut, User, DollarSign, Tag, Save } from "lucide-react-native"
import { Card, SectionTitle, Button, Divider } from "~/components/ui-elements"

const categoryOptions = ["Food", "Transport", "Shopping", "Bills", "Others"]

export default function Profile() {
  const router = useRouter()
  const uid = auth.currentUser?.uid
  const userEmail = auth.currentUser?.email

  const [budgets, setBudgets] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [amountInput, setAmountInput] = useState<string>("")
  const [userName, setUserName] = useState(auth.currentUser?.displayName || "User")
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    transactions: 0,
  })

  // Load existing budgets and user data
  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return

      // Fetch budgets
      const budgetSnap = await getDoc(doc(db, "budgets", uid))
      if (budgetSnap.exists()) {
        const now = new Date()
        const monthKey = `${now.getFullYear()}_${now.getMonth()}`
        setBudgets(budgetSnap.data()[monthKey] || {})
      }

      // Fetch user stats
      const userSnap = await getDoc(doc(db, "users", uid))
      if (userSnap.exists()) {
        const userData = userSnap.data()
        setUserStats({
          level: userData.level || 1,
          xp: userData.xp || 0,
          streak: userData.streak || 0,
          transactions: userData.transactions || 0,
        })
      }
    }

    fetchData()
  }, [uid])

  const saveBudget = async () => {
    if (!uid || !selectedCategory) return
  
    const amount = Number.parseFloat(amountInput)
    if (isNaN(amount)) {
      Alert.alert("Invalid input", "Please enter a valid number.")
      return
    }
  
    try {
      const docRef = doc(db, "budgets", uid)
      const docSnap = await getDoc(docRef)
      const existingData = docSnap.exists() ? docSnap.data() : {}
  
      const updatedGlobal = {
        ...(existingData["global"] || {}),
        [selectedCategory]: amount,
      }
  
      await setDoc(docRef, {
        ...existingData,
        global: updatedGlobal,
      })
  
      Alert.alert("Success", `Budget for "${selectedCategory}" saved globally.`)
      setBudgets((prev) => ({ ...prev, [selectedCategory]: amount }))
    } catch (e) {
      console.error(e)
      Alert.alert("Error", "Failed to save budget.")
    }
  }  

  const { mutate: signOutMutate, isPending: isSigningOut } = useMutation({
    mutationFn: () => signOut(auth),
    onError(error) {
      console.log(error)
      Alert.alert("Error", "Failed to sign out. Please try again.")
    },
  })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mb-4">
            <User size={40} className="text-indigo-500" />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-1">{userName}</Text>
          <Text className="text-muted-foreground">{userEmail}</Text>

          <View className="flex-row mt-4">
            <View className="items-center mx-4">
              <Text className="text-2xl font-bold text-foreground">{userStats.level}</Text>
              <Text className="text-xs text-muted-foreground">Level</Text>
            </View>
            <View className="items-center mx-4">
              <Text className="text-2xl font-bold text-foreground">{userStats.streak}</Text>
              <Text className="text-xs text-muted-foreground">Day Streak</Text>
            </View>
            <View className="items-center mx-4">
              <Text className="text-2xl font-bold text-foreground">{userStats.xp}</Text>
              <Text className="text-xs text-muted-foreground">XP</Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* Budget Settings */}
        <View className="mb-6">
          <SectionTitle>
            <View className="flex-row items-center">
              <DollarSign size={18} className="text-indigo-500 mr-2" />
              <Text>Budget Settings</Text>
            </View>
          </SectionTitle>

          <Card>
            <Text className="text-sm text-muted-foreground mb-3">
              Set monthly spending limits for each category to help manage your finances.
            </Text>

            {/* Category Dropdown */}
            <Text className="text-sm font-medium text-foreground mb-2">Select Category</Text>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg mb-4">
                  <View className="flex-row items-center">
                    <Tag size={16} className="text-indigo-500 mr-2" />
                    <Text className="text-foreground">{selectedCategory || "Select Category"}</Text>
                  </View>
                  <ChevronDown size={16} className="text-foreground" />
                </TouchableOpacity>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categoryOptions.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onPress={() => {
                      setSelectedCategory(cat)
                      setAmountInput(budgets[cat]?.toString() || "")
                    }}
                  >
                    <Text className="text-foreground px-2 py-1">{cat}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Budget Input */}
            {selectedCategory && (
              <>
                <Text className="text-sm font-medium text-foreground mb-2">Monthly Budget (RM)</Text>
                <View className="flex-row items-center mb-4">
                  <TextInput
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg text-foreground"
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={amountInput}
                    onChangeText={setAmountInput}
                  />
                </View>

                <Button onPress={saveBudget} variant="primary" fullWidth>
                  <View className="flex-row items-center">
                    <Save size={16} className="text-white mr-2" />
                    <Text>Save Budget</Text>
                  </View>
                </Button>
              </>
            )}
          </Card>

          {/* Current Budgets */}
          {Object.keys(budgets).length > 0 && (
            <Card>
              <Text className="font-medium text-foreground mb-3">Current Budget Limits</Text>
              {Object.entries(budgets).map(([category, amount]) => (
                <View key={category} className="flex-row justify-between items-center mb-2">
                  <Text className="text-foreground">{category}</Text>
                  <Text className="font-medium text-foreground">RM {amount.toFixed(2)}</Text>
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* Sign Out */}
        <Button
          variant="destructive"
          onPress={() =>
            signOutMutate(undefined, {
              onSuccess: () => {
                router.dismissAll()
                router.replace("/")
              },
            })
          }
          fullWidth
          disabled={isSigningOut}
        >
          <View className="flex-row items-center">
            <LogOut size={16} className="text-white mr-2" />
            <Text>{isSigningOut ? "Signing out..." : "Sign out"}</Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}

