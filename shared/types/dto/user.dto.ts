import type { BaseListDto } from "./common.dto";

/**
 * DTO for listing/filtering users
 * Extends universal BaseListDto for flexibility
 */
export interface ListUsersDto extends BaseListDto {}

/**
 * DTO for updating user profile
 * Requires currentPassword for security verification
 */
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
}
