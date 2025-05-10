import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "~/firebaseConfig";
import { useState, memo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import * as v from "valibot";
import { SafeParseResult } from "valibot";
import { CircleAlert } from "~/lib/icons/CircleAlert";
import { useRouter } from "expo-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { FirebaseError } from "firebase/app";

async function register(username: string, email: string, password: string) {
  await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: username,
    });
  } else {
    throw new Error("No logged in user.");
  }
}

const usernameSchema = v.pipe(
  v.string(),
  v.nonEmpty("Please enter your username."),
  v.maxLength(16, "Your username is too long.")
);

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
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

type signUpInput = v.InferInput<typeof signUpSchema>;

type UsernameInputProps = {
  username: string;
  setUsername: (username: string) => void;
  usernameParseResult: SafeParseResult<typeof usernameSchema> | null;
  setUsernameParseResult: (
    usernameParseResult: SafeParseResult<typeof usernameSchema> | null
  ) => void;
};

const UsernameInput = memo(function UsernameInput(props: UsernameInputProps) {
  const { username, setUsername, usernameParseResult, setUsernameParseResult } =
    props;

  const handleUsernameChange = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      setUsername(trimmed);
      const result = v.safeParse(usernameSchema, trimmed);
      setUsernameParseResult(result);
    },
    [setUsername, setUsernameParseResult]
  );

  const isSuccess = usernameParseResult === null || usernameParseResult.success;

  return (
    <View className="gap-1">
      <Label nativeID="username">Username</Label>
      <Input
        placeholder="Enter username"
        autoCapitalize="none"
        value={username}
        onChangeText={handleUsernameChange}
        className={isSuccess ? "" : "border-destructive"}
      />
      {isSuccess ? null : (
        <View className=" flex flex-row items-center gap-1 ">
          <CircleAlert className="text-destructive" size={12} />
          <Text className="text-sm text-destructive">
            {usernameParseResult?.issues?.[0]?.message}
          </Text>
        </View>
      )}
    </View>
  );
});

type EmailInputProps = {
  email: string;
  setEmail: (email: string) => void;
  emailParseResult: SafeParseResult<typeof emailSchema> | null;
  setEmailParseResult: (
    emailParseResult: SafeParseResult<typeof emailSchema> | null
  ) => void;
};

const EmailInput = memo(function EmailInput(props: EmailInputProps) {
  const { email, setEmail, emailParseResult, setEmailParseResult } = props;

  const handleEmailChange = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      setEmail(trimmed);
      const result = v.safeParse(emailSchema, trimmed);
      setEmailParseResult(result);
    },
    [setEmail, setEmailParseResult]
  );

  const isSuccess = emailParseResult === null || emailParseResult.success;

  return (
    <View className="gap-1">
      <Label nativeID="email">Email</Label>
      <Input
        placeholder="abc@example.com"
        autoComplete="email"
        autoCapitalize="none"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        className={isSuccess ? "" : "border-destructive"}
      />
      {isSuccess ? null : (
        <View className=" flex flex-row items-center gap-1 ">
          <CircleAlert className="text-destructive" size={12} />
          <Text className="text-sm text-destructive">
            {emailParseResult?.issues?.[0]?.message}
          </Text>
        </View>
      )}
    </View>
  );
});

type PasswordInputProps = {
  password: string;
  setPassword: (password: string) => void;
  passwordParseResult: SafeParseResult<typeof passwordSchema> | null;
  setPasswordParseResult: (
    passwordParseResult: SafeParseResult<typeof passwordSchema> | null
  ) => void;
  confirmPassword: string;
  setPasswordMatch: (passwordMatch: boolean | null) => void;
};

const PasswordInput = memo(function PasswordInput(props: PasswordInputProps) {
  const {
    password,
    setPassword,
    passwordParseResult,
    setPasswordParseResult,
    confirmPassword,
    setPasswordMatch,
  } = props;

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      const result = v.safeParse(passwordSchema, text);
      setPasswordParseResult(result);
      setPasswordMatch(confirmPassword === text);
    },
    [setPassword, setPasswordParseResult, setPasswordMatch, confirmPassword]
  );

  const isSuccess = passwordParseResult === null || passwordParseResult.success;

  return (
    <View className="gap-1">
      <Label nativeID="password">Password</Label>
      <Input
        placeholder="Enter password"
        autoCapitalize="none"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        className={isSuccess ? "" : "border-destructive"}
      />
      {isSuccess ? null : (
        <View className=" flex flex-row items-center gap-1 ">
          <CircleAlert className="text-destructive" size={12} />
          <Text className="text-sm text-destructive">
            {passwordParseResult?.issues?.[0]?.message}
          </Text>
        </View>
      )}
    </View>
  );
});

type ConfirmPasswordInputProps = {
  password: string;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  passwordMatch: boolean | null;
  setPasswordMatch: (passwordMatch: boolean | null) => void;
};

