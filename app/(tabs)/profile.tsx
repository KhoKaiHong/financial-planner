import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { useSignOut } from "~/hooks/useSignOut";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { LoadingCircle } from "~/components/loading-circle";
import React from "react";
import { UserInfo } from "~/components/profile/user-info";
import { BudgetSettingsCard } from "~/components/profile/budget-settings";
import { CurrentBudgetCard } from "~/components/profile/current-budget";

export default function Profile() {
  const router = useRouter();

  const signOutMutation = useSignOut();

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-8 flex gap-4">
        <UserInfo />

        <View className="mb-6 flex gap-4">
          <BudgetSettingsCard />
          <CurrentBudgetCard />
        </View>
        <Button
          variant="destructive"
          onPress={() => {
            signOutMutation.mutate(undefined, {
              onSuccess: () => {
                router.dismissAll();
                router.replace("/");
              },
              onError: () => {
                router.dismissAll();
                router.replace("/error");
              },
            });
          }}
        >
          <Text>Sign out</Text>
        </Button>
        {signOutMutation.isPending && (
          <View className="absolute flex justify-center items-center w-full h-full bg-background">
            <LoadingCircle size={60} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
