import * as v from "valibot";

// Booking schema with validation
export const BookingSchema = v.pipe(
  v.object({
    carId: v.pipe(
      v.string(),
      v.minLength(1, "Please select a car")
    ),
    carName: v.string(),
    slot: v.pipe(
      v.string(),
      v.minLength(1, "Please select a time slot")
    ),
    bookingDate: v.pipe(
      v.string(),
      v.minLength(1, "Please select a booking date")
    ),
    customerMobile: v.pipe(
      v.string(),
      v.minLength(10, "Mobile number must be at least 10 digits"),
      v.maxLength(15, "Mobile number must not exceed 15 digits"),
      v.regex(/^[0-9+\-\s()]+$/, "Please enter a valid mobile number")
    ),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    courseId: v.pipe(
      v.string(),
      v.minLength(1, "Please select a course")
    ),
    courseName: v.string(),
    coursePrice: v.number(),
    addons: v.optional(v.array(v.string())),
    selectedAddons: v.optional(v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        price: v.number(),
      })
    )),
    totalAmount: v.number(),
    notes: v.optional(v.string()),
  })
);

export type BookingFormData = v.InferOutput<typeof BookingSchema>;

// Course interface
export interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

// Addon interface
export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Customer interface
export interface Customer {
  mobile: string;
  name: string;
  email: string;
  licenseNumber?: string;
  address?: string;
}
