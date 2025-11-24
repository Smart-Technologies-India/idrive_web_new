import { isContainSpace } from "@/utils/methods";
import {
  check,
  InferInput,
  minLength,
  object,
  string,
  pipe,
  regex,
  optional,
  url,
} from "valibot";

const EditProfileSchema = object({
  name: pipe(
    string("Enter school name"),
    minLength(5, "School name must be at least 5 characters")
  ),
  email: optional(
    pipe(
      string(),
      check(
        (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Please enter valid email address"
      )
    )
  ),
  phone: pipe(
    string("Enter phone number"),
    minLength(10, "Phone number should be at least 10 digits"),
    check(isContainSpace, "Phone number cannot contain space")
  ),
  alternatePhone: optional(string()),
  address: pipe(
    string("Enter address"),
    minLength(10, "Address must be at least 10 characters")
  ),
  registrationNumber: pipe(
    string("Enter registration number"),
    minLength(5, "Registration number must be at least 5 characters")
  ),
  gstNumber: optional(
    pipe(
      string(),
      check(
        (value) =>
          value === "" ||
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
            value
          ),
        "Please enter valid GST number"
      )
    )
  ),
  establishedYear: pipe(
    string("Enter established year"),
    regex(/^(19|20)\d{2}$/, "Please enter valid year (e.g., 2022)")
  ),
  website: optional(
    pipe(string("Enter website URL"), url("Please enter valid URL"))
  ),

  // Operating Hours
  dayStartTime: pipe(
    string("Enter day start time"),
    regex(
      /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
      "Please enter valid time in 12-hour format (e.g., 8:00 AM)"
    )
  ),
  dayEndTime: pipe(
    string("Enter day end time"),
    regex(
      /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
      "Please enter valid time in 12-hour format (e.g., 8:00 PM)"
    )
  ),
  lunchStartTime: pipe(
    string("Enter lunch start time"),
    regex(
      /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
      "Please enter valid time in 12-hour format (e.g., 1:00 PM)"
    )
  ),
  lunchEndTime: pipe(
    string("Enter lunch end time"),
    regex(
      /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/,
      "Please enter valid time in 12-hour format (e.g., 2:00 PM)"
    )
  ),
  weeklyHoliday: pipe(
    string("Select weekly holiday"),
    minLength(1, "Please select weekly holiday")
  ),

  // Owner Details
  ownerName: pipe(
    string("Enter owner name"),
    minLength(3, "Owner name must be at least 3 characters")
  ),
  ownerPhone: pipe(
    string("Enter owner phone"),
    minLength(10, "Phone number should be at least 10 digits"),
    check(isContainSpace, "Phone number cannot contain space")
  ),
  ownerEmail: optional(
    pipe(
      string(),
      check(
        (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Please enter valid email address"
      )
    )
  ),

  // Bank Details
  bankName: pipe(
    string("Enter bank name"),
    minLength(3, "Bank name must be at least 3 characters")
  ),
  accountNumber: pipe(
    string("Enter account number"),
    minLength(8, "Account number must be at least 8 characters")
  ),
  ifscCode: pipe(
    string("Enter IFSC code"),
    regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter valid IFSC code")
  ),
  branchName: pipe(
    string("Enter branch name"),
    minLength(3, "Branch name must be at least 3 characters")
  ),

  // License & Certifications
  rtoLicenseNumber: pipe(
    string("Enter RTO license number"),
    minLength(5, "RTO license number must be at least 5 characters")
  ),
  rtoLicenseExpiry: optional(string()),
  insuranceProvider: optional(string()),
  insurancePolicyNumber: optional(string()),
  insuranceExpiry: optional(string()),

  // Social Media
  facebook: optional(string()),
  instagram: optional(string()),
  twitter: optional(string()),
});

type EditProfileForm = InferInput<typeof EditProfileSchema>;
export { EditProfileSchema, type EditProfileForm };
