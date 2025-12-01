"use client";

import { use } from "react";
import { Card, Button, Tag, Descriptions, Spin } from "antd";
import {
  AntDesignEditOutlined,
  Fa6SolidArrowLeftLong,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCarAdminById } from "@/services/car-admin.api";

const CarAdminDetailPage = ({
  params,
}: {
  params: Promise<{ carAdminId: string }>;
}) => {
  const router = useRouter();
  const { carAdminId: carAdminIdStr } = use(params);
  const carAdminId = parseInt(carAdminIdStr);

  // Fetch car admin from API
  const {
    data: carAdminResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["carAdmin", carAdminId],
    queryFn: () => getCarAdminById(carAdminId),
    enabled: carAdminId > 0,
  });

  const carAdminData = carAdminResponse?.data?.getCarAdminById;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "green",
      INACTIVE: "red",
      MAINTENANCE: "orange",
    };
    return colors[status] || "default";
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SEDAN: "blue",
      MUV: "purple",
      SUV: "green",
      HATCHBACK: "cyan",
    };
    return colors[category] || "default";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !carAdminData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card>
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {error ? "Failed to load car data" : "Car not found"}
            </p>
            <Button onClick={() => router.push("/admin/car-admin")}>
              Back to Car List
            </Button>
          </div>
        </Card>
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
                onClick={() => router.push("/admin/car-admin")}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {carAdminData.name}
                  <Tag
                    color={getStatusColor(carAdminData.status)}
                    className="!text-sm"
                  >
                    {carAdminData.status}
                  </Tag>
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {carAdminData.manufacturer} • {carAdminData.category}
                </p>
              </div>
            </div>
            <Button
              type="primary"
              icon={<AntDesignEditOutlined className="text-lg" />}
              size="large"
              onClick={() =>
                router.push(`/admin/car-admin/${carAdminIdStr}/edit`)
              }
              className="!bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              Edit Car
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Car Information */}
        <Card title="Vehicle Information" className="shadow-sm">
          <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered>
            <Descriptions.Item label="Car ID">
              #{carAdminData.id}
            </Descriptions.Item>
            <Descriptions.Item label="Car Name">
              {carAdminData.name}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(carAdminData.status)}>
                {carAdminData.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Manufacturer">
              {carAdminData.manufacturer}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              <Tag color={getCategoryColor(carAdminData.category)}>
                {carAdminData.category}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

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
              {new Date(carAdminData.createdAt).toLocaleString("en-IN", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(carAdminData.updatedAt).toLocaleString("en-IN", {
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

export default CarAdminDetailPage;
