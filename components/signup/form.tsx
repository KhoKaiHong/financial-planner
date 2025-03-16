import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/firebaseConfig";
import { useState, memo, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import * as v from "valibot";
import { SafeParseResult } from "valibot";
import { CircleAlert } from "~/lib/icons/CircleAlert";

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

  const isSuccess = useMemo(() => {
    return emailParseResult === null || emailParseResult.success;
  }, [emailParseResult]);

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
  setPassword: (email: string) => void;
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

  const isSuccess = useMemo(() => {
    return passwordParseResult === null || passwordParseResult.success;
  }, [passwordParseResult]);

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
  setConfirmPassword: (email: string) => void;
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

  const isSuccess = useMemo(() => {
    return passwordMatch === null || passwordMatch === true;
  }, [passwordMatch]);

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

export function SignUpForm() {
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
    <View className="gap-4">
      <EmailInput
        email={email}
        setEmail={(email: string) => setEmail(email)}
        emailParseResult={emailParseResult}
        setEmailParseResult={(
          emailParseResult: SafeParseResult<typeof emailSchema> | null
        ) => setEmailParseResult(emailParseResult)}
      />

      <PasswordInput
        password={password}
        setPassword={(password: string) => setPassword(password)}
        passwordParseResult={passwordParseResult}
        setPasswordParseResult={(
          passwordParseResult: SafeParseResult<typeof passwordSchema> | null
        ) => setPasswordParseResult(passwordParseResult)}
        confirmPassword={confirmPassword}
        setPasswordMatch={(passwordMatch: boolean | null) =>
          setPasswordMatch(passwordMatch)
        }
      />

      <ConfirmPasswordInput
        password={password}
        confirmPassword={confirmPassword}
        setConfirmPassword={(confirmPassword: string) =>
          setConfirmPassword(confirmPassword)
        }
        passwordMatch={passwordMatch}
        setPasswordMatch={(passwordMatch: boolean | null) =>
          setPasswordMatch(passwordMatch)
        }
      />

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
    </View>
  );
}
