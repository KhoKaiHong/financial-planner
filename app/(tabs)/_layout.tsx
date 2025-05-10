import { Redirect, Tabs } from "expo-router";
import { House } from "~/lib/icons/House";
import { Settings } from "~/lib/icons/Settings";
import { User } from "~/lib/icons/User";
import { Utensils } from "~/lib/icons/Utensils";
import { useColorScheme } from "~/lib/useColorScheme";
import { useRouter } from "expo-router";
import { auth } from "~/firebaseConfig";
import { ColorSchemeToggle } from "~/components/color-scheme-toggle";
import { NAV_THEME } from "~/lib/constants";
import { BarChart2 } from "~/lib/icons/BarChart2";
import { Award } from "~/lib/icons/Award";
import { Sparkles } from "~/lib/icons/Sparkles";

export default function TabsLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();

  if (!(auth.currentUser && auth.currentUser.emailVerified)) {
    router.dismissAll();
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkColorScheme
          ? NAV_THEME.dark.primary
          : NAV_THEME.light.primary,
        tabBarLabelStyle: { fontFamily: "inter-medium", fontSize: 11 },
        headerRight: () => <ColorSchemeToggle />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerTitle: "Home",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <House size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction-history"
        options={{
          title: "Transactions",
          headerTitle: "Transactions",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <BarChart2 size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="badges"
        options={{
          title: "Badges",
          headerTitle: "Badges",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <Award size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="playground"
        options={{
          title: "Playground",
          headerTitle: "Playground",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <Sparkles size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: "Food Finder",
          headerTitle: "Food Finder",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <Utensils size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "Profile",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
