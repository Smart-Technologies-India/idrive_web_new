"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Select,
  Space,
  Spin,
  Avatar,
  Progress,
  Modal,
  Timeline,
  Descriptions,
  Divider,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  CarOutlined,
  BookOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { getAllBookings, type Booking, type BookingSession } from "@/services/booking.api";

const { Search } = Input;

// Extended types for additional properties
interface ExtendedBookingSession extends BookingSession {
  deletedAt?: string;
  notes?: string;
}

interface BookingService {
  id: number;
  service?: {
    serviceName: string;
    servicePrice: number;
  };
}

interface ExtendedBooking extends Booking {
  bookingServices?: BookingService[];
}

interface Student {
  id: number;
  name: string;
  mobile: string;
  email: string;
  course: string;
  carName: string;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  cancelledSessions: number;
  progress: number;
  startDate: string;
  lastSession: string;
  status: "active" | "completed" | "inactive";
  bookingId: string;
}

const StudentsPage = () => {
  const userId: number = parseInt(getCookie("id")?.toString() || "0");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);

  // Fetch bookings data
  const {
    data: bookingsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["driverStudents", userId],
    queryFn: async () => {
      if (!userId || userId === 0) {
        throw new Error("User ID not found");
      }
      const data = await getAllBookings({});
      return data;
    },
    enabled: userId > 0,
  });

  // Transform bookings to students data
  const students: Student[] = useMemo(() => {
    if (!bookingsResponse?.data?.getAllBooking) return [];

    const bookingMap = new Map<string, Student>();

    bookingsResponse.data.getAllBooking.forEach((booking: Booking) => {
      // Filter sessions for this driver
      const driverSessions = (booking.sessions || []).filter(
        (session: BookingSession) => session.driver?.userId === userId
      );

      if (driverSessions.length === 0) return;

      const customerId = booking.customer?.id || booking.customerMobile;
      const key = `${customerId}-${booking.id}`;

      const completed = driverSessions.filter(
        (s: BookingSession) => s.status === "COMPLETED"
      ).length;
      const pending = driverSessions.filter(
        (s: BookingSession) =>
          s.status === "PENDING" || s.status === "CONFIRMED"
      ).length;
      const cancelled = driverSessions.filter(
        (s: BookingSession) => s.status === "CANCELLED" || s.status === "NO_SHOW"
      ).length;
      const total = driverSessions.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Get dates
      const sessionDates = driverSessions
        .map((s: BookingSession) => dayjs(s.sessionDate))
        .sort((a, b) => a.diff(b));
      const startDate = sessionDates[0]?.format("YYYY-MM-DD") || "";
      const lastSession =
        sessionDates[sessionDates.length - 1]?.format("YYYY-MM-DD") || "";

      // Determine status
      let status: "active" | "completed" | "inactive" = "inactive";
      if (completed === total && total > 0) {
        status = "completed";
      } else if (pending > 0) {
        status = "active";
      }

      bookingMap.set(key, {
        id: booking.id,
        name: booking.customer?.name || booking.customerName || "Unknown",
        mobile: booking.customer?.contact1 || booking.customerMobile,
        email: booking.customer?.email || booking.customerEmail || "N/A",
        course: booking.course?.courseName || booking.courseName,
        carName: booking.car?.carName || booking.carName,
        totalSessions: total,
        completedSessions: completed,
        pendingSessions: pending,
        cancelledSessions: cancelled,
        progress,
        startDate,
        lastSession,
        status,
        bookingId: booking.bookingId,
      });
    });

    return Array.from(bookingMap.values());
  }, [bookingsResponse, userId]);

  // Filter by status
  const filteredStudents = useMemo(() => {
    if (statusFilter === "all") return students;
    return students.filter((student) => student.status === statusFilter);
  }, [students, statusFilter]);

  // Define columns
  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Student Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              className="bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0"
            >
              {row.original.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{row.original.name}</p>
              <p className="text-xs text-gray-500">{row.original.bookingId}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "mobile",
        header: "Contact",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <PhoneOutlined className="text-green-600" />
              <a
                href={`tel:${row.original.mobile}`}
                className="text-gray-900 hover:text-blue-600"
              >
                {row.original.mobile}
              </a>
            </div>
            {row.original.email !== "N/A" && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MailOutlined />
                <span className="truncate max-w-[150px]">
                  {row.original.email}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOutlined className="text-blue-600" />
              <span className="font-medium text-gray-900">
                {row.original.course}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CarOutlined />
              <span>{row.original.carName}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="space-y-2">
            <Progress
              percent={row.original.progress}
              size="small"
              strokeColor={{
                "0%": "#3b82f6",
                "100%": "#8b5cf6",
              }}
            />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {row.original.completedSessions}/{row.original.totalSessions}{" "}
                completed
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const statusConfig = {
            active: { color: "blue", label: "Active" },
            completed: { color: "green", label: "Completed" },
            inactive: { color: "default", label: "Inactive" },
          };
          const config = statusConfig[row.original.status];
          return (
            <Tag color={config.color} className="!text-sm">
              {config.label}
            </Tag>
          );
        },
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarOutlined className="text-purple-600" />
            {dayjs(row.original.startDate).format("DD MMM YYYY")}
          </div>
        ),
      },
      {
        accessorKey: "lastSession",
        header: "Last Session",
        cell: ({ row }) => (
          <div className="text-sm text-gray-700">
            {row.original.lastSession
              ? dayjs(row.original.lastSession).format("DD MMM YYYY")
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "sessions",
        header: "Sessions",
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-semibold text-green-600">
                {row.original.completedSessions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-semibold text-orange-600">
                {row.original.pendingSessions}
              </span>
            </div>
            {row.original.cancelledSessions > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cancelled:</span>
                <span className="font-semibold text-red-600">
                  {row.original.cancelledSessions}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const booking = bookingsResponse?.data?.getAllBooking.find(
            (b: Booking) => b.id === row.original.id
          );
          return (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedBooking(booking || null);
                setViewModalOpen(true);
              }}
            >
              View
            </Button>
          );
        },
      },
    ],
    [bookingsResponse]
  );

  // Initialize table
  const table = useReactTable({
    data: filteredStudents,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading students..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all students learning from you
            </p>
          </div>
          <Button
            type="default"
            size="large"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">
                {students.length}
              </p>
            </div>
          </Card>
          <Card className="shadow-sm">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {students.filter((s) => s.status === "active").length}
              </p>
            </div>
          </Card>
          <Card className="shadow-sm">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Completed</p>
              <p className="text-3xl font-bold text-purple-600">
                {students.filter((s) => s.status === "completed").length}
              </p>
            </div>
          </Card>
          <Card className="shadow-sm">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Sessions</p>
              <p className="text-3xl font-bold text-orange-600">
                {students.reduce((acc, s) => acc + s.totalSessions, 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <Space size="middle" wrap>
              <Search
                placeholder="Search students..."
                allowClear
                size="large"
                style={{ width: 300 }}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                size="large"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: "All Students", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Completed", value: "completed" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </Space>
            <div className="text-sm text-gray-600">
              Showing {table.getRowModel().rows.length} of{" "}
              {filteredStudents.length} students
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-2"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      No students found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Space size="middle">
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </div>

      {/* View Booking Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <BookOutlined className="text-blue-600 text-xl" />
            <span className="text-xl font-semibold">Booking Details</span>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedBooking(null);
        }}
        footer={null}
        width={800}
        className="booking-details-modal"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Customer & Booking Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Booking ID" span={2}>
                  <Tag color="blue" className="!text-sm !font-semibold">
                    {selectedBooking.bookingId}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Customer Name">
                  {selectedBooking.customer?.name || selectedBooking.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Mobile">
                  <a href={`tel:${selectedBooking.customer?.contact1 || selectedBooking.customerMobile}`} className="text-blue-600">
                    <PhoneOutlined /> {selectedBooking.customer?.contact1 || selectedBooking.customerMobile}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>
                  {selectedBooking.customer?.email || selectedBooking.customerEmail || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>
                  {selectedBooking.customer?.address || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Course & Car Info */}
            <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Course">
                  <Tag color="green" className="!text-sm">
                    {selectedBooking.course?.courseName || selectedBooking.courseName}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Car">
                  <Tag color="purple" className="!text-sm">
                    <CarOutlined /> {selectedBooking.car?.carName || selectedBooking.carName}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Booking Date">
                  <CalendarOutlined /> {dayjs(selectedBooking.bookingDate).format("DD MMM YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Time Slot">
                  <ClockCircleOutlined /> {selectedBooking.slot}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Sessions Timeline */}
            <div>
              <Divider orientation="left" className="!text-base !font-semibold">
                <CalendarOutlined /> Session Timeline
              </Divider>
              <div className="max-h-96 overflow-y-auto">
                <Timeline
                  items={(selectedBooking.sessions || [])
                    .filter((session: BookingSession) => session.driver?.userId === userId)
                    .sort((a: BookingSession, b: BookingSession) => 
                      dayjs(a.sessionDate).diff(dayjs(b.sessionDate))
                    )
                    .map((session: BookingSession) => {
                      const statusConfig = {
                        COMPLETED: {
                          color: "green",
                          icon: <CheckCircleOutlined />,
                          label: "Completed",
                        },
                        PENDING: {
                          color: "orange",
                          icon: <ClockCircleOutlined />,
                          label: "Pending",
                        },
                        CONFIRMED: {
                          color: "blue",
                          icon: <ClockCircleOutlined />,
                          label: "Confirmed",
                        },
                        CANCELLED: {
                          color: "red",
                          icon: <CloseCircleOutlined />,
                          label: "Cancelled",
                        },
                        NO_SHOW: {
                          color: "red",
                          icon: <CloseCircleOutlined />,
                          label: "No Show",
                        },
                      };

                      const config = statusConfig[session.status as keyof typeof statusConfig] || {
                        color: "default",
                        icon: <ClockCircleOutlined />,
                        label: session.status,
                      };

                      return {
                        color: config.color,
                        dot: config.icon,
                        children: (
                          <div className="pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">
                                Day {session.dayNumber} - {dayjs(session.sessionDate).format("DD MMM YYYY")}
                              </span>
                              <Tag color={config.color} className="!text-sm">
                                {config.label}
                              </Tag>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <ClockCircleOutlined /> <strong>Slot:</strong> {session.slot}
                              </div>
                              {(session as ExtendedBookingSession).deletedAt && (
                                <div className="text-red-600">
                                  <CloseCircleOutlined /> <strong>Cancelled on:</strong>{" "}
                                  {dayjs((session as ExtendedBookingSession).deletedAt!).format("DD MMM YYYY, hh:mm A")}
                                </div>
                              )}
                              {session.instructorNotes && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                  <strong>Notes:</strong> {session.instructorNotes}
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      };
                    })}
                />
              </div>
            </div>

            {/* Services (if any) */}
            {selectedBooking.bookingServices && selectedBooking.bookingServices.length > 0 && (
              <div>
                <Divider orientation="left" className="!text-base !font-semibold">
                  Additional Services
                </Divider>
                <div className="grid grid-cols-1 gap-2">
                  {selectedBooking.bookingServices.map((bs: BookingService) => (
                    <Card key={bs.id} size="small" className="bg-orange-50 border-orange-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{bs.service?.serviceName}</span>
                        <Tag color="orange">₹{bs.service?.servicePrice}</Tag>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsPage;
