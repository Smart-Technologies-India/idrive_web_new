import { AdminLoginForm, AdminLoginSchema } from "@/schema/login";
import { FormProvider, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { onFormError } from "@/utils/methods";
import { TextInput } from "../inputfields/textinput";
import { PasswordInput } from "../inputfields/passwordinput";
import { setCookie } from "cookies-next/client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Button, Steps } from "antd";

const RESEND_TIMEOUT = 60;

const AdminLoginPage = () => {
  const router = useRouter();
  const methods = useForm<AdminLoginForm>({
    resolver: valibotResolver(AdminLoginSchema),
  });

  // Forgot‑password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpStep, setFpStep] = useState(0);
  const [fpContact, setFpContact] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mobileForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  const startCountdown = () => {
    setCountdown(RESEND_TIMEOUT);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const openForgot = () => {
    setFpStep(0);
    setFpContact("");
    setFpOtp("");
    setCountdown(0);
    mobileForm.resetFields();
    otpForm.resetFields();
    resetForm.resetFields();
    setForgotOpen(true);
  };

  const closeForgot = () => {
    setForgotOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const sendOtp = async (values: { contact: string }) => {
    setFpLoading(true);
    try {
      const res = await ApiCall<{ forgotPasswordOtp: boolean }>({
        query: `mutation ForgotPasswordOtp($contact: String!) { forgotPasswordOtp(contact: $contact) }`,
        variables: { contact: values.contact },
      });
      if (!res.status) {
        toast.error(res.message || "Failed to send OTP");
        return;
      }
      setFpContact(values.contact);
      setFpStep(1);
      startCountdown();
      toast.success("OTP sent to your mobile number");
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setFpLoading(true);
    try {
      const res = await ApiCall<{ forgotPasswordOtp: boolean }>({
        query: `mutation ForgotPasswordOtp($contact: String!) { forgotPasswordOtp(contact: $contact) }`,
        variables: { contact: fpContact },
      });
      if (!res.status) {
        toast.error(res.message || "Failed to resend OTP");
        return;
      }
      startCountdown();
      toast.success("OTP resent successfully");
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  const verifyOtp = (values: { otp: string }) => {
    setFpOtp(values.otp);
    setFpStep(2);
  };

  const resetPassword = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    setFpLoading(true);
    try {
      const res = await ApiCall<{ forgotPasswordVerify: boolean }>({
        query: `mutation ForgotPasswordVerify($contact: String!, $otp: String!, $newPassword: String!) { forgotPasswordVerify(contact: $contact, otp: $otp, newPassword: $newPassword) }`,
        variables: {
          contact: fpContact,
          otp: fpOtp,
          newPassword: values.newPassword,
        },
      });
      if (!res.status) {
        toast.error(res.message || "Failed to reset password");
        // OTP might be wrong; send back to OTP step
        setFpStep(1);
        return;
      }
      toast.success("Password reset successfully! Please log in.");
      closeForgot();
    } catch {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setFpLoading(false);
    }
  };

  type LoginResponse = {
    id: string;
    name: string;
    role: string;
    schoolId?: number;
  };

  const adminLogin = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: AdminLoginForm) => {
      const response = await ApiCall({
        query:
          "query Login($loginUserInput: LoginUserInput!) { login(loginUserInput: $loginUserInput) { id, name, role, schoolId }}",
        variables: {
          loginUserInput: {
            contact: data.mobile,
            password: data.password,
          },
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      if (!(response.data as Record<string, unknown>)["login"]) {
        throw new Error("Value not found in response");
      }
      return (response.data as Record<string, unknown>)[
        "login"
      ] as LoginResponse;
    },

    onSuccess: async (data) => {
      setCookie("role", data.role);
      setCookie("id", data.id);

      if (data.role == "MT_ADMIN") {
        setCookie("school", data.schoolId?.toString() || "");
      }

      router.push("/admin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: AdminLoginForm) => {
    adminLogin.mutate({
      mobile: data.mobile,
      password: data.password,
    });
  };

  const stepItems = [
    { title: "Mobile" },
    { title: "OTP" },
    { title: "New Password" },
  ];

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit, onFormError)}
          className="space-y-6"
        >
          {/* Mobile Number Field */}
          <div className="space-y-2">
            <TextInput<AdminLoginForm>
              title="Mobile Number"
              required={true}
              name="mobile"
              placeholder="Enter your 10-digit mobile number"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <PasswordInput<AdminLoginForm>
              title="Password"
              required={true}
              name="password"
              placeholder="Enter your password"
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={openForgot}
              className="text-sm text-blue-600 hover:text-purple-600 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={methods.formState.isSubmitting || adminLogin.isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform "
          >
            {adminLogin.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </div>
            )}
          </button>
        </form>
      </FormProvider>

      {/* Forgot Password Modal */}
      <Modal
        title="Forgot Password"
        open={forgotOpen}
        onCancel={closeForgot}
        footer={null}
        width={440}
      >
        <Steps
          current={fpStep}
          items={stepItems}
          size="small"
          className="mb-6 mt-2"
        />

        {/* Step 0 — Enter mobile */}
        {fpStep === 0 && (
          <Form
            form={mobileForm}
            layout="vertical"
            onFinish={sendOtp}
            autoComplete="off"
          >
            <Form.Item
              label="Registered Mobile Number"
              name="contact"
              rules={[
                { required: true, message: "Please enter mobile number" },
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              ]}
            >
              <Input
                size="large"
                maxLength={10}
                placeholder="Enter your 10-digit mobile number"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={fpLoading}
              className="w-full !bg-blue-600"
            >
              Send OTP
            </Button>
          </Form>
        )}

        {/* Step 1 — Enter OTP */}
        {fpStep === 1 && (
          <Form
            form={otpForm}
            layout="vertical"
            onFinish={verifyOtp}
            autoComplete="off"
          >
            <p className="text-gray-500 text-sm mb-4">
              OTP sent to <span className="font-semibold">{fpContact}</span>
            </p>
            <Form.Item
              label="Enter OTP"
              name="otp"
              rules={[
                { required: true, message: "Please enter the OTP" },
                { len: 6, message: "OTP must be 6 digits" },
                {
                  pattern: /^\d{6}$/,
                  message: "OTP must contain only digits",
                },
              ]}
            >
              <Input
                size="large"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="tracking-widest text-center text-lg font-mono"
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                {countdown > 0 ? (
                  <>Resend OTP in <span className="font-semibold text-blue-600">{countdown}s</span></>
                ) : (
                  "Didn't receive the OTP?"
                )}
              </span>
              <button
                type="button"
                disabled={countdown > 0 || fpLoading}
                onClick={resendOtp}
                className={`text-sm font-medium transition-colors ${
                  countdown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-purple-600 cursor-pointer"
                }`}
              >
                Resend OTP
              </button>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full !bg-blue-600"
            >
              Verify OTP
            </Button>
          </Form>
        )}

        {/* Step 2 — New password */}
        {fpStep === 2 && (
          <Form
            form={resetForm}
            layout="vertical"
            onFinish={resetPassword}
            autoComplete="off"
          >
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please enter new password" },
                { min: 6, message: "Password must be at least 6 characters" },
                { whitespace: true, message: "Password cannot be empty" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter new password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Re-enter new password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={fpLoading}
              className="w-full !bg-blue-600"
            >
              Reset Password
            </Button>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default AdminLoginPage;
