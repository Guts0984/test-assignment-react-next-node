try {
    process.loadEnvFile();
}
catch { }
export const env = {
    port: Number(process.env.PORT ?? 3000),
    cacheTtlMs: Number(process.env.CACHE_TTL_MS ?? 30_000),
    delayMinMs: Number(process.env.DELAY_MIN_MS ?? 500),
    delayMaxMs: Number(process.env.DELAY_MAX_MS ?? 1000),
};
