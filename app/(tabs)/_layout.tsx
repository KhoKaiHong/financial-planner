"use client"

import { Redirect, Tabs } from "expo-router"
import { Home, BarChart2, Award, User, Settings, Sparkles } from "lucide-react-native"
import { useColorScheme } from "~/lib/useColorScheme"
import { useRouter } from "expo-router"
import { auth } from "~/firebaseConfig"
import { ColorSchemeToggle } from "~/components/color-scheme-toggle"
import { NAV_THEME } from "~/lib/constants"

export default function TabsLayout() {
  const { isDarkColorScheme } = useColorScheme()
  const router = useRouter()

  if (!(auth.currentUser && auth.currentUser.emailVerified)) {
    router.dismissAll()
    return <Redirect href="/" />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkColorScheme ? NAV_THEME.dark.primary : NAV_THEME.light.primary,
        tabBarLabelStyle: { fontFamily: "inter-medium", fontSize: 11 },
        headerRight: () => <ColorSchemeToggle />,
        headerTitleStyle: { fontFamily: "inter-medium" },
        headerTitleAlign: "center",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: isDarkColorScheme ? "#27272a" : "#e5e7eb",
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction-history"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="badges"
        options={{
          title: "Badges",
          tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="playground"
        options={{
          title: "Playground",
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}

