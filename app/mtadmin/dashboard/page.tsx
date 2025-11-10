"use client";

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

  // Mock data for statistics
  const stats = {
    todayBookings: 24,
    pendingBookings: 12,
    totalRevenue: 45600,
    activeCustomers: 156,
  };

  // Mock data for recent bookings
  const recentBookings: BookingData[] = [
    {
      key: "1",
      bookingId: "BK-2024-001",
      customerName: "Rajesh Kumar",
      mobile: "9876543210",
      course: "Basic Driving",
      date: "2024-11-12",
      slot: "09:00 AM - 10:00 AM",
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      amount: 2500,
    },
    {
      key: "2",
      bookingId: "BK-2024-002",
      customerName: "Priya Sharma",
      mobile: "9876543211",
      course: "Advanced Driving",
      date: "2024-11-12",
      slot: "10:00 AM - 11:00 AM",
      carName: "Honda City - DL01AB2345",
      status: "completed",
      amount: 3500,
    },
    {
      key: "3",
      bookingId: "BK-2024-003",
      customerName: "Amit Singh",
      mobile: "9876543212",
      course: "Highway Driving",
      date: "2024-11-12",
      slot: "11:00 AM - 12:00 PM",
      carName: "Hyundai Venue - DL01AB3456",
      status: "pending",
      amount: 4500,
    },
    {
      key: "4",
      bookingId: "BK-2024-004",
      customerName: "Sneha Reddy",
      mobile: "9876543213",
      course: "Basic Driving",
      date: "2024-11-12",
      slot: "02:00 PM - 03:00 PM",
      carName: "Maruti Baleno - DL01AB4567",
      status: "cancelled",
      amount: 2500,
    },
    {
      key: "5",
      bookingId: "BK-2024-005",
      customerName: "Vikram Patel",
      mobile: "9876543214",
      course: "Parking Practice",
      date: "2024-11-13",
      slot: "09:00 AM - 10:00 AM",
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      amount: 1800,
    },
  ];

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
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<AntDesignEyeOutlined />}
          onClick={() => {
            // Navigate to booking details
            console.log("View booking:", record.bookingId);
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
            className="!bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-md"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Statistics Cards */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              className="shadow-sm hover:shadow-md transition-all"
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">
                    Today&apos;s Bookings
                  </span>
                }
                value={stats.todayBookings}
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
              bordered={false}
              className="shadow-sm hover:shadow-md transition-all"
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">
                    Pending Bookings
                  </span>
                }
                value={stats.pendingBookings}
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
              bordered={false}
              className="shadow-sm hover:shadow-md transition-all"
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">Total Revenue</span>
                }
                value={stats.totalRevenue}
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
              bordered={false}
              className="shadow-sm hover:shadow-md transition-all"
            >
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">
                    Active Customers
                  </span>
                }
                value={stats.activeCustomers}
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

        {/* Alerts Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <CarbonWarningSquare className="text-orange-600 text-xl" />
              <span className="font-semibold">Alerts & Notifications</span>
            </div>
          }
          bordered={false}
          className="shadow-sm"
        >
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.key}>
                <Alert
                  message={
                    <div className="flex items-center justify-between">
                      <span>{alert.message}</span>
                      <span className="text-xs text-gray-400">
                        {alert.timestamp}
                      </span>
                    </div>
                  }
                  type={alert.type}
                  showIcon
                  closable
                />
                <div></div>
              </div>
            ))}
          </div>
        </Card>
        <div></div>

        {/* Recent Bookings Table */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="font-semibold">Recent Bookings</span>
              <Button
                type="link"
                onClick={() => router.push("/mtadmin/scheduler")}
                className="text-blue-600"
              >
                View All Bookings →
              </Button>
            </div>
          }
          bordered={false}
          className="shadow-sm"
        >
          <Table
            columns={columns}
            dataSource={recentBookings}
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
        <div></div>

        {/* Quick Actions */}
        <Card
          title={<span className="font-semibold">Quick Actions</span>}
          bordered={false}
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
