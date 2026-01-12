import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import { config } from "./config/config";

const app = express();
const port = config.app.port;

// Middlewares
app.use(
  cors({
    origin: config.app.frontendUrl, // ✅ Da config invece di hardcoded
    credentials: true, // Permette invio cookie cross-origin
  })
);
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.listen(config.app.port, () => {
  console.log(
    `✅ [server]: Server running at http://localhost:${config.app.port}`
  );
  console.log(`📝 [cors]: Frontend allowed from ${config.app.frontendUrl}`);
});
