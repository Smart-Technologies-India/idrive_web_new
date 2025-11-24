"use client";

import React, { useState, use } from "react";
import {
  Card,
  Button,
  Tag,
  Table,
  Avatar,
  Descriptions,
  Modal,
  Form,
  InputNumber,
  Input,
  Statistic,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  IcBaselineArrowBack,
  AntDesignEditOutlined,
  MaterialSymbolsPersonRounded,
  IcBaselineCalendarMonth,
  AntDesignCheckOutlined,
  MaterialSymbolsFreeCancellation,
  Fa6RegularClock,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getDriverWithHistory, type LeaveHistory, type SalaryHistory } from "@/services/driver.api";
import { toast } from "react-toastify";

const { TextArea } = Input;

interface BookingData {
  key: string;
  bookingId: string;
  studentName: string;
  courseName: string;
  date: string;
  slot: string;
  carNumber: string;
  status: "completed" | "cancelled" | "pending" | "ongoing";
  amount: number;
}

const DriverDetailPage = ({ params }: { params: Promise<{ driverId: string }> }) => {
  const router = useRouter();
  const [bonusModalVisible, setBonusModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Unwrap params (Next.js 15+ async params)
  const { driverId } = use(params);

  // Fetch driver with history from API
  const { data: driverResponse, isLoading } = useQuery({
    queryKey: ["driver", driverId],
    queryFn: () => getDriverWithHistory(parseInt(driverId)),
  });

  const driverData = driverResponse?.data?.getDriverById;
  const leaveHistoryData = driverData?.leaveHistory || [];
  const salaryHistoryData = driverData?.salaryHistory || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <p className="text-gray-600 mb-4">Driver not found</p>
          <Button onClick={() => router.push("/mtadmin/driver")}>
            Back to Drivers
          </Button>
        </Card>
      </div>
    );
  }

  // Mock booking history (keeping this as bookings aren't part of driver API yet)
  const bookings: BookingData[] = [
    {
      key: "1",
      bookingId: "BK-2024-101",
      studentName: "Rajesh Kumar",
      courseName: "Basic Driving",
      date: "2024-11-15",
      slot: "09:00 AM - 10:00 AM",
      carNumber: "DL-01-AB-1234",
      status: "ongoing",
      amount: 2500,
    },
    {
      key: "2",
      bookingId: "BK-2024-100",
      studentName: "Priya Sharma",
      courseName: "Highway Driving",
      date: "2024-11-14",
      slot: "10:00 AM - 11:00 AM",
      carNumber: "DL-01-CD-5678",
      status: "completed",
      amount: 4500,
    },
    {
      key: "3",
      bookingId: "BK-2024-099",
      studentName: "Amit Singh",
      courseName: "Parking Practice",
      date: "2024-11-13",
      slot: "02:00 PM - 03:00 PM",
      carNumber: "DL-01-AB-1234",
      status: "completed",
      amount: 1800,
    },
    {
      key: "4",
      bookingId: "BK-2024-098",
      studentName: "Sneha Reddy",
      courseName: "Basic Driving",
      date: "2024-11-12",
      slot: "11:00 AM - 12:00 PM",
      carNumber: "DL-01-EF-9012",
      status: "completed",
      amount: 2500,
    },
    {
      key: "5",
      bookingId: "BK-2024-097",
      studentName: "Vikram Patel",
      courseName: "Advanced Driving",
      date: "2024-11-11",
      slot: "03:00 PM - 04:00 PM",
      carNumber: "DL-01-CD-5678",
      status: "cancelled",
      amount: 3500,
    },
  ];

  const bookingColumns: ColumnsType<BookingData> = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      width: 140,
    },
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
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
      dataIndex: "carNumber",
      key: "carNumber",
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
      render: (status) => {
        const config: Record<
          string,
          { color: string; icon: React.ReactElement; text: string }
        > = {
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
          pending: {
            color: "orange",
            icon: <Fa6RegularClock />,
            text: "Pending",
          },
          ongoing: {
            color: "blue",
            icon: <IcBaselineCalendarMonth />,
            text: "Ongoing",
          },
        };
        const { color, icon, text } = config[status];
        return (
          <Tag
            color={color}
            icon={icon}
            className="!text-sm !px-3 !py-1 !flex !items-center !gap-1 !w-fit"
          >
            {text}
          </Tag>
        );
      },
    },
  ];

  const leaveColumns: ColumnsType<LeaveHistory> = [
    {
      title: "Leave ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id) => `LV-${id}`,
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
      render: (type) => type || "N/A",
    },
    {
      title: "From Date",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "To Date",
      dataIndex: "toDate",
      key: "toDate",
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Days",
      dataIndex: "totalDays",
      key: "totalDays",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = {
          APPROVED: { color: "green", text: "Approved" },
          PENDING: { color: "orange", text: "Pending" },
          REJECTED: { color: "red", text: "Rejected" },
          CANCELLED: { color: "gray", text: "Cancelled" },
        };
        const statusConfig = config[status as keyof typeof config];
        return (
          <Tag color={statusConfig?.color || "default"} className="!text-sm !px-3 !py-1">
            {statusConfig?.text || status}
          </Tag>
        );
      },
    },
  ];

  const salaryColumns: ColumnsType<SalaryHistory> = [
    {
      title: "Month/Year",
      key: "monthYear",
      render: (_, record) => `${record.month}/${record.year}`,
    },
    {
      title: "Basic Salary",
      dataIndex: "basicSalary",
      key: "basicSalary",
      render: (amount) => `₹${amount.toLocaleString()}`,
    },
    {
      title: "Bonus",
      dataIndex: "bonus",
      key: "bonus",
      render: (amount) => (
        <span className="text-green-600">+₹{(amount || 0).toLocaleString()}</span>
      ),
    },
    {
      title: "Deductions",
      dataIndex: "deductions",
      key: "deductions",
      render: (amount) => (
        <span className="text-red-600">-₹{(amount || 0).toLocaleString()}</span>
      ),
    },
    {
      title: "Net Salary",
      dataIndex: "netSalary",
      key: "netSalary",
      render: (amount) => (
        <span className="font-semibold">₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date) => date ? new Date(date).toLocaleDateString("en-IN") : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = {
          PAID: { color: "green", text: "Paid" },
          PENDING: { color: "orange", text: "Pending" },
          PROCESSING: { color: "blue", text: "Processing" },
        };
        const statusConfig = config[status as keyof typeof config];
        return (
          <Tag
            color={statusConfig?.color || "default"}
            className="!text-sm !px-3 !py-1"
          >
            {statusConfig?.text || status}
          </Tag>
        );
      },
    },
  ];

  const handleBonus = (values: { amount: number; reason: string }) => {
    toast.success(
      `₹${values.amount} bonus has been approved for ${driverData.name}`
    );
    setBonusModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push("/mtadmin/driver")}
              size="large"
            >
              Back to Drivers
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size={80}
                icon={<MaterialSymbolsPersonRounded />}
                className="bg-gradient-to-r from-green-600 to-teal-600"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {driverData.name}
                </h1>
                <p className="text-gray-600 mt-1">{driverData.email || "N/A"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Tag
                    color={
                      driverData.status === "ACTIVE"
                        ? "green"
                        : driverData.status === "ON_LEAVE"
                        ? "orange"
                        : driverData.status === "SUSPENDED"
                        ? "volcano"
                        : "red"
                    }
                    className="!text-sm !px-3 !py-1"
                  >
                    {driverData.status === "ACTIVE"
                      ? "Active"
                      : driverData.status === "ON_LEAVE"
                      ? "On Leave"
                      : driverData.status === "SUSPENDED"
                      ? "Suspended"
                      : "Inactive"}
                  </Tag>
                  <span className="text-sm text-gray-600">
                    ID: {driverData.driverId}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">
                      {driverData.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<AntDesignEditOutlined />}
              size="large"
              onClick={() =>
                router.push(`/mtadmin/driver/${driverId}/edit`)
              }
              className="!bg-blue-600"
            >
              Edit Driver
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <Statistic
              title="Total Bookings"
              value={driverData.totalBookings}
              prefix={<IcBaselineCalendarMonth className="text-blue-600" />}
            />
          </Card>

          <Card className="shadow-sm">
            <Statistic
              title="Completed"
              value={driverData.completedBookings}
              valueStyle={{ color: "#52c41a" }}
              prefix={<AntDesignCheckOutlined className="text-green-600" />}
            />
          </Card>

          <Card className="shadow-sm">
            <Statistic
              title="Cancelled"
              value={driverData.cancelledBookings}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={
                <MaterialSymbolsFreeCancellation className="text-red-600" />
              }
            />
          </Card>

          <Card className="shadow-sm">
            <Statistic
              title="Monthly Salary"
              value={driverData.salary}
              prefix="₹"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </div>
        <div></div>

        {/* Personal Information */}
        <Card
          title={
            <span className="text-lg font-semibold">Personal Information</span>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Full Name">
              {driverData.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {driverData.email}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile">
              {driverData.mobile}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {new Date(driverData.dateOfBirth).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Blood Group">
              {driverData.bloodGroup}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {driverData.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={3}>
              {driverData.address}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* License & Professional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title={
              <span className="text-lg font-semibold">License Information</span>
            }
            className="shadow-sm"
          >
            <Descriptions column={1}>
              <Descriptions.Item label="License Number">
                <span className="font-mono">{driverData.licenseNumber}</span>
              </Descriptions.Item>
              <Descriptions.Item label="License Type">
                {driverData.licenseType}
              </Descriptions.Item>
              <Descriptions.Item label="Issue Date">
                {new Date(driverData.licenseIssueDate).toLocaleDateString(
                  "en-IN"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Expiry Date">
                {new Date(driverData.licenseExpiryDate).toLocaleDateString(
                  "en-IN"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={
              <span className="text-lg font-semibold">
                Professional Information
              </span>
            }
            className="shadow-sm"
          >
            <Descriptions column={1}>
              <Descriptions.Item label="Experience">
                {driverData.experience} Years
              </Descriptions.Item>
              <Descriptions.Item label="Joining Date">
                {new Date(driverData.joiningDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Monthly Salary">
                ₹{driverData.salary.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Rating">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">
                    {driverData.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
        <div></div>

        {/* Emergency Contact */}
        <Card
          title={
            <span className="text-lg font-semibold">Emergency Contact</span>
          }
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Contact Name">
              {driverData.emergencyContactName}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Number">
              {driverData.emergencyContactNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Relationship">
              {driverData.emergencyContactRelation}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Booking History */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Booking History ({bookings.length})
            </span>
          }
          className="shadow-sm"
        >
          <Table
            columns={bookingColumns}
            dataSource={bookings}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
        <div></div>

        {/* Leave History */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Leave History ({leaveHistoryData.length})
            </span>
          }
          className="shadow-sm"
        >
          <Table
            columns={leaveColumns}
            dataSource={leaveHistoryData}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 800 }}
          />
        </Card>
        <div></div>

        {/* Salary History */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                Salary History ({salaryHistoryData.length})
              </span>
              <Button
                type="primary"
                onClick={() => setBonusModalVisible(true)}
                className="!bg-green-600"
              >
                Add Bonus
              </Button>
            </div>
          }
          className="shadow-sm"
        >
          <Table
            columns={salaryColumns}
            dataSource={salaryHistoryData}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Bonus Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <AntDesignCheckOutlined className="text-green-600 text-lg" />
            </div>
            <span className="text-xl font-semibold">Add Bonus</span>
          </div>
        }
        open={bonusModalVisible}
        onCancel={() => {
          setBonusModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={550}
      >
        <Form form={form} layout="vertical" onFinish={handleBonus}>
          <div className="py-4 space-y-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Driver:</span>{" "}
                {driverData.name}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-semibold">Current Salary:</span> ₹
                {driverData.salary.toLocaleString()}
              </p>
            </div>

            <Form.Item
              label="Bonus Amount"
              name="amount"
              rules={[
                { required: true, message: "Please enter bonus amount" },
                {
                  type: "number",
                  min: 1,
                  message: "Amount must be greater than 0",
                },
              ]}
            >
              <InputNumber
                prefix="₹"
                placeholder="Enter bonus amount"
                size="large"
                className="w-full"
                min={1}
              />
            </Form.Item>

            <Form.Item
              label="Reason for Bonus"
              name="reason"
              rules={[{ required: true, message: "Please enter reason" }]}
            >
              <TextArea
                rows={4}
                placeholder="Enter reason for bonus (e.g., excellent performance, extra hours, etc.)"
              />
            </Form.Item>

            <div className="flex gap-3 pt-4">
              <Button
                type="default"
                size="large"
                onClick={() => {
                  setBonusModalVisible(false);
                  form.resetFields();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                className="flex-1 !bg-green-600"
              >
                Add Bonus
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DriverDetailPage;
