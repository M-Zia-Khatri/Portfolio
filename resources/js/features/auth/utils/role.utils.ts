import type { UserRole } from '../types';

export const isAdmin = (role?: UserRole) => role === 'admin';

// FIX: removed isUser — UserRole is currently "admin" only, so
// role === "user" was always false. Re-add when the schema gains a user role:
//   export type UserRole = "admin" | "user"
//   export const isUser = (role?: UserRole) => role === "user"
