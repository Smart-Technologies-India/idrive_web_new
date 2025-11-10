"use client";
import {
  UserLoginForm,
  UserLoginSchema,
  VerifyOtpForm,
  VerifyOtpSchema,
} from "@/schema/userlogin";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { TextInput } from "../inputfields/textinput";
import { setCookie } from "cookies-next/client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

const UserLoginPage = () => {
  const router = useRouter();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [contact, setContact] = useState("");
  const [timer, setTimer] = useState(0);

  const loginMethods = useForm<UserLoginForm>({
    resolver: valibotResolver(UserLoginSchema),
  });

  const otpMethods = useForm<VerifyOtpForm>({
    resolver: valibotResolver(VerifyOtpSchema),
    defaultValues: {
      contact: contact,
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  type LoginResponse = {
    id: string;
    contact1: string;
    role: string;
  };

  const sendOtp = useMutation({
    mutationKey: ["sendOtp"],
    mutationFn: async (data: UserLoginForm) => {
      const response = await ApiCall({
        query: `mutation OptLogin($contact: String!) {
          optLogin(contact: $contact) {
            id,
            contact1,
            role
          }
        }`,
        variables: {
          contact: data.contact,
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      return response.data;
    },

    onSuccess: (data, variables) => {
      toast.success("OTP sent successfully!");
      setIsOtpSent(true);
      setContact(variables.contact);
      setTimer(120); // 2 minutes
      otpMethods.setValue("contact", variables.contact);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const verifyOtp = useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: async (data: VerifyOtpForm) => {
      const response = await ApiCall({
        query: `mutation VerifyOtp($contact: String!, $otp: String!) {
          verifyOtp(contact: $contact, otp: $otp) {
            id,
            contact1,
            role
          }
        }`,
        variables: {
          contact: data.contact,
          otp: data.otp,
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      if (!(response.data as Record<string, unknown>)["verifyOtp"]) {
        throw new Error("Invalid OTP");
      }
      return (response.data as Record<string, unknown>)[
        "verifyOtp"
      ] as LoginResponse;
    },

    onSuccess: (data) => {
      setCookie("role", data.role);
      setCookie("id", data.id);
      toast.success("Login successful!");
      router.push(`/customer/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSendOtp = async (data: UserLoginForm) => {
    sendOtp.mutate({
      contact: data.contact,
    });
  };

  const onVerifyOtp = async (data: VerifyOtpForm) => {
    verifyOtp.mutate({
      contact: data.contact,
      otp: data.otp,
    });
  };

  const handleResendOtp = () => {
    if (timer === 0) {
      sendOtp.mutate({ contact });
    }
  };

  const handleBackToContact = () => {
    setIsOtpSent(false);
    setContact("");
    setTimer(0);
    loginMethods.reset();
    otpMethods.reset();
  };

  if (!isOtpSent) {
    return (
      <FormProvider {...loginMethods}>
        <form
          onSubmit={loginMethods.handleSubmit(onSendOtp, onFormError)}
          className="space-y-6"
        >
          {/* Contact Number Field */}
          <div className="space-y-2">
            <TextInput<UserLoginForm>
              title="Mobile Number"
              required={true}
              name="contact"
              onlynumber={true}
              maxlength={10}
              placeholder="Enter your 10-digit mobile number"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMethods.formState.isSubmitting || sendOtp.isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
          >
            {sendOtp.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending OTP...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Send OTP
              </div>
            )}
          </button>
        </form>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...otpMethods}>
      <form
        onSubmit={otpMethods.handleSubmit(onVerifyOtp, onFormError)}
        className="space-y-6"
      >
        {/* Contact Display */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">OTP sent to</p>
          <p className="font-semibold text-gray-900">{contact}</p>
        </div>

        {/* OTP Field */}
        <div className="space-y-2">
          <TextInput<VerifyOtpForm>
            title="Enter OTP"
            required={true}
            name="otp"
            onlynumber={true}
            maxlength={6}
            placeholder="Enter 6-digit OTP"
          />
        </div>

        {/* Timer and Resend */}
        <div className="text-center">
          {timer > 0 ? (
            <p className="text-sm text-gray-600">
              Resend OTP in{" "}
              <span className="font-semibold text-blue-600">
                {formatTime(timer)}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={sendOtp.isPending}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
            >
              {sendOtp.isPending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={otpMethods.formState.isSubmitting || verifyOtp.isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
        >
          {verifyOtp.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Verify & Login
            </div>
          )}
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={handleBackToContact}
          className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
        >
          ← Change Mobile Number
        </button>
      </form>
    </FormProvider>
  );
};

export default UserLoginPage;
