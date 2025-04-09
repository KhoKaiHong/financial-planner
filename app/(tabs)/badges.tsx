import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { Card, CardContent } from "~/components/ui/card";
import { Badge as BadgeComponent } from "~/components/ui/badge";
import { Award } from "~/lib/icons/Award";
import { Calendar } from "~/lib/icons/Calendar";
import { DollarSign } from "~/lib/icons/DollarSign";
import { Lock } from "~/lib/icons/Lock";
import { Trophy } from "~/lib/icons/Trophy";
import { TrendingUp } from "~/lib/icons/TrendingUp";
import { useState } from "react";

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
    <View className="flex-1 px-8 py-8 gap-4">
      <View>
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
                selectedCategory === category.id ? "bg-primary" : "bg-muted"
              }`}
            >
              <category.icon
                size={16}
                className={
                  selectedCategory === category.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }
              />

              <Text
                className={`ml-2 ${
                  selectedCategory === category.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex gap-4">
          {filteredBadges.map((badge, index) => (
            <Card
              key={index}
              className={`${badge.isEarned ? "opacity-100" : "opacity-60"}`}
            >
              <CardContent className="py-6 px-4">
                <View className="flex-row items-center">
                  <View
                    className={`w-14 h-14 rounded-full relative ${
                      badge.isEarned ? "bg-secondary" : "bg-muted"
                    } items-center justify-center mr-4`}
                  >
                    {/* Emoji Icon */}
                    {badge.isEarned ? (
                      <Text className="text-3xl">{badge.icon}</Text>
                    ) : (
                      <Lock
                        size={24}
                        className="text-muted-foreground"
                      />
                    )}
                  </View>

                  <View className="flex-1 gap-2">
                    <View className="flex-row items-center">
                      <Text className="text-lg font-semibold text-foreground mr-2">
                        {badge.title}
                      </Text>
                      {badge.isEarned && (
                        <BadgeComponent variant="success">
                          <Text>Earned</Text>
                        </BadgeComponent>
                      )}
                    </View>

                    <Text className="text-sm text-muted-foreground">
                      {badge.description}
                    </Text>

                    {!badge.isEarned && (
                      <Text className="text-xs text-primary">
                        Complete the challenge to unlock this badge
                      </Text>
                    )}
                  </View>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
