import * as v from "valibot";

export const EditCarAdminSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(2, "Car name must be at least 2 characters")
  ),
  manufacturer: v.pipe(
    v.string(),
    v.minLength(2, "Manufacturer must be at least 2 characters")
  ),
  category: v.pipe(
    v.string(),
    v.minLength(1, "Category is required")
  ),
  status: v.pipe(
    v.string(),
    v.minLength(1, "Status is required")
  ),
});

export type EditCarAdminForm = v.InferOutput<typeof EditCarAdminSchema>;
