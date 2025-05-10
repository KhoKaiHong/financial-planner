import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Link, Redirect } from "expo-router";
import { auth } from "~/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginForm } from "~/components/login/form";
import { useCallback, useState } from "react";
import { LoadingCircle } from "~/components/loading-circle";
import { UnverifiedDialog } from "~/components/login/unverified-dialog";

export default function Login() {
  if (auth.currentUser && auth.currentUser.emailVerified) {
    return <Redirect href="/home" />;
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
          <View className="px-8 flex flex-col gap-20">
            <Text className="py-32 text-5xl self-center font-inter-thin">
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

          <UnverifiedDialog setLoadingState={setLoadingState} />
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
