import { useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { db, auth } from "~/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { useColorScheme } from "nativewind";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

type AchievementCondition = {
  type: "categorySpendingBelow";
  value: number;
  category: string;
};

type CustomAchievement = {
  title: string;
  icon: string;
  condition: AchievementCondition;
  public: boolean;
  createdAt: Date;
  userId: string;
};

export default function CreateAchievement() {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🏆");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  const { colorScheme } = useColorScheme();

  const generateTitleFromAPI = async (category: string, amount: string) => {
    try {
      const response = await axios.post(
        "http://192.168.100.159:3000/generate-title",
        {
          category,
          amount,
        }
      );
      const result = response.data.title;

      if (Array.isArray(result)) return result;

      // Handle fallback: parse string into array if needed
      const matches = result.match(/\*([^\*]+)\*/g); // match *something*
      return matches?.map((s) => s.replace(/\*/g, "").trim()) ?? [result];
    } catch (error) {
      console.error("❌ Failed to get title:", error);
      return null;
    }
  };

  const onSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Error", "You must be logged in");

    if (!title || !value || !category) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const achievement: CustomAchievement = {
      title,
      icon,
      public: isPublic,
      createdAt: new Date(),
      userId: user.uid,
      condition: {
        type: "categorySpendingBelow",
        value: Number(value),
        category,
      },
    };

    try {
      await addDoc(collection(db, "customAchievements"), achievement);
      Alert.alert("Success", "Achievement created!");
      setTitle("");
      setTitleSuggestions([]);
      setIcon("🏆");
      setValue("");
      setCategory("");
    } catch (e) {
      console.error("🔥 Failed to add custom achievement:", e);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4 bg-background">
      <ScrollView className="gap-4">
        <Text className="text-2xl font-bold mb-4 text-foreground">
          🎯 Create Your Own Achievement
        </Text>

        <View className="gap-2 mb-4">
          <Label>Target Category</Label>
          <TextInput
            className="border p-2 rounded-md text-foreground"
            placeholder="e.g. Food"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
            value={category}
            onChangeText={setCategory}
          />
        </View>

        <View className="gap-2 mb-4">
          <Label>Max Spending Threshold (RM)</Label>
          <TextInput
            className="border p-2 rounded-md text-foreground"
            placeholder="e.g. 200"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />
        </View>

        <View className="gap-2 mb-2">
          <View className="flex-row justify-between items-center">
            <Label>Title</Label>
            <Button
              variant="outline"
              onPress={async () => {
                if (!category || !value) {
                  return Alert.alert(
                    "Missing Info",
                    "Please enter category and amount first."
                  );
                }

                setLoadingTitle(true);
                const suggestions = await generateTitleFromAPI(category, value);
                setLoadingTitle(false);

                if (suggestions) {
                  setTitleSuggestions(suggestions);
                  setTitle(suggestions[0]);
                } else {
                  Alert.alert(
                    "Error",
                    "Could not generate title. Try again later."
                  );
                }
              }}
            >
              {loadingTitle ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text>Suggest Title</Text>
              )}
            </Button>
          </View>

          {titleSuggestions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Text className="text-foreground">
                    {title || "Select Suggested Title"}
                  </Text>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-full rounded-md border border-border bg-background shadow-md"
                style={{
                  maxHeight: 200,
                  overflow: "hidden",
                }}
              >
                <ScrollView
                  style={{
                    maxHeight: 200,
                  }}
                  nestedScrollEnabled
                >
                  {titleSuggestions.map((suggestion, index) => (
                    <DropdownMenuItem
                      key={index}
                      onPress={() => setTitle(suggestion)}
                      className="px-4 py-3 border-b border-border"
                    >
                      <Text className="text-foreground">{suggestion}</Text>
                    </DropdownMenuItem>
                  ))}
                </ScrollView>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <TextInput
            className="border p-2 rounded-md text-foreground mt-2"
            placeholder="Or write your own..."
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="gap-2 mb-4">
          <Label>Icon (Emoji)</Label>
          <TextInput
            className="border p-2 rounded-md text-foreground"
            placeholder="🏆"
            placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
            value={icon}
            onChangeText={setIcon}
          />
        </View>

        <View className="gap-2 mb-4">
          <Label>Public?</Label>
          <Button variant="secondary" onPress={() => setIsPublic(!isPublic)}>
            <Text>
              {isPublic
                ? "Yes (Tap to make Private)"
                : "No (Tap to make Public)"}
            </Text>
          </Button>
        </View>

        <Button onPress={onSubmit}>
          <Text>Create Achievement</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
