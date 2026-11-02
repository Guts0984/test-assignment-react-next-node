import { createApp } from "./app.ts";
import { env } from "./config/env.ts";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`api listening on http://localhost:${env.port}`);
});

function shutdown(signal: string): void {
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