const ConfirmPasswordInput = memo(function ConfirmPasswordInput(
  props: ConfirmPasswordInputProps
) {
  const {
    password,
    confirmPassword,
    setConfirmPassword,
    passwordMatch,
    setPasswordMatch,
  } = props;

  const handleConfirmPasswordChange = useCallback(
    (text: string) => {
      setConfirmPassword(text);
      setPasswordMatch(password === text);
    },
    [setConfirmPassword, setPasswordMatch, password]
  );

  const isSuccess = passwordMatch === null || passwordMatch === true;

  return (
    <View className="gap-1">
      <Label nativeID="confirm password">Confirm Password</Label>
      <Input
        placeholder="Enter password"
        autoCapitalize="none"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        secureTextEntry
        className={isSuccess ? "" : "border-destructive"}
      />
      {isSuccess ? null : (
        <View className=" flex flex-row items-center gap-1 ">
          <CircleAlert className="text-destructive" size={12} />
          <Text className="text-sm text-destructive">
            Passwords do not match
          </Text>
        </View>
      )}
    </View>
  );
});

type SignUpFormProps = {
  setLoadingState: (isLoading: boolean) => void;
};

export function SignUpForm(props: SignUpFormProps) {
  const { setLoadingState } = props;

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [usernameParseResult, setUsernameParseResult] =
    useState<SafeParseResult<typeof usernameSchema> | null>(null);

  const [email, setEmail] = useState("");
  const [emailParseResult, setEmailParseResult] = useState<SafeParseResult<
    typeof emailSchema
  > | null>(null);

  const [password, setPassword] = useState("");
  const [passwordParseResult, setPasswordParseResult] =
    useState<SafeParseResult<typeof passwordSchema> | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const registerMutation = useMutation({
    mutationFn: (input: signUpInput) =>
      register(input.username, input.email, input.password),
    onSettled: () => setLoadingState(false),
    onSuccess: () => router.replace("/verify"),
  });

  const handleUsername = useCallback(
    (username: string) => {
      setUsername(username);
    },
    [setUsername]
  );

  const handleUsernameParseResult = useCallback(
    (usernameParseResult: SafeParseResult<typeof usernameSchema> | null) => {
      setUsernameParseResult(usernameParseResult);
    },
    [setUsernameParseResult]
  );

  const handleEmail = useCallback(
    (email: string) => {
      setEmail(email);
    },
    [setEmail]
  );

  const handleEmailParseResult = useCallback(
    (emailParseResult: SafeParseResult<typeof emailSchema> | null) => {
      setEmailParseResult(emailParseResult);
    },
    [setEmailParseResult]
  );

  const handlePassword = useCallback(
    (password: string) => {
      setPassword(password);
    },
    [setPassword]
  );

  const handlePasswordParseResult = useCallback(
    (passwordParseResult: SafeParseResult<typeof passwordSchema> | null) => {
      setPasswordParseResult(passwordParseResult);
    },
    [setPasswordParseResult]
  );

  const handleConfirmPassword = useCallback(
    (confirmPassword: string) => {
      setConfirmPassword(confirmPassword);
    },
    [setConfirmPassword]
  );

  const handlePasswordMatch = useCallback(
    (passwordMatch: boolean | null) => {
      setPasswordMatch(passwordMatch);
    },
    [setPasswordMatch]
  );

  const onButtonPress = useCallback(() => {
    setLoadingState(true);
    registerMutation.mutate({ username, email, password });
  }, [email, password, registerMutation, setLoadingState]);

  return (
    <View className="gap-4">
      <UsernameInput
        username={username}
        setUsername={handleUsername}
        usernameParseResult={usernameParseResult}
        setUsernameParseResult={handleUsernameParseResult}
      />

      <EmailInput
        email={email}
        setEmail={handleEmail}
        emailParseResult={emailParseResult}
        setEmailParseResult={handleEmailParseResult}
      />

      <PasswordInput
        password={password}
        setPassword={handlePassword}
        passwordParseResult={passwordParseResult}
        setPasswordParseResult={handlePasswordParseResult}
        confirmPassword={confirmPassword}
        setPasswordMatch={handlePasswordMatch}
      />

      <ConfirmPasswordInput
        password={password}
        confirmPassword={confirmPassword}
        setConfirmPassword={handleConfirmPassword}
        passwordMatch={passwordMatch}
        setPasswordMatch={handlePasswordMatch}
      />

      <Button
        disabled={
          !(
            usernameParseResult?.success &&
            emailParseResult?.success &&
            passwordParseResult?.success &&
            passwordMatch
          )
        }
        onPress={onButtonPress}
        className="mt-4"
      >
        <Text>Sign Up</Text>
      </Button>

      <AlertDialog
        open={
          registerMutation.error instanceof FirebaseError &&
          registerMutation.error.code === "auth/email-already-in-use"
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email already in use</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Press OK to login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onPress={() => {
                registerMutation.reset();
                router.replace("/");
              }}
            >
              <Text>Ok</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
