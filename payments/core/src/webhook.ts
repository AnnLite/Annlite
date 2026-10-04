import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerifyOptions {
  /** Max accepted age of the signed timestamp, in seconds (replay protection). */
  toleranceSeconds?: number;
  /** Injectable clock (ms) for tests. */
  now?: () => number;
}

/** Signature format: `t=<unix-seconds>,v1=<hex hmac-sha256 of "<t>.<rawBody>">`. */
export function signWebhook(rawBody: string, secret: string, timestampSeconds: number): string {
  const mac = createHmac("sha256", secret).update(`${timestampSeconds}.${rawBody}`).digest("hex");
  return `t=${timestampSeconds},v1=${mac}`;
}

export function verifyWebhook(
  rawBody: string,
  header: string | undefined,
  secret: string,
  opts: VerifyOptions = {},
): boolean {
  if (!header || !secret) return false;
  const tolerance = opts.toleranceSeconds ?? 300;
  const now = (opts.now ?? Date.now)();
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts["t"]);
  const sig = parts["v1"];
  if (!Number.isFinite(t) || !sig || !/^[0-9a-f]+$/i.test(sig)) return false;
  if (Math.abs(now / 1000 - t) > tolerance) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest();
  const given = Buffer.from(sig, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
