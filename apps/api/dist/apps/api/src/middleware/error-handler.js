import { ZodError } from "zod";
import { isAppError } from "../utils/app-error.js";
export function errorHandler(err, _req, res, _next) {
    if (isAppError(err)) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    if (err instanceof ZodError) {
        res.status(400).json({ error: "Validation failed", details: err.issues });
        return;
    }
    if (err instanceof SyntaxError &&
        "status" in err &&
        err.status === 400) {
        res.status(400).json({ error: "Malformed JSON in request body" });
        return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
}
