import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Link, Redirect } from "expo-router";
import { auth } from "~/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginForm } from "~/components/login/form";
import { useCallback, useState } from "react";
import { LoadingCircle } from "~/components/loading-circle";

export default function Login() {
  if (auth.currentUser && auth.currentUser.emailVerified) {
    return <Redirect href="/home" />;
  }

  if (auth.currentUser && !auth.currentUser.emailVerified) {
    return <Redirect href="/verify" />;
  }

  const [isLoading, setIsLoading] = useState(false);

  const setLoadingState = useCallback(
    (isLoading: boolean) => {
      setIsLoading(isLoading);
    },
    [setIsLoading]
  );

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <View className="px-8 flex flex-col gap-4">
            <Link
              href="/error"
              className="text-muted-foreground"
              replace={true}
            >
              Hello
            </Link>
            <Text className="py-16 text-5xl self-center font-inter-thin">
              Log In
            </Text>
            <LoginForm setLoadingState={setLoadingState} />
          </View>
          <View className="flex flex-row justify-center pb-8">
            <Text className="text-muted-foreground">
              New to this app?&nbsp;
            </Text>
            <Link href="/signup" className="text-blue-500" replace={true}>
              Register Now.
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isLoading && (
        <View className="absolute flex justify-center items-center w-full h-full bg-background">
          <LoadingCircle size={60} />
        </View>
      )}
    </SafeAreaView>
  );
}
