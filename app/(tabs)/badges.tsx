import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import LottieSparkle from "~/components/LottieSparkle"; // optional

const badges = [
  {
    title: "Login Starter",
    icon: "📅",
    description: "Your journey begins! This badge marks your first login.",
  },
  {
    title: "Three-Day Trailblazer",
    icon: "🔥",
    description: "Three days in a row! You’re blazing a trail of consistency.",
  },
  {
    title: "Seven-Day Streak",
    icon: "🧱",
    description: "A full week of logins! Your streak is going strong.",
  },
  {
    title: "Budget Starter",
    icon: "💼",
    description:
      "You've started tracking your budget. The first step to greatness!",
  },
  {
    title: "Saved RM50",
    icon: "💰",
    description: "You've successfully saved RM50. Keep going!",
  },
];

export default function BadgesPage() {
  return (
    <SafeAreaView className="flex-1 bg-background px-6 pt-10">
      <Text className="text-2xl font-bold text-foreground mb-4">
        🎖️ All Badges
      </Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {badges.map((badge, index) => (
          <View
            key={index}
            className="relative bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-700 p-4 mb-4 shadow-md"
          >
            {/* Optional sparkle animation */}
            {(
              <View className="absolute top-[-10] right-[-10] z-10">
                <LottieSparkle />
              </View>
            )}

            <View className="flex-row items-start gap-4">
              <Text className="text-3xl">{badge.icon}</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground mb-1">
                  {badge.title}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {badge.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
