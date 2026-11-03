import { env } from "../config/env.ts";

export function simulateLatency(): Promise<void> {
  const ms = env.delayMinMs + Math.random() * (env.delayMaxMs - env.delayMinMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
