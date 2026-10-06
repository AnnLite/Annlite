import test from "node:test";
import assert from "node:assert/strict";
import { CeloHTProvider } from "../src/index.ts";
test("CeloHT provider creates a checkout session only when enabled", async () => {
    const provider = new CeloHTProvider({
        enabled: true,
        environment: "sandbox",
        baseUrl: "https://app.celoht.com",
        webhookSecret: "secret",
    });
    const session = await provider.createCheckoutSession({
        amount: 25,
        currency: "USD",
        donorName: "Test Donor",
        campaign: "general-support",
    });
    assert.equal(session.provider, "celoht");
    assert.match(session.checkoutUrl, /app\.celoht\.com/);
    assert.equal(session.status, "created");
    assert.ok(session.sessionId.length > 0);
    const disabled = new CeloHTProvider({
        enabled: false,
        environment: "sandbox",
        baseUrl: "https://app.celoht.com",
        webhookSecret: "secret",
    });
    await assert.rejects(() => disabled.createCheckoutSession({ amount: 10, currency: "USD" }), /disabled|enabled/i);
});
test("CeloHT webhook verification rejects a missing secret or stale request", () => {
    const provider = new CeloHTProvider({
        enabled: true,
        environment: "sandbox",
        baseUrl: "https://app.celoht.com",
        webhookSecret: "secret",
    });
    const now = Date.now();
    const body = JSON.stringify({ type: "donation" });
    const valid = `t=${Math.floor(now / 1000)},v1=${Buffer.from("placeholder", "utf8").toString("hex")}`;
    assert.equal(provider.verifyWebhook(body, valid), false);
    assert.equal(provider.verifyWebhook(body, undefined), false);
});
