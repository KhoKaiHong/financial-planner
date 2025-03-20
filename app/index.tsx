import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { View } from "react-native";
import { Sun } from "~/lib/icons/Sun";
import { MoonStar } from "~/lib/icons/MoonStar";
import { useColorScheme } from "~/lib/useColorScheme";
import { Link, Redirect } from "expo-router";
import { auth } from "~/firebaseConfig";

export default function Login() {
  if (auth.currentUser && auth.currentUser.emailVerified) {
    return <Redirect href="/home" />;
  }

  if (auth.currentUser && !auth.currentUser.emailVerified) {
    return <Redirect href="/verify" />;
  }

  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <Link href="/home" className="text-muted-foreground" replace={true}>
        Hello
      </Link>
      <Link href="/signup" className="text-muted-foreground" replace={true}>
        Hello
      </Link>
    </View>
  );
}
