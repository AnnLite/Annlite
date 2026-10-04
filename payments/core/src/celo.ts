/**
 * Server-side verification of a CELO / ERC-20 (e.g. USDm) donation.
 * A client-reported "success" is NEVER proof: the backend re-reads the chain.
 * The RPC is injected, so this logic is testable and provider-independent.
 */
export interface ChainReceipt {
  status: "success" | "reverted";
  blockNumber: bigint;
  to: string | null;
  /** Native CELO value in wei (for native transfers). */
  valueWei: bigint;
  /** Decoded ERC-20 Transfer events in this tx. */
  transfers: { token: string; to: string; amount: bigint }[];
}
export interface ChainReader {
  getReceipt(txHash: string): Promise<ChainReceipt | null>;
  getLatestBlock(): Promise<bigint>;
}
export interface Expectation {
  recipient: string;
  /** "native" for CELO, otherwise the token contract address. */
  asset: "native" | string;
  minAmount: bigint;
  minConfirmations: number;
}
export type VerifyResult =
  | { ok: true; confirmations: bigint }
  | { ok: false; reason: "not_found" | "reverted" | "wrong_recipient" | "insufficient_amount" | "not_enough_confirmations" | "bad_hash" };

const HASH = /^0x[0-9a-fA-F]{64}$/;
const eq = (a: string | null, b: string) => !!a && a.toLowerCase() === b.toLowerCase();

export async function verifyDonationTx(chain: ChainReader, txHash: string, exp: Expectation): Promise<VerifyResult> {
  if (!HASH.test(txHash)) return { ok: false, reason: "bad_hash" };
  const r = await chain.getReceipt(txHash);
  if (!r) return { ok: false, reason: "not_found" };
  if (r.status !== "success") return { ok: false, reason: "reverted" };

  if (exp.asset === "native") {
    if (!eq(r.to, exp.recipient)) return { ok: false, reason: "wrong_recipient" };
    if (r.valueWei < exp.minAmount) return { ok: false, reason: "insufficient_amount" };
  } else {
    const hits = r.transfers.filter((t) => eq(t.token, exp.asset) && eq(t.to, exp.recipient));
    if (hits.length === 0) return { ok: false, reason: "wrong_recipient" };
    const total = hits.reduce((s, t) => s + t.amount, 0n);
    if (total < exp.minAmount) return { ok: false, reason: "insufficient_amount" };
  }
  const confirmations = (await chain.getLatestBlock()) - r.blockNumber + 1n;
  if (confirmations < BigInt(exp.minConfirmations)) return { ok: false, reason: "not_enough_confirmations" };
  return { ok: true, confirmations };
}
