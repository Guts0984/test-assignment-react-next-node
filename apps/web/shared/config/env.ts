import "server-only";

// Server-only configuration. Never expose via NEXT_PUBLIC_* —
// this module must not be reachable from client components.
export const env = {
  apiUrl: process.env.API_URL ?? "http://localhost:3000",
} as const;
