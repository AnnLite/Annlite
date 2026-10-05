export type CardNetwork = "Mastercard" | "Visa";
export type PaymentState = "created" | "pending" | "succeeded" | "failed" | "cancelled";

export type SandboxPaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  network: CardNetwork;
  status: PaymentState;
  provider: "sandbox";
  checkoutUrl: string;
  reference: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

export function createSandboxPaymentIntent({ amount, network, currency = "USD" }: { amount: number; network: CardNetwork; currency?: string }): SandboxPaymentIntent {
  const safeAmount = Number.isFinite(amount) ? Math.max(1, amount) : 1;
  const createdAt = new Date().toISOString();
  const id = `sandbox_${Math.random().toString(36).slice(2, 10)}`;

  return {
    id,
    amount: Number(safeAmount.toFixed(2)),
    currency,
    network,
    status: "created",
    provider: "sandbox",
    checkoutUrl: "/donate",
    reference: `SANDBOX-${Date.now().toString(36).toUpperCase()}`,
    idempotencyKey: `${id}:${currency}:${network}`,
    createdAt,
    updatedAt: createdAt,
  };
}

export function markSandboxPaymentPending(intent: SandboxPaymentIntent): SandboxPaymentIntent {
  return { ...intent, status: "pending", updatedAt: new Date().toISOString() };
}

export function completeSandboxPayment(intent: SandboxPaymentIntent): SandboxPaymentIntent {
  return { ...intent, status: "succeeded", updatedAt: new Date().toISOString() };
}

export function cancelSandboxPayment(intent: SandboxPaymentIntent): SandboxPaymentIntent {
  return { ...intent, status: "cancelled", updatedAt: new Date().toISOString() };
}

export function failSandboxPayment(intent: SandboxPaymentIntent): SandboxPaymentIntent {
  return { ...intent, status: "failed", updatedAt: new Date().toISOString() };
}

export function sanitizeDonationAmount(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(10000, Math.max(1, Number(parsed.toFixed(2))));
}
