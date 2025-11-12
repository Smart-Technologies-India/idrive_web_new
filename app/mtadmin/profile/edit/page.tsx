"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  TimePicker,
  Upload,
  message,
  Divider,
} from "antd";
import {
  IcBaselineArrowBack,
  AntDesignCheckOutlined,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import type { UploadFile } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

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
  dayStartTime: Dayjs;
  dayEndTime: Dayjs;
  lunchStartTime: Dayjs;
  lunchEndTime: Dayjs;
  weeklyHoliday: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  facebook: string;
  instagram: string;
  twitter: string;
  rtoLicenseNumber: string;
  rtoLicenseExpiry: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
}

const EditSchoolProfilePage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoImage, setLogoImage] = useState<UploadFile[]>([]);

  // Load existing data
  useEffect(() => {
    const mockData = {
      name: "iDrive Driving School",
      email: "contact@idrive.com",
      phone: "+91 9876543210",
      alternatePhone: "+91 9876543211",
      address: "Plot No. 123, Sector 15, Rohini, New Delhi - 110085, India",
      registrationNumber: "DL/DS/2022/12345",
      gstNumber: "07AABCI1234F1Z5",
      establishedYear: "2022",
      website: "https://www.idrive.com",
      dayStartTime: dayjs("08:00", "HH:mm"),
      dayEndTime: dayjs("20:00", "HH:mm"),
      lunchStartTime: dayjs("13:00", "HH:mm"),
      lunchEndTime: dayjs("14:00", "HH:mm"),
      weeklyHoliday: "Sunday",
      ownerName: "Mr. Rajesh Kumar",
      ownerPhone: "+91 9876543200",
      ownerEmail: "rajesh.kumar@idrive.com",
      bankName: "HDFC Bank",
      accountNumber: "50200012345678",
      ifscCode: "HDFC0001234",
      branchName: "Rohini Sector 15",
      facebook: "https://facebook.com/idriveschool",
      instagram: "https://instagram.com/idriveschool",
      twitter: "https://twitter.com/idriveschool",
      rtoLicenseNumber: "DL-RTO-2022-456",
      rtoLicenseExpiry: "2027-12-31",
      insuranceProvider: "ICICI Lombard",
      insurancePolicyNumber: "POL/2024/123456",
      insuranceExpiry: "2025-12-31",
    };

    form.setFieldsValue(mockData);
  }, [form]);

  const handleSubmit = async (values: SchoolFormValues) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Updated values:", values);
      message.success("School profile updated successfully!");
      router.push("/mtadmin/profile");
    } catch {
      message.error("Failed to update profile. Please try again.");
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
              onClick={() => router.push("/mtadmin/profile")}
              size="large"
            >
              Back to Profile
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit School Profile
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Update your driving school information
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <Card className="shadow-sm max-w-6xl mx-auto">
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

            <Divider />

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
                  ]}
                >
                  <Input size="large" placeholder="Enter GST number" />
                </Form.Item>

                <Form.Item
                  label="Established Year"
                  name="establishedYear"
                  rules={[
                    {
                      required: true,
                      message: "Please enter established year",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter year (e.g., 2022)" />
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
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <TextArea rows={3} placeholder="Enter complete address" />
                </Form.Item>
              </div>
            </div>

            <Divider />

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input size="large" placeholder="contact@school.com" />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                  ]}
                >
                  <Input size="large" placeholder="+91 9876543210" />
                </Form.Item>

                <Form.Item
                  label="Alternate Phone Number"
                  name="alternatePhone"
                >
                  <Input size="large" placeholder="+91 9876543211" />
                </Form.Item>
              </div>
            </div>

            <Divider />

            {/* Operating Hours */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Operating Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item
                  label="Day Start Time"
                  name="dayStartTime"
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}
                >
                  <TimePicker
                    size="large"
                    className="w-full"
                    format="HH:mm"
                    placeholder="Select start time"
                  />
                </Form.Item>

                <Form.Item
                  label="Day End Time"
                  name="dayEndTime"
                  rules={[
                    { required: true, message: "Please select end time" },
                  ]}
                >
                  <TimePicker
                    size="large"
                    className="w-full"
                    format="HH:mm"
                    placeholder="Select end time"
                  />
                </Form.Item>

                <Form.Item
                  label="Weekly Holiday"
                  name="weeklyHoliday"
                  rules={[
                    { required: true, message: "Please select weekly holiday" },
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Select day"
                    options={[
                      { label: "Monday", value: "Monday" },
                      { label: "Tuesday", value: "Tuesday" },
                      { label: "Wednesday", value: "Wednesday" },
                      { label: "Thursday", value: "Thursday" },
                      { label: "Friday", value: "Friday" },
                      { label: "Saturday", value: "Saturday" },
                      { label: "Sunday", value: "Sunday" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Lunch Start Time"
                  name="lunchStartTime"
                  rules={[
                    {
                      required: true,
                      message: "Please select lunch start time",
                    },
                  ]}
                >
                  <TimePicker
                    size="large"
                    className="w-full"
                    format="HH:mm"
                    placeholder="Select lunch start time"
                  />
                </Form.Item>

                <Form.Item
                  label="Lunch End Time"
                  name="lunchEndTime"
                  rules={[
                    {
                      required: true,
                      message: "Please select lunch end time",
                    },
                  ]}
                >
                  <TimePicker
                    size="large"
                    className="w-full"
                    format="HH:mm"
                    placeholder="Select lunch end time"
                  />
                </Form.Item>
              </div>
            </div>

            <Divider />

            {/* Owner/Contact Person Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Owner / Contact Person
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item
                  label="Owner Name"
                  name="ownerName"
                  rules={[
                    { required: true, message: "Please enter owner name" },
                  ]}
                >
                  <Input size="large" placeholder="Enter owner name" />
                </Form.Item>

                <Form.Item
                  label="Owner Phone"
                  name="ownerPhone"
                  rules={[
                    { required: true, message: "Please enter owner phone" },
                  ]}
                >
                  <Input size="large" placeholder="+91 9876543200" />
                </Form.Item>

                <Form.Item
                  label="Owner Email"
                  name="ownerEmail"
                  rules={[
                    { required: true, message: "Please enter owner email" },
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input size="large" placeholder="owner@school.com" />
                </Form.Item>
              </div>
            </div>

            <Divider />

            {/* Bank Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Bank Name"
                  name="bankName"
                  rules={[
                    { required: true, message: "Please enter bank name" },
                  ]}
                >
                  <Input size="large" placeholder="Enter bank name" />
                </Form.Item>

                <Form.Item
                  label="Branch Name"
                  name="branchName"
                  rules={[
                    { required: true, message: "Please enter branch name" },
                  ]}
                >
                  <Input size="large" placeholder="Enter branch name" />
                </Form.Item>

                <Form.Item
                  label="Account Number"
                  name="accountNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter account number",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter account number" />
                </Form.Item>

                <Form.Item
                  label="IFSC Code"
                  name="ifscCode"
                  rules={[
                    { required: true, message: "Please enter IFSC code" },
                  ]}
                >
                  <Input size="large" placeholder="Enter IFSC code" />
                </Form.Item>
              </div>
            </div>

            <Divider />

            {/* License & Certifications */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                License & Certifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="RTO License Number"
                  name="rtoLicenseNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter RTO license number",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter RTO license number" />
                </Form.Item>

                <Form.Item
                  label="RTO License Expiry Date"
                  name="rtoLicenseExpiry"
                  rules={[
                    {
                      required: true,
                      message: "Please enter expiry date",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    type="date"
                    placeholder="Select expiry date"
                  />
                </Form.Item>

                <Form.Item
                  label="Insurance Provider"
                  name="insuranceProvider"
                  rules={[
                    {
                      required: true,
                      message: "Please enter insurance provider",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Enter insurance provider name"
                  />
                </Form.Item>

                <Form.Item
                  label="Insurance Policy Number"
                  name="insurancePolicyNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please enter policy number",
                    },
                  ]}
                >
                  <Input size="large" placeholder="Enter policy number" />
                </Form.Item>

                <Form.Item
                  label="Insurance Expiry Date"
                  name="insuranceExpiry"
                  rules={[
                    {
                      required: true,
                      message: "Please enter expiry date",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    type="date"
                    placeholder="Select expiry date"
                  />
                </Form.Item>
              </div>
            </div>

            <Divider />

            {/* Social Media */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Social Media Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item label="Facebook" name="facebook">
                  <Input
                    size="large"
                    placeholder="https://facebook.com/yourpage"
                  />
                </Form.Item>

                <Form.Item label="Instagram" name="instagram">
                  <Input
                    size="large"
                    placeholder="https://instagram.com/yourpage"
                  />
                </Form.Item>

                <Form.Item label="Twitter" name="twitter">
                  <Input
                    size="large"
                    placeholder="https://twitter.com/yourpage"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="default"
                size="large"
                onClick={() => router.push("/mtadmin/profile")}
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
                Update Profile
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default EditSchoolProfilePage;
