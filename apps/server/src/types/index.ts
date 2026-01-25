import type { Context } from "hono";

// App-wide Hono environment bindings
export type AppEnv = {
  Variables: {
    requestId: string;
    userId?: string; // Set by auth middleware
  };
};

// Standard API response wrapper
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

// Typed context helper
export type AppContext = Context<AppEnv>;
