import { Redirect, Tabs } from "expo-router";
import { House } from "~/lib/icons/House";
import { Settings } from "~/lib/icons/Settings";
import { User } from "~/lib/icons/User";
import { Check } from "~/lib/icons/Check";
import { ChevronRight } from "~/lib/icons/ChevronRight";
import { MoonStar } from "~/lib/icons/MoonStar"; // 🌟 use for Playground for now
import { useColorScheme } from "~/lib/useColorScheme";
import { useRouter } from "expo-router";
import { auth } from "~/firebaseConfig";
import { ColorSchemeToggle } from "~/components/color-scheme-toggle";
import { NAV_THEME } from "~/lib/constants";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ScrollView, View } from "react-native";

const Tab = createBottomTabNavigator();

function CustomTabBar(props: any) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row" }}>
        <props.tabBar {...props} />
      </View>
    </ScrollView>
  );
}

export default function TabsLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();

  if (!(auth.currentUser && auth.currentUser.emailVerified)) {
    router.dismissAll();
    return <Redirect href="/" />;
  }

  const screens = [
    {
      name: "home",
      title: "Home",
      icon: House,
    },
    {
      name: "transaction-history",
      title: "Transactions",
      icon: ChevronRight,
    },
    {
      name: "badges",
      title: "Badges",
      icon: Check,
    },
    {
      name: "profile",
      title: "Profile",
      icon: User,
    },
    {
      name: "settings",
      title: "Settings",
      icon: Settings,
    },
    {
      name: "playground",
      title: "Playground",
      icon: MoonStar,
    },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkColorScheme
          ? NAV_THEME.dark.primary
          : NAV_THEME.light.primary,
        tabBarLabelStyle: { fontFamily: "inter-medium", fontSize: 11 },
        headerRight: () => <ColorSchemeToggle />,
        headerTitleStyle: { fontFamily: "inter-medium" },
        headerTitleAlign: "center",
      }}
    >
      {screens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color }) => <screen.icon size={20} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
