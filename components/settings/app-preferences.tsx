import { View } from "react-native";
import { Fingerprint } from "~/lib/icons/Fingerprint";
import { Bell } from "~/lib/icons/Bell";
import { MoonStar } from "~/lib/icons/MoonStar";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { Switch } from "~/components/ui/switch";

export function AppPreferencesCard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">App Preferences</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Bell size={18} className="text-primary" />
            <Text className="text-lg">Notifications</Text>
          </View>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MoonStar size={18} className="text-primary" />
            <Text className="text-lg">Dark Mode</Text>
          </View>
          <Switch
            checked={isDarkColorScheme}
            onCheckedChange={toggleColorScheme}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Fingerprint size={18} className="text-primary" />
            <Text className="text-lg">Biometric Authentication</Text>
          </View>
          <Switch
            checked={biometricEnabled}
            onCheckedChange={setBiometricEnabled}
          />
        </View>
      </CardContent>
    </Card>
  );
}
