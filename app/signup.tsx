import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/firebaseConfig";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import * as v from "valibot";
import { SafeParseResult } from "valibot";

async function register(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

const emailSchema = v.pipe(
  v.string(),
  v.nonEmpty("Please enter your email."),
  v.email("Please enter the correct email format"),
  v.maxLength(32, "Your email is too long.")
);

const passwordSchema = v.pipe(
  v.string(),
  v.minLength(8, "Your password is too short."),
  v.maxLength(32, "Your password is too long."),
  v.regex(/[a-z]/, "Your password must contain a lowercase letter."),
  v.regex(/[A-Z]/, "Your password must contain a uppercase letter."),
  v.regex(/[0-9]/, "Your password must contain a number.")
);

const signUpSchema = v.object({
  email: emailSchema,
  password: passwordSchema,
});

type signUpInput = v.InferInput<typeof signUpSchema>;

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [emailParseResult, setEmailParseResult] = useState<SafeParseResult<
    typeof emailSchema
  > | null>(null);
  const [password, setPassword] = useState("");
  const [passwordParseResult, setPasswordParseResult] =
    useState<SafeParseResult<typeof passwordSchema> | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const user = useMutation({
    mutationFn: (input: signUpInput) => register(input.email, input.password),
    onError(error, variables, context) {
      console.log(error);
    },
  });

  return (
    <View className="p-8 gap-4 flex">
      <Text className="text-5xl self-center">Get Started</Text>
      <View className="gap-1">
        <Label nativeID="email">Email</Label>
        <Input
          placeholder="abc@example.com"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text.trim());
            const result = v.safeParse(emailSchema, text.trim());
            setEmailParseResult(result);
          }}
          keyboardType="email-address"
        />
        {emailParseResult?.success ? null : (
          <Text className="text-sm text-destructive">
            {emailParseResult?.issues[0].message}
          </Text>
        )}
      </View>

      <View className="gap-1">
        <Label nativeID="password">Password</Label>
        <Input
          placeholder="Enter password"
          autoCapitalize="none"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            const result = v.safeParse(passwordSchema, text);
            setPasswordParseResult(result);
          }}
          secureTextEntry
        />
        {passwordParseResult?.success ? null : (
          <Text className="text-sm text-destructive">
            {passwordParseResult?.issues[0].message}
          </Text>
        )}
      </View>

      <View className="gap-1">
        <Label nativeID="confirm password">Confirm Password</Label>
        <Input
          placeholder="Enter password"
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setPasswordMatch(password === text);
          }}
          secureTextEntry
        />
        {passwordMatch === null || passwordMatch === true ? null : (
          <Text className="text-sm text-destructive">
            Passwords do not match
          </Text>
        )}
      </View>

      <Button
        disabled={
          !(
            emailParseResult?.success &&
            passwordParseResult?.success &&
            passwordMatch
          )
        }
        onPress={() => user.mutate({ email, password })}
      >
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
