import { sendEmailVerification } from "firebase/auth";
import { Redirect, useRouter } from "expo-router";
import { auth } from "~/firebaseConfig";
import { useMutation } from "@tanstack/react-query";
import { EmailSentSvg } from "~/components/verify/emailSent";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingCircle } from "~/components/loading-circle";
import { Text } from "~/components/ui/text";
import { MailX } from "~/lib/icons/MailX";
import { Button } from "~/components/ui/button";
import { CircleAlert } from "~/lib/icons/CircleAlert";
import { MailCheck } from "~/lib/icons/MailCheck";
import { useEffect, useState } from "react";
import { View } from "react-native";

async function performVerification() {
  if (auth.currentUser && !auth.currentUser.emailVerified) {
    await sendEmailVerification(auth.currentUser);
  } else if (!auth.currentUser) {
    throw new Error("No user");
  }
}

async function reloadUser() {
  if (auth.currentUser) {
    await auth.currentUser.reload();
  } else {
    throw new Error("No user");
  }
}

export default function Verify() {
  const router = useRouter();

  if (!auth.currentUser || auth.currentUser.emailVerified) {
    router.dismissAll();
    return <Redirect href="/" />;
  }

  const [cooldown, setCooldown] = useState(60);

  const { mutate, isSuccess, isError, isPending } = useMutation({
    mutationKey: ["verify"],
    mutationFn: performVerification,
  });

  const reloadUserMutation = useMutation({
    mutationKey: ["reloadUser"],
    mutationFn: reloadUser,
    retry: 5,
  });

  useEffect(() => {
    mutate();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isSuccess) {
      setCooldown(60);
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSuccess]);

  if (auth.currentUser.emailVerified) {
    return (
      <SafeAreaView className="flex-1 gap-6 justify-center items-center">
        <MailCheck size={60} />
        <Text className="text-xl font-inter-semibold">
          Your email has already been verified.
        </Text>
        <Button
          className="w-64"
          onPress={() => {
            router.replace("/home");
          }}
        >
          <Text>Go to Home Page</Text>
        </Button>
      </SafeAreaView>
    );
  }

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 gap-6 justify-center items-center">
        <LoadingCircle size={60} />
        <Text className="text-xl font-inter-semibold">
          Sending verification email...
        </Text>
      </SafeAreaView>
    );
  }

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 gap-12 justify-center items-center">
        <View className="flex gap-4 items-center">
          <EmailSentSvg width={60} height={60} />
          <Text className="text-xl font-inter-semibold">
            Verification email sent successfully
          </Text>
          <Button
            className="w-64"
            onPress={() => {
              reloadUserMutation.mutate(undefined, {
                onSuccess: () => router.replace("/home"),
                onError: () => router.replace("/error"),
              });
            }}
          >
            <Text>I have verified my email</Text>
          </Button>
        </View>
        <View className="flex gap-4 items-center">
          <Text className="text-muted-foreground">
            Haven't received email? Try again in {cooldown} seconds.
          </Text>
          <Button
            variant="secondary"
            disabled={cooldown > 0}
            onPress={() => {
              setCooldown(60);
              mutate();
            }}
          >
            <Text>Resend Email</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 gap-6 justify-center items-center">
        <MailX className="text-primary" size={60} />
        <Text className="text-xl font-inter-semibold">
          Error Sending Email. Please try again later.
        </Text>
        <Button
          onPress={() => {
            router.replace("/");
          }}
        >
          <Text>Return to Login Page</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 gap-6 justify-center items-center">
      <CircleAlert className="text-primary" size={60} />
      <Text className="text-xl font-inter-semibold">
        An error occured. Please try again later.
      </Text>
      <Button
        onPress={() => {
          router.replace("/");
        }}
      >
        <Text>Return to Login Page</Text>
      </Button>
    </SafeAreaView>
  );
}
