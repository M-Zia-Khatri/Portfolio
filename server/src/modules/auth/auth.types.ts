// ─── REQUEST BODIES ───────────────────────────────────────────────────────────

export interface LoginBody {
  email: string;
  password: string;
}

export interface VerifyOtpBody {
  email: string;
  otp: string;
}

export interface RefreshBody {
  refreshToken: string;
}
