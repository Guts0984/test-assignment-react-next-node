export function appError(statusCode, message) {
    return { isAppError: true, statusCode, message };
}
export function isAppError(err) {
    return (typeof err === "object" &&
        err !== null &&
        "isAppError" in err &&
        err.isAppError === true);
}
