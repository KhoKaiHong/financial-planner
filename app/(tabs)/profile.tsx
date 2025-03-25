import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "~/firebaseConfig";
import { useSignOut } from "~/hooks/useSignOut";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { LoadingCircle } from "~/components/loading-circle";

export default function Profile() {
  const router = useRouter();

  const { mutate, isPending } = useSignOut();

  return (
    <SafeAreaView className="flex-1">
      <View className="px-8 flex flex-col gap-4">
        <Text className="py-16 text-5xl self-center font-inter-thin">
          Profile
        </Text>
        <Text>{auth.currentUser?.email}</Text>
        <Text>{auth.currentUser?.displayName}</Text>
        <Button
          variant="destructive"
          onPress={() => {
            mutate(undefined, {
              onSuccess: () => {
                router.dismissAll();
                router.replace("/");
              },
              onError: () => {
                router.dismissAll();
                router.replace("/error");
              },
            });
          }}
        >
          <Text>Sign out</Text>
        </Button>
        <Text>{auth.currentUser?.email}</Text>
      </View>
      {isPending && (
        <View className="absolute flex justify-center items-center w-full h-full bg-background">
          <LoadingCircle size={60} />
        </View>
      )}
    </SafeAreaView>
  );
}
