import test from "node:test";
import assert from "node:assert/strict";

import { CardProvider } from "../src/index.ts";

test("card provider creates a checkout session and preserves provider metadata", async () => {
  const provider = new CardProvider({
    enabled: true,
    environment: "sandbox",
    baseUrl: "https://checkout.example.com",
    merchantId: "merchant_123",
    apiKey: "pk_test_123",
  });

  const session = await provider.createCheckoutSession({
    amount: 50,
    currency: "USD",
    donorName: "Supporter",
    email: "supporter@example.com",
    campaign: "education",
  });

  assert.equal(session.provider, "cards");
  assert.ok(session.checkoutUrl.includes("merchant_123"));
  assert.equal(session.status, "created");
  assert.ok(session.sessionId.includes("card_"));
});

test("card provider refuses disabled configs", async () => {
  const provider = new CardProvider({
    enabled: false,
    environment: "sandbox",
    baseUrl: "https://checkout.example.com",
    merchantId: "merchant_123",
    apiKey: "pk_test_123",
  });

  await assert.rejects(() => provider.createCheckoutSession({ amount: 10, currency: "USD" }), /disabled|enabled/i);
});
