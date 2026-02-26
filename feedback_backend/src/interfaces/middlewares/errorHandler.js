import { DomainError, PolicyNotFoundError, ValidationError } from "../../domain/errors.js";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const isDomainError = err instanceof DomainError;

  const statusCode = (() => {
    if (err instanceof ValidationError) return 400;
    if (err instanceof PolicyNotFoundError) return 404;
    if (isDomainError) return 422;
    return 500;
  })();

  const payload = {
    error: err instanceof Error ? err.name : "Error",
    message: err instanceof Error ? err.message : "Unknown error"
  };

  if (err instanceof ValidationError && err.details) {
    payload.details = err.details;
  }

  // eslint-disable-next-line no-console
  console.error("Error handling request", {
    name: err instanceof Error ? err.name : "Unknown",
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  });

  res.status(statusCode).json(payload);
};

