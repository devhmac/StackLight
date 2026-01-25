import { Hono } from "hono";
import { exampleRouter } from "./routes/index.routes";

const app = new Hono().route("/", exampleRouter);

export default app;
