import { Redirect, Tabs } from "expo-router";
import { House } from "~/lib/icons/House";
import { Settings } from "~/lib/icons/Settings";
import { User } from "~/lib/icons/User";
import { useColorScheme } from "~/lib/useColorScheme";
import { useRouter } from "expo-router";
import { auth } from "~/firebaseConfig";

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
    </Tabs>
  );
}
