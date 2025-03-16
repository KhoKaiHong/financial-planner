import { KeyboardAvoidingView, View, ScrollView, Platform } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleSvg } from "~/components/signup/google";
import { SignUpForm } from "~/components/signup/form";

export default function SignUp() {
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <View className="p-8 gap-8 flex">

            <Text className="text-5xl self-center font-inter-thin">
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

            <View className="flex items-center">
              <Button size={"icon"} className="rounded-full p-6">
                <GoogleSvg />
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
