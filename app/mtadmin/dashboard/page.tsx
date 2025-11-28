"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Button, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignCheckOutlined,
  Fa6RegularClock,
  RiMoneyRupeeCircleLine,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsCalendarClockRounded,
  CarbonWarningSquare,
  IcBaselineRefresh,
  AntDesignEyeOutlined,
  Fa6RegularHourglassHalf,
  MaterialSymbolsFreeCancellation,
  Fa6RegularPenToSquare,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getSchoolById, getSchoolDashboardStats } from "@/services/school.api";
import { getAllBookings } from "@/services/booking.api";
import { getCookie } from "cookies-next";
import { useQuery } from "@tanstack/react-query";

interface BookingData {
  key: string;
  bookingId: string;
  customerName: string;
  mobile: string;
  course: string;
  date: string;
  slot: string;
  carName: string;
  status: "pending" | "completed" | "cancelled";
  amount: number;
}

interface AlertData {
  key: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Fetch dashboard statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["schoolDashboardStats", schoolId],
    queryFn: async () => {
      const response = await getSchoolDashboardStats(schoolId);
      return response.data?.getSchoolDashboardStats;
    },
    enabled: schoolId > 0,
  });

  // Fetch recent bookings
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["recentBookings", schoolId],
    queryFn: async () => {
      const response = await getAllBookings({
        schoolId,
      });
      return response.data?.getAllBooking?.slice(0, 5) || [];
    },
    enabled: schoolId > 0,
  });

  const handleRefresh = () => {
    void refetchStats();
    void refetchBookings();
  };

  // Check profile completion on mount
  useEffect(() => {
    const checkProfileCompletion = async () => {
      setCheckingProfile(true);
      try {
        if (!schoolId || schoolId === 0) {
          setCheckingProfile(false);
          return;
        }

        const response = await getSchoolById(schoolId);

        if (response.status && response.data.getSchoolById) {
          const school = response.data.getSchoolById;

          // Check required fields for profile completion
          const requiredFields: Array<{
            key: keyof typeof school;
            label: string;
          }> = [
            { key: "dayStartTime", label: "Day Start Time" },
            { key: "dayEndTime", label: "Day End Time" },
            { key: "ownerName", label: "Owner Name" },
            { key: "bankName", label: "Bank Name" },
            { key: "accountNumber", label: "Account Number" },
            { key: "ifscCode", label: "IFSC Code" },
            { key: "rtoLicenseNumber", label: "RTO License Number" },
          ];

          const missing = requiredFields.filter((field) => !school[field.key]);

          if (missing.length > 0) {
            setProfileIncomplete(true);
            setMissingFields(missing.map((f) => f.label));
          } else {
            setProfileIncomplete(false);
            setMissingFields([]);
          }
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = statsData || {
    todayBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    activeCustomers: 0,
  };

  const recentBookings: BookingData[] =
    bookingsData?.map((booking) => ({
      key: booking.id.toString(),
      bookingId: booking.bookingId,
      customerName: booking.customerName || "N/A",
      mobile: booking.customerMobile,
      course: booking.courseName,
      date: new Date(booking.bookingDate).toLocaleDateString(),
      slot: booking.slot,
      carName: booking.carName,
      status: booking.status.toLowerCase() as
        | "pending"
        | "completed"
        | "cancelled",
      amount: booking.totalAmount,
    })) || [];

  // Mock data for alerts
  const alerts: AlertData[] = [
    {
      key: "1",
      type: "warning",
      message: "Car DL01AB1234 needs maintenance - scheduled for tomorrow",
      timestamp: "2 hours ago",
    },
    {
      key: "2",
      type: "error",
      message: "Customer Rajesh Kumar (9876543210) requested date change",
      timestamp: "3 hours ago",
    },
    {
      key: "3",
      type: "info",
      message: "5 new bookings received today",
      timestamp: "5 hours ago",
    },
  ];

  const columns: ColumnsType<BookingData> = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      width: 140,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.mobile}</div>
        </div>
      ),
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Date & Slot",
      key: "dateSlot",
      render: (_, record) => (
        <div>
          <div>{record.date}</div>
          <div className="text-xs text-gray-500">{record.slot}</div>
        </div>
      ),
    },
    {
      title: "Car",
      dataIndex: "carName",
      key: "carName",
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (status: "pending" | "completed" | "cancelled") => {
        const config = {
          pending: {
            color: "orange",
            icon: <Fa6RegularClock />,
            text: "Pending",
          },
          completed: {
            color: "green",
            icon: <AntDesignCheckOutlined />,
            text: "Completed",
          },
          cancelled: {
            color: "red",
            icon: <MaterialSymbolsFreeCancellation />,
            text: "Cancelled",
          },
        };
        const { color, icon, text } = config[status];
        return (
          <Tag
            color={color}
            icon={icon}
            className="!text-sm !px-3 !py-1 !flex !items-center !gap-1"
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Button
          type="link"
          size="small"
          icon={<AntDesignEyeOutlined />}
          onClick={() => {
            // Navigate to booking details
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Welcome back! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <Button
            type="primary"
            icon={<IcBaselineRefresh className="text-lg" />}
            size="large"
            onClick={handleRefresh}
            loading={statsLoading || bookingsLoading}
            className="!bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-md"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Profile Completion Alert */}
        {!checkingProfile && profileIncomplete && (
          <Alert
            message="Complete Your School Profile"
            description={
              <div>
                <p className="mb-2">
                  Your school profile is incomplete. Please complete the
                  following required information to access all features:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {missingFields.map((field, index) => (
                    <li key={index} className="text-sm">
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            }
            type="warning"
            showIcon
            action={
              <Button
                size="small"
                type="primary"
                onClick={() => router.push("/mtadmin/profile/edit")}
                className="!bg-orange-500 !border-orange-500"
              >
                Complete Profile
              </Button>
            }
            closable={false}
            className="mb-6"
          />
        )}
        <div></div>

        {/* Statistics Cards */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-sm hover:shadow-md transition-all"
              loading={statsLoading}
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">
                    Today&apos;s Bookings
                  </span>
                }
                value={stats?.todayBookings || 0}
                prefix={
                  <MaterialSymbolsCalendarClockRounded className="text-blue-600 text-3xl" />
                }
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-sm hover:shadow-md transition-all"
              loading={statsLoading}
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">
                    Pending Bookings
                  </span>
                }
                value={stats?.pendingBookings || 0}
                prefix={
                  <Fa6RegularHourglassHalf className="text-orange-600 text-3xl" />
                }
                valueStyle={{
                  color: "#fa8c16",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-sm hover:shadow-md transition-all"
              loading={statsLoading}
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">Total Revenue</span>
                }
                value={stats?.totalRevenue || 0}
                prefix={
                  <RiMoneyRupeeCircleLine className="text-green-600 text-3xl" />
                }
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="shadow-sm hover:shadow-md transition-all"
              loading={statsLoading}
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">
                    Active Customers
                  </span>
                }
                value={stats?.activeCustomers || 0}
                prefix={
                  <MaterialSymbolsPersonRounded className="text-purple-600 text-3xl" />
                }
                valueStyle={{
                  color: "#722ed1",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
        </Row>

        <div></div>

        {/* Recent Bookings Table */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="font-semibold">Recent Bookings</span>
              <Button
                type="link"
                onClick={() => router.push("/mtadmin/bookinglist")}
                className="text-blue-600"
              >
                View All Bookings →
              </Button>
            </div>
          }
          className="shadow-sm"
        >
          <Table
            columns={columns}
            dataSource={recentBookings}
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
            loading={bookingsLoading}
            rowKey="key"
          />
        </Card>
        <div></div>

        {/* Quick Actions */}
        <Card
          title={<span className="font-semibold">Quick Actions</span>}
          className="shadow-sm"
        >
          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <div
                className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                onClick={() => router.push("/mtadmin/booking")}
              >
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AntDesignCheckOutlined className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Create New Booking
                </h3>
                <p className="text-gray-500 text-sm">
                  Add a new customer booking
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:shadow-md transition-all bg-white"
                onClick={() => router.push("/mtadmin/scheduler")}
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MaterialSymbolsCalendarClockRounded className="text-3xl text-purple-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  View Schedule
                </h3>
                <p className="text-gray-500 text-sm">
                  Check car availability and schedules
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 hover:shadow-md transition-all bg-white"
                onClick={() => router.push("/mtadmin/amendment")}
              >
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Fa6RegularPenToSquare className="text-3xl text-orange-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Manage Amendments
                </h3>
                <p className="text-gray-500 text-sm">
                  Cancel or modify existing bookings
                </p>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
