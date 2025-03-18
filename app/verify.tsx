import { sendEmailVerification } from "firebase/auth";
import { Redirect, useRouter } from "expo-router";
import { auth } from "~/firebaseConfig";
import { useQuery } from "@tanstack/react-query";

async function performVerification() {
  if (auth.currentUser && !auth.currentUser.emailVerified) {
    await sendEmailVerification(auth.currentUser);
  }
}

export default function Verify() {
  const router = useRouter();

  if (!auth.currentUser || auth.currentUser.emailVerified) {
    router.dismissAll();
    return <Redirect href="/" />;
  }

  const { isSuccess, isError, refetch } = useQuery({
    queryKey: ["verify"],
    queryFn: performVerification,
    retry: 5
  });

  if (isSuccess) {
    return 
  }

  return <></>;
}
