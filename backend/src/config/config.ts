import dotenv from "dotenv";

dotenv.config();

/**
 * Centralized configuration
 * Legge tutte le variabili d'ambiente in un unico posto
 */
export const config = {
  app: {
    port: parseInt(process.env.PORT || "3000"),
    env: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "fallback-secret-DO-NOT-USE-IN-PROD",
    jwtExpiresIn: parseInt(process.env.JWT_EXPIRES_IN || "86400"), // 24 ore
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
} as const;

// Validazione configuration (opzionale ma consigliata)
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Warning: ${varName} is not set in .env file`);
  }
});
