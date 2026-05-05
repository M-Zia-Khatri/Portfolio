// ─── Roles ────────────────────────────────────────────────────────────────────
// Narrowed to "admin" only until other roles are added to the Prisma schema.
// Expand once model Admin { role String @default("admin") } is in place.
export type UserRole = 'admin';

// ─── Auth user ────────────────────────────────────────────────────────────────
// Must match the shape returned by GET /auth/me
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string; // ISO string — Date is serialised to string over JSON
}

// ─── Auth state ───────────────────────────────────────────────────────────────
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthStep = 'login' | 'otp';

export interface AuthStepConfig {
  title: string;
  badge: string;
  description: string;
}
