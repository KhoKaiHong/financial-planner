import { KeyboardAvoidingView, View, ScrollView, Platform } from "react-native";
import { Text } from "~/components/ui/text";
import { Separator } from "~/components/ui/separator";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignUpForm } from "~/components/signup/form";
import { SignUpProviders } from "~/components/signup/providers";
import { Link } from "expo-router";

export default function SignUp() {
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
            gap: 20
          }}
        >
          <View className="px-8 flex flex-col gap-4">
            <Text className="py-16 text-5xl self-center font-inter-thin">
              Get Started
            </Text>

            <SignUpForm />

            <View className="flex flex-row items-center gap-3">
              <Separator orientation="horizontal" className="flex-1" />
              <Text className="text-sm text-muted-foreground">
                Or sign up with
              </Text>
              <Separator orientation="horizontal" className="flex-1" />
            </View>

            <SignUpProviders />
          </View>
          <View className="flex flex-row justify-center pb-8">
            <Text className="text-muted-foreground">
              Already have an account?&nbsp;
            </Text>
            <Link href="/" className="text-blue-500">
              Log in.
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
