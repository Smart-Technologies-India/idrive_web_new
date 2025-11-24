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

const AddSchoolSchema = object({
  name: pipe(
    string("Enter school name"),
    minLength(5, "School name must be at least 5 characters")
  ),
  email: optional(
    pipe(
      string("Enter email address"),
      regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter valid email address")
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
      string("Enter GST number"),
      regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please enter valid GST number"
      )
    )
  ),
  establishedYear: pipe(
    string("Enter established year"),
    regex(/^(19|20)\d{2}$/, "Please enter valid year (e.g., 2022)")
  ),
  website: optional(
    pipe(
      string("Enter website URL"),
      url("Please enter valid URL")
    )
  ),
});

type AddSchoolForm = InferInput<typeof AddSchoolSchema>;
export { AddSchoolSchema, type AddSchoolForm };
