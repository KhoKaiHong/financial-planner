"use client";

import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import {
  Card,
  SectionTitle,
  Badge as BadgeComponent,
} from "~/components/ui-elements";
import {
  Award,
  Lock,
  Trophy,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react-native";
import { useState } from "react";
import LottieSparkle from "~/components/LottieSparkle"; // optional

const badges = [
  {
    title: "Login Starter",
    icon: "📅",
    description: "Your journey begins! This badge marks your first login.",
    isEarned: true,
    category: "login",
  },
  {
    title: "Three-Day Trailblazer",
    icon: "🔥",
    description: "Three days in a row! You're blazing a trail of consistency.",
    isEarned: true,
    category: "login",
  },
  {
    title: "Seven-Day Streak",
    icon: "🧱",
    description: "A full week of logins! Your streak is going strong.",
    isEarned: true,
    category: "login",
  },
  {
    title: "Budget Starter",
    icon: "💼",
    description:
      "You've started tracking your budget. The first step to greatness!",
    isEarned: true,
    category: "budget",
  },
  {
    title: "Saved RM50",
    icon: "💰",
    description: "You've successfully saved RM50. Keep going!",
    isEarned: true,
    category: "savings",
  },
  {
    title: "Expense Tracker",
    icon: "📊",
    description: "Track 10 expenses to earn this badge.",
    isEarned: false,
    category: "tracking",
  },
  {
    title: "Budget Master",
    icon: "🏆",
    description: "Stay under budget in all categories for a month.",
    isEarned: false,
    category: "budget",
  },
  {
    title: "Savings Champion",
    icon: "💎",
    description: "Save RM500 in total.",
    isEarned: false,
    category: "savings",
  },
];

const categories = [
  { id: "all", name: "All Badges", icon: Trophy },
  { id: "login", name: "Login Streaks", icon: Calendar },
  { id: "budget", name: "Budgeting", icon: DollarSign },
  { id: "savings", name: "Savings", icon: TrendingUp },
  { id: "tracking", name: "Tracking", icon: Award },
];

export default function BadgesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredBadges =
    selectedCategory === "all"
      ? badges
      : badges.filter((badge) => badge.category === selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <Trophy size={20} className="text-indigo-500 mr-2" />
          <SectionTitle>Achievement Badges</SectionTitle>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${
                selectedCategory === category.id
                  ? "bg-indigo-500"
                  : "bg-gray-100 dark:bg-zinc-800"
              }`}
            >
              <category.icon
                size={16}
                className={
                  selectedCategory === category.id
                    ? "text-white"
                    : "text-indigo-500"
                }
              />

              <Text
                className={`ml-2 ${
                  selectedCategory === category.id
                    ? "text-white"
                    : "text-foreground"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredBadges.map((badge, index) => (
          <Card key={index} style={{ opacity: badge.isEarned ? 1 : 0.7 }}>
            <View className="flex-row items-start">
              <View
                className={`w-14 h-14 rounded-full relative ${
                  badge.isEarned
                    ? "bg-indigo-100 dark:bg-indigo-900"
                    : "bg-gray-200 dark:bg-zinc-800"
                } items-center justify-center mr-4`}
              >
                {badge.isEarned && (
                  <>
                    {/* Sparkle Top Left */}
                    <View className="absolute -top-2 -left-0.5 w-7 h-7">
                      <LottieSparkle />
                    </View>

                    {/* Sparkle Bottom Right */}
                    <View className="absolute -bottom-2 -right-1 w-7 h-10">
                      <LottieSparkle />
                    </View>
                  </>
                )}

                {/* Emoji Icon */}
                {badge.isEarned ? (
                  <Text className="text-3xl">{badge.icon}</Text>
                ) : (
                  <Lock
                    size={24}
                    className="text-gray-400 dark:text-zinc-600"
                  />
                )}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-lg font-semibold text-foreground mr-2">
                    {badge.title}
                  </Text>
                  {badge.isEarned && (
                    <BadgeComponent label="Earned" color="green" />
                  )}
                </View>

                <Text className="text-sm text-muted-foreground">
                  {badge.description}
                </Text>

                {!badge.isEarned && (
                  <Text className="text-xs text-indigo-500 mt-2">
                    Complete the challenge to unlock this badge
                  </Text>
                )}
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
