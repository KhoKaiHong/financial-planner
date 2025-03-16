import { Tabs } from "expo-router";
import { House } from "~/lib/icons/House";
import { Settings } from "~/lib/icons/Settings";
import { User } from "~/lib/icons/User";
import { useColorScheme } from "~/lib/useColorScheme";

export default function TabsLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkColorScheme ? "white" : "black",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: "Home",
          title: "Home",
          tabBarIcon: ({ color }) => <House size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
      <Tabs.Screen name="transaction-history" options={{ title: 'Transactions' }} />
    </Tabs>
  );
}
