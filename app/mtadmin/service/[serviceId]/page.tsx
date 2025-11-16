"use client";

import { use } from "react";
import {
  Card,
  Button,
  Tag,
  Descriptions,
  Spin,
  Statistic,
  Row,
  Col,
  Progress,
} from "antd";
import {
  AntDesignEditOutlined,
  Fa6SolidArrowLeftLong,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const ServiceDetailPage = ({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) => {
  const router = useRouter();
  const { serviceId: serviceIdStr } = use(params);
  const serviceId = parseInt(serviceIdStr);

  // Mock data - Replace with actual API call
  const serviceData = {
    id: serviceId,
    serviceId: "SRV-001",
    serviceName: "Two Wheeler License",
    serviceType: "LICENSE",
    category: "Two Wheeler",
    price: 5000,
    duration: 365,
    status: "ACTIVE",
    activeUsers: 150,
    totalRevenue: 750000,
    description: "Complete two wheeler driving license training program including theoretical and practical sessions",
    features: [
      "20 hours of practical training",
      "10 sessions of theory classes",
      "Road safety training",
      "RTO test preparation",
      "License application assistance",
    ],
    requirements: "Minimum age 16 years, Valid Aadhar card, Medical fitness certificate",
    termsAndConditions: "Valid for 365 days from purchase date. Non-transferable. Refund policy as per terms.",
    includedServices: ["Theory Classes", "Practical Training", "Mock Test", "RTO Assistance"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-11-10T14:20:00Z",
  };

  const isLoading = false;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "green",
      INACTIVE: "red",
      UPCOMING: "blue",
      DISCONTINUED: "default",
    };
    return colors[status] || "default";
  };

  const getTypeColor = (type: string) => {
    return type === "LICENSE" ? "purple" : "cyan";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card>
          <p className="text-center text-gray-500">Service not found</p>
        </Card>
      </div>
    );
  }

  const utilizationPercentage = (serviceData.activeUsers / 300) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<Fa6SolidArrowLeftLong className="text-lg" />}
                size="large"
                onClick={() => router.push("/mtadmin/service")}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {serviceData.serviceName}
                  <Tag
                    color={getStatusColor(serviceData.status)}
                    className="!text-sm"
                  >
                    {serviceData.status}
                  </Tag>
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {serviceData.serviceId} •{" "}
                  <Tag
                    color={getTypeColor(serviceData.serviceType)}
                    className="!text-xs !px-2 !py-0"
                  >
                    {serviceData.serviceType}
                  </Tag>
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<AntDesignEditOutlined className="text-lg" />}
              size="large"
              onClick={() => router.push(`/mtadmin/service/${serviceIdStr}/edit`)}
              className="!bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Edit Service
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Revenue"
                value={serviceData.totalRevenue}
                prefix="₹"
                valueStyle={{ color: "#3f8600", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Active Users"
                value={serviceData.activeUsers}
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Service Price"
                value={serviceData.price}
                prefix="₹"
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Utilization"
                value={Math.round(utilizationPercentage)}
                suffix="%"
                valueStyle={{ fontSize: "24px" }}
              />
              <Progress
                percent={Math.round(utilizationPercentage)}
                size="small"
                className="mt-2"
              />
            </Card>
          </Col>
        </Row>

        {/* Service Information */}
        <Card title="Service Information" className="shadow-sm">
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered>
            <Descriptions.Item label="Service ID">
              {serviceData.serviceId}
            </Descriptions.Item>
            <Descriptions.Item label="Service Name">
              {serviceData.serviceName}
            </Descriptions.Item>
            <Descriptions.Item label="Service Type">
              <Tag color={getTypeColor(serviceData.serviceType)}>
                {serviceData.serviceType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {serviceData.category}
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {serviceData.duration} days
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              ₹{serviceData.price.toLocaleString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(serviceData.status)}>
                {serviceData.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Active Users">
              {serviceData.activeUsers}
            </Descriptions.Item>
            <Descriptions.Item label="Total Revenue">
              ₹{serviceData.totalRevenue.toLocaleString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {serviceData.description}
            </Descriptions.Item>
            {serviceData.requirements && (
              <Descriptions.Item label="Requirements" span={3}>
                {serviceData.requirements}
              </Descriptions.Item>
            )}
            {serviceData.termsAndConditions && (
              <Descriptions.Item label="Terms & Conditions" span={3}>
                {serviceData.termsAndConditions}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
        <div></div>

        {/* Features and Included Services */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span>Key Features</span>
                </div>
              }
              className="shadow-sm h-full"
            >
              <ul className="space-y-3">
                {serviceData.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <span className="text-green-600 text-lg mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-xl">📦</span>
                  <span>Included Services</span>
                </div>
              }
              className="shadow-sm h-full"
            >
              <div className="flex flex-wrap gap-2">
                {serviceData.includedServices.map((service, index) => (
                  <Tag
                    key={index}
                    color="blue"
                    className="!text-sm !px-3 !py-2"
                  >
                    {service}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Metadata */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span>Additional Information</span>
            </div>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="Created At">
              {new Date(serviceData.createdAt).toLocaleString("en-IN", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(serviceData.updatedAt).toLocaleString("en-IN", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
