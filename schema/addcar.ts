import * as v from "valibot";

export const AddCarSchema = v.object({
  // Car ID
  carId: v.pipe(
    v.string(),
    v.minLength(3, "Car ID must be at least 3 characters")
  ),

  // Basic Information
  carAdminId: v.pipe(
    v.string(),
    v.minLength(1, "Please select a car")
  ),
  registrationNumber: v.pipe(
    v.string(),
    v.minLength(5, "Registration number must be at least 5 characters")
  ),
  year: v.pipe(
    v.string(),
    v.regex(/^[0-9]{4}$/, "Year must be a valid 4-digit number")
  ),
  color: v.pipe(v.string(), v.minLength(1, "Color is required")),

  // Technical Specifications
  fuelType: v.pipe(v.string(), v.minLength(1, "Fuel type is required")),
  transmission: v.pipe(
    v.string(),
    v.minLength(1, "Transmission type is required")
  ),
  seatingCapacity: v.optional(
    v.pipe(v.string(), v.regex(/^[0-9]+$/, "Seating capacity must be a number"))
  ),
  engineNumber: v.optional(v.string()),
  chassisNumber: v.optional(v.string()),

  // Purchase Information
  purchaseDate: v.optional(v.string()),
  purchaseCost: v.optional(
    v.pipe(v.string(), v.regex(/^[0-9]+(\.[0-9]+)?$/, "Purchase cost must be a valid number"))
  ),
  currentMileage: v.optional(
    v.pipe(v.string(), v.regex(/^[0-9]+$/, "Current mileage must be a number"))
  ),

  // Documents & Compliance
  insuranceNumber: v.optional(v.string()),
  insuranceExpiry: v.optional(v.string()),
  pucExpiry: v.optional(v.string()),
  fitnessExpiry: v.optional(v.string()),

  // Maintenance
  lastServiceDate: v.optional(v.string()),
  nextServiceDate: v.optional(v.string()),

  // Assignment
  assignedDriverId: v.pipe(
    v.string(),
    v.minLength(1, "Driver assignment is required")
  ),
});

export type AddCarForm = v.InferOutput<typeof AddCarSchema>;
