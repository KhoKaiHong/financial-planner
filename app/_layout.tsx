import "~/global.css";

import {
  Theme,
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { DevToolsBubble } from "react-native-react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { PortalHost } from "@rn-primitives/portal";
import { ColorSchemeToggle } from "~/components/color-scheme-toggle";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text } from "~/components/ui/text";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [fontLoaded, fontError] = useFonts({
    "inter-black": require("../assets/fonts/Inter-Black.otf"),
    "inter-black-italic": require("../assets/fonts/Inter-BlackItalic.otf"),
    "inter-extrabold": require("../assets/fonts/Inter-ExtraBold.otf"),
    "inter-extrabold-italic": require("../assets/fonts/Inter-ExtraBoldItalic.otf"),
    "inter-bold": require("../assets/fonts/Inter-Bold.otf"),
    "inter-bold-italic": require("../assets/fonts/Inter-BoldItalic.otf"),
    "inter-semibold": require("../assets/fonts/Inter-SemiBold.otf"),
    "inter-semibold-italic": require("../assets/fonts/Inter-SemiBoldItalic.otf"),
    "inter-medium": require("../assets/fonts/Inter-Medium.otf"),
    "inter-medium-italic": require("../assets/fonts/Inter-MediumItalic.otf"),
    inter: require("../assets/fonts/Inter-Regular.otf"),
    "inter-italic": require("../assets/fonts/Inter-Italic.otf"),
    "inter-light": require("../assets/fonts/Inter-Light.otf"),
    "inter-light-italic": require("../assets/fonts/Inter-LightItalic.otf"),
    "inter-extralight": require("../assets/fonts/Inter-ExtraLight.otf"),
    "inter-extralight-italic": require("../assets/fonts/Inter-ExtraLightItalic.otf"),
    "inter-thin": require("../assets/fonts/Inter-Thin.otf"),
    "inter-thin-italic": require("../assets/fonts/Inter-ThinItalic.otf"),
  });

  useEffect(() => {
    if (fontLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, fontError]);

  const queryClient = new QueryClient();

  const onCopy = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch {
      return false;
    }
  };

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!fontLoaded && !fontError) {
    return null;
  }

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <Stack screenOptions={{ headerRight: () => <ColorSchemeToggle /> }}>
            <Stack.Screen
              name="index"
              options={{
                headerTitle: "Login",
                headerTitleStyle: { fontFamily: "inter-medium" },
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="signup"
              options={{
                headerTitle: "Sign Up",
                headerTitleStyle: { fontFamily: "inter-medium" },
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="verify"
              options={{
                headerTitle: "Verify Your Email",
                headerTitleStyle: { fontFamily: "inter-medium" },
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen
              name="error"
              options={{
                headerTitle: "Error",
                headerTitleStyle: { fontFamily: "inter-medium" },
                headerTitleAlign: "center",
              }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <PortalHost />
        </ThemeProvider>
        {/* <DevToolsBubble onCopy={onCopy} /> */}
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
