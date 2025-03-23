import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "~/firebaseConfig";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  const { mutate } = useMutation({
    mutationFn: () => signOut(auth),
    onError(error, variables, context) {
      console.log(error);
    },
  });

  return (
    <SafeAreaView className="flex-1">
      <View className="px-8 flex flex-col gap-4">
        <Text className="py-16 text-5xl self-center font-inter-thin">
          Profile
        </Text>
        <Button
          variant="destructive"
          onPress={() => {
            mutate(undefined, {
              onSuccess: () => {
                router.dismissAll();
                router.replace("/");
              },
            });
          }}
        >
          <Text>Sign out</Text>
        </Button>
        <Text>{auth.currentUser?.email}</Text>
      </View>
    </SafeAreaView>
  );
}
