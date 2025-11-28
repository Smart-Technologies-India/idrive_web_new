import * as v from "valibot";

export const AddServiceSchema = v.object({
  // Basic Information
  serviceName: v.pipe(
    v.string(),
    v.minLength(3, "Service name must be at least 3 characters")
  ),
  serviceType: v.pipe(
    v.string(),
    v.minLength(1, "Service type is required")
  ),
  category: v.pipe(
    v.string(),
    v.minLength(2, "Category must be at least 2 characters")
  ),
  price: v.pipe(
    v.string(),
    v.regex(/^[0-9]+(\.[0-9]+)?$/, "Price must be a valid number")
  ),
  duration: v.pipe(
    v.string(),
    v.regex(/^[0-9]+$/, "Duration must be a number")
  ),

  // Service Details
  description: v.pipe(
    v.string(),
    v.minLength(10, "Description must be at least 10 characters")
  ),
  features: v.optional(v.array(v.string())),
  includedServices: v.optional(v.array(v.string())),
  requirements: v.optional(v.string()),
  termsAndConditions: v.optional(v.string()),
});

export type AddServiceForm = v.InferOutput<typeof AddServiceSchema>;
