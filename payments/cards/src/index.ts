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

export class CardProvider implements PaymentProviderAdapter {
  readonly provider = "cards" as const;
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
    assertProviderEnabled(this.config, "Card");

    const sessionId = `card_${crypto.randomUUID()}`;
    const query = buildQueryString({
      sessionId,
      amount: request.amount.toFixed(2),
      currency: request.currency,
      merchant: this.config.merchantId ?? "annlite",
      donorName: request.donorName ?? "",
      email: request.email ?? "",
      campaign: request.campaign ?? "general-support",
      metadata: request.metadata ? JSON.stringify(request.metadata) : undefined,
      environment: this.config.environment,
    });

    return {
      provider: this.provider,
      sessionId,
      checkoutUrl: `${this.config.baseUrl}/checkout?${query}`,
      status: "created",
    };
  }

  verifyWebhook(rawBody: string, header?: string): boolean {
    return verifyProviderWebhook(rawBody, header, this.config.webhookSecret);
  }
}
