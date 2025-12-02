"use client";

import { useEffect, useState } from "react";
import { Card, Button, Tag, Avatar, Descriptions, Spin, Alert } from "antd";
import {
  AntDesignEditOutlined,
  IcBaselineRefresh,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getSchoolById, School } from "@/services/school.api";
import { getCookie } from "cookies-next";

const SchoolProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);

  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  const fetchSchoolData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!schoolId || schoolId == 0) {
        setError("School information not found. Please contact administrator.");
        return;
      }

      const response = await getSchoolById(schoolId);
      
      if (response.status && response.data.getSchoolById) {
        setSchoolData(response.data.getSchoolById);
      } else {
        setError(response.message || "Failed to load school profile");
      }
    } catch (error) {
      console.error("Error fetching school:", error);
      setError("Failed to load school profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={fetchSchoolData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Please complete your school profile to continue.</p>
          <Button
            type="primary"
            onClick={() => router.push("/mtadmin/profile/edit")}
          >
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: "green", text: "Active" },
      INACTIVE: { color: "red", text: "Inactive" },
      SUSPENDED: { color: "orange", text: "Suspended" },
    };
    return configs[status as keyof typeof configs] || configs.ACTIVE;
  };

  const statusConfig = getStatusConfig(schoolData.status);

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
                <Tag
                  color={statusConfig.color}
                  className="!text-sm !px-3 !py-1"
                >
                  {statusConfig.text}
                </Tag>
                <Tag color="blue" className="!text-sm !px-3 !py-1">
                  Est. {schoolData.establishedYear}
                </Tag>
                <span className="text-sm text-gray-600">
                  ID: SCH-{String(schoolData.id).padStart(3, "0")}
                </span>
              </div>
            </div>
          </div>
        </Card>
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
              {schoolData.dayStartTime ? (
                <Tag color="green" className="!text-base !px-4 !py-1">
                  🕐 {schoolData.dayStartTime}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Day End Time">
              {schoolData.dayEndTime ? (
                <Tag color="red" className="!text-base !px-4 !py-1">
                  🕐 {schoolData.dayEndTime}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Weekly Holiday">
              {schoolData.weeklyHoliday ? (
                <Tag color="purple" className="!text-base !px-4 !py-1">
                  📅 {schoolData.weeklyHoliday}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Lunch Start Time">
              {schoolData.lunchStartTime ? (
                <Tag color="orange" className="!text-base !px-4 !py-1">
                  🍽️ {schoolData.lunchStartTime}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Lunch End Time">
              {schoolData.lunchEndTime ? (
                <Tag color="orange" className="!text-base !px-4 !py-1">
                  🍽️ {schoolData.lunchEndTime}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">Not set</span>
              )}
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
              {schoolData.rtoLicenseExpiry ? (
                <Tag color="green" className="!text-sm !px-3 !py-1">
                  Valid till{" "}
                  {new Date(schoolData.rtoLicenseExpiry).toLocaleDateString("en-IN")}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Provider">
              {schoolData.insuranceProvider || <span className="text-gray-400 italic">N/A</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Policy Number">
              {schoolData.insurancePolicyNumber ? (
                <span className="font-mono">
                  {schoolData.insurancePolicyNumber}
                </span>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Expiry">
              {schoolData.insuranceExpiry ? (
                <Tag color="orange" className="!text-sm !px-3 !py-1">
                  {new Date(schoolData.insuranceExpiry).toLocaleDateString("en-IN")}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
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
