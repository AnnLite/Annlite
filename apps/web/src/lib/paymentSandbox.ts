export type DonationMethod = "card" | "celoht";

export type DonationValidationResult = {
  valid: boolean;
  amount: number;
  message: string;
};

export function validateDonationAmount(value: string): DonationValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, amount: 0, message: "Enter a donation amount." };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { valid: false, amount: 0, message: "Enter a valid donation amount greater than zero." };
  }

  if (parsed > 10000) {
    return { valid: false, amount: 0, message: "Donation amounts above $10,000 are not supported." };
  }

  const rounded = Number(parsed.toFixed(2));
  if (!Number.isFinite(rounded)) {
    return { valid: false, amount: 0, message: "Enter a valid donation amount with up to two decimal places." };
  }

  return { valid: true, amount: rounded, message: "" };
}

export function sanitizeDonationAmount(value: string): number {
  const result = validateDonationAmount(value);
  return result.valid ? result.amount : 0;
}
