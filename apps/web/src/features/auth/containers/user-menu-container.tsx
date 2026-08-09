import { UserMenu } from "../components/user-menu";
import { useSession } from "../hooks/use-session";
import { useSignOut } from "../hooks/use-sign-out";

/**
 * Joins the session to the header user menu. App chrome renders this.
 */
export function UserMenuContainer() {
  const { user, isPending } = useSession();
  const signOut = useSignOut();

  return <UserMenu user={user} isPending={isPending} onSignOut={signOut} />;
}
