import { useMutation } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { auth } from "~/firebaseConfig";

export function useSignOut() {
  return useMutation({
    mutationFn: () => signOut(auth),
    mutationKey: ["signOut"],
  });
}
