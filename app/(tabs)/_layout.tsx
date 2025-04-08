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
          headerTitle: "Home",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          title: "Home",
          tabBarIcon: ({ color }) => <House size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          title: "Profile",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          headerTitle: "Food Finder",
          title: "Food Finder",
          headerTitleStyle: { fontFamily: "inter-medium" },
          headerTitleAlign: "center",
          tabBarIcon: ({ color }) => <Utensils size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction-history"
        options={{ title: "Transactions" }}
      />
    </Tabs>
  );
}
