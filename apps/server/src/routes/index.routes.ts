import { Hono } from "hono";

export const exampleRouter = new Hono()
  .get("/example", (c) => {
    return c.text("Hello Hono!");
  })
  .get("/test", (c) => {
    const query = c.req.query("q");
    return c.json({ query, results: ["result1", "result2"] });
  });
