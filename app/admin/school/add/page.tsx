"use client";

import { useState } from "react";
import { Card, Form, Input, Button, message, Upload } from "antd";
import {
  IcBaselineArrowBack,
  AntDesignCheckOutlined,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import type { UploadFile } from "antd";

const { TextArea } = Input;

interface SchoolFormValues {
  name: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  registrationNumber: string;
  gstNumber: string;
  establishedYear: string;
  website: string;
}

const AddSchoolPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoImage, setLogoImage] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: SchoolFormValues) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Form values:", values);
      message.success(
        "School added successfully! School admin can now complete the remaining details."
      );
      router.push("/admin/school");
    } catch {
      message.error("Failed to add school. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push("/admin/school")}
              size="large"
            >
              Back to Schools
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New School
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Create a new driving school. School admin will complete remaining
              details after registration.
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
            {/* School Logo */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                School Logo
              </h3>
              <Form.Item label="Upload School Logo (Optional)" name="logo">
                <Upload
                  listType="picture-card"
                  fileList={logoImage}
                  onChange={({ fileList }) => setLogoImage(fileList)}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {logoImage.length === 0 && (
                    <div>
                      <AntDesignPlusCircleOutlined className="text-2xl" />
                      <div className="mt-2">Upload Logo</div>
                    </div>
                  )}
                </Upload>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended size: 200x200 pixels. Max size: 2MB
                </p>
              </Form.Item>
            </div>

            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="School Name"
                  name="name"
                  className="md:col-span-2"
                  rules={[
                    { required: true, message: "Please enter school name" },
                    {
                      min: 5,
                      message: "School name must be at least 5 characters",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter school name (e.g., iDrive Driving School - Rohini)"
                  />
                </Form.Item>

                <Form.Item
                  label="Registration Number"
                  name="registrationNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter registration number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter registration number (e.g., DL/DS/2022/12345)"
                  />
                </Form.Item>

                <Form.Item
                  label="GST Number"
                  name="gstNumber"
                  rules={[
                    { required: true, message: "Please enter GST number" },
                    {
                      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                      message: "Please enter valid GST number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter GST number (e.g., 07AABCI1234F1Z5)"
                    maxLength={15}
                  />
                </Form.Item>

                <Form.Item
                  label="Established Year"
                  name="establishedYear"
                  rules={[
                    {
                      required: true,
                      message: "Please enter established year",
                    },
                    {
                      pattern: /^(19|20)\d{2}$/,
                      message: "Please enter valid year (e.g., 2022)",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter year (e.g., 2022)"
                    maxLength={4}
                  />
                </Form.Item>

                <Form.Item
                  label="Website"
                  name="website"
                  rules={[
                    { required: true, message: "Please enter website URL" },
                    { type: "url", message: "Please enter valid URL" },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="https://www.yourschool.com"
                  />
                </Form.Item>

                <Form.Item
                  label="Address"
                  name="address"
                  className="md:col-span-2"
                  rules={[
                    { required: true, message: "Please enter address" },
                    {
                      min: 10,
                      message: "Address must be at least 10 characters",
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Enter complete address with city and state"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter email address" },
                    {
                      type: "email",
                      message: "Please enter valid email address",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="school@example.com"
                    type="email"
                  />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    {
                      pattern: /^[+]?[0-9]{10,15}$/,
                      message: "Please enter valid phone number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="+91 9876543210"
                    maxLength={15}
                  />
                </Form.Item>

                <Form.Item
                  label="Alternate Phone Number (Optional)"
                  name="alternatePhone"
                  rules={[
                    {
                      pattern: /^[+]?[0-9]{10,15}$/,
                      message: "Please enter valid phone number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="+91 9876543211"
                    maxLength={15}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Information Note */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-lg">ℹ️</span>
                Important Information
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                <li>
                  After creating the school, an account will be created for the
                  school admin
                </li>
                <li>
                  Login credentials will be sent to the registered email address
                </li>
                <li>
                  School admin can complete remaining details like operating
                  hours, bank details, license information, etc.
                </li>
                <li>
                  School admin will have full control to manage their school
                  operations
                </li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="default"
                size="large"
                onClick={() => router.push("/admin/school")}
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
                className="flex-1 !bg-gradient-to-r from-indigo-600 to-blue-600 border-0"
              >
                Create School
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddSchoolPage;
