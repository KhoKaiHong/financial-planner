import { View } from "react-native";
import { User } from "~/lib/icons/User";
import { Text } from "~/components/ui/text";
import { auth } from "~/firebaseConfig";
import { useUserInfo } from "~/hooks/useUserInfo";

export function UserInfo() {
  const useUserInfoQuery = useUserInfo();
  return (
    <View className="flex items-center pt-8 pb-2 gap-2">
      <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center">
        <User size={40} className="text-primary" />
      </View>
      <Text className="text-2xl font-inter-semibold text-foreground">
        {auth.currentUser?.displayName ?? "User"}
      </Text>
      <Text className="text-muted-foreground">{auth.currentUser?.email ?? "Email"}</Text>

      <View className="flex-row gap-8 pt-2">
        <View className="items-center">
          <Text className="text-2xl font-inter-semibold text-foreground">
            {useUserInfoQuery.data?.level}
          </Text>
          <Text className="text-xs text-muted-foreground">Level</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-inter-semibold text-foreground">
            {useUserInfoQuery.data?.streak}
          </Text>
          <Text className="text-xs text-muted-foreground">Day Streak</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-inter-semibold text-foreground">
            {useUserInfoQuery.data?.xp}
          </Text>
          <Text className="text-xs text-muted-foreground">XP</Text>
        </View>
      </View>
    </View>
  );
}
