import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { GoogleSvg } from "~/components/google";

export function SignUpProviders() {
  return (
    <View className="flex items-center">
      <Button size={"icon"} className="rounded-full p-6">
        <GoogleSvg width={24} height={24} />
      </Button>
    </View>
  );
}
