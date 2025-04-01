import LottieView from "lottie-react-native";
import { View } from "react-native";

export default function LottieSparkle() {
  return (
    <View className="absolute top-0 right-0 w-16 h-16">
      <LottieView
        source={require("../assets/lottie/sparkle.json")} // <- get a sparkle animation from lottiefiles.com
        autoPlay
        loop
        style={{ width: 60, height: 60 }}
      />
    </View>
  );
}
