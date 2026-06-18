import path from "node:path";
import dotenv from "dotenv";

let initialized = false;

function initialize() {
  if (initialized) return;

  const nodeEnv = process.env.NODE_ENV || "development";
  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${nodeEnv}`),
  });

  initialized = true;
}

function parseCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireInProduction(name: string, value: string | undefined, isProduction: boolean) {
  if (isProduction && !value?.trim()) {
    throw new Error(`Missing required production environment variable: ${name}`);
  }
}

export const getConfig = () => {
  initialize(); // Ensures dotenv runs before we read values
  const isProduction = process.env.NODE_ENV === "production";
  const corsOrigins = parseCsv(process.env.CORS_ORIGINS);

  requireInProduction("CORS_ORIGINS", process.env.CORS_ORIGINS, isProduction);
  requireInProduction("CLIENT_URL", process.env.CLIENT_URL, isProduction);
  requireInProduction("JWT_ACCESS_SECRET", process.env.JWT_ACCESS_SECRET, isProduction);
  requireInProduction("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET, isProduction);

  return {
    isDev: !isProduction,
    isProduction,
    port: Number(process.env.PORT) || 5000,

    db: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    },

    redis: {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || (isProduction ? "redis" : "localhost"),
      port: Number(process.env.REDIS_PORT) || 6379,
    },

    rateLimit: {
      bypass: process.env.RATE_LIMIT_BYPASS === "true",
    },

    cors: {
      origins: process.env.CORS_ORIGINS,
      originList: corsOrigins,
    },

    cookies: {
      secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : isProduction,
      sameSite: (process.env.COOKIE_SAMESITE || (isProduction ? "none" : "lax")) as
        | "lax"
        | "strict"
        | "none",
      domain: process.env.COOKIE_DOMAIN,
    },

    client: {
      url: process.env.CLIENT_URL,
    },

    mailer: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
      adminEmail: process.env.SEED_ADMIN_EMAIL,
    },

    admin: {
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      name: process.env.SEED_ADMIN_NAME,
    },

    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
    },

    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  };
};
