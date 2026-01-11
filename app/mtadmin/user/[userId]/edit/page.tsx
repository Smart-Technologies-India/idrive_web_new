"use client";

import React, { useState, useEffect, use } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Spin,
  Checkbox,
} from "antd";
import {
  IcBaselineArrowBack,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getUserById, updateUser } from "@/services/user.api";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { TextArea } = Input;

interface UserFormValues {
  name: string;
  surname?: string;
  fatherName?: string;
  email?: string;
  contact1: string;
  contact2?: string;
  address?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  dateOfBirth?: Dayjs;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT" | "DRIVER" | "MTADMIN";
  status: "ACTIVE" | "INACTIVE";
}

const EditUserPage = ({ params }: { params: Promise<{ userId: string }> }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

  // Unwrap params (Next.js 15+ async params)
  const { userId } = use(params);

  // Parse the numeric user ID from the URL parameter
  const numericUserId = parseInt(userId);

  // Handle checkbox change to copy current address to permanent address
  const handleSameAsCurrentAddress = (checked: boolean) => {
    setSameAsCurrentAddress(checked);
    if (checked) {
      const currentAddress = form.getFieldValue("address");
      form.setFieldValue("permanentAddress", currentAddress);
    } else {
      form.setFieldValue("permanentAddress", "");
    }
  };

  // Load existing user data
  useEffect(() => {
    const fetchUserData = async () => {
      setFetching(true);
      try {
        const response = await getUserById(numericUserId);

        if (response.status && response.data.getUserById) {
          const user = response.data.getUserById;
          form.setFieldsValue({
            name: user.name,
            surname: user.surname || "",
            fatherName: user.fatherName || "",
            email: user.email || "",
            contact1: user.contact1,
            contact2: user.contact2 || "",
            address: user.address || "",
            permanentAddress: user.permanentAddress || "",
            bloodGroup: user.bloodGroup || "",
            dateOfBirth: user.dob ? dayjs(user.dob) : undefined,
            role: user.role,
            status: user.status,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [form, numericUserId]);

  const handleSubmit = async (values: UserFormValues) => {
    setLoading(true);
    try {
      const response = await updateUser({
        id: numericUserId,
        name: values.name,
        surname: values.surname,
        fatherName: values.fatherName,
        email: values.email || undefined,
        contact1: values.contact1,
        contact2: values.contact2,
        address: values.address,
        permanentAddress: values.permanentAddress,
        bloodGroup: values.bloodGroup,
        dob: values.dateOfBirth?.toDate(),
        role: values.role,
        status: values.status,
      });

      if (response.status && response.data.updateUser) {
        toast.success("User updated successfully!");
        router.push(`/mtadmin/user/${userId}`);
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push(`/mtadmin/user/${userId}`)}
              size="large"
            >
              Back to User Profile
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Update user information - ID: {userId}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <Card className="shadow-sm max-w-4xl mx-auto">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter name" },
                    {
                      min: 3,
                      message: "Name must be at least 3 characters",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter full name" />
                </Form.Item>

                <Form.Item label="Surname (Optional)" name="surname">
                  <Input size="large" placeholder="Enter surname" />
                </Form.Item>

                <Form.Item label="Father's Name (Optional)" name="fatherName">
                  <Input size="large" placeholder="Enter father's name" />
                </Form.Item>

                <Form.Item
                  label="Email (Optional)"
                  name="email"
                  rules={[
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input size="large" placeholder="Enter email address" />
                </Form.Item>

                <Form.Item
                  label="Primary Contact"
                  name="contact1"
                  rules={[
                    { required: true, message: "Please enter contact number" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </Form.Item>

                <Form.Item
                  label="Secondary Contact (Optional)"
                  name="contact2"
                  rules={[
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter valid 10-digit mobile number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter 10-digit alternate mobile number"
                    maxLength={10}
                  />
                </Form.Item>

                <Form.Item label="Date of Birth (Optional)" name="dateOfBirth">
                  <DatePicker
                    size="large"
                    className="w-full"
                    placeholder="Select date of birth"
                    format="DD-MM-YYYY"
                    maxDate={dayjs()}
                  />
                </Form.Item>

                <Form.Item label="Blood Group (Optional)" name="bloodGroup">
                  <Select
                    size="large"
                    placeholder="Select blood group"
                    options={[
                      { label: "A+", value: "A+" },
                      { label: "A-", value: "A-" },
                      { label: "B+", value: "B+" },
                      { label: "B-", value: "B-" },
                      { label: "AB+", value: "AB+" },
                      { label: "AB-", value: "AB-" },
                      { label: "O+", value: "O+" },
                      { label: "O-", value: "O-" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Current Address (Optional)"
                  name="address"
                  className="md:col-span-2"
                >
                  <TextArea rows={3} placeholder="Enter current address" />
                </Form.Item>

                <div className="md:col-span-2">
                  <div className="mb-2">
                    <Checkbox
                      checked={sameAsCurrentAddress}
                      onChange={(e) =>
                        handleSameAsCurrentAddress(e.target.checked)
                      }
                    >
                      <span className="text-sm text-gray-700">
                        Same as Current Address
                      </span>
                    </Checkbox>
                  </div>
                  <Form.Item
                    label="Permanent Address (Optional)"
                    name="permanentAddress"
                  >
                    <TextArea rows={3} placeholder="Enter permanent address" />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: "Please select role" }]}
                >
                  <Select
                    size="large"
                    placeholder="Select role"
                    options={[
                      { label: "Admin", value: "ADMIN" },
                      { label: "Instructor", value: "INSTRUCTOR" },
                      { label: "Student", value: "STUDENT" },
                      { label: "Driver", value: "DRIVER" },
                      { label: "MT Admin", value: "MTADMIN" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select
                    size="large"
                    placeholder="Select status"
                    options={[
                      { label: "Active", value: "ACTIVE" },
                      { label: "Inactive", value: "INACTIVE" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="default"
                size="large"
                onClick={() => router.push(`/mtadmin/user/${userId}`)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<AntDesignCheckOutlined />}
                className="flex-1 !bg-blue-600"
              >
                Update User
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditUserPage;
