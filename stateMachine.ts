export type PaymentStatus = "created" | "pending" | "confirmed" | "failed" | "expired" | "refunded";

const TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  created: ["pending", "failed", "expired"],
  pending: ["confirmed", "failed", "expired"],
  confirmed: ["refunded"],
  failed: [],
  expired: [],
  refunded: [],
};

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal payment transition: ${from} -> ${to}`);
  }
}

export function isTerminal(s: PaymentStatus): boolean {
  return TRANSITIONS[s].length === 0;
}
