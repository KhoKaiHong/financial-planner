import { KeyboardAvoidingView, View, ScrollView, Platform } from "react-native";
import { Text } from "~/components/ui/text";
import { Separator } from "~/components/ui/separator";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignUpForm } from "~/components/signup/form";
import { Link } from "expo-router";
import { LoadingCircle } from "~/components/loading-circle";
import { useCallback, useState } from "react";
import { auth } from "~/firebaseConfig";

export default function SignUp() {
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
            <Text className="py-16 text-5xl self-center font-inter-thin">
              Get Started
            </Text>

            <SignUpForm setLoadingState={setLoadingState} />
          </View>
          <View className="flex flex-row justify-center pb-8">
            <Text className="text-muted-foreground">
              Already have an account?&nbsp;
            </Text>
            <Link href="/" className="text-blue-500" replace={true}>
              Log in.
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isLoading && (
        <View className="absolute flex justify-center items-center w-full h-full bg-background">
          <LoadingCircle size={60} />
        </View>
      )}
      <Text>{auth.currentUser?.email}</Text>
    </SafeAreaView>
  );
}
