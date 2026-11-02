import { createApp } from "./app.js";
import { env } from "./config/env.js";
const app = createApp();
const server = app.listen(env.port, () => {
    console.log(`api listening on http://localhost:${env.port}`);
});
function shutdown(signal) {
    console.log(`${signal} received, finishing in-flight requests...`);
    server.close(() => {
        console.log("all requests finished, bye");
        process.exit(0);
    });
    setTimeout(() => {
        console.error("forced shutdown after timeout");
        process.exit(1);
    }, 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
