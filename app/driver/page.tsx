"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Space,
  Modal,
  Input,
  Select,
  Pagination,
  DatePicker,
  Spin,
} from "antd";
import dayjs from "dayjs";
import {
  AntDesignCheckOutlined,
  Fa6RegularClock,
  MaterialSymbolsLocationOn,
  MaterialSymbolsCall,
  MaterialSymbolsFreeCancellation,
  IcBaselineRefresh,
  AntDesignCloseCircleOutlined,
  MaterialSymbolsCheckCircle,
  Fa6RegularHourglassHalf,
  MaterialSymbolsPersonRounded,
} from "@/components/icons";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllBookings,
  updateBookingSession,
  type Booking,
  type BookingSession,
} from "@/services/booking.api";
import { getCookie } from "cookies-next";

const { TextArea } = Input;

interface BookingSlot {
  key: string;
  sessionId: number;
  bookingId: string;
  customerName: string;
  mobile: string;
  address: string;
  course: string;
  slot: string;
  date: string; // Format: YYYY-MM-DD
  carName: string;
  status: "pending" | "completed" | "cancelled";
  attendanceMarked: boolean;
  attendanceNotes?: string;
}

const DriverPage = () => {
  const queryClient = useQueryClient();
  const userId: number = parseInt(getCookie("id")?.toString() || "0");

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const pageSize = 10;

  // Fetch bookings from backend - using userId to get driver's bookings
  const {
    data: bookingsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["driverBookings", userId],
    queryFn: async () => {
      if (!userId || userId === 0) {
        throw new Error("User ID not found");
      }
      // Fetch all bookings - we'll filter by driver's userId on the sessions
      const data = await getAllBookings({});
      return data;
    },
    enabled: userId > 0,
  });

  // Transform backend data to BookingSlot format
  // Filter sessions where the driver's userId matches the logged-in user's ID
  const allBookings: BookingSlot[] =
    bookingsResponse?.data?.getAllBooking?.flatMap((booking: Booking) =>
      (booking.sessions || [])
        .filter((session: BookingSession) => session.driver?.userId === userId)
        .map((session: BookingSession) => ({
          key: `${booking.id}-${session.id}`,
          sessionId: session.id,
          bookingId: booking.bookingId,
          customerName:
            booking.customer?.name || booking.customerName || "Unknown",
          mobile: booking.customer?.contact1 || booking.customerMobile,
          address: booking.customer?.address || "Address not provided",
          course: booking.course?.courseName || booking.courseName,
          slot: session.slot,
          date: dayjs(session.sessionDate).format("YYYY-MM-DD"),
          carName: `${booking.car?.carName || booking.carName} - ${
            booking.car?.registrationNumber || ""
          }`,
          status: session.status.toLowerCase() as
            | "pending"
            | "completed"
            | "cancelled",
          attendanceMarked:
            session.attended ||
            session.status === "COMPLETED" ||
            session.status === "NO_SHOW",
          attendanceNotes: session.instructorNotes || "",
        }))
    ) || [];

  // Update booking session mutation
  const updateSessionMutation = useMutation({
    mutationKey: ["updateBookingSession"],
    mutationFn: async (data: {
      sessionId: number;
      status: "COMPLETED" | "NO_SHOW";
      notes: string;
    }) => {
      return await updateBookingSession({
        id: data.sessionId,
        status: data.status,
        attended: data.status === "COMPLETED",
        completedAt: new Date(),
        instructorNotes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driverBookings"] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark attendance");
    },
  });

  const [attendanceModal, setAttendanceModal] = useState({
    visible: false,
    booking: null as BookingSlot | null,
    sessionId: null as number | null,
    notes: "",
    status: "completed" as "completed" | "no_show",
  });

  // Filter bookings by date and status
  const filteredBookings = allBookings.filter((booking) => {
    const bookingDate = dayjs(booking.date);
    const isDateMatch = bookingDate.isSame(selectedDate, "day");
    if (!isDateMatch) return false;
    if (filterStatus === "all") return true;
    return booking.status === filterStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "time") {
      return a.slot.localeCompare(b.slot);
    }
    return 0;
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBookings = sortedBookings.slice(startIndex, endIndex);

  // Calculate statistics for selected date
  const dateFilteredBookings = allBookings.filter((booking) => {
    const bookingDate = dayjs(booking.date);
    return bookingDate.isSame(selectedDate, "day");
  });

  const stats = {
    totalSlots: dateFilteredBookings.length,
    completed: dateFilteredBookings.filter((b) => b.status === "completed")
      .length,
    pending: dateFilteredBookings.filter((b) => b.status === "pending").length,
    cancelled: dateFilteredBookings.filter((b) => b.status === "cancelled")
      .length,
  };

  const handleMarkAttendance = (
    booking: BookingSlot & { sessionId: number }
  ) => {
    setAttendanceModal({
      visible: true,
      booking,
      sessionId: booking.sessionId,
      notes: "",
      status: "completed",
    });
  };

  const handleAttendanceSubmit = () => {
    if (!attendanceModal.sessionId) return;

    updateSessionMutation.mutate({
      sessionId: attendanceModal.sessionId,
      status: attendanceModal.status === "completed" ? "COMPLETED" : "NO_SHOW",
      notes: attendanceModal.notes,
    });

    setAttendanceModal({
      visible: false,
      booking: null,
      sessionId: null,
      notes: "",
      status: "completed",
    });
  };

  const getStatusTag = (status: "pending" | "completed" | "cancelled") => {
    if (status === "completed") {
      return (
        <Tag
          color="green"
          icon={<AntDesignCheckOutlined />}
          className="!text-sm !px-3 !py-1 !flex !items-center !gap-1"
        >
          Completed
        </Tag>
      );
    }
    if (status === "cancelled") {
      return (
        <Tag
          color="red"
          icon={<MaterialSymbolsFreeCancellation />}
          className="!text-sm !px-3 !py-1 !flex !items-center !gap-1"
        >
          Cancelled
        </Tag>
      );
    }
    return (
      <Tag
        color="orange"
        icon={<Fa6RegularClock />}
        className="!text-sm !px-3 !py-1 !flex !items-center !gap-1"
      >
        Pending
      </Tag>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Today&apos;s Sessions
            </h2>
            <p className="text-gray-600 text-sm">
              Manage your driving sessions and mark attendance
            </p>
          </div>
          <div className="flex gap-3">
            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD MMM, YYYY"
              size="large"
              className="!w-48"
              disabledDate={(current) => {
                const today = dayjs();
                return (
                  current &&
                  (current.isBefore(today, "day") ||
                    current.isAfter(today.add(7, "day"), "day"))
                );
              }}
            />
            <Button
              type="default"
              icon={<IcBaselineRefresh className="text-lg" />}
              size="large"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>
      <div></div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSlots}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsCheckCircle className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Fa6RegularHourglassHalf className="text-orange-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <AntDesignCloseCircleOutlined className="text-red-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.cancelled}
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Actions */}
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-700 font-medium">Filter:</span>
            <Space.Compact>
              <Button
                type={filterStatus === "all" ? "primary" : "default"}
                onClick={() => {
                  setFilterStatus("all");
                  setCurrentPage(1);
                }}
              >
                All ({dateFilteredBookings.length})
              </Button>
              <Button
                type={filterStatus === "pending" ? "primary" : "default"}
                onClick={() => {
                  setFilterStatus("pending");
                  setCurrentPage(1);
                }}
              >
                Pending ({stats.pending})
              </Button>
              <Button
                type={filterStatus === "completed" ? "primary" : "default"}
                onClick={() => {
                  setFilterStatus("completed");
                  setCurrentPage(1);
                }}
              >
                Completed ({stats.completed})
              </Button>
              <Button
                type={filterStatus === "cancelled" ? "primary" : "default"}
                onClick={() => {
                  setFilterStatus("cancelled");
                  setCurrentPage(1);
                }}
              >
                Cancelled ({stats.cancelled})
              </Button>
            </Space.Compact>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Sort:</span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 150 }}
              options={[
                { label: "By Time", value: "time" },
                { label: "By Status", value: "status" },
              ]}
            />
          </div>
        </div>
      </Card>
      <div></div>
      {/* Bookings List */}
      <div className="space-y-4">
        {paginatedBookings.length === 0 && (
          <div>
            <Card className="shadow-sm">
              <div className="text-center py-12">
                <Fa6RegularClock className="text-gray-300 text-5xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-500">
                  {filterStatus === "all"
                    ? `You don't have any bookings scheduled for ${selectedDate.format(
                        "DD MMMM YYYY"
                      )}.`
                    : `No ${filterStatus} bookings found for ${selectedDate.format(
                        "DD MMMM YYYY"
                      )}.`}
                </p>
              </div>
            </Card>
          </div>
        )}
        {paginatedBookings.map((booking) => (
          <div key={booking.key} className="mt-3">
            <Card className="shadow-sm hover:shadow transition-all">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section - Time */}
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-5 text-center min-w-[140px]">
                    <div className="text-xs font-medium opacity-90 mb-2">
                      Time Slot
                    </div>
                    <div className="text-xl font-bold">
                      {booking.slot.split(" - ")[0]}
                    </div>
                    <div className="text-xs opacity-75 my-1">to</div>
                    <div className="text-xl font-bold">
                      {booking.slot.split(" - ")[1]}
                    </div>
                  </div>
                </div>

                {/* Middle Section - Customer Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {booking.customerName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium text-gray-900">
                            Course:
                          </span>{" "}
                          {booking.course}
                        </span>
                        <span className="text-gray-600">
                          <span className="font-medium text-gray-900">ID:</span>{" "}
                          {booking.bookingId}
                        </span>
                      </div>
                    </div>
                    <div>{getStatusTag(booking.status)}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <MaterialSymbolsCall className="text-green-600 text-base" />
                      </div>
                      <a
                        href={`tel:${booking.mobile}`}
                        className="text-gray-900 hover:text-blue-600 font-medium"
                      >
                        {booking.mobile}
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <MaterialSymbolsLocationOn className="text-red-600 text-base" />
                      </div>
                      <span className="text-gray-700 leading-relaxed">
                        {booking.address}
                      </span>
                    </div>
                  </div>

                  {booking.attendanceMarked && booking.attendanceNotes && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">
                          Notes:
                        </span>{" "}
                        {booking.attendanceNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Section - Action Button */}
                <div className="flex-shrink-0 flex items-start">
                  {booking.status === "pending" &&
                    !booking.attendanceMarked && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<AntDesignCheckOutlined />}
                        onClick={() =>
                          handleMarkAttendance(
                            booking as BookingSlot & { sessionId: number }
                          )
                        }
                        className="!bg-blue-600 hover:!bg-blue-700"
                      >
                        Mark Attendance
                      </Button>
                    )}
                  {booking.attendanceMarked && (
                    <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-700 font-semibold text-sm flex items-center gap-2">
                        <AntDesignCheckOutlined />
                        Attendance Marked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}

        {/* Pagination */}
        {sortedBookings.length > pageSize && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              total={sortedBookings.length}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} bookings`
              }
            />
          </div>
        )}
      </div>

      {/* Attendance Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <AntDesignCheckOutlined className="text-blue-600 text-lg" />
            </div>
            <span className="text-xl font-semibold">Mark Attendance</span>
          </div>
        }
        open={attendanceModal.visible}
        onOk={handleAttendanceSubmit}
        onCancel={() =>
          setAttendanceModal({
            visible: false,
            booking: null,
            sessionId: null,
            notes: "",
            status: "completed",
          })
        }
        okText="Submit Attendance"
        okButtonProps={{
          size: "large",
          className: "!h-11",
          loading: updateSessionMutation.isPending,
        }}
        cancelButtonProps={{ size: "large", className: "!h-11" }}
        width={650}
      >
        {attendanceModal.booking && (
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-5 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4 text-base">
                Customer Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 block mb-1">Name</span>
                  <span className="font-semibold text-gray-900">
                    {attendanceModal.booking?.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Mobile</span>
                  <span className="font-semibold text-gray-900">
                    {attendanceModal.booking?.mobile}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Time Slot</span>
                  <span className="font-semibold text-gray-900">
                    {attendanceModal.booking?.slot}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Course</span>
                  <span className="font-semibold text-gray-900">
                    {attendanceModal.booking?.course}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Attendance Status
              </label>
              <Space size="middle">
                <Button
                  type={
                    attendanceModal.status === "completed"
                      ? "primary"
                      : "default"
                  }
                  size="large"
                  icon={<AntDesignCheckOutlined />}
                  onClick={() =>
                    setAttendanceModal((prev) => ({
                      ...prev,
                      status: "completed",
                    }))
                  }
                  className={
                    attendanceModal.status === "completed"
                      ? "!bg-green-600 !border-green-600"
                      : ""
                  }
                >
                  Session Completed
                </Button>
                <Button
                  type={
                    attendanceModal.status === "no_show" ? "primary" : "default"
                  }
                  size="large"
                  danger={attendanceModal.status === "no_show"}
                  icon={<MaterialSymbolsFreeCancellation />}
                  onClick={() =>
                    setAttendanceModal((prev) => ({
                      ...prev,
                      status: "no_show",
                    }))
                  }
                >
                  No Show / Cancelled
                </Button>
              </Space>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Session Notes (Optional)
              </label>
              <TextArea
                rows={4}
                placeholder="Enter feedback, customer performance, areas of improvement, or any issues encountered during the session..."
                value={attendanceModal.notes}
                onChange={(e) =>
                  setAttendanceModal((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="!text-base"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DriverPage;
