const MAX_INITIALS = 2;

/**
 * Makes the avatar fallback text from a person's name.
 */
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, MAX_INITIALS)
    .join("")
    .toUpperCase();
}
