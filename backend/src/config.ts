export const config = {
  appName: "AnnLite API",
  environment: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "https://annlite.github.io",
  paymentProvider: {
    provider: "celoht",
    enabled: false,
  },
  security: {
    rateLimitWindowMs: 60_000,
    maxRequestsPerWindow: 120,
    requireWebhookSignature: true,
  },
} as const;
