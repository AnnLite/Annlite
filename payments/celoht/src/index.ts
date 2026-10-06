import crypto from "node:crypto";
import {
  assertProviderEnabled,
  buildQueryString,
  type CheckoutRequest,
  type CheckoutSession,
  type PaymentProviderAdapter,
  type ProviderConfig,
  verifyProviderWebhook,
} from "@annlite/payments-core";

export class CeloHTProvider implements PaymentProviderAdapter {
  readonly provider = "celoht" as const;
  readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  getStatus() {
    return {
      enabled: this.config.enabled,
      environment: this.config.environment,
      provider: this.provider,
      baseUrl: this.config.baseUrl,
    };
  }

  async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutSession> {
    assertProviderEnabled(this.config, "CeloHT");

    const sessionId = `celoht_${crypto.randomUUID()}`;
    const query = buildQueryString({
      sessionId,
      amount: request.amount.toFixed(2),
      currency: request.currency,
      donorName: request.donorName ?? "",
      email: request.email ?? "",
      campaign: request.campaign ?? "general-support",
      metadata: request.metadata ? JSON.stringify(request.metadata) : undefined,
      environment: this.config.environment,
    });

    return {
      provider: this.provider,
      sessionId,
      checkoutUrl: `${this.config.baseUrl}/donate?${query}`,
      status: "created",
    };
  }

  verifyWebhook(rawBody: string, header?: string): boolean {
    return verifyProviderWebhook(rawBody, header, this.config.webhookSecret);
  }
}
