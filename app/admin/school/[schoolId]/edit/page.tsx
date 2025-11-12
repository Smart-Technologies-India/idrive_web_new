"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Select, message, Upload } from "antd";
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
  status: string;
}

const EditSchoolPage = ({ params }: { params: { schoolId: string } }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoImage, setLogoImage] = useState<UploadFile[]>([]);

  // Load existing data
  useEffect(() => {
    const mockData = {
      name: "iDrive Driving School - Rohini",
      email: "rohini@idrive.com",
      phone: "+91 9876543210",
      alternatePhone: "+91 9876543211",
      address: "Plot No. 123, Sector 15, Rohini, New Delhi - 110085, India",
      registrationNumber: "DL/DS/2022/12345",
      gstNumber: "07AABCI1234F1Z5",
      establishedYear: "2022",
      website: "https://www.idrive-rohini.com",
      status: "active",
    };

    form.setFieldsValue(mockData);
  }, [form]);

  const handleSubmit = async (values: SchoolFormValues) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Updated values:", values);
      message.success("School information updated successfully!");
      router.push(`/admin/school/${params.schoolId}`);
    } catch {
      message.error("Failed to update school. Please try again.");
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
              onClick={() => router.push(`/admin/school/${params.schoolId}`)}
              size="large"
            >
              Back to School Details
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit School</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Update school information - ID: {params.schoolId}
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
              <Form.Item label="Upload School Logo" name="logo">
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
                  <Input size="large" placeholder="Enter school name" />
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
                    placeholder="Enter registration number"
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
                    placeholder="Enter GST number"
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
                      message: "Please enter valid year",
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
                  <TextArea rows={3} placeholder="Enter complete address" />
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
                  <Input size="large" placeholder="school@example.com" />
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
                  label="Alternate Phone Number"
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

                <Form.Item
                  label="School Status"
                  name="status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select
                    size="large"
                    placeholder="Select status"
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                      { label: "Suspended", value: "suspended" },
                    ]}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Information Note */}
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                Important Note
              </h4>
              <ul className="text-sm text-amber-800 space-y-1 ml-6 list-disc">
                <li>
                  Only basic information and contact details can be edited by
                  super admin
                </li>
                <li>
                  Other details like operating hours, bank details, and license
                  information are managed by school admin
                </li>
                <li>
                  Changing status to &quot;Inactive&quot; or
                  &quot;Suspended&quot; will restrict school admin access
                </li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="default"
                size="large"
                onClick={() => router.push(`/admin/school/${params.schoolId}`)}
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
                Update School
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditSchoolPage;
