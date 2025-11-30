"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, Table, Input, Button, Tag, Space, Select, Progress, Alert, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Booking } from "@/services/booking.api";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedBookings } from "@/services/booking.api";
import { getTotalPaidAmount } from "@/services/payment.api";
import { getCookie } from "cookies-next";
import { WarningOutlined } from "@ant-design/icons";

const { Search } = Input;

// Payment Status Cell Component
const PaymentStatusCell = ({ 
  bookingId, 
  totalAmount, 
  booking,
  onUrgencyDetected 
}: { 
  bookingId: number; 
  totalAmount: number; 
  booking: Booking;
  onUrgencyDetected?: (bookingId: number, isUrgent: boolean, daysUntilEnd: number) => void;
}) => {
  const { data: paidData } = useQuery({
    queryKey: ["payment-total", bookingId],
    queryFn: () => getTotalPaidAmount(bookingId),
    enabled: !!bookingId,
  });

  const totalPaid = paidData?.data?.getTotalPaidAmount || 0;
  const remaining = totalAmount - totalPaid;
  const percentage = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Check if urgent
  const { isUrgent, daysUntilEnd } = useMemo(() => {
    if (!booking.sessions || booking.sessions.length === 0) return { isUrgent: false, daysUntilEnd: 999 };
    
    const lastSession = booking.sessions.reduce((latest, session) => {
      const sessionDate = new Date(session.sessionDate);
      return sessionDate > latest ? sessionDate : latest;
    }, new Date(0));

    const today = new Date();
    const days = Math.ceil((lastSession.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const hasOutstandingPayment = totalPaid < totalAmount;
    
    const urgent = days <= 5 && days >= 0 && hasOutstandingPayment;
    
    return { isUrgent: urgent, daysUntilEnd: days };
  }, [booking.sessions, totalPaid, totalAmount]);

  // Notify parent component of urgency status
  useEffect(() => {
    if (onUrgencyDetected) {
      onUrgencyDetected(bookingId, isUrgent, daysUntilEnd);
    }
  }, [bookingId, isUrgent, daysUntilEnd, onUrgencyDetected]);

  return (
    <div className="space-y-1">
      {isUrgent && (
        <div className="flex items-center gap-1 mb-1">
          <WarningOutlined className="text-red-500" />
          <span className="text-xs text-red-600 font-semibold">
            URGENT - {daysUntilEnd} day{daysUntilEnd !== 1 ? 's' : ''} left
          </span>
        </div>
      )}
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">Paid: ₹{totalPaid.toLocaleString("en-IN")}</span>
        <span className="text-red-600 font-semibold">Due: ₹{remaining.toLocaleString("en-IN")}</span>
      </div>
      <Progress percent={percentage} size="small" status={percentage === 100 ? "success" : "active"} />
    </div>
  );
};

const BookingListPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [urgentBookingIds, setUrgentBookingIds] = useState<Set<number>>(new Set());
  const pageSize = 10;

  // Fetch bookings
  const {
    data: bookingsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["booking-list", schoolId, searchText, filterStatus, currentPage],
    queryFn: () =>
      getPaginatedBookings({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
        },
        whereSearchInput: {
          schoolId,
          status: filterStatus !== "all" ? filterStatus : undefined,
        },
      }),
    enabled: schoolId > 0,
  });

  const allBookings = useMemo(() => {
    return bookingsResponse?.data?.getPaginatedBooking?.data || [];
  }, [bookingsResponse]);
  
  const totalBookings = bookingsResponse?.data?.getPaginatedBooking?.total || 0;

  // Callback to track urgent bookings (memoized to prevent re-renders)
  const handleUrgencyDetected = useCallback((bookingId: number, isUrgent: boolean) => {
    setUrgentBookingIds(prev => {
      const newSet = new Set(prev);
      if (isUrgent) {
        newSet.add(bookingId);
      } else {
        newSet.delete(bookingId);
      }
      return newSet;
    });
  }, []);

  // Filter bookings based on urgent flag
  const bookings = useMemo(() => {
    if (!showUrgentOnly) return allBookings;
    return allBookings.filter(booking => urgentBookingIds.has(booking.id));
  }, [allBookings, showUrgentOnly, urgentBookingIds]);

  const columns: ColumnsType<Booking> = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      width: 120,
      sorter: true,
    },
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">{record.customerName}</div>
          <div className="text-xs text-gray-500">{record.customerMobile}</div>
        </div>
      ),
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      width: 160,
      sorter: true,
    },
    {
      title: "Car",
      dataIndex: "carName",
      key: "carName",
      width: 140,
      sorter: true,
    },
    {
      title: "Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 130,
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Slot",
      dataIndex: "slot",
      key: "slot",
      width: 110,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "COMPLETED" ? "green" : status === "CANCELLED" ? "red" : "blue"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amt) => `₹${amt.toLocaleString("en-IN")}`,
    },
    {
      title: "Payment Status",
      key: "paymentStatus",
      width: 180,
      render: (_, record) => (
        <PaymentStatusCell 
          bookingId={record.id} 
          totalAmount={record.totalAmount} 
          booking={record} 
          onUrgencyDetected={handleUrgencyDetected}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => router.push(`/mtadmin/bookinglist/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking List</h1>
            <p className="text-gray-600 mt-1 text-sm">All bookings for your school</p>
          </div>
          <Button type="default" onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        {urgentBookingIds.size > 0 && (
          <Alert
            message={`${urgentBookingIds.size} Urgent Payment${urgentBookingIds.size > 1 ? 's' : ''} Required`}
            description="Bookings with courses ending within 5 days and outstanding payments are highlighted in red and marked as URGENT."
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            closable
          />
        )}
        <Card className="shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Search
                placeholder="Search by customer, course, car, or booking ID..."
                allowClear
                size="large"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Space size="middle">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show Urgent Only:</span>
                <Switch 
                  checked={showUrgentOnly} 
                  onChange={(checked) => {
                    setShowUrgentOnly(checked);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
                style={{ width: 150 }}
                size="large"
                options={[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Confirmed", value: "CONFIRMED" },
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Cancelled", value: "CANCELLED" },
                  { label: "No Show", value: "NO_SHOW" },
                ]}
              />
            </Space>
          </div>
        </Card>
        <div></div>
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={bookings}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalBookings,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} bookings`,
              showSizeChanger: false,
            }}
            scroll={{ x: 1200 }}
            size="middle"
            rowKey="id"
            rowClassName={(record) => urgentBookingIds.has(record.id) ? 'bg-red-50 hover:bg-red-100' : ''}
          />
        </Card>
      </div>
    </div>
  );
};

export default BookingListPage;
