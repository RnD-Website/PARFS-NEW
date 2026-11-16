export type PaymentInit = {
  orderNumber: string;
  transactionId: string;
  amount: number; // minor units
  currency: string;
  method: "BKASH" | "NAGAD" | "CARD";
  customer: { name: string; email: string; phone: string; address: string; city: string; postcode?: string | null };
  productNames: string;
  itemCount: number;
};

export type PaymentValidation =
  | { ok: true; transactionId: string; validationId: string; amount: number; currency: string; raw: unknown }
  | { ok: false; transactionId?: string; reason: string; raw?: unknown };

export interface PaymentProvider {
  readonly name: "sslcommerz" | "mock";
  /** Creates a gateway session; returns the URL to send the shopper to. */
  initiate(p: PaymentInit): Promise<{ redirectUrl: string }>;
  /** Validates a gateway callback (success URL or IPN) server-to-server. */
  validate(payload: Record<string, string>): Promise<PaymentValidation>;
}
