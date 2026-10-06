import { verifyWebhook } from "./webhook.js";

export type ProviderName = "celoht" | "cards";
export type ProviderEnvironment = "sandbox" | "preview" | "production";

export interface ProviderConfig {
  enabled: boolean;
  environment: ProviderEnvironment;
  baseUrl: string;
  apiKey?: string;
  merchantId?: string;
  webhookSecret?: string;
}

export interface CheckoutRequest {
  amount: number;
  currency: "USD" | "USDC" | "CELO";
  donorName?: string;
  email?: string;
  campaign?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CheckoutSession {
  provider: ProviderName;
  sessionId: string;
  checkoutUrl: string;
  status: "created" | "pending" | "confirmed" | "failed";
}

export interface PaymentProviderAdapter {
  readonly provider: ProviderName;
  readonly config: ProviderConfig;
  getStatus(): {
    enabled: boolean;
    environment: ProviderEnvironment;
    provider: ProviderName;
    baseUrl: string;
  };
  createCheckoutSession(request: CheckoutRequest): Promise<CheckoutSession>;
  verifyWebhook(rawBody: string, header?: string): boolean;
}

export function assertProviderEnabled(config: ProviderConfig, providerName: string) {
  if (!config.enabled) {
    throw new Error(`${providerName} provider is disabled; enable it only after provider verification is complete.`);
  }
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "undefined") continue;
    search.set(key, String(value));
  }
  return search.toString();
}

export function verifyProviderWebhook(
  rawBody: string,
  header: string | undefined,
  secret: string | undefined,
  toleranceSeconds = 300,
) {
  if (!secret) return false;
  return verifyWebhook(rawBody, header, secret, { toleranceSeconds });
}
