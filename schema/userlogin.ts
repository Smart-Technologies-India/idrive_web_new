import { isContainSpace } from "@/utils/methods";
import { check, InferInput, minLength, object, string, pipe } from "valibot";

const UserLoginSchema = object({
  contact: pipe(
    string(),
    minLength(10, "Contact number must be 10 digits"),
    check(isContainSpace, "Contact number cannot contain space.")
  ),
});

const VerifyOtpSchema = object({
  contact: pipe(
    string(),
    minLength(10, "Contact number must be 10 digits"),
    check(isContainSpace, "Contact number cannot contain space.")
  ),
  otp: pipe(
    string(),
    minLength(4, "OTP must be at least 4 digits"),
    check(isContainSpace, "OTP cannot contain space.")
  ),
});

type UserLoginForm = InferInput<typeof UserLoginSchema>;
type VerifyOtpForm = InferInput<typeof VerifyOtpSchema>;

export { UserLoginSchema, VerifyOtpSchema, type UserLoginForm, type VerifyOtpForm };