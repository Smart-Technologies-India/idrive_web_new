"use client";

import { useEffect, useState, use } from "react";
import { Card, Button, Tag, Avatar, Descriptions, Statistic, Row, Col, Spin } from "antd";
import {
  IcBaselineArrowBack,
  AntDesignEditOutlined,
  IcBaselineRefresh,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getSchoolById, School } from "@/services/school.api";

const SchoolDetailPage = ({ params }: { params: Promise<{ schoolId: string }> }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<School | null>(null);

  const fetchSchoolData = async () => {
    setLoading(true);
    try {
      const response = await getSchoolById(parseInt(resolvedParams.schoolId));
      
      if (response.status && response.data.getSchoolById) {
        setSchoolData(response.data.getSchoolById);
      }
    } catch (error) {
      console.error("Error fetching school:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.schoolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">School Not Found</h2>
          <Button onClick={() => router.push("/admin/school")}>Back to Schools</Button>
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
                    color={statusConfig.color}
                    className="!text-sm !px-3 !py-1"
                  >
                    {statusConfig.text}
                  </Tag>
                  <span className="text-sm text-gray-600">
                    ID: SCH-{String(schoolData.id).padStart(3, "0")}
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
                  router.push(`/admin/school/${resolvedParams.schoolId}/edit`)
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
                value={245}
                prefix={<span className="text-2xl">👥</span>}
                valueStyle={{ color: "#722ed1", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Instructors"
                value={12}
                prefix={<span className="text-2xl">🚘</span>}
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Vehicles"
                value={15}
                prefix={<span className="text-2xl">🚗</span>}
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Revenue"
                value={456000}
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
              {schoolData.email ? (
                <a href={`mailto:${schoolData.email}`} className="text-blue-600">
                  {schoolData.email}
                </a>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <a href={`tel:${schoolData.phone}`} className="text-blue-600">
                {schoolData.phone}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Alternate Phone">
              {schoolData.alternatePhone ? (
                <a
                  href={`tel:${schoolData.alternatePhone}`}
                  className="text-blue-600"
                >
                  {schoolData.alternatePhone}
                </a>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
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
                color={statusConfig.color}
                className="!text-sm !px-3 !py-1"
              >
                {statusConfig.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Joined Date">
              {new Date(schoolData.createdAt).toLocaleDateString("en-IN", {
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
              {schoolData.ownerName ? (
                <span className="font-medium">{schoolData.ownerName}</span>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Owner Phone">
              {schoolData.ownerPhone ? (
                <a href={`tel:${schoolData.ownerPhone}`} className="text-blue-600">
                  {schoolData.ownerPhone}
                </a>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Owner Email">
              {schoolData.ownerEmail ? (
                <a
                  href={`mailto:${schoolData.ownerEmail}`}
                  className="text-blue-600"
                >
                  {schoolData.ownerEmail}
                </a>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
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
              {schoolData.bankName || <span className="text-gray-400 italic">N/A</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Branch Name">
              {schoolData.branchName || <span className="text-gray-400 italic">N/A</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Account Number">
              {schoolData.accountNumber ? (
                <span className="font-mono">{schoolData.accountNumber}</span>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="IFSC Code">
              {schoolData.ifscCode ? (
                <span className="font-mono">{schoolData.ifscCode}</span>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
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
              {schoolData.rtoLicenseNumber ? (
                <span className="font-mono">{schoolData.rtoLicenseNumber}</span>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="RTO License Expiry">
              {schoolData.rtoLicenseExpiry ? (
                <Tag color="green" className="!text-sm !px-3 !py-1">
                  Valid till{" "}
                  {new Date(schoolData.rtoLicenseExpiry).toLocaleDateString(
                    "en-IN"
                  )}
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
                  {new Date(schoolData.insuranceExpiry).toLocaleDateString(
                    "en-IN"
                  )}
                </Tag>
              ) : (
                <span className="text-gray-400 italic">N/A</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default SchoolDetailPage;
