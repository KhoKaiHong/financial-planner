import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/firebaseConfig";
import { useState, memo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { CircleAlert } from "~/lib/icons/CircleAlert";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

async function login(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

type EmailInputProps = {
  email: string;
  setEmail: (email: string) => void;
  emailError: string | null;
  resetEmailError: () => void;
};

const EmailInput = memo(function EmailInput(props: EmailInputProps) {
  const { email, setEmail, emailError, resetEmailError } = props;

  const handleEmailChange = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      setEmail(trimmed);
      if (emailError) {
        resetEmailError();
      }
    },
    [setEmail, emailError, resetEmailError]
  );

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
        className={emailError ? "border-destructive" : ""}
      />
      {emailError ? (
        <View className=" flex flex-row items-center gap-1 ">
          <CircleAlert className="text-destructive" size={12} />
          <Text className="text-sm text-destructive">{emailError}</Text>
        </View>
      ) : null}
    </View>
  );
});

type PasswordInputProps = {
  password: string;
  setPassword: (password: string) => void;
  passwordError: string | null;
  resetPasswordError: () => void;
};

const PasswordInput = memo(function PasswordInput(props: PasswordInputProps) {
  const { password, setPassword, passwordError, resetPasswordError } = props;

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (passwordError) {
        resetPasswordError();
      }
    },
    [setPassword, passwordError, resetPasswordError]
  );

  return (
    <View className="gap-1">
      <Label nativeID="password">Password</Label>
      <Input
        placeholder="Enter password"
        autoCapitalize="none"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        className={passwordError ? "border-destructive" : ""}
      />
      {passwordError ? (
        <View className=" flex flex-row items-center gap-1 ">
          <CircleAlert className="text-destructive" size={12} />
          <Text className="text-sm text-destructive">{passwordError}</Text>
        </View>
      ) : null}
    </View>
  );
});

type LoginFormProps = {
  setLoadingState: (isLoading: boolean) => void;
};

export function LoginForm(props: LoginFormProps) {
  const { setLoadingState } = props;

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isError, setIsError] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      login(input.email, input.password),
    mutationKey: ["login"],
    onSettled: () => setLoadingState(false),
    onSuccess: () => router.replace("/home"),
    onError: (error) => {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/user-not-found"
      ) {
        setEmailError("User not found.");
      } else if (
        error instanceof FirebaseError &&
        error.code === "auth/wrong-password"
      ) {
        setPasswordError("Incorrect password.");
      } else if (
        error instanceof FirebaseError &&
        error.code === "auth/invalid-email"
      ) {
        setEmailError("Email not valid.");
      } else {
        setIsError(true);
      }
    },
  });

  const handleEmail = useCallback(
    (email: string) => {
      setEmail(email);
    },
    [setEmail]
  );

  const resetEmailError = useCallback(() => {
    setEmailError(null);
  }, [setEmailError]);

  const handlePassword = useCallback(
    (password: string) => {
      setPassword(password);
    },
    [setPassword]
  );

  const resetPasswordError = useCallback(() => {
    setPasswordError(null);
  }, [setPasswordError]);

  const onButtonPress = useCallback(() => {
    if (email === "") setEmailError("Please enter your email.");
    if (password === "") setPasswordError("Please enter your password.");
    if (email === "" || password === "") return;

    setLoadingState(true);
    loginMutation.mutate({ email, password });
  }, [email, password, loginMutation, setLoadingState]);

  return (
    <View className="gap-4">
      <EmailInput
        email={email}
        setEmail={handleEmail}
        emailError={emailError}
        resetEmailError={resetEmailError}
      />

      <PasswordInput
        password={password}
        setPassword={handlePassword}
        passwordError={passwordError}
        resetPasswordError={resetPasswordError}
      />

      <Button
        disabled={emailError !== null || passwordError !== null}
        onPress={onButtonPress}
        className="mt-4"
      >
        <Text>Login</Text>
      </Button>

      <AlertDialog open={isError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error logging you in.</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onPress={() => {
                setIsError(false);
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
