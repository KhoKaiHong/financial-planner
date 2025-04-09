import { TouchableOpacity, View } from "react-native";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { DollarSign } from "~/lib/icons/DollarSign";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tag } from "~/lib/icons/Tag";
import { ChevronDown } from "~/lib/icons/ChevronDown";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { useChangeBudget } from "~/hooks/useChangeBudget";
import { Save } from "~/lib/icons/Save";

const categoryOptions = [
  "Food",
  "Transport",
  "Entertainment",
  "Bills",
  "Others",
];

export function BudgetSettingsCard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");
  const useChangeBudgetMutation = useChangeBudget();

  return (
    <Card className="w-full">
      <CardHeader className="gap-2">
        <View className="flex-row items-center gap-2">
          <DollarSign size={18} className="text-primary" />
          <CardTitle className="text-xl">Budget Settings</CardTitle>
        </View>

        <CardDescription>
          Set monthly spending limits for each category to help manage your
          finances.
        </CardDescription>
      </CardHeader>

      <CardContent className="gap-4">
        <View className="flex gap-2">
          <Text className="text-sm font-inter-medium">Select Category</Text>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg">
                <View className="flex-row items-center gap-2">
                  <Tag size={16} className="text-primary" />
                  <Text className="text-foreground">
                    {selectedCategory || "Select Category"}
                  </Text>
                </View>
                <ChevronDown size={16} className="text-foreground" />
              </TouchableOpacity>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categoryOptions.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onPress={() => {
                    setSelectedCategory(category);
                  }}
                >
                  <Text className="text-foreground px-2 py-1">{category}</Text>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        {/* Budget Input */}
        {selectedCategory && (
          <View className="flex gap-2">
            <Text className="text-sm font-inter-medium text-foreground">
              Monthly Budget (RM)
            </Text>
            <Input
              className="w-full mb-4"
              placeholder="Enter amount"
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
            />

            <Button
              onPress={() =>
                useChangeBudgetMutation.mutate({
                  amount: Number(amountInput),
                  category: selectedCategory.toLowerCase(),
                })
              }
            >
              <View className="flex-row items-center gap-2">
                <Save size={16} className="text-primary-foreground" />
                <Text>Save Budget</Text>
              </View>
            </Button>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
