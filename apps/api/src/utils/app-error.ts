export type AppError = {
  isAppError: true;
  statusCode: number;
  message: string;
};

export function appError(statusCode: number, message: string): AppError {
  return { isAppError: true, statusCode, message };
}

export function isAppError(err: unknown): err is AppError {
  return (
    typeof err === "object" &&
    err !== null &&
    "isAppError" in err &&
    (err as AppError).isAppError === true
  );
}
