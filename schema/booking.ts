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
      v.maxLength(10, "Mobile number must not exceed 10 digits"),
      v.regex(/^[0-9]+$/, "Please enter a valid mobile number")
    ),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    courseId: v.pipe(
      v.string(),
      v.minLength(1, "Please select a course")
    ),
    courseName: v.string(),
    coursePrice: v.number(),
    services: v.optional(v.array(v.string())),
    selectedServices: v.optional(v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        price: v.number(),
        serviceType: v.string(),
        description: v.string(),
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

// Customer interface (based on User entity)
export interface Customer {
  id: number;
  name: string;
  contact1: string;
  contact2?: string;
  email?: string;
  address?: string;
  role?: string;
  status?: string;
}
