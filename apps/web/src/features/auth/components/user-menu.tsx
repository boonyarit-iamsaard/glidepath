import { Button } from "@glidepath/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@glidepath/ui/components/dropdown-menu";
import { Skeleton } from "@glidepath/ui/components/skeleton";
import { Link } from "@tanstack/react-router";

import { AUTH_ROUTES } from "../auth-config";
import { authContent } from "../auth-content";
import type { SessionUser } from "../hooks/use-session";

const content = authContent.userMenu;

interface UserMenuProps {
  user: SessionUser | null;
  isPending: boolean;
  onSignOut: () => void;
}

/**
 * Header menu for the current person. It shows what it gets and reports the
 * sign-out click to its parent.
 */
export function UserMenu({ user, isPending, onSignOut }: UserMenuProps) {
  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!user) {
    return (
      <Link to={AUTH_ROUTES.signIn}>
        <Button variant="outline">{content.signInLabel}</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        {user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{content.accountLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{user.email}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onSignOut}>
            {content.signOutLabel}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
