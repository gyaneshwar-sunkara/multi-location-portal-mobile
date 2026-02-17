/**
 * Get initials from a first + last name pair.
 * Returns '?' if both are empty/null.
 */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? '';
  const l = lastName?.charAt(0)?.toUpperCase() ?? '';
  return f + l || '?';
}
