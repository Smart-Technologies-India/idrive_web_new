"use client";

import { useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Input,
  DatePicker,
  Spin,
  Avatar,
} from "antd";
import {
  IcBaselineArrowBack,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsCall,
  MaterialSymbolsLocationOn,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserById, updateUser, type User } from "@/services/user.api";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { TextArea } = Input;

interface ProfileFormValues {
  name: string;
  contact1: string;
  contact2?: string;
  email?: string;
  dob?: dayjs.Dayjs;
  address?: string;
}

const EditProfilePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const userId: number = parseInt(getCookie("id")?.toString() || "0");

  // Fetch user data
  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId || userId == 0) throw new Error("User ID not found");
      return await getUserById(userId);
    },
    enabled: userId > 0,
  });

  const user: User | undefined = userResponse?.data?.getUserById;

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      return await updateUser({
        id: userId,
        name: values.name,
        contact1: values.contact1,
        contact2: values.contact2,
        email: values.email,
        dob: values.dob ? values.dob.toDate() : undefined,
        address: values.address,
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      router.push("/customer/profile");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        contact1: user.contact1,
        contact2: user.contact2,
        email: user.email,
        dob: user.dob ? dayjs(user.dob) : undefined,
        address: user.address,
      });
    }
  }, [user, form]);

  const handleSubmit = (values: ProfileFormValues) => {
    updateUserMutation.mutate(values);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push("/customer/profile")}
              size="large"
            >
              Back to Profile
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Avatar
              size={64}
              icon={<MaterialSymbolsPersonRounded />}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Update your personal information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="max-w-3xl">
          <Card className="shadow-sm">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              size="large"
            >
              <div className="space-y-1">
                {/* Name */}
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      <MaterialSymbolsPersonRounded className="text-gray-600" />
                      Full Name
                    </span>
                  }
                  name="name"
                  rules={[
                    { required: true, message: "Please enter your name" },
                    {
                      min: 2,
                      message: "Name must be at least 2 characters",
                    },
                  ]}
                >
                  <Input placeholder="Enter your full name" />
                </Form.Item>

                {/* Primary Contact */}
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      <MaterialSymbolsCall className="text-gray-600" />
                      Primary Contact Number
                    </span>
                  }
                  name="contact1"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your contact number",
                    },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </Form.Item>

                {/* Secondary Contact */}
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      <MaterialSymbolsCall className="text-gray-600" />
                      Secondary Contact Number (Optional)
                    </span>
                  }
                  name="contact2"
                  rules={[
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </Form.Item>

                {/* Email */}
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      📧 Email Address (Optional)
                    </span>
                  }
                  name="email"
                  rules={[
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input placeholder="Enter your email address" />
                </Form.Item>

                {/* Date of Birth */}
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      📅 Date of Birth (Optional)
                    </span>
                  }
                  name="dob"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        const age = dayjs().diff(value, "year");
                        if (age < 18) {
                          return Promise.reject(
                            new Error("You must be at least 18 years old")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder="Select your date of birth"
                    disabledDate={(current) => {
                      // Disable dates that would make the user younger than 18
                      const eighteenYearsAgo = dayjs().subtract(18, "year");
                      return (
                        current &&
                        (current > dayjs().endOf("day") ||
                          current > eighteenYearsAgo.endOf("day"))
                      );
                    }}
                  />
                </Form.Item>

                {/* Address */}
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium">
                      <MaterialSymbolsLocationOn className="text-gray-600" />
                      Address (Optional)
                    </span>
                  }
                  name="address"
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter your complete address"
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                {/* Information Note */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your primary contact number is used
                    for booking confirmations and important notifications. Make
                    sure it&apos;s always up to date.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="default"
                    size="large"
                    onClick={() => router.push("/customer/profile")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={updateUserMutation.isPending}
                    icon={<AntDesignCheckOutlined />}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
