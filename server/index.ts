import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders, createRateLimit, validateContentType } from "./middleware/security";

const app = express();

// Security middleware
app.use(securityHeaders);

// Rate limiting - more restrictive for API routes
app.use('/api/', createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
app.use('/api/opportunities/generate', createRateLimit(5 * 60 * 1000, 5)); // 5 AI generations per 5 minutes

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Content type validation for API routes
app.use('/api/', validateContentType);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? (status < 500 ? err.message : 'Internal Server Error')
      : err.message || "Internal Server Error";

    // Log error details in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error ${status} on ${req.method} ${req.path}:`, err);
    }

    res.status(status).json({ 
      error: message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
