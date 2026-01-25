import { ContentfulStatusCode } from "hono/utils/http-status";

export class HttpError extends Error {
  constructor(
    public statusCode: ContentfulStatusCode,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message = "Bad Request", code?: string) {
    return new HttpError(400, message, code);
  }

  static unauthorized(message = "Unauthorized", code?: string) {
    return new HttpError(401, message, code);
  }

  static forbidden(message = "Forbidden", code?: string) {
    return new HttpError(403, message, code);
  }

  static notFound(message = "Not Found", code?: string) {
    return new HttpError(404, message, code);
  }

  static conflict(message = "Conflict", code?: string) {
    return new HttpError(409, message, code);
  }

  static internal(message = "Internal Server Error", code?: string) {
    return new HttpError(500, message, code);
  }
}
