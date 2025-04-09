import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "~/firebaseConfig";

type UserInfo = {
  lastLogin?: number;
  level?: number;
  streak?: number;
  xp?: number;
};

async function fetchUserInfo() {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error("No user ID");
  }

  const user = await getDoc(doc(db, "users", userId));

  if (user.exists()) {
    return user.data() as UserInfo;
  } else {
    return null;
  }
}

export function useUserInfo() {
  return useQuery({
    queryFn: fetchUserInfo,
    queryKey: ["useUser"],
  });
}