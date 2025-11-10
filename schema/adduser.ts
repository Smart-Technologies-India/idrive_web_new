import { isContainSpace } from "@/utils/methods";
import {
  check,
  InferInput,
  minLength,
  object,
  string,
  pipe,
} from "valibot";

const AddUserSchema = object({
  contact1: pipe(
    string("Enter mobile number"),
    minLength(10, "Mobile number should be 10 digits."),
    check(isContainSpace, "Mobile number cannot contain space.")
  ),
  password: pipe(
    string("Enter password"),
    minLength(6, "Password should be at least 6 characters.")
  ),
  role: pipe(string("Select user role")),
});

type AddUserForm = InferInput<typeof AddUserSchema>;
export { AddUserSchema, type AddUserForm };