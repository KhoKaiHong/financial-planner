import { SafeAreaView } from "react-native-safe-area-context";
import { CircleAlert } from "~/lib/icons/CircleAlert";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { BackHandler } from "react-native";

export default function ErrorPage() {
  return (
    <SafeAreaView className="flex-1 gap-6 justify-center items-center">
      <CircleAlert className="text-primary" size={60} />
      <Text className="text-xl font-inter-semibold">
        An unexpected error occured.
      </Text>
      <Button
        onPress={() => {
          BackHandler.exitApp();
        }}
      >
        <Text>Exit App</Text>
      </Button>
    </SafeAreaView>
  );
}
