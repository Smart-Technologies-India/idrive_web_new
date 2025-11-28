"use client";

import { useRouter, useParams } from "next/navigation";
import { Card, Descriptions, Tag, Table, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "@/services/booking.api";

const BookingDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const bookingId = parseInt(params.bookingId as string);

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking-details", bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
  });

  const booking = data?.data?.getBookingById;

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error || !booking) {
    return (
      <div className="p-8 text-center text-red-600">Booking not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Booking Details
        </h1>
        <div className="flex gap-4">
          <Button type="default" onClick={() => router.back()}>
            Back
          </Button>
          <Button 
            type="primary" 
            onClick={() => router.push(`/mtadmin/amendment?bookingId=${booking.bookingId}`)}
          >
            Go to Amendment
          </Button>
        </div>
      </div>
      <Card className="shadow-sm mb-6">
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Booking ID">
            {booking.bookingId}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                booking.status === "COMPLETED"
                  ? "green"
                  : booking.status === "CANCELLED"
                  ? "red"
                  : "blue"
              }
            >
              {booking.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Customer Name">
            {booking.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Mobile">
            {booking.customerMobile}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Email">
            {booking.customerEmail}
          </Descriptions.Item>
          <Descriptions.Item label="Course">
            {booking.courseName}
          </Descriptions.Item>
          <Descriptions.Item label="Car">{booking.carName}</Descriptions.Item>
          <Descriptions.Item label="Slot">{booking.slot}</Descriptions.Item>
          <Descriptions.Item label="Booking Date">
            {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            ₹{booking.totalAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            {booking.notes || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Info</h2>
        <Table
          columns={[
            {
              title: "Session #",
              dataIndex: "dayNumber",
              key: "dayNumber",
              width: 100,
            },
            {
              title: "Date",
              dataIndex: "sessionDate",
              key: "sessionDate",
              width: 130,
              render: (date) => new Date(date).toLocaleDateString("en-IN"),
            },
            { title: "Slot", dataIndex: "slot", key: "slot", width: 110 },
            { title: "Car", dataIndex: "carId", key: "carId", width: 100 },
            {
              title: "Driver",
              key: "driver",
              width: 160,
              render: (_, rec) => rec.driver?.name || "-",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              width: 120,
              render: (status) => (
                <Tag
                  color={
                    status === "COMPLETED"
                      ? "green"
                      : status === "CANCELLED"
                      ? "red"
                      : "blue"
                  }
                >
                  {status}
                </Tag>
              ),
            },
            {
              title: "Attended",
              dataIndex: "attended",
              key: "attended",
              width: 100,
              render: (att) => (att ? "Yes" : "No"),
            },
          ]}
          dataSource={booking.sessions || []}
          pagination={false}
          rowKey="id"
          size="small"
        />
      </Card>
      <div className="mt-4"></div>
      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Info</h2>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Name">
            {booking.customer?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {booking.customer?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Contact">
            {booking.customer?.contact1}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {booking.customer?.address}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Car Info</h2>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Car Name">
            {booking.car?.carName}
          </Descriptions.Item>
          <Descriptions.Item label="Model">
            {booking.car?.model}
          </Descriptions.Item>
          <Descriptions.Item label="Registration">
            {booking.car?.registrationNumber}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Course Info</h2>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Course Name">
            {booking.course?.courseName}
          </Descriptions.Item>
          <Descriptions.Item label="Price">
            ₹{booking.course?.price}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default BookingDetailsPage;
