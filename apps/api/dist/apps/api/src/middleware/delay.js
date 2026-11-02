import { env } from "../config/env.js";
export function delay(_req, _res, next) {
    const ms = env.delayMinMs + Math.random() * (env.delayMaxMs - env.delayMinMs);
    setTimeout(next, ms);
}
