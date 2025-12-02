"use client";

import {
  Card,
  Button,
  Tag,
  Table,
  Avatar,
  Descriptions,
  Spin,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  IcBaselineAccountCircle,
  RiMoneyRupeeCircleLine,
  MaterialSymbolsPersonRounded,
  AntDesignCheckOutlined,
  MaterialSymbolsFreeCancellation,
  Fa6RegularClock,
  IcBaselineCalendarMonth,
  MaterialSymbolsCall,
  MaterialSymbolsLocationOn,
  AntDesignEditOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserById, type User } from "@/services/user.api";
import { getAllBookings, type Booking } from "@/services/booking.api";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";

interface BookingData {
  key: string;
  bookingId: string;
  courseName: string;
  date: string;
  slot: string;
  carName: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  amount: number;
  totalSessions: number;
  completedSessions: number;
}

const CustomerProfilePage = () => {
  const router = useRouter();
  const userId: number = parseInt(getCookie("id")?.toString() || "0");

  // Fetch user data
  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId || userId == 0) throw new Error("User ID not found");
      return await getUserById(userId);
    },
    enabled: userId > 0,
  });

  const user: User | undefined = userResponse?.data?.getUserById;

  // Fetch bookings data
  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ["customerBookings", userId],
    queryFn: async () => {
      if (!userId || userId == 0) throw new Error("User ID not found");
      return await getAllBookings({ customerId: userId });
    },
    enabled: userId > 0,
  });

  const bookings: Booking[] = bookingsResponse?.data?.getAllBooking || [];

  // Process bookings data
  const bookingsData: BookingData[] = bookings.map((booking) => {
    const totalSessions = booking.sessions?.length || 0;
    const completedSessions =
      booking.sessions?.filter((s) => s.status == "COMPLETED").length || 0;

    return {
      key: booking.id.toString(),
      bookingId: booking.bookingId,
      courseName: booking.course?.courseName || booking.courseName,
      date: dayjs(booking.bookingDate).format("DD MMM, YYYY"),
      slot: booking.slot,
      carName: booking.car?.carName || booking.carName,
      status: booking.status,
      amount: booking.totalAmount,
      totalSessions,
      completedSessions,
    };
  });

  // Calculate statistics
  const totalBookings = bookingsData.length;
  const completedBookings = bookingsData.filter(
    (b) => b.status == "COMPLETED"
  ).length;
  const activeBookings = bookingsData.filter(
    (b) => b.status == "PENDING" || b.status == "CONFIRMED"
  ).length;
  const totalSpent = bookingsData.reduce((sum, b) => sum + b.amount, 0);

  const bookingColumns: ColumnsType<BookingData> = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      width: 140,
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Date & Slot",
      key: "dateSlot",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.date}</div>
          <div className="text-xs text-gray-500">{record.slot}</div>
        </div>
      ),
    },
    {
      title: "Car",
      dataIndex: "carName",
      key: "carName",
    },
    {
      title: "Sessions",
      key: "sessions",
      render: (_, record) => (
        <span>
          {record.completedSessions}/{record.totalSessions}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="font-semibold">₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config: Record<
          string,
          { color: string; icon: React.ReactElement; text: string }
        > = {
          COMPLETED: {
            color: "green",
            icon: <AntDesignCheckOutlined />,
            text: "Completed",
          },
          CANCELLED: {
            color: "red",
            icon: <MaterialSymbolsFreeCancellation />,
            text: "Cancelled",
          },
          PENDING: {
            color: "orange",
            icon: <Fa6RegularClock />,
            text: "Pending",
          },
          CONFIRMED: {
            color: "blue",
            icon: <IcBaselineCalendarMonth />,
            text: "Confirmed",
          },
          NO_SHOW: {
            color: "red",
            icon: <MaterialSymbolsFreeCancellation />,
            text: "No Show",
          },
        };
        const statusConfig = config[status] || config.PENDING;
        return (
          <Tag
            color={statusConfig.color}
            icon={statusConfig.icon}
            className="!text-sm !px-3 !py-1 !flex !items-center !gap-1 !w-fit"
          >
            {statusConfig.text}
          </Tag>
        );
      },
    },
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Empty description="User not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size={80}
                icon={<MaterialSymbolsPersonRounded />}
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-600 mt-1">{user.email || "No email"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Tag
                    color={user.status == "ACTIVE" ? "green" : "red"}
                    className="!text-sm !px-3 !py-1"
                  >
                    {user.status}
                  </Tag>
                  <span className="text-sm text-gray-600">ID: {user.id}</span>
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<AntDesignEditOutlined className="text-lg" />}
              size="large"
              onClick={() => router.push("/customer/profile/edit")}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <IcBaselineCalendarMonth className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBookings}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <AntDesignCheckOutlined className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedBookings}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Fa6RegularClock className="text-orange-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeBookings}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <RiMoneyRupeeCircleLine className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Personal Information */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <IcBaselineAccountCircle className="text-blue-600 text-xl" />
              <span className="text-lg font-semibold">
                Personal Information
              </span>
            </div>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="middle">
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <MaterialSymbolsPersonRounded className="text-gray-500" />
                  Full Name
                </span>
              }
            >
              <span className="font-medium">{user.name}</span>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <MaterialSymbolsCall className="text-gray-500" />
                  Primary Contact
                </span>
              }
            >
              {user.contact1}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <MaterialSymbolsCall className="text-gray-500" />
                  Secondary Contact
                </span>
              }
            >
              {user.contact2 || "-"}
            </Descriptions.Item>
            <Descriptions.Item
              label={<span className="flex items-center gap-2">📧 Email</span>}
              span={2}
            >
              {user.email || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {user.dob ? dayjs(user.dob).format("DD MMM, YYYY") : "-"}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <MaterialSymbolsLocationOn className="text-gray-500" />
                  Address
                </span>
              }
              span={3}
            >
              {user.address || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color="blue">{user.role}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={user.status == "ACTIVE" ? "green" : "red"}>
                {user.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Member Since">
              {dayjs(user.createdAt).format("DD MMM, YYYY")}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>
        {/* Booking History */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Booking History ({bookingsData.length})
            </span>
          }
          className="shadow-sm"
          loading={bookingsLoading}
        >
          {bookingsData.length > 0 ? (
            <Table
              columns={bookingColumns}
              dataSource={bookingsData}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} bookings`,
              }}
              scroll={{ x: 1000 }}
            />
          ) : (
            <Empty description="No bookings found" />
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
