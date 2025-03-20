import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "~/firebaseConfig";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const user = useMutation({
    mutationFn: () => signOut(auth),
    onError(error, variables, context) {
      console.log(error);
    },
  });

  return (
    <View>
      <Text>Profile</Text>
      <Input
        placeholder="Enter your email"
        autoComplete="email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        placeholder="Enter password"
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </View>
  );
}
