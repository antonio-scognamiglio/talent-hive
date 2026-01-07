export const getRoleDisplayName = (role: string | null | undefined): string => {
  if (!role) return "Guest";
  // Capitalize logic or dictionary
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};
