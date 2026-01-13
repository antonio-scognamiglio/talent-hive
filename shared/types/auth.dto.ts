import { type Role } from "./user.types";

/**
 * Shared Authentication DTOs
 * Used by both Frontend and Backend
 */

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Role is optional in DTO because backend might force it,
  // but good to have in type definition for flexibility (e.g. admin creating users)
  role?: Role;
}
