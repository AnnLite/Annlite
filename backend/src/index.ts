import { createServer } from "node:http";
import { config } from "./config.js";
import {
  ADMIN_ROLES,
  authorize,
  createAdminToken,
  parseBearerToken,
  verifyAdminCredentials,
} from "./auth.js";
import { log } from "./lib/logger.js";

function withCors(headers: Record<string, string>, origin: string) {
  headers["Access-Control-Allow-Origin"] = origin;
  headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Signature";
  return headers;
}

function readJsonBody(req: import("node:http").IncomingMessage): Promise<Record<string, unknown> | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }

      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? (JSON.parse(text) as Record<string, unknown>) : null);
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });

    req.on("error", (error) => reject(error));
  });
}

function sanitizeErrorMessage(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : fallback;
  const safe = String(raw)
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/[<>&"']/g, (char) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    }[char] ?? char));

  return safe.trim().slice(0, 255) || fallback;
}

function emitJsonError(res: import("node:http").ServerResponse, statusCode: number, error: unknown, fallback: string) {
  res.writeHead(statusCode, withCors({ "Content-Type": "application/json; charset=utf-8" }, config.corsOrigin));
  res.end(JSON.stringify({ error: sanitizeErrorMessage(error, fallback) }));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");

  if (req.method === "OPTIONS") {
    res.writeHead(204, withCors({ "Content-Length": "0" }, config.corsOrigin));
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    const health = {
      app: config.appName,
      status: "ok",
      environment: config.environment,
      providerEnabled: config.paymentProvider.enabled,
    };

    res.writeHead(200, withCors({ "Content-Type": "application/json" }, config.corsOrigin));
    res.end(JSON.stringify(health));
    log("info", "healthcheck ok", { path: url.pathname });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/v1/status") {
    const status = {
      name: config.appName,
      environment: config.environment,
      paymentProvider: config.paymentProvider.provider,
      paymentProviderEnabled: config.paymentProvider.enabled,
      security: {
        webhookSignatureRequired: config.security.requireWebhookSignature,
        rateLimitWindowMs: config.security.rateLimitWindowMs,
      },
    };

    res.writeHead(200, withCors({ "Content-Type": "application/json" }, config.corsOrigin));
    res.end(JSON.stringify(status));
    log("info", "status endpoint requested", { path: url.pathname });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/v1/auth/login") {
    try {
      const body = (await readJsonBody(req)) ?? {};
      const email = typeof body.email === "string" ? body.email : "";
      const password = typeof body.password === "string" ? body.password : "";

      const user = verifyAdminCredentials(email, password);
      const token = createAdminToken({
        sub: user.sub,
        email: user.email,
        role: user.role,
      });

      res.writeHead(200, withCors({ "Content-Type": "application/json" }, config.corsOrigin));
      res.end(
        JSON.stringify({
          token,
          user: {
            sub: user.sub,
            email: user.email,
            role: user.role,
          },
        }),
      );
      log("info", "admin login successful", { email: user.email, role: user.role });
      return;
    } catch (error) {
      emitJsonError(res, 401, error, "Unauthorized");
      log("warn", "admin login failed");
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/v1/admin/me") {
    try {
      const token = parseBearerToken(req.headers.authorization);
      if (!token) {
        throw new Error("Missing bearer token");
      }

      const claims = authorize(token, [...ADMIN_ROLES]);
      res.writeHead(200, withCors({ "Content-Type": "application/json" }, config.corsOrigin));
      res.end(JSON.stringify({ user: { email: claims.email, role: claims.role, sub: claims.sub } }));
      return;
    } catch (error) {
      emitJsonError(res, 401, error, "Unauthorized");
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/v1/admin/summary") {
    try {
      const token = parseBearerToken(req.headers.authorization);
      if (!token) {
        throw new Error("Missing bearer token");
      }

      const claims = authorize(token, [...ADMIN_ROLES]);
      res.writeHead(200, withCors({ "Content-Type": "application/json" }, config.corsOrigin));
      res.end(
        JSON.stringify({
          user: {
            email: claims.email,
            role: claims.role,
          },
          permissions: {
            canViewDonors: ["finance", "security", "super_admin"].includes(claims.role),
            canManageCharity: ["super_admin", "security"].includes(claims.role),
            canApprovePayments: ["finance", "super_admin"].includes(claims.role),
          },
        }),
      );
      return;
    } catch (error) {
      emitJsonError(res, 403, error, "Forbidden");
      return;
    }
  }

  res.writeHead(404, withCors({ "Content-Type": "application/json" }, config.corsOrigin));
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(config.port, () => {
  log("info", "AnnLite backend started", {
    port: config.port,
    environment: config.environment,
  });
});

process.on("SIGINT", () => {
  log("warn", "backend shutting down");
  server.close(() => process.exit(0));
});
