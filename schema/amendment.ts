import * as v from "valibot";

// Amendment action types
export type AmendmentAction = 
  | "CANCEL_BOOKING" 
  | "CHANGE_DATE" 
  | "CAR_BREAKDOWN" 
  | "CAR_HOLIDAY";

// Search method
export type SearchMethod = "mobile" | "bookingId";

// Amendment schema
export const AmendmentSchema = v.object({
  searchMethod: v.picklist(["mobile", "bookingId"] as const),
  customerMobile: v.optional(v.pipe(
    v.string(),
    v.minLength(10, "Mobile number must be at least 10 digits"),
    v.regex(/^[0-9+\-\s()]+$/, "Please enter a valid mobile number")
  )),
  bookingId: v.optional(v.pipe(
    v.string(),
    v.minLength(1, "Please enter a booking ID")
  )),
  selectedBookingId: v.optional(v.string()),
  amendmentAction: v.optional(v.picklist(["CANCEL_BOOKING", "CHANGE_DATE", "CAR_BREAKDOWN", "CAR_HOLIDAY"] as const)),
  selectedDates: v.optional(v.array(v.string())),
  newDate: v.optional(v.string()),
  reason: v.optional(v.string()),
});

export type AmendmentFormData = v.InferOutput<typeof AmendmentSchema>;

// Booking interface with dates
export interface BookingWithDates {
  id: string;
  bookingReference: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  carId: string;
  carName: string;
  carModel: string;
  slot: string;
  courseName: string;
  coursePrice: number;
  totalAmount: number;
  bookingDates: BookingDate[];
  status: "active" | "completed" | "cancelled" | "partial";
  createdAt: string;
}

// Individual booking date
export interface BookingDate {
  id: string;
  date: string;
  status: "scheduled" | "completed" | "cancelled";
  cancelledAt?: string;
  cancelReason?: string;
}

// Amendment request interface
export interface AmendmentRequest {
  bookingId: string;
  action: AmendmentAction;
  selectedDates?: string[];
  newDate?: string;
  reason: string;
}
