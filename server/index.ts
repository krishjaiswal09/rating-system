import express from "express";
import session from "express-session";
import { setupRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());

// Simple session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "simple-secret-key-for-dev",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Setup routes
setupRoutes(app);

(async () => {
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, app);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})();