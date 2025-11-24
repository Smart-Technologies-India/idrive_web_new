"use client";

import React, { useState, useEffect, use } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Spin,
} from "antd";
import {
  IcBaselineArrowBack,
  AntDesignCheckOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getDriverById, updateDriver } from "@/services/driver.api";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const { TextArea } = Input;

interface DriverFormValues {
  name: string;
  email: string;
  mobile: string;
  alternatePhone?: string;
  dateOfBirth?: Dayjs;
  bloodGroup?: string;
  gender?: string;
  address?: string;
  licenseNumber: string;
  licenseIssueDate?: Dayjs;
  licenseExpiryDate?: Dayjs;
  licenseType?: string;
  experience?: number;
  joiningDate?: Dayjs;
  salary?: number;
  status: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
}

const EditDriverPage = ({
  params,
}: {
  params: Promise<{ driverId: string }>;
}) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Unwrap params (Next.js 15+ async params)
  const { driverId } = use(params);

  // Parse the numeric driver ID from the URL parameter
  const numericDriverId = parseInt(driverId);

  // Load existing driver data
  useEffect(() => {
    const fetchDriverData = async () => {
      setFetching(true);
      try {
        const response = await getDriverById(numericDriverId);

        if (response.status && response.data.getDriverById) {
          const driver = response.data.getDriverById;
          form.setFieldsValue({
            name: driver.name,
            email: driver.email,
            mobile: driver.mobile,
            alternatePhone: driver.alternatePhone || "",
            dateOfBirth: driver.dateOfBirth
              ? dayjs(driver.dateOfBirth)
              : undefined,
            bloodGroup: driver.bloodGroup || "",
            gender: driver.gender || "",
            address: driver.address || "",
            licenseNumber: driver.licenseNumber,
            licenseIssueDate: driver.licenseIssueDate
              ? dayjs(driver.licenseIssueDate)
              : undefined,
            licenseExpiryDate: driver.licenseExpiryDate
              ? dayjs(driver.licenseExpiryDate)
              : undefined,
            licenseType: driver.licenseType || "",
            experience: driver.experience || undefined,
            joiningDate: driver.joiningDate
              ? dayjs(driver.joiningDate)
              : undefined,
            salary: driver.salary || undefined,
            status: driver.status,
            emergencyContactName: driver.emergencyContactName || "",
            emergencyContactNumber: driver.emergencyContactNumber || "",
            emergencyContactRelation: driver.emergencyContactRelation || "",
          });
        }
      } catch (error) {
        console.error("Error fetching driver:", error);
        toast.error("Failed to load driver data");
      } finally {
        setFetching(false);
      }
    };

    fetchDriverData();
  }, [form, numericDriverId]);

  const handleSubmit = async (values: DriverFormValues) => {
    setLoading(true);
    try {
      const response = await updateDriver({
        id: numericDriverId,
        name: values.name,
        email: values.email || undefined,
        mobile: values.mobile,
        alternatePhone: values.alternatePhone,
        dateOfBirth: values.dateOfBirth?.toDate(),
        bloodGroup: values.bloodGroup,
        gender: values.gender,
        address: values.address,
        licenseNumber: values.licenseNumber,
        licenseType: values.licenseType,
        licenseIssueDate: values.licenseIssueDate?.toDate(),
        licenseExpiryDate: values.licenseExpiryDate?.toDate(),
        experience: values.experience,
        joiningDate: values.joiningDate?.toDate(),
        salary: values.salary,
        status: values.status as
          | "ACTIVE"
          | "INACTIVE"
          | "ON_LEAVE"
          | "SUSPENDED",
        emergencyContactName: values.emergencyContactName,
        emergencyContactNumber: values.emergencyContactNumber,
        emergencyContactRelation: values.emergencyContactRelation,
      });

      if (response.status && response.data.updateDriver) {
        toast.success("Driver updated successfully!");
        router.push(`/mtadmin/driver/${driverId}`);
      } else {
        toast.error(response.message || "Failed to update driver");
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      toast.error("Failed to update driver. Please try again.");
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
              onClick={() => router.push(`/mtadmin/driver/${driverId}`)}
              size="large"
            >
              Back to Driver Profile
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Driver</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Update driver information - ID: {driverId}
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
                    { required: true, message: "Please enter driver name" },
                    {
                      min: 3,
                      message: "Name must be at least 3 characters",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter full name" />
                </Form.Item>

                <Form.Item
                  label="Email (Optional)"
                  name="email"
                  rules={[
                    { type: "email", message: "Please enter valid email" },
                    { required: false }
                  ]}
                >
                  <Input size="large" placeholder="Enter email address" />
                </Form.Item>

                <Form.Item
                  label="Mobile Number"
                  name="mobile"
                  rules={[
                    { required: true, message: "Please enter mobile number" },
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
                  label="Alternate Phone Number (Optional)"
                  name="alternatePhone"
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
                    format="DD/MM/YYYY"
                    maxDate={dayjs().subtract(18, "years")}
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
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Gender (Optional)" name="gender">
                  <Select
                    size="large"
                    placeholder="Select gender"
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Other", value: "Other" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Address (Optional)"
                  name="address"
                  className="md:col-span-2"
                >
                  <TextArea rows={3} placeholder="Enter complete address" />
                </Form.Item>
              </div>
            </div>

            {/* License Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                License Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="License Number"
                  name="licenseNumber"
                  rules={[
                    { required: true, message: "Please enter license number" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter license number (e.g., DL-0320190012345)"
                  />
                </Form.Item>

                <Form.Item
                  label="License Issue Date (Optional)"
                  name="licenseIssueDate"
                >
                  <DatePicker
                    size="large"
                    className="w-full"
                    placeholder="Select issue date"
                    format="DD/MM/YYYY"
                    maxDate={dayjs()}
                  />
                </Form.Item>

                <Form.Item
                  label="License Expiry Date (Optional)"
                  name="licenseExpiryDate"
                >
                  <DatePicker
                    size="large"
                    className="w-full"
                    placeholder="Select expiry date"
                    format="DD/MM/YYYY"
                    minDate={dayjs()}
                  />
                </Form.Item>

                <Form.Item label="License Type (Optional)" name="licenseType">
                  <Select
                    size="large"
                    placeholder="Select license type"
                    options={[
                      { label: "LMV (Light Motor Vehicle)", value: "LMV" },
                      { label: "MCWG (Motorcycle with Gear)", value: "MCWG" },
                      {
                        label: "MCWOG (Motorcycle without Gear)",
                        value: "MCWOG",
                      },
                      { label: "HMV (Heavy Motor Vehicle)", value: "HMV" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Professional Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Years of Experience (Optional)"
                  name="experience"
                >
                  <InputNumber
                    size="large"
                    className="w-full"
                    min={0}
                    max={50}
                    placeholder="Enter years of experience"
                  />
                </Form.Item>

                <Form.Item label="Joining Date (Optional)" name="joiningDate">
                  <DatePicker
                    size="large"
                    className="w-full"
                    placeholder="Select joining date"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item label="Salary (Optional)" name="salary">
                  <InputNumber
                    size="large"
                    className="w-full"
                    prefix="₹"
                    min={0}
                    placeholder="Enter monthly salary"
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
                      { label: "On Leave", value: "ON_LEAVE" },
                      { label: "Suspended", value: "SUSPENDED" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Emergency Contact Name (Optional)"
                  name="emergencyContactName"
                >
                  <Input size="large" placeholder="Enter contact name" />
                </Form.Item>

                <Form.Item
                  label="Emergency Contact Number (Optional)"
                  name="emergencyContactNumber"
                  rules={[
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
                  label="Relationship (Optional)"
                  name="emergencyContactRelation"
                >
                  <Select
                    size="large"
                    placeholder="Select relationship"
                    options={[
                      { label: "Father", value: "Father" },
                      { label: "Mother", value: "Mother" },
                      { label: "Spouse", value: "Spouse" },
                      { label: "Sibling", value: "Sibling" },
                      { label: "Friend", value: "Friend" },
                      { label: "Other", value: "Other" },
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
                onClick={() => router.push(`/mtadmin/driver/${driverId}`)}
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
                Update Driver
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditDriverPage;
