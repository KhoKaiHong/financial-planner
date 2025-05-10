import { View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Shield } from "~/lib/icons/Shield";
import { Text } from "~/components/ui/text";
import { useBudget } from "~/hooks/useBudget";

export function CurrentBudgetCard() {
  const useBudgetQuery = useBudget();
  
  return (
    <Card className="w-full">
      <CardHeader className="gap-2">
        <View className="flex-row items-center gap-2">
          <Shield size={18} className="text-primary" />
          <CardTitle className="text-xl">Current Budget Limits</CardTitle>
        </View>
      </CardHeader>
      <CardContent className="flex gap-2 justify-center">
        {useBudgetQuery.data ? (
          Object.entries(useBudgetQuery.data).map(([category, amount]) => (
            <View
              key={category}
              className="flex-row justify-between items-center"
            >
              <Text className="text-foreground">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <Text className="font-inter-medium text-foreground">
                RM {amount.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text>No budget data available</Text>
        )}
      </CardContent>
    </Card>
  );
}
