import * as v from "valibot";

export const AddDriverSchema = v.object({
  // Personal Information
  name: v.pipe(v.string(), v.minLength(3, "Name must be at least 3 characters")),
  email: v.optional(v.pipe(v.string(), v.email("Invalid email address"))),
  mobile: v.pipe(
    v.string(),
    v.length(10, "Mobile number must be 10 digits"),
    v.regex(/^[0-9]+$/, "Mobile number must contain only digits")
  ),
  alternatePhone: v.optional(
    v.pipe(
      v.string(),
      v.length(10, "Alternate phone must be 10 digits"),
      v.regex(/^[0-9]+$/, "Phone number must contain only digits")
    )
  ),
  address: v.pipe(
    v.string(),
    v.minLength(10, "Address must be at least 10 characters")
  ),
  dateOfBirth: v.pipe(
    v.string(),
    v.minLength(1, "Date of birth is required"),
    v.check(
      (value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        return adjustedAge >= 18;
      },
      "Driver must be at least 18 years old"
    )
  ),
  bloodGroup: v.optional(v.string()),
  gender: v.pipe(v.string(), v.minLength(1, "Gender is required")),

  // License Information
  licenseNumber: v.pipe(
    v.string(),
    v.minLength(5, "License number must be at least 5 characters")
  ),
  licenseType: v.pipe(
    v.string(),
    v.minLength(1, "License type is required")
  ),
  licenseIssueDate: v.pipe(
    v.string(),
    v.minLength(1, "License issue date is required")
  ),
  licenseExpiryDate: v.pipe(
    v.string(),
    v.minLength(1, "License expiry date is required")
  ),

  // Professional Information
  experience: v.optional(v.pipe(v.string(), v.regex(/^[0-9]+$/, "Experience must be a number"))),
  joiningDate: v.optional(v.string()),
  salary: v.optional(v.pipe(v.string(), v.regex(/^[0-9]+$/, "Salary must be a number"))),

  // Emergency Contact
  emergencyContactName: v.optional(v.string()),
  emergencyContactNumber: v.optional(
    v.pipe(
      v.string(),
      v.length(10, "Emergency contact must be 10 digits"),
      v.regex(/^[0-9]+$/, "Phone number must contain only digits")
    )
  ),
  emergencyContactRelation: v.optional(v.string()),
});

export type AddDriverForm = v.InferOutput<typeof AddDriverSchema>;
