/**
 * DTO for user login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * DTO for user registration
 */
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * DTO for changing password
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
