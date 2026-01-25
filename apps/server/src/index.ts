import { serve } from "bun";
import { app } from "./app";
import env from "./config/env";

console.log(`🚀 Server starting on port: ${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});

// export default app;
