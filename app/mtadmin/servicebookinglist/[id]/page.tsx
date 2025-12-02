"use client";

import { useState } from "react";
import { Card, Descriptions, Tag, Button, Spin, Space } from "antd";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBookingServiceById } from "@/services/service.booking.api";
import type { BookingService } from "@/services/service.booking.api";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface ServiceBookingViewPageProps {
  params: Promise<{ id: string }>;
}

const ServiceBookingViewPage = ({ params }: ServiceBookingViewPageProps) => {
  const router = useRouter();
  const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);

  // Unwrap params
  useState(() => {
    params.then((p) => setBookingServiceId(parseInt(p.id)));
  });

  // Fetch booking service details
  const { data: bookingServiceResponse, isLoading } = useQuery({
    queryKey: ["service-booking-detail", bookingServiceId],
    queryFn: () => getBookingServiceById(bookingServiceId!),
    enabled: bookingServiceId !== null && bookingServiceId > 0,
  });

  const bookingService: BookingService | undefined =
    bookingServiceResponse?.data?.getBookingServiceById;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading service booking details..." />
      </div>
    );
  }

  if (!bookingService) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl text-gray-600">Service booking not found</h2>
          <Button
            type="primary"
            onClick={() => router.push("/mtadmin/servicebookinglist")}
            className="mt-4"
          >
            Back to List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/mtadmin/servicebookinglist")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Service Booking Details
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {bookingService.confirmationNumber || "N/A"}
              </p>
            </div>
          </div>
          <Tag
            color={bookingService.serviceType == "LICENSE" ? "green" : "blue"}
            className="text-base px-4 py-1"
          >
            {bookingService.serviceType}
          </Tag>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Service Information */}
        <Card title="Service Information" className="shadow-sm">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
            <Descriptions.Item label="Service Name" span={2}>
              <span className="font-semibold">{bookingService.serviceName}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Service Type">
              <Tag
                color={bookingService.serviceType == "LICENSE" ? "green" : "blue"}
              >
                {bookingService.serviceType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Price" span={1}>
              <span className="text-lg font-bold text-green-600">
                ₹{bookingService.price.toFixed(2)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Confirmation Number" span={2}>
              <span className="font-medium text-blue-600">
                {bookingService.confirmationNumber || "N/A"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {bookingService.description || "No description available"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Customer Information */}
        <Card title="Customer Information" className="shadow-sm">
          {bookingService.user ? (
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
              <Descriptions.Item label="Customer Name">
                <span className="font-semibold">{bookingService.user.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {bookingService.user.contact1}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {bookingService.user.email || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <p className="text-gray-500">Customer information not available</p>
          )}
        </Card>

        {/* Related Booking Information */}
        {bookingService.booking && (
          <Card title="Related Booking Information" className="shadow-sm">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
              <Descriptions.Item label="Booking ID">
                <span className="font-medium text-blue-600">
                  {bookingService.booking.bookingId}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Name">
                {bookingService.booking.customerName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Mobile">
                {bookingService.booking.customerMobile}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Email">
                {bookingService.booking.customerEmail || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* School Service Details */}
        {bookingService.schoolService && (
          <Card title="School Service Details" className="shadow-sm">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
              <Descriptions.Item label="School Service ID">
                {bookingService.schoolService.schoolServiceId}
              </Descriptions.Item>
              <Descriptions.Item label="Service Category">
                <Tag color="purple">
                  {bookingService.schoolService.service?.category || "N/A"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Service Name">
                {bookingService.schoolService.service?.serviceName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Service Description">
                {bookingService.schoolService.service?.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="License Price">
                <span className="font-semibold text-green-600">
                  ₹{bookingService.schoolService.licensePrice.toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Add-on Price">
                <span className="font-semibold text-blue-600">
                  ₹{bookingService.schoolService.addonPrice.toFixed(2)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Timestamps */}
        <Card title="Booking Timeline" className="shadow-sm">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Booked On">
              {new Date(bookingService.createdAt).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(bookingService.updatedAt).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Action Buttons */}
        <Card className="shadow-sm">
          <Space>
            <Button
              type="primary"
              onClick={() => router.push("/mtadmin/servicebookinglist")}
            >
              Back to Service Booking List
            </Button>
            {bookingService.booking && (
              <Button
                onClick={() =>
                  router.push(`/mtadmin/bookinglist/${bookingService.booking!.id}`)
                }
              >
                View Related Booking
              </Button>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default ServiceBookingViewPage;
