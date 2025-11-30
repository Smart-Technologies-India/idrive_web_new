import * as v from "valibot";

// Payment schema with validation
export const PaymentSchema = v.object({
  bookingId: v.pipe(
    v.number(),
    v.minValue(1, "Booking ID is required")
  ),
  userId: v.pipe(
    v.number(),
    v.minValue(1, "User ID is required")
  ),
  amount: v.pipe(
    v.number(),
    v.minValue(1, "Amount must be greater than 0")
  ),
  paymentMethod: v.optional(v.string()),
  transactionId: v.optional(v.string()),
  installmentNumber: v.pipe(
    v.number(),
    v.minValue(1, "Installment number must be at least 1")
  ),
  totalInstallments: v.pipe(
    v.number(),
    v.minValue(1, "Total installments must be at least 1")
  ),
  notes: v.optional(v.string()),
  paymentNumber: v.optional(v.string()),
});

export type PaymentFormData = v.InferOutput<typeof PaymentSchema>;
