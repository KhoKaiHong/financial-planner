import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { View } from "react-native";
import { Sun } from "~/lib/icons/Sun";
import { MoonStar } from "~/lib/icons/MoonStar";
import { useColorScheme } from "~/lib/useColorScheme";

export default function Index() {
  const { toggleColorScheme, colorScheme } = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <View className="items-center">
        <Text className="text-4xl">Welcome to NativeWind!</Text>
        <Text className="text-xl">Style your app with</Text>
        <Text className="text-3xl font-bold underline">Tailwind CSS!</Text>
      </View>
      <Button
        size={"icon"}
        variant={"outline"}
        onPress={() => {
          toggleColorScheme();
        }}
      >
        {colorScheme === "dark" ? (
          <MoonStar className="text-foreground" />
        ) : (
          <Sun className="text-foreground" />
        )}
      </Button>
    </View>
  );
}
