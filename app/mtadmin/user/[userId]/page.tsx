"use client";

import { useState, use, useMemo } from "react";
import {
  Card,
  Button,
  Tag,
  Table,
  Input,
  Form,
  Avatar,
  Descriptions,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  IcBaselineArrowBack,
  MaterialSymbolsPersonRounded,
  AntDesignCheckOutlined,
  MaterialSymbolsFreeCancellation,
  Fa6RegularClock,
  IcBaselineCalendarMonth,
  AntDesignEditOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/services/user.api";
import { getAllPayments, type Payment } from "@/services/payment.api";
import {
  getAllServicePayments,
  type ServicePayment,
} from "@/services/service-payment.api";
import { getAllBookings, type Booking } from "@/services/booking.api";
import {
  getAllBookingServices,
  type BookingService,
} from "@/services/service.booking.api";
import { formatDate } from "@/utils/date-format";
import { baseurl } from "@/utils/conts";

const { TextArea } = Input;

interface ServiceData {
  key: string;
  confirmationNumber: string;
  serviceName: string;
  serviceType: string;
  price: number;
  discount: number;
  createdAt: string;
  status: string;
}

interface WalletTransaction {
  key: string;
  transactionId: string;
  type: "credit" | "debit" | "refund";
  amount: number;
  description: string;
  date: string;
  remainingDue: number;
}

interface BookingRow {
  key: string;
  bookingId: string;
  courseName: string;
  totalAmount: number;
  bookingDate: string;
  slot: string;
  status: string;
}

const UserDetailPage = ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
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

  const { data: paymentsResponse, isLoading: loadingPayments } = useQuery({
    queryKey: ["user-payments", numericUserId],
    queryFn: () => getAllPayments({ userId: numericUserId }),
    enabled: !isNaN(numericUserId),
  });

  const { data: servicePaymentsResponse, isLoading: loadingServicePayments } =
    useQuery({
      queryKey: ["user-service-payments", numericUserId],
      queryFn: () => getAllServicePayments({ userId: numericUserId }),
      enabled: !isNaN(numericUserId),
    });

  const { data: bookingsResponse } = useQuery({
    queryKey: ["user-bookings", numericUserId],
    queryFn: () => getAllBookings({ customerId: numericUserId }),
    enabled: !isNaN(numericUserId),
  });

  const { data: bookingServicesResponse } = useQuery({
    queryKey: ["user-booking-services", numericUserId],
    queryFn: () => getAllBookingServices({ userId: numericUserId }),
    enabled: !isNaN(numericUserId),
  });

  const serviceBookings = useMemo<ServiceData[]>(() => {
    const bookingServices =
      bookingServicesResponse?.data?.getAllBookingService || [];

    return bookingServices.map((s: BookingService) => {
      const latestStatus = s.licenseApplications?.[0]?.status || "PENDING";

      return {
        key: s.id.toString(),
        confirmationNumber: s.confirmationNumber || `SVC-${s.id}`,
        serviceName: s.serviceName,
        serviceType: s.serviceType,
        price: s.price || 0,
        discount: s.discount || 0,
        createdAt: s.createdAt,
        status: latestStatus,
      };
    });
  }, [bookingServicesResponse]);

  const bookingRows = useMemo<BookingRow[]>(() => {
    const bookings = bookingsResponse?.data?.getAllBooking || [];

    return bookings.map((b: Booking) => ({
      key: b.id.toString(),
      bookingId: b.bookingId,
      courseName: b.courseName,
      totalAmount: b.totalAmount || 0,
      bookingDate: b.bookingDate,
      slot: b.slot,
      status: b.status,
    }));
  }, [bookingsResponse]);

  const walletTransactions = useMemo<WalletTransaction[]>(() => {
    const payments = paymentsResponse?.data?.getAllPayment || [];
    const servicePayments =
      servicePaymentsResponse?.data?.getAllServicePayment || [];
    const bookings = bookingsResponse?.data?.getAllBooking || [];
    const bookingServices =
      bookingServicesResponse?.data?.getAllBookingService || [];

    const bookingTotalMap = new Map<number, number>();
    bookings.forEach((b: Booking) => {
      bookingTotalMap.set(b.id, b.totalAmount || 0);
    });

    const serviceTotalMap = new Map<number, number>();
    bookingServices.forEach((s: BookingService) => {
      const discount = s.discount || 0;
      serviceTotalMap.set(s.id, Math.max((s.price || 0) - discount, 0));
    });

    const paidBookingMap = new Map<number, number>();
    payments
      .filter((p: Payment) => p.status?.toLowerCase() === "completed")
      .forEach((p: Payment) => {
        const current = paidBookingMap.get(p.bookingId) || 0;
        paidBookingMap.set(p.bookingId, current + p.amount);
      });

    const paidServiceMap = new Map<number, number>();
    servicePayments
      .filter((p: ServicePayment) => p.status?.toLowerCase() === "completed")
      .forEach((p: ServicePayment) => {
        const current = paidServiceMap.get(p.bookingServiceId) || 0;
        paidServiceMap.set(p.bookingServiceId, current + p.amount);
      });

    type CombinedPayment = {
      id: number;
      amount: number;
      paymentNumber: string;
      paymentDate?: string;
      createdAt?: string;
      status?: string;
      notes?: string;
      source: "BOOKING" | "SERVICE";
      bookingId?: number;
      bookingServiceId?: number;
    };

    const combined: CombinedPayment[] = [
      ...payments.map((p: Payment) => ({
        id: p.id,
        amount: p.amount,
        paymentNumber: p.paymentNumber,
        paymentDate: p.paymentDate,
        createdAt: p.createdAt,
        status: p.status,
        notes: p.notes,
        bookingId: p.bookingId,
        source: "BOOKING" as const,
      })),
      ...servicePayments.map((p: ServicePayment) => ({
        id: p.id,
        amount: p.amount,
        paymentNumber: p.paymentNumber,
        paymentDate: p.paymentDate,
        createdAt: p.createdAt,
        status: p.status,
        notes: p.notes,
        bookingServiceId: p.bookingServiceId,
        source: "SERVICE" as const,
      })),
    ];

    const toType = (
      status?: string,
      notes?: string,
    ): WalletTransaction["type"] => {
      const normalizedStatus = status?.toLowerCase() || "";
      const normalizedNotes = notes?.toLowerCase() || "";
      if (
        normalizedStatus.includes("refund") ||
        normalizedNotes.includes("refund")
      ) {
        return "refund";
      }
      return "debit";
    };

    const getRemainingDue = (item: CombinedPayment) => {
      if (item.source === "SERVICE" && item.bookingServiceId) {
        const total = serviceTotalMap.get(item.bookingServiceId) || 0;
        const paid = paidServiceMap.get(item.bookingServiceId) || 0;
        return Math.max(total - paid, 0);
      }
      if (item.source === "BOOKING" && item.bookingId) {
        const total = bookingTotalMap.get(item.bookingId) || 0;
        const paid = paidBookingMap.get(item.bookingId) || 0;
        return Math.max(total - paid, 0);
      }
      return 0;
    };

    const sorted = [...combined].sort((a, b) => {
      const aDate = new Date(a.paymentDate || a.createdAt || 0).getTime();
      const bDate = new Date(b.paymentDate || b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return sorted.map((item) => {
      const type = toType(item.status, item.notes);
      const description =
        item.source === "SERVICE"
          ? `Service Payment - ${item.paymentNumber}`
          : `Booking Payment - ${item.paymentNumber}`;

      return {
        key: `${item.source}-${item.id}`,
        transactionId: item.paymentNumber,
        type,
        amount: item.amount,
        description,
        date: item.paymentDate || item.createdAt || "",
        remainingDue: getRemainingDue(item),
      };
    });
  }, [
    paymentsResponse,
    servicePaymentsResponse,
    bookingsResponse,
    bookingServicesResponse,
  ]);

  const currentWalletBalance = useMemo(() => {
    const payments = paymentsResponse?.data?.getAllPayment || [];
    const servicePayments =
      servicePaymentsResponse?.data?.getAllServicePayment || [];

    const toType = (status?: string, notes?: string) => {
      const normalizedStatus = status?.toLowerCase() || "";
      const normalizedNotes = notes?.toLowerCase() || "";
      if (
        normalizedStatus.includes("refund") ||
        normalizedNotes.includes("refund")
      ) {
        return "refund" as const;
      }
      return "debit" as const;
    };

    const all = [
      ...payments.map((p: Payment) => ({
        amount: p.amount,
        status: p.status,
        notes: p.notes,
      })),
      ...servicePayments.map((p: ServicePayment) => ({
        amount: p.amount,
        status: p.status,
        notes: p.notes,
      })),
    ];

    return all.reduce((total, item) => {
      const type = toType(item.status, item.notes);
      return type === "refund" ? total + item.amount : total - item.amount;
    }, 0);
  }, [paymentsResponse, servicePaymentsResponse]);

  const serviceColumns: ColumnsType<ServiceData> = [
    {
      title: "Confirmation No",
      dataIndex: "confirmationNumber",
      key: "confirmationNumber",
      width: 160,
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Type",
      dataIndex: "serviceType",
      key: "serviceType",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (amount) => (
        <span className="font-semibold">₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (amount) => (
        <span className="font-semibold">₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const normalized = status?.toLowerCase?.() || "pending";
        const config: Record<
          string,
          { color: string; icon: React.ReactElement; text: string }
        > = {
          closed: {
            color: "green",
            icon: <AntDesignCheckOutlined />,
            text: "Closed",
          },
          dl_applied: {
            color: "blue",
            icon: <IcBaselineCalendarMonth />,
            text: "DL Applied",
          },
          dl_pending: {
            color: "orange",
            icon: <Fa6RegularClock />,
            text: "DL Pending",
          },
          ll_applied: {
            color: "purple",
            icon: <IcBaselineCalendarMonth />,
            text: "LL Applied",
          },
          pending: {
            color: "orange",
            icon: <Fa6RegularClock />,
            text: "Pending",
          },
          cancelled: {
            color: "red",
            icon: <MaterialSymbolsFreeCancellation />,
            text: "Cancelled",
          },
        };
        const { color, icon, text } =
          config[normalized] || config.pending;
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
      render: (date) => formatDate(date),
    },
    {
      title: "Remaining Due",
      dataIndex: "remainingDue",
      key: "remainingDue",
      render: (remainingDue) => (
        <span className="font-semibold">₹{remainingDue.toLocaleString()}</span>
      ),
    },
  ];

  const bookingColumns: ColumnsType<BookingRow> = [
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
      title: "Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Slot",
      dataIndex: "slot",
      key: "slot",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <span className="font-semibold">₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const normalized = status?.toLowerCase?.() || "pending";
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
          confirmed: {
            color: "blue",
            icon: <IcBaselineCalendarMonth />,
            text: "Confirmed",
          },
          no_show: {
            color: "red",
            icon: <MaterialSymbolsFreeCancellation />,
            text: "No Show",
          },
        };
        const { color, icon, text } =
          config[normalized] || config.pending;
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

  // const handleRefund = (values: { amount: number; reason: string }) => {
  //   toast.success(
  //     `₹${values.amount} has been refunded to ${userData?.name}'s wallet`,
  //   );
  //   setRefundModalVisible(false);
  //   form.resetFields();
  // };

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
          <Button type="primary" onClick={() => router.push("/mtadmin/user")}>
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
                src={user?.profile ? `${baseurl}/${user.profile}` : undefined}
                className={!user?.profile ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userData.name} {userData.surname}
                </h1>
                <p className="text-gray-600 mt-1">{userData.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Tag
                    color={userData.status == "active" ? "green" : "red"}
                    className="text-sm! px-3! py-1!"
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
                {formatDate(userData.dob)}
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
              {formatDate(userData.joinedDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={userData.status == "active" ? "green" : "red"}
                className="text-sm!"
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
              {/* <Button
                type="primary"
                danger
                onClick={() => setRefundModalVisible(true)}
              >
                Refund to Wallet
              </Button> */}
            </div>
          }
          className="shadow-sm"
        >
          <Table
            columns={walletColumns}
            dataSource={walletTransactions}
            loading={loadingPayments || loadingServicePayments}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
        <div></div>

        {/* Service Bookings */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Service Bookings ({serviceBookings.length})
            </span>
          }
          className="shadow-sm"
        >
          <Table
            columns={serviceColumns}
            dataSource={serviceBookings}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
        <div></div>

        {/* Booking History */}
        <Card
          title={
            <span className="text-lg font-semibold">
              Bookings ({bookingRows.length})
            </span>
          }
          className="shadow-sm"
        >
          <Table
            columns={bookingColumns}
            dataSource={bookingRows}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Refund Modal */}
      {/* <Modal
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
                {currentWalletBalance.toLocaleString()}
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
      </Modal> */}
    </div>
  );
};

export default UserDetailPage;
