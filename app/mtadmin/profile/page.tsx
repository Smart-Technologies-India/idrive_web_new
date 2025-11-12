"use client";

import { Card, Button, Descriptions, Tag, Avatar } from "antd";
import {
  AntDesignEditOutlined,
  IcBaselineRefresh,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const SchoolProfilePage = () => {
  const router = useRouter();

  // Mock school data
  const schoolData = {
    name: "iDrive Driving School",
    email: "contact@idrive.com",
    phone: "+91 9876543210",
    alternatePhone: "+91 9876543211",
    address: "Plot No. 123, Sector 15, Rohini, New Delhi - 110085, India",
    registrationNumber: "DL/DS/2022/12345",
    gstNumber: "07AABCI1234F1Z5",
    establishedYear: "2022",
    website: "https://www.idrive.com",
    
    // Operating Hours
    dayStartTime: "08:00 AM",
    dayEndTime: "08:00 PM",
    lunchStartTime: "01:00 PM",
    lunchEndTime: "02:00 PM",
    weeklyHoliday: "Sunday",
    
    // Additional Details
    totalInstructors: 12,
    totalVehicles: 15,
    totalStudents: 245,
    coursesOffered: 8,
    
    // Contact Person
    ownerName: "Mr. Rajesh Kumar",
    ownerPhone: "+91 9876543200",
    ownerEmail: "rajesh.kumar@idrive.com",
    
    // Bank Details
    bankName: "HDFC Bank",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0001234",
    branchName: "Rohini Sector 15",
    
    // Social Media
    facebook: "https://facebook.com/idriveschool",
    instagram: "https://instagram.com/idriveschool",
    twitter: "https://twitter.com/idriveschool",
    
    // License & Certifications
    rtoLicenseNumber: "DL-RTO-2022-456",
    rtoLicenseExpiry: "2027-12-31",
    insuranceProvider: "ICICI Lombard",
    insurancePolicyNumber: "POL/2024/123456",
    insuranceExpiry: "2025-12-31",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                School Profile
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                View and manage your driving school information
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="default"
                icon={<IcBaselineRefresh className="text-lg" />}
                size="large"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<AntDesignEditOutlined className="text-lg" />}
                size="large"
                onClick={() => router.push("/mtadmin/profile/edit")}
                className="!bg-blue-600"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* School Header Card */}
        <Card className="shadow-sm">
          <div className="flex items-center gap-6">
            <Avatar
              size={100}
              className="bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0"
              style={{ fontSize: "2.5rem" }}
            >
              {schoolData.name.charAt(0)}
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">
                {schoolData.name}
              </h2>
              <p className="text-gray-600 mt-2 text-base">
                {schoolData.address}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Tag color="green" className="!text-sm !px-3 !py-1">
                  ✓ Verified
                </Tag>
                <Tag color="blue" className="!text-sm !px-3 !py-1">
                  Est. {schoolData.establishedYear}
                </Tag>
                <Tag color="purple" className="!text-sm !px-3 !py-1">
                  RTO Licensed
                </Tag>
              </div>
            </div>
          </div>
        </Card>
        <div></div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {schoolData.totalInstructors}
              </div>
              <div className="text-gray-600 mt-2">Total Instructors</div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {schoolData.totalVehicles}
              </div>
              <div className="text-gray-600 mt-2">Total Vehicles</div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {schoolData.totalStudents}
              </div>
              <div className="text-gray-600 mt-2">Active Students</div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {schoolData.coursesOffered}
              </div>
              <div className="text-gray-600 mt-2">Courses Offered</div>
            </div>
          </Card>
        </div>
        <div></div>

        {/* Basic Information */}
        <Card
          title={
            <span className="text-lg font-semibold">Basic Information</span>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
            <Descriptions.Item label="School Name" span={3}>
              <span className="font-medium">{schoolData.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Registration Number">
              {schoolData.registrationNumber}
            </Descriptions.Item>
            <Descriptions.Item label="GST Number">
              {schoolData.gstNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Established Year">
              {schoolData.establishedYear}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <a href={`mailto:${schoolData.email}`} className="text-blue-600">
                {schoolData.email}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <a href={`tel:${schoolData.phone}`} className="text-blue-600">
                {schoolData.phone}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Alternate Phone">
              <a
                href={`tel:${schoolData.alternatePhone}`}
                className="text-blue-600"
              >
                {schoolData.alternatePhone}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Website" span={2}>
              <a
                href={schoolData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                {schoolData.website}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={3}>
              {schoolData.address}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Operating Hours */}
        <Card
          title={
            <span className="text-lg font-semibold">Operating Hours</span>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
            <Descriptions.Item label="Day Start Time">
              <Tag color="green" className="!text-base !px-4 !py-1">
                🕐 {schoolData.dayStartTime}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Day End Time">
              <Tag color="red" className="!text-base !px-4 !py-1">
                🕐 {schoolData.dayEndTime}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Weekly Holiday">
              <Tag color="purple" className="!text-base !px-4 !py-1">
                📅 {schoolData.weeklyHoliday}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lunch Start Time">
              <Tag color="orange" className="!text-base !px-4 !py-1">
                🍽️ {schoolData.lunchStartTime}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lunch End Time">
              <Tag color="orange" className="!text-base !px-4 !py-1">
                🍽️ {schoolData.lunchEndTime}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lunch Duration">
              <Tag color="blue" className="!text-base !px-4 !py-1">
                ⏱️ 1 Hour
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Owner/Contact Person Details */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Owner / Contact Person
            </span>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
            <Descriptions.Item label="Owner Name">
              <span className="font-medium">{schoolData.ownerName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Owner Phone">
              <a href={`tel:${schoolData.ownerPhone}`} className="text-blue-600">
                {schoolData.ownerPhone}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Owner Email">
              <a
                href={`mailto:${schoolData.ownerEmail}`}
                className="text-blue-600"
              >
                {schoolData.ownerEmail}
              </a>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Bank Details */}
        <Card
          title={<span className="text-lg font-semibold">Bank Details</span>}
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
            <Descriptions.Item label="Bank Name">
              {schoolData.bankName}
            </Descriptions.Item>
            <Descriptions.Item label="Branch Name">
              {schoolData.branchName}
            </Descriptions.Item>
            <Descriptions.Item label="Account Number">
              <span className="font-mono">{schoolData.accountNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="IFSC Code">
              <span className="font-mono">{schoolData.ifscCode}</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* License & Certifications */}
        <Card
          title={
            <span className="text-lg font-semibold">
              License & Certifications
            </span>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
            <Descriptions.Item label="RTO License Number">
              <span className="font-mono">{schoolData.rtoLicenseNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="RTO License Expiry">
              <Tag color="green" className="!text-sm !px-3 !py-1">
                Valid till {new Date(schoolData.rtoLicenseExpiry).toLocaleDateString("en-IN")}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Provider">
              {schoolData.insuranceProvider}
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Policy Number">
              <span className="font-mono">{schoolData.insurancePolicyNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Expiry">
              <Tag color="orange" className="!text-sm !px-3 !py-1">
                {new Date(schoolData.insuranceExpiry).toLocaleDateString("en-IN")}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Social Media */}
        <Card
          title={<span className="text-lg font-semibold">Social Media</span>}
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
            <Descriptions.Item label="Facebook">
              <a
                href={schoolData.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                {schoolData.facebook}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Instagram">
              <a
                href={schoolData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                {schoolData.instagram}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Twitter">
              <a
                href={schoolData.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                {schoolData.twitter}
              </a>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default SchoolProfilePage;
