"use client";

import { useState } from "react";
import { Button, Card, Form, Input } from "antd";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { updateUser } from "@/services/user.api";

interface ResetPasswordFormValues {
  password: string;
  rePassword: string;
}

export default function MtAdminResetPasswordPage() {
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const userId = parseInt(getCookie("id")?.toString() || "0", 10);

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!userId) {
      toast.error("User session not found. Please login again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await updateUser({
        id: userId,
        password: values.password,
      });

      if (response.status && response.data.updateUser) {
        toast.success("Password updated successfully!");
        form.resetFields();
      } else {
        toast.error(response.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Set a new password for your account.
          </p>
        </div>
      </div>

      <div className="px-8 py-6">
        <Card className="max-w-xl mx-auto shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: "Please enter new password" },
                {
                  min: 6,
                  message: "Password should be at least 6 characters",
                },
                {
                  whitespace: true,
                  message: "Password cannot be empty",
                },
              ]}
            >
              <Input.Password size="large" placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              label="Re-password"
              name="rePassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please re-enter new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password size="large" placeholder="Re-enter new password" />
            </Form.Item>

            <Form.Item className="mb-0 pt-2">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submitting}
                className="w-full !bg-blue-600"
              >
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
