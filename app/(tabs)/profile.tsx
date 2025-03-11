import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/firebaseConfig";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";

async function register({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export default function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const user = useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      register({ email: creds.email, password: creds.password }),
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
      <Button onPress={() => user.mutate({ email, password })}>
        <Text>Sign Up</Text>
      </Button>
      {user.data ? (
        <Text>{user.data.user.email ?? "email"}</Text>
      ) : (
        <Text>No user</Text>
      )}
    </View>
  );
}
