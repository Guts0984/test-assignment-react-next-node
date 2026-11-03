import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";
import { env } from "../config/env.ts";

export function createProductsRateLimiter(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
  });
}
