"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Avatar,
  Dropdown,
  Space,
  Modal,
  Input,
  message,
  Select,
  Pagination,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import type { MenuProps } from "antd";
import {
  AntDesignCheckOutlined,
  Fa6RegularClock,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsLogout,
  IcBaselineAccountCircle,
  MaterialSymbolsLocationOn,
  MaterialSymbolsCall,
  MaterialSymbolsFreeCancellation,
  IcBaselineRefresh,
  AntDesignCloseCircleOutlined,
  MaterialSymbolsCheckCircle,
  Fa6RegularHourglassHalf,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

interface BookingSlot {
  key: string;
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
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const pageSize = 10;
  const [bookings, setBookings] = useState<BookingSlot[]>([
    {
      key: "1",
      bookingId: "BK-2024-001",
      customerName: "Rajesh Kumar",
      mobile: "9876543210",
      address: "House No. 123, Sector 15, Rohini, New Delhi - 110085",
      course: "Basic Driving",
      slot: "09:00 AM - 10:00 AM",
      date: dayjs().format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "2",
      bookingId: "BK-2024-002",
      customerName: "Priya Sharma",
      mobile: "9876543211",
      address: "Flat 45, Green Park Apartments, Dwarka, New Delhi - 110075",
      course: "Advanced Driving",
      slot: "10:00 AM - 11:00 AM",
      date: dayjs().format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "completed",
      attendanceMarked: true,
      attendanceNotes: "Session completed successfully",
    },
    {
      key: "3",
      bookingId: "BK-2024-003",
      customerName: "Amit Singh",
      mobile: "9876543212",
      address: "B-67, Janakpuri, Near Metro Station, New Delhi - 110058",
      course: "Highway Driving",
      slot: "11:00 AM - 12:00 PM",
      date: dayjs().format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "4",
      bookingId: "BK-2024-004",
      customerName: "Sneha Reddy",
      mobile: "9876543213",
      address: "Tower 3, Apartment 901, Vasant Kunj, New Delhi - 110070",
      course: "Basic Driving",
      slot: "02:00 PM - 03:00 PM",
      date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "5",
      bookingId: "BK-2024-005",
      customerName: "Vikram Patel",
      mobile: "9876543214",
      address: "Plot 89, Saket, Near Hospital, New Delhi - 110017",
      course: "Parking Practice",
      slot: "03:00 PM - 04:00 PM",
      date: dayjs().add(2, "day").format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "cancelled",
      attendanceMarked: false,
    },
    {
      key: "6",
      bookingId: "BK-2024-006",
      customerName: "Neha Gupta",
      mobile: "9876543215",
      address: "House 234, Pitampura, Near Mall, New Delhi - 110034",
      course: "Basic Driving",
      slot: "04:00 PM - 05:00 PM",
      date: dayjs().add(3, "day").format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "7",
      bookingId: "BK-2024-007",
      customerName: "Arjun Verma",
      mobile: "9876543216",
      address: "A-45, Model Town, New Delhi - 110009",
      course: "Advanced Driving",
      slot: "09:00 AM - 10:00 AM",
      date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "8",
      bookingId: "BK-2024-008",
      customerName: "Kavya Nair",
      mobile: "9876543217",
      address: "C-12, Connaught Place, New Delhi - 110001",
      course: "Basic Driving",
      slot: "11:00 AM - 12:00 PM",
      date: dayjs().add(4, "day").format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "9",
      bookingId: "BK-2024-009",
      customerName: "Rohan Malhotra",
      mobile: "9876543218",
      address: "D-78, Defence Colony, New Delhi - 110024",
      course: "Highway Driving",
      slot: "01:00 PM - 02:00 PM",
      date: dayjs().add(5, "day").format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "10",
      bookingId: "BK-2024-010",
      customerName: "Meera Kapoor",
      mobile: "9876543219",
      address: "E-23, Greater Kailash, New Delhi - 110048",
      course: "Parking Practice",
      slot: "03:00 PM - 04:00 PM",
      date: dayjs().add(6, "day").format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "11",
      bookingId: "BK-2024-011",
      customerName: "Siddharth Roy",
      mobile: "9876543220",
      address: "F-56, Hauz Khas, New Delhi - 110016",
      course: "Basic Driving",
      slot: "10:00 AM - 11:00 AM",
      date: dayjs().format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "pending",
      attendanceMarked: false,
    },
    {
      key: "12",
      bookingId: "BK-2024-012",
      customerName: "Ananya Das",
      mobile: "9876543221",
      address: "G-90, Lajpat Nagar, New Delhi - 110024",
      course: "Advanced Driving",
      slot: "02:00 PM - 03:00 PM",
      date: dayjs().format("YYYY-MM-DD"),
      carName: "Swift Dzire - DL01AB1234",
      status: "completed",
      attendanceMarked: true,
      attendanceNotes: "Excellent progress",
    },
  ]);

  const [attendanceModal, setAttendanceModal] = useState({
    visible: false,
    booking: null as BookingSlot | null,
    notes: "",
    status: "completed" as "completed" | "cancelled",
  });

  // Filter bookings by date and status
  const filteredBookings = bookings.filter((booking) => {
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
  const dateFilteredBookings = bookings.filter((booking) => {
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

  // Disable dates outside the 7-day range
  const disabledDate = (current: dayjs.Dayjs) => {
    const today = dayjs().startOf("day");
    const maxDate = dayjs().add(7, "day").endOf("day");
    return current < today || current > maxDate;
  };

  const handleMarkAttendance = (booking: BookingSlot) => {
    setAttendanceModal({
      visible: true,
      booking,
      notes: "",
      status: "completed",
    });
  };

  const handleAttendanceSubmit = () => {
    if (!attendanceModal.booking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.key === attendanceModal.booking?.key
          ? {
              ...b,
              status: attendanceModal.status,
              attendanceMarked: true,
              attendanceNotes: attendanceModal.notes,
            }
          : b
      )
    );

    message.success(
      `Attendance marked as ${attendanceModal.status} for ${attendanceModal.booking.customerName}`
    );

    setAttendanceModal({
      visible: false,
      booking: null,
      notes: "",
      status: "completed",
    });
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <MaterialSymbolsPersonRounded className="text-lg" />,
      label: "Profile",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <MaterialSymbolsLogout className="text-lg" />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "logout") {
      router.push("/login");
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Driver Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="default"
                icon={<IcBaselineRefresh className="text-lg" />}
                size="large"
              >
                Refresh
              </Button>
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all border border-gray-200">
                  <Avatar
                    size={40}
                    icon={<IcBaselineAccountCircle />}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  />
                  <div className="text-left hidden md:block">
                    <p className="text-gray-900 font-semibold text-sm">
                      Ramesh Kumar
                    </p>
                    <p className="text-gray-500 text-xs">Driver ID: DRV-001</p>
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        <Row gutter={[20, 20]}>
          <Col xs={12} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
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
            <Card bordered={false} className="shadow-sm">
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
            <Card bordered={false} className="shadow-sm">
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
            <Card bordered={false} className="shadow-sm">
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
        <Card bordered={false} className="shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-700 font-medium">Date:</span>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCurrentPage(1);
                    }
                  }}
                  disabledDate={disabledDate}
                  format="DD MMM YYYY"
                  size="large"
                  className="!w-[180px]"
                />
                <div className="flex gap-2">
                  <Button
                    type={selectedDate.isSame(dayjs(), "day") ? "primary" : "default"}
                    onClick={() => {
                      setSelectedDate(dayjs());
                      setCurrentPage(1);
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedDate(selectedDate.add(1, "day"));
                      setCurrentPage(1);
                    }}
                    disabled={selectedDate.isAfter(dayjs().add(6, "day"), "day")}
                  >
                    Next Day
                  </Button>
                </div>
              </div>
            </div>
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
          </div>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {paginatedBookings.length === 0 && (
            <Card bordered={false} className="shadow-sm">
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
          )}
          {paginatedBookings.map((booking) => (
            <Card
              key={booking.key}
              bordered={false}
              className="shadow-sm hover:shadow transition-all"
            >
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
                          <span className="font-medium text-gray-900">
                            ID:
                          </span>{" "}
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
                        onClick={() => handleMarkAttendance(booking)}
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
          ))}
        </div>

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
            notes: "",
            status: "completed",
          })
        }
        okText="Submit Attendance"
        okButtonProps={{ size: "large", className: "!h-11" }}
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
                    {attendanceModal.booking.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Mobile</span>
                  <span className="font-semibold text-gray-900">
                    {attendanceModal.booking.mobile}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Time Slot</span>
                  <span className="font-semibold text-gray-900">
                    {attendanceModal.booking.slot}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Course</span>
                  <span className="font-semibold text-gray-900">
                    {attendanceModal.booking.course}
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
                    attendanceModal.status === "cancelled"
                      ? "primary"
                      : "default"
                  }
                  size="large"
                  danger={attendanceModal.status === "cancelled"}
                  icon={<MaterialSymbolsFreeCancellation />}
                  onClick={() =>
                    setAttendanceModal((prev) => ({
                      ...prev,
                      status: "cancelled",
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
