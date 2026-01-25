import { describe, expect, it } from "vitest";
import { testClient } from "hono/testing";
import app from "../src/.";

// Quick Example Hono test for future reference
describe("example test endpoint", () => {
  // Create the test client from the app instance
  const client = testClient(app);

  it("should return test results", async () => {
    // Include the token in the headers and set the content type
    const token = "this-is-an-example-token";
    const res = await client.test.$get({
      query: { q: "test" },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Assertions
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      query: "test",
      results: ["result1", "result2"],
    });
  });
});
