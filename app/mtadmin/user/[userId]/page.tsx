"use client";

import { useState, use } from "react";
import {
  Card,
  Button,
  Tag,
  Table,
  Input,
  Modal,
  Form,
  InputNumber,
  Avatar,
  Descriptions,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  IcBaselineArrowBack,
  RiMoneyRupeeCircleLine,
  MaterialSymbolsPersonRounded,
  AntDesignCheckOutlined,
  MaterialSymbolsFreeCancellation,
  Fa6RegularClock,
  IcBaselineCalendarMonth,
  AntDesignEditOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/services/user.api";

const { TextArea } = Input;

interface ServiceData {
  key: string;
  bookingId: string;
  courseName: string;
  date: string;
  slot: string;
  instructor: string;
  status: "completed" | "cancelled" | "pending" | "ongoing";
  amount: number;
}

interface WalletTransaction {
  key: string;
  transactionId: string;
  type: "credit" | "debit" | "refund";
  amount: number;
  description: string;
  date: string;
  balance: number;
}

const UserDetailPage = ({ params }: { params: Promise<{ userId: string }> }) => {
  const router = useRouter();
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Unwrap params (Next.js 15+ async params)
  const { userId } = use(params);

  // Parse the numeric user ID from the URL parameter
  const numericUserId = parseInt(userId);

  // Fetch user data from database
  const {
    data: userResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-detail", numericUserId],
    queryFn: () => getUserById(numericUserId),
    enabled: !isNaN(numericUserId),
  });

  const user = userResponse?.data?.getUserById;

  // Mock user data structure for dashboard stats (to be replaced with real data later)
  const userData = user
    ? {
        userId: `USR-${user.id.toString().padStart(3, "0")}`,
        id: user.id,
        name: user.name,
        surname: user.surname || "",
        fatherName: user.fatherName || "",
        email: user.email || "N/A",
        mobile: user.contact1,
        contact2: user.contact2 || "",
        address: user.address || "N/A",
        permanentAddress: user.permanentAddress || "",
        bloodGroup: user.bloodGroup || "N/A",
        dob: user.dob || null,
        walletBalance: 5000, // TODO: Replace with real wallet balance
        totalSpent: 45000, // TODO: Replace with real data
        joinedDate: user.createdAt,
        status: user.status.toLowerCase(),
        totalBookings: 15, // TODO: Replace with real booking count
        completedBookings: 12, // TODO: Replace with real data
        cancelledBookings: 2, // TODO: Replace with real data
        pendingBookings: 1, // TODO: Replace with real data
      }
    : null;

  // Mock active services
  const [activeServices] = useState<ServiceData[]>([
    {
      key: "1",
      bookingId: "BK-2024-101",
      courseName: "Basic Driving",
      date: "2024-11-15",
      slot: "09:00 AM - 10:00 AM",
      instructor: "Ramesh Kumar",
      status: "ongoing",
      amount: 2500,
    },
    {
      key: "2",
      bookingId: "BK-2024-102",
      courseName: "Highway Driving",
      date: "2024-11-20",
      slot: "10:00 AM - 11:00 AM",
      instructor: "Suresh Sharma",
      status: "pending",
      amount: 4500,
    },
  ]);

  // Mock previous services
  const [previousServices] = useState<ServiceData[]>([
    {
      key: "1",
      bookingId: "BK-2024-050",
      courseName: "Basic Driving",
      date: "2024-10-15",
      slot: "09:00 AM - 10:00 AM",
      instructor: "Ramesh Kumar",
      status: "completed",
      amount: 2500,
    },
    {
      key: "2",
      bookingId: "BK-2024-051",
      courseName: "Parking Practice",
      date: "2024-10-18",
      slot: "11:00 AM - 12:00 PM",
      instructor: "Suresh Sharma",
      status: "completed",
      amount: 1800,
    },
    {
      key: "3",
      bookingId: "BK-2024-052",
      courseName: "Advanced Driving",
      date: "2024-10-22",
      slot: "02:00 PM - 03:00 PM",
      instructor: "Ramesh Kumar",
      status: "cancelled",
      amount: 3500,
    },
    {
      key: "4",
      bookingId: "BK-2024-053",
      courseName: "Highway Driving",
      date: "2024-10-25",
      slot: "10:00 AM - 11:00 AM",
      instructor: "Vikram Singh",
      status: "completed",
      amount: 4500,
    },
  ]);

  // Mock wallet transactions
  const [walletTransactions] = useState<WalletTransaction[]>([
    {
      key: "1",
      transactionId: "TXN-001",
      type: "credit",
      amount: 10000,
      description: "Wallet top-up",
      date: "2024-01-15",
      balance: 10000,
    },
    {
      key: "2",
      transactionId: "TXN-002",
      type: "debit",
      amount: 2500,
      description: "Booking payment - BK-2024-050",
      date: "2024-10-15",
      balance: 7500,
    },
    {
      key: "3",
      transactionId: "TXN-003",
      type: "debit",
      amount: 1800,
      description: "Booking payment - BK-2024-051",
      date: "2024-10-18",
      balance: 5700,
    },
    {
      key: "4",
      transactionId: "TXN-004",
      type: "refund",
      amount: 3500,
      description: "Refund for cancelled booking - BK-2024-052",
      date: "2024-10-23",
      balance: 9200,
    },
  ]);

  const serviceColumns: ColumnsType<ServiceData> = [
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
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
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

  const walletColumns: ColumnsType<WalletTransaction> = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 140,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => {
        const config: Record<string, { color: string; text: string }> = {
          credit: { color: "green", text: "Credit" },
          debit: { color: "red", text: "Debit" },
          refund: { color: "blue", text: "Refund" },
        };
        return (
          <Tag color={config[type].color} className="!text-sm !px-3 !py-1">
            {config[type].text}
          </Tag>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <span
          className={`font-semibold ${
            record.type == "debit" ? "text-red-600" : "text-green-600"
          }`}
        >
          {record.type == "debit" ? "-" : "+"}₹{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance) => (
        <span className="font-semibold">₹{balance.toLocaleString()}</span>
      ),
    },
  ];

  const handleRefund = (values: { amount: number; reason: string }) => {
    toast.success(
      `₹${values.amount} has been refunded to ${userData?.name}'s wallet`
    );
    setRefundModalVisible(false);
    form.resetFields();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The user you are looking for does not exist.
          </p>
          <Button
            type="primary"
            onClick={() => router.push("/mtadmin/user")}
          >
            Back to Users
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button
              icon={<IcBaselineArrowBack className="text-lg" />}
              onClick={() => router.push("/mtadmin/user")}
              size="large"
            >
              Back to Users
            </Button>
            <Button
              type="primary"
              icon={<AntDesignEditOutlined className="text-lg" />}
              onClick={() => router.push(`/mtadmin/user/${userId}/edit`)}
              size="large"
            >
              Edit User
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                size={80}
                icon={<MaterialSymbolsPersonRounded />}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name}
                </h1>
                <p className="text-gray-600 mt-1">{userData.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Tag
                    color={userData.status == "active" ? "green" : "red"}
                    className="!text-sm !px-3 !py-1"
                  >
                    {userData.status == "active" ? "Active" : "Inactive"}
                  </Tag>
                  <span className="text-sm text-gray-600">
                    ID: {userData.userId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <RiMoneyRupeeCircleLine className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{userData.walletBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <IcBaselineCalendarMonth className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userData.totalBookings}
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
                  ₹{userData.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <AntDesignCheckOutlined className="text-orange-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userData.completedBookings}
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div></div>

        {/* User Details */}
        <Card
          title={<span className="text-lg font-semibold">User Details</span>}
          className="shadow-sm"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Full Name">
              {userData.name} {userData.surname}
            </Descriptions.Item>
            <Descriptions.Item label="Father's Name">
              {userData.fatherName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {userData.email}
            </Descriptions.Item>
            <Descriptions.Item label="Primary Mobile">
              {userData.mobile}
            </Descriptions.Item>
            <Descriptions.Item label="Secondary Mobile">
              {userData.contact2 || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Blood Group">
              {userData.bloodGroup}
            </Descriptions.Item>
            {userData.dob && (
              <Descriptions.Item label="Date of Birth">
                {new Date(userData.dob).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Current Address" span={3}>
              {userData.address}
            </Descriptions.Item>
            {userData.permanentAddress && (
              <Descriptions.Item label="Permanent Address" span={3}>
                {userData.permanentAddress}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Joined Date">
              {new Date(userData.joinedDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={userData.status == "active" ? "green" : "red"}
                className="!text-sm"
              >
                {userData.status == "active" ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Wallet Management */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Wallet Management</span>
              <Button
                type="primary"
                danger
                onClick={() => setRefundModalVisible(true)}
              >
                Refund to Wallet
              </Button>
            </div>
          }
          className="shadow-sm"
        >
          <Table
            columns={walletColumns}
            dataSource={walletTransactions}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
        <div></div>

        {/* Active Services */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Active Services ({activeServices.length})
            </span>
          }
          className="shadow-sm"
        >
          <Table
            columns={serviceColumns}
            dataSource={activeServices}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Card>
        <div></div>
        {/* Previous Services */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Previous Services ({previousServices.length})
            </span>
          }
          className="shadow-sm"
        >
          <Table
            columns={serviceColumns}
            dataSource={previousServices}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Refund Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <RiMoneyRupeeCircleLine className="text-red-600 text-lg" />
            </div>
            <span className="text-xl font-semibold">Refund to Wallet</span>
          </div>
        }
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={550}
      >
        <Form form={form} layout="vertical" onFinish={handleRefund}>
          <div className="py-4 space-y-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Current Wallet Balance:</span> ₹
                {userData.walletBalance.toLocaleString()}
              </p>
            </div>

            <Form.Item
              label="Refund Amount"
              name="amount"
              rules={[
                { required: true, message: "Please enter refund amount" },
                {
                  type: "number",
                  min: 1,
                  message: "Amount must be greater than 0",
                },
              ]}
            >
              <InputNumber
                prefix="₹"
                placeholder="Enter amount"
                size="large"
                className="w-full"
                min={1}
              />
            </Form.Item>

            <Form.Item
              label="Reason for Refund"
              name="reason"
              rules={[{ required: true, message: "Please enter reason" }]}
            >
              <TextArea
                rows={4}
                placeholder="Enter reason for refund (e.g., booking cancellation, service issue, etc.)"
              />
            </Form.Item>

            <div className="flex gap-3 pt-4">
              <Button
                type="default"
                size="large"
                onClick={() => {
                  setRefundModalVisible(false);
                  form.resetFields();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                size="large"
                htmlType="submit"
                className="flex-1"
              >
                Process Refund
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetailPage;
