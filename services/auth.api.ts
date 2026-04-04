import { ApiCall } from "./api";

export const sendOtp = async (contact: string) => {
  return ApiCall<{ forgotPasswordOtp: boolean }>({
    query: `mutation ForgotPasswordOtp($contact: String!) { forgotPasswordOtp(contact: $contact) }`,
    variables: { contact },
  });
};

export const verifyOtp = async (contact: string, otp: string) => {
  return ApiCall<{ verifyOtp: { id: number } }>({
    query: `mutation VerifyOtp($contact: String!, $otp: String!) { verifyOtp(contact: $contact, otp: $otp) { id } }`,
    variables: { contact, otp },
  });
};
