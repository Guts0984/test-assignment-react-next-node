import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.ts";

export function delay(_req: Request, _res: Response, next: NextFunction): void {
  const ms = env.delayMinMs + Math.random() * (env.delayMaxMs - env.delayMinMs);
  setTimeout(next, ms);
}
