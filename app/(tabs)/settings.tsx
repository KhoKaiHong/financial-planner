// import { useState } from "react";
import {
  View,
  ScrollView,
  // TextInput,
  // Alert,
  // ActivityIndicator,
  // Switch,
  // TouchableOpacity,
} from "react-native";
// import { Text } from "~/components/ui/text";
// import { db, auth } from "~/firebaseConfig";
// import { addDoc, collection } from "firebase/firestore";
// import { useColorScheme } from "nativewind";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "~/components/ui/dropdown-menu";
// import { Card, SectionTitle, Button } from "~/components/ui-elements";
// import {
//   Settings as SettingsIcon,
//   Award,
//   ChevronDown,
//   Tag,
//   DollarSign,
//   Sparkles,
// } from "lucide-react-native";
import { AppPreferencesCard } from "~/components/settings/app-preferences";

// type AchievementCondition = {
//   type: "categorySpendingBelow";
//   value: number;
//   category: string;
// };

// type CustomAchievement = {
//   title: string;
//   icon: string;
//   condition: AchievementCondition;
//   public: boolean;
//   createdAt: Date;
//   userId: string;
// };

export default function SettingsScreen() {
  // const [title, setTitle] = useState("");
  // const [icon, setIcon] = useState("🏆");
  // const [value, setValue] = useState("");
  // const [category, setCategory] = useState("");
  // const [isPublic, setIsPublic] = useState(true);
  // const [loadingTitle, setLoadingTitle] = useState(false);
  // const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  // const { colorScheme, setColorScheme } = useColorScheme();

  // const generateTitleFromAPI = async (category: string, amount: string) => {
  //   try {
  //     const result = "AI placeholder";

  //     if (Array.isArray(result)) return result;

  //     // Handle fallback: parse string into array if needed
  //     const matches = result.match(/\*([^*]+)\*/g); // match *something*
  //     return (
  //       matches?.map((s: string) => String(s).replace(/\*/g, "").trim()) ?? [
  //         result,
  //       ]
  //     );
  //   } catch (error) {
  //     console.error("❌ Failed to get title:", error);
  //     return null;
  //   }
  // };

  // const onSubmit = async () => {
  //   const user = auth.currentUser;
  //   if (!user) return Alert.alert("Error", "You must be logged in");

  //   if (!title || !value || !category) {
  //     Alert.alert("Missing Fields", "Please fill in all required fields.");
  //     return;
  //   }

  //   const achievement: CustomAchievement = {
  //     title,
  //     icon,
  //     public: isPublic,
  //     createdAt: new Date(),
  //     userId: user.uid,
  //     condition: {
  //       type: "categorySpendingBelow",
  //       value: Number(value),
  //       category,
  //     },
  //   };

  //   try {
  //     await addDoc(collection(db, "customAchievements"), achievement);
  //     Alert.alert("Success", "Achievement created!");
  //     setTitle("");
  //     setTitleSuggestions([]);
  //     setIcon("🏆");
  //     setValue("");
  //     setCategory("");
  //   } catch (e) {
  //     console.error("🔥 Failed to add custom achievement:", e);
  //     Alert.alert("Error", "Something went wrong.");
  //   }
  // };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingVertical: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-8 flex gap-4">
        {/* App Settings */}
        <AppPreferencesCard />

        {/* Custom Achievement */}
        {/* <View className="mt-6">
          <View className="flex-row items-center mb-4">
            <Award size={20} className="text-indigo-500 mr-2" />
            <SectionTitle>Create Custom Achievement</SectionTitle>
          </View>

          <Card>
            <Text className="text-sm text-muted-foreground mb-4">
              Create your own custom achievement to track specific financial
              goals.
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                <Tag size={16} className="text-indigo-500 mr-1" />
                Target Category
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                placeholder="e.g. Food"
                placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
                value={category}
                onChangeText={setCategory}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                <DollarSign size={16} className="text-indigo-500 mr-1" />
                Max Spending Threshold (RM)
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                placeholder="e.g. 200"
                placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
                keyboardType="numeric"
                value={value}
                onChangeText={setValue}
              />
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-medium text-foreground">
                  Achievement Title
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={async () => {
                    if (!category || !value) {
                      return Alert.alert(
                        "Missing Info",
                        "Please enter category and amount first."
                      );
                    }

                    setLoadingTitle(true);
                    const suggestions = await generateTitleFromAPI(
                      category,
                      value
                    );
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
                    <View className="flex-row items-center">
                      <Sparkles size={14} className="text-indigo-500 mr-1" />
                      <Text>Suggest Title</Text>
                    </View>
                  )}
                </Button>
              </View>

              {titleSuggestions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg mb-2">
                      <Text className="text-foreground">
                        {title || "Select Suggested Title"}
                      </Text>
                      <ChevronDown size={16} className="text-foreground" />
                    </TouchableOpacity>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="bg-background border border-border rounded-md"
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
                className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                placeholder="Or write your own..."
                placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                Icon (Emoji)
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-zinc-700 p-3 rounded-lg text-foreground"
                placeholder="🏆"
                placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
                value={icon}
                onChangeText={setIcon}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">
                Visibility
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground">Make achievement public</Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: "#767577", true: "#6366f1" }}
                  thumbColor="#f4f3f4"
                />
              </View>
            </View>

            <Button onPress={onSubmit} variant="primary" fullWidth>
              <View className="flex-row items-center">
                <Award size={16} className="text-white mr-2" />
                <Text>Create Achievement</Text>
              </View>
            </Button>
          </Card>
        </View> */}
      </View>
    </ScrollView>
  );
}
