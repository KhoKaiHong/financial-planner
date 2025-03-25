import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Text } from "~/components/ui/text";
import { useSignOut } from "~/hooks/useSignOut";
import { useRouter } from "expo-router";
import { auth } from "~/firebaseConfig";

type UnverifiedDialogProps = {
  setLoadingState: (isLoading: boolean) => void;
};

export function UnverifiedDialog(props: UnverifiedDialogProps) {
  const router = useRouter();
  const { mutate, isPending } = useSignOut();

  if (isPending) props.setLoadingState(true);

  return (
    <AlertDialog
      open={
        auth.currentUser !== null && auth.currentUser.emailVerified === false
      }
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Email Unverified</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            Proceed to verify email?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onPress={() =>
              mutate(undefined, {
                onError: () => router.replace("/error"),
                onSettled: () => props.setLoadingState(false),
              })
            }
          >
            <Text>No</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            onPress={() => {
              router.replace("/verify");
            }}
          >
            <Text>Yes</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
