export function getInitials(
  firstName?: string | null,
  lastName?: string | null
) {
  if (!firstName) return "";
  if (lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }
  const parts = firstName.split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
