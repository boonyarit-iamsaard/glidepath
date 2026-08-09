import { NavUser } from "../components/nav-user";
import { useSession } from "../hooks/use-session";
import { useSignOut } from "../hooks/use-sign-out";

/**
 * Joins the session to the sidebar user menu. App chrome renders this.
 */
export function NavUserContainer() {
  const { user, isPending } = useSession();
  const signOut = useSignOut();

  return <NavUser user={user} isPending={isPending} onSignOut={signOut} />;
}
