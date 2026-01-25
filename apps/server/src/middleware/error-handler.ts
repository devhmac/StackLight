import { ErrorHandler } from "hono";
import { AppContext } from "../types";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-errors";
import { HTTPException } from "hono/http-exception";
import env from "../config/env";

export const onError: ErrorHandler = (err, c) => {
  const requestId = c.get("requestId");

  console.error(`[${requestId}] Error:`, err);

  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: "Validation failed",
        details: err.message,
      },
      400,
    );
  }

  // Handle our custom HttpError
  if (err instanceof HttpError) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
      },
      err.statusCode,
    );
  }
  // Handle Hono's HTTPException
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status,
    );
  }

  return c.json(
    {
      success: false,
      error:
        env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    },
    500,
  );
};
