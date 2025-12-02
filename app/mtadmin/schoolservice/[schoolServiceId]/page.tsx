"use client";

import { use } from "react";
import { Card, Button, Tag, Space, Descriptions, Spin, Alert } from "antd";
import {
  AntDesignEditOutlined,
  Fa6SolidArrowLeftLong,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSchoolServiceById } from "@/services/school-service.api";

const SchoolServiceDetailPage = ({
  params,
}: {
  params: Promise<{ schoolServiceId: string }>;
}) => {
  const router = useRouter();
  const { schoolServiceId } = use(params);
  const numericId = parseInt(schoolServiceId);

  // Fetch school service data
  const {
    data: serviceResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["schoolService", numericId],
    queryFn: async () => {
      if (!numericId || isNaN(numericId)) {
        throw new Error("Invalid school service ID");
      }
      return await getSchoolServiceById(numericId);
    },
    enabled: !isNaN(numericId),
  });

  const serviceData = serviceResponse?.data?.getSchoolServiceById;

  const formatCategory = (category: string) => {
    const categoryLabels: Record<string, string> = {
      NEW_LICENSE: "New License",
      I_HOLD_LICENSE: "I Hold License",
      TRANSPORT: "Transport",
      IDP: "IDP",
    };
    return categoryLabels[category] || category;
  };

  const getStatusColor = (status: string) => {
    return status == "ACTIVE" ? "green" : "red";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-8 py-6">
          <Alert
            message="Error Loading School Service"
            description={
              error instanceof Error
                ? error.message
                : "Failed to load school service details"
            }
            type="error"
            showIcon
          />
          <Button
            type="primary"
            onClick={() => router.push("/mtadmin/schoolservice")}
            className="mt-4"
          >
            Back to List
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={() => router.push("/mtadmin/schoolservice")}
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {serviceData.service?.serviceName}
                  </h1>
                  <Tag
                    color={getStatusColor(serviceData.status)}
                    className="!text-sm !px-3 !py-1"
                  >
                    {serviceData.status}
                  </Tag>
                </div>
                <p className="text-gray-600 mt-1 text-sm">
                  Service ID: {serviceData.schoolServiceId}
                </p>
              </div>
            </div>
            <Space size="middle">
              <Button
                type="primary"
                icon={<AntDesignEditOutlined className="text-lg" />}
                size="large"
                onClick={() =>
                  router.push(`/mtadmin/schoolservice/${numericId}/edit`)
                }
                className="!bg-blue-600"
              >
                Edit Service
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Service Information */}
        <Card
          title={
            <span className="text-lg font-semibold">Service Information</span>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered>
            <Descriptions.Item label="Service ID" span={2}>
              <span className="font-mono font-medium">
                {serviceData.schoolServiceId}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Service Name" span={2}>
              <span className="font-semibold text-gray-900">
                {serviceData.service?.serviceName}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              <Tag color="blue" className="!text-sm !px-3 !py-1">
                {formatCategory(serviceData.service?.category || "")}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              <span className="font-medium">
                {serviceData.service?.duration} days
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={getStatusColor(serviceData.status)}
                className="!text-sm !px-3 !py-1"
              >
                {serviceData.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>
        {/* Pricing Information */}
        <Card
          title={
            <span className="text-lg font-semibold">Pricing Information</span>
          }
          className="shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 font-medium text-sm">
                  License Price
                </span>
                <span className="text-green-600 text-xs">💳</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                ₹{serviceData.licensePrice.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-green-600 mt-1">
                For license-related services
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-medium text-sm">
                  Addon Price
                </span>
                <span className="text-blue-600 text-xs">➕</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                ₹{serviceData.addonPrice.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                For addon services
              </div>
            </div>
          </div>
        </Card>
        <div></div>

        {/* Service Description */}
        {serviceData.service?.description && (
          <Card
            title={
              <span className="text-lg font-semibold">Service Description</span>
            }
            className="shadow-sm"
          >
            <p className="text-gray-700 whitespace-pre-wrap">
              {serviceData.service.description}
            </p>
          </Card>
        )}
        <div></div>

        {/* Metadata */}
        <Card
          title={<span className="text-lg font-semibold">Metadata</span>}
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered>
            <Descriptions.Item label="Created At">
              {new Date(serviceData.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(serviceData.updatedAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default SchoolServiceDetailPage;
