"use client";

import { Card, Button, Tag, Avatar, Descriptions, Statistic, Row, Col } from "antd";
import {
  IcBaselineArrowBack,
  AntDesignEditOutlined,
  IcBaselineRefresh,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const SchoolDetailPage = ({ params }: { params: { schoolId: string } }) => {
  const router = useRouter();

  // Mock school data
  const schoolData = {
    schoolId: params.schoolId,
    name: "iDrive Driving School - Rohini",
    email: "rohini@idrive.com",
    phone: "+91 9876543210",
    alternatePhone: "+91 9876543211",
    address: "Plot No. 123, Sector 15, Rohini, New Delhi - 110085, India",
    registrationNumber: "DL/DS/2022/12345",
    gstNumber: "07AABCI1234F1Z5",
    establishedYear: "2022",
    website: "https://www.idrive-rohini.com",
    
    // Operating Hours
    dayStartTime: "08:00 AM",
    dayEndTime: "08:00 PM",
    lunchStartTime: "01:00 PM",
    lunchEndTime: "02:00 PM",
    weeklyHoliday: "Sunday",
    
    // Statistics
    totalInstructors: 12,
    totalVehicles: 15,
    totalStudents: 245,
    coursesOffered: 8,
    totalRevenue: 456000,
    
    // Contact Person
    ownerName: "Mr. Rajesh Kumar",
    ownerPhone: "+91 9876543200",
    ownerEmail: "rajesh.kumar@idrive.com",
    
    // Bank Details
    bankName: "HDFC Bank",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0001234",
    branchName: "Rohini Sector 15",
    
    // License & Certifications
    rtoLicenseNumber: "DL-RTO-2022-456",
    rtoLicenseExpiry: "2027-12-31",
    insuranceProvider: "ICICI Lombard",
    insurancePolicyNumber: "POL/2024/123456",
    insuranceExpiry: "2025-12-31",
    
    status: "active",
    joinedDate: "2022-01-15",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push("/admin/school")}
              size="large"
            >
              Back to Schools
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size={80}
                className="bg-gradient-to-r from-indigo-600 to-blue-600"
                style={{ fontSize: "2rem" }}
              >
                {schoolData.name.charAt(0)}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {schoolData.name}
                </h1>
                <p className="text-gray-600 mt-1">{schoolData.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Tag
                    color={schoolData.status === "active" ? "green" : "red"}
                    className="!text-sm !px-3 !py-1"
                  >
                    {schoolData.status === "active" ? "Active" : "Inactive"}
                  </Tag>
                  <span className="text-sm text-gray-600">
                    ID: {schoolData.schoolId}
                  </span>
                </div>
              </div>
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
                icon={<AntDesignEditOutlined />}
                size="large"
                onClick={() =>
                  router.push(`/admin/school/${params.schoolId}/edit`)
                }
                className="!bg-blue-600"
              >
                Edit School
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Students"
                value={schoolData.totalStudents}
                prefix={<span className="text-2xl">👥</span>}
                valueStyle={{ color: "#722ed1", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Instructors"
                value={schoolData.totalInstructors}
                prefix={<span className="text-2xl">🚘</span>}
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Vehicles"
                value={schoolData.totalVehicles}
                prefix={<span className="text-2xl">🚗</span>}
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Revenue"
                value={schoolData.totalRevenue}
                prefix="₹"
                valueStyle={{ color: "#fa8c16", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>
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
            <Descriptions.Item label="Status">
              <Tag
                color={schoolData.status === "active" ? "green" : "red"}
                className="!text-sm !px-3 !py-1"
              >
                {schoolData.status === "active" ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Joined Date">
              {new Date(schoolData.joinedDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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
                Valid till{" "}
                {new Date(schoolData.rtoLicenseExpiry).toLocaleDateString(
                  "en-IN"
                )}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Provider">
              {schoolData.insuranceProvider}
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Policy Number">
              <span className="font-mono">
                {schoolData.insurancePolicyNumber}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Expiry">
              <Tag color="orange" className="!text-sm !px-3 !py-1">
                {new Date(schoolData.insuranceExpiry).toLocaleDateString(
                  "en-IN"
                )}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default SchoolDetailPage;
