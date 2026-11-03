import "server-only";

export const env = {
  apiUrl: process.env.API_URL ?? "http://localhost:3000",
} as const;
