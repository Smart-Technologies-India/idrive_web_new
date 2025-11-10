import {
  InferInput,
  object,
  string,
  pipe,
  array,
  optional,
  union,
  literal,
} from "valibot";

// Schema for declaring holidays for all cars on multiple dates
const AllCarsMultipleDatesSchema = object({
  declarationType: literal("ALL_CARS_MULTIPLE_DATES"),
  carId: optional(string()),
  dateRange: pipe(
    array(string("Select date range")),
    // minLength(1, "Please select at least one date")
  ),
  slots: optional(array(string())),
  reason: pipe(string("Enter reason for holiday")),
});

// Schema for declaring holidays for one car on multiple dates
const OneCarMultipleDatesSchema = object({
  declarationType: literal("ONE_CAR_MULTIPLE_DATES"),
  carId: pipe(string("Select a car")),
  dateRange: pipe(
    array(string("Select date range")),
    // minLength(1, "Please select at least one date")
  ),
  slots: optional(array(string())),
  reason: pipe(string("Enter reason for holiday")),
});

// Schema for declaring holidays for all cars on particular slots
const AllCarsParticularSlotsSchema = object({
  declarationType: literal("ALL_CARS_PARTICULAR_SLOTS"),
  carId: optional(string()),
  dateRange: pipe(
    array(string("Select date range")),
    // minLength(1, "Please select at least one date")
  ),
  slots: pipe(
    array(string("Select time slots")),
    // minLength(1, "Please select at least one slot")
  ),
  reason: pipe(string("Enter reason for holiday")),
});

// Schema for declaring holidays for one car on particular slots
const OneCarParticularSlotsSchema = object({
  declarationType: literal("ONE_CAR_PARTICULAR_SLOTS"),
  carId: pipe(string("Select a car")),
  dateRange: pipe(
    array(string("Select date range")),
    // minLength(1, "Please select at least one date")
  ),
  slots: pipe(
    array(string("Select time slots")),
    // minLength(1, "Please select at least one slot")
  ),
  reason: pipe(string("Enter reason for holiday")),
});

// Union schema for all declaration types
const HolidayDeclarationSchema = union([
  AllCarsMultipleDatesSchema,
  OneCarMultipleDatesSchema,
  AllCarsParticularSlotsSchema,
  OneCarParticularSlotsSchema,
]);

type HolidayDeclarationForm = InferInput<typeof HolidayDeclarationSchema>;

export {
  HolidayDeclarationSchema,
  type HolidayDeclarationForm,
  AllCarsMultipleDatesSchema,
  OneCarMultipleDatesSchema,
  AllCarsParticularSlotsSchema,
  OneCarParticularSlotsSchema,
};
