import express from "express";
import cors from "cors";
import routes from "./interfaces/routes.js";
import { loggingMiddleware } from "./interfaces/middlewares/logging.js";
import { errorHandler } from "./interfaces/middlewares/errorHandler.js";
import { env } from "./config/env.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(loggingMiddleware);

app.use("/api", routes);

app.use(errorHandler);

const port = env.port;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Feedback backend listening on port ${port}`);
});

export default app;

