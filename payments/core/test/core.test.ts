import { test } from "node:test";
import assert from "node:assert/strict";
import { canTransition, assertTransition, isTerminal } from "../src/stateMachine.ts";
import { signWebhook, verifyWebhook } from "../src/webhook.ts";
import { InMemoryIdempotencyStore, once } from "../src/idempotency.ts";
import { verifyDonationTx, type ChainReader, type ChainReceipt } from "../src/celo.ts";

test("state machine: only legal transitions", () => {
  assert.ok(canTransition("pending", "confirmed"));
  assert.ok(!canTransition("created", "confirmed"));
  assert.ok(!canTransition("failed", "confirmed"));
  assert.throws(() => assertTransition("confirmed", "pending"));
  assert.ok(isTerminal("failed") && !isTerminal("confirmed"));
});

test("webhook: valid signature accepted", () => {
  const now = 1_700_000_000_000;
  const h = signWebhook('{"id":"p1"}', "s3cret", now / 1000);
  assert.equal(verifyWebhook('{"id":"p1"}', h, "s3cret", { now: () => now }), true);
});
test("webhook: tampered body, wrong secret, stale timestamp, garbage rejected", () => {
  const now = 1_700_000_000_000;
  const h = signWebhook('{"id":"p1"}', "s3cret", now / 1000);
  assert.equal(verifyWebhook('{"id":"p2"}', h, "s3cret", { now: () => now }), false);
  assert.equal(verifyWebhook('{"id":"p1"}', h, "other", { now: () => now }), false);
  assert.equal(verifyWebhook('{"id":"p1"}', h, "s3cret", { now: () => now + 10 * 60_000 }), false);
  assert.equal(verifyWebhook("x", "garbage", "s3cret", { now: () => now }), false);
  assert.equal(verifyWebhook("x", undefined, "s3cret"), false);
});

test("idempotency: second claim is a duplicate and fn runs once", async () => {
  const store = new InMemoryIdempotencyStore();
  let n = 0;
  const a = await once(store, "evt_1", async () => ++n);
  const b = await once(store, "evt_1", async () => ++n);
  assert.equal(a.duplicate, false);
  assert.equal(b.duplicate, true);
  assert.equal(n, 1);
});

test("idempotency: concurrent claims execute the callback once", async () => {
  const store = new InMemoryIdempotencyStore();
  let calls = 0;
  const results = await Promise.all(
    Array.from({ length: 10 }, () => once(store, "evt_concurrent", async () => ++calls)),
  );

  assert.equal(results.filter((result) => !result.duplicate).length, 1);
  assert.equal(calls, 1);
});

const RECIPIENT = "0xAbC0000000000000000000000000000000000001";
const TOKEN = "0xToken000000000000000000000000000000000002";
const HASH = "0x" + "a".repeat(64);
const chain = (r: ChainReceipt | null, latest = 110n): ChainReader => ({
  getReceipt: async () => r,
  getLatestBlock: async () => latest,
});
const base: ChainReceipt = { status: "success", blockNumber: 100n, to: RECIPIENT.toLowerCase(), valueWei: 5n * 10n ** 18n, transfers: [] };

test("celo: native transfer verified (case-insensitive address)", async () => {
  const r = await verifyDonationTx(chain(base), HASH, { recipient: RECIPIENT, asset: "native", minAmount: 10n ** 18n, minConfirmations: 5 });
  assert.equal(r.ok, true);
});
test("celo: rejects bad hash, missing, reverted, wrong recipient, low amount, few confirmations", async () => {
  const exp = { recipient: RECIPIENT, asset: "native" as const, minAmount: 10n ** 18n, minConfirmations: 5 };
  assert.deepEqual(await verifyDonationTx(chain(base), "0x12", exp), { ok: false, reason: "bad_hash" });
  assert.deepEqual(await verifyDonationTx(chain(null), HASH, exp), { ok: false, reason: "not_found" });
  assert.deepEqual(await verifyDonationTx(chain({ ...base, status: "reverted" }), HASH, exp), { ok: false, reason: "reverted" });
  assert.deepEqual(await verifyDonationTx(chain({ ...base, to: "0xdead" }), HASH, exp), { ok: false, reason: "wrong_recipient" });
  assert.deepEqual(await verifyDonationTx(chain({ ...base, valueWei: 1n }), HASH, exp), { ok: false, reason: "insufficient_amount" });
  assert.deepEqual(await verifyDonationTx(chain(base, 101n), HASH, exp), { ok: false, reason: "not_enough_confirmations" });
});
test("celo: ERC-20 (stablecoin) transfer verified and summed", async () => {
  const r = { ...base, to: TOKEN, valueWei: 0n, transfers: [
    { token: TOKEN, to: RECIPIENT, amount: 3n * 10n ** 18n },
    { token: TOKEN, to: RECIPIENT, amount: 2n * 10n ** 18n },
  ] };
  const ok = await verifyDonationTx(chain(r), HASH, { recipient: RECIPIENT, asset: TOKEN, minAmount: 5n * 10n ** 18n, minConfirmations: 1 });
  assert.equal(ok.ok, true);
  const bad = await verifyDonationTx(chain(r), HASH, { recipient: RECIPIENT, asset: "0xOtherToken", minAmount: 1n, minConfirmations: 1 });
  assert.deepEqual(bad, { ok: false, reason: "wrong_recipient" });
});
