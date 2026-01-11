"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Space,
  Select,
  Progress,
  Alert,
  Switch,
} from "antd";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import type { Booking } from "@/services/booking.api";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedBookings } from "@/services/booking.api";
import { getTotalPaidAmount } from "@/services/payment.api";
import { getCookie } from "cookies-next";
import { WarningOutlined } from "@ant-design/icons";
import { convertSlotTo12Hour } from "@/utils/time-format";
import { encryptURLData } from "@/utils/methods";
import { formatDate } from "@/utils/date-format";

const { Search } = Input;

// Payment Status Cell Component
const PaymentStatusCell = ({
  bookingId,
  totalAmount,
  booking,
  onUrgencyDetected,
}: {
  bookingId: number;
  totalAmount: number;
  booking: Booking;
  onUrgencyDetected?: (
    bookingId: number,
    isUrgent: boolean,
    daysUntilEnd: number
  ) => void;
}) => {
  const { data: paidData } = useQuery({
    queryKey: ["payment-total", bookingId],
    queryFn: () => getTotalPaidAmount(bookingId),
    enabled: !!bookingId,
  });

  const totalPaid = paidData?.data?.getTotalPaidAmount || 0;
  const remaining = totalAmount - totalPaid;
  const percentage =
    totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Check if urgent - bookings that have started and haven't paid full fees
  const { isUrgent, daysUntilEnd } = useMemo(() => {
    if (!booking.sessions || booking.sessions.length == 0)
      return { isUrgent: false, daysUntilEnd: 999 };

    // Get first and last session dates
    const firstSession = booking.sessions.reduce((earliest, session) => {
      const sessionDate = new Date(session.sessionDate);
      return sessionDate < earliest ? sessionDate : earliest;
    }, new Date(booking.sessions[0].sessionDate));

    const lastSession = booking.sessions.reduce((latest, session) => {
      const sessionDate = new Date(session.sessionDate);
      return sessionDate > latest ? sessionDate : latest;
    }, new Date(0));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

    // Check if booking has started (first session has passed)
    const hasStarted = firstSession.getTime() < today.getTime();

    // Calculate days since completion (negative if last session has passed)
    const daysSinceCompletion = Math.ceil(
      (lastSession.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if payment is outstanding
    const hasOutstandingPayment = totalPaid < totalAmount;

    // Urgent if: started + outstanding payment
    const urgent = hasStarted && hasOutstandingPayment;

    return { isUrgent: urgent, daysUntilEnd: daysSinceCompletion };
  }, [booking.sessions, totalPaid, totalAmount]);

  // Notify parent component of urgency status
  useEffect(() => {
    let mounted = true;
    if (onUrgencyDetected && mounted) {
      onUrgencyDetected(bookingId, isUrgent, daysUntilEnd);
    }
    return () => {
      mounted = false;
    };
  }, [bookingId, isUrgent, daysUntilEnd, onUrgencyDetected]);

  return (
    <div className="space-y-1">
      {isUrgent && (
        <div className="flex items-center gap-1 mb-1">
          <WarningOutlined className="text-red-500" />
          <span className="text-xs text-red-600 font-semibold">
            {daysUntilEnd < 0
              ? `URGENT - Completed ${Math.abs(daysUntilEnd)} day${
                  Math.abs(daysUntilEnd) !== 1 ? "s" : ""
                } ago`
              : `URGENT - Course started, ${daysUntilEnd} day${
                  daysUntilEnd !== 1 ? "s" : ""
                } left`}
          </span>
        </div>
      )}
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">
          Paid: ₹{totalPaid.toLocaleString("en-IN")}
        </span>
        <span className="text-red-600 font-semibold">
          Due: ₹{remaining.toLocaleString("en-IN")}
        </span>
      </div>
      <Progress
        percent={percentage}
        size="small"
        status={percentage == 100 ? "success" : "active"}
      />
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
  const [urgentBookingIds, setUrgentBookingIds] = useState<Set<number>>(
    new Set()
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 10;

  // Fetch bookings
  const {
    data: bookingsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "booking-list",
      schoolId,
      searchText,
      filterStatus,
      currentPage,
      JSON.stringify(sorting), // Stringify to ensure React Query detects changes
    ],
    queryFn: () => {
      // Convert TanStack sorting to backend orderBy format
      const orderBy = sorting.map((sort) => ({
        field: sort.id,
        direction: sort.desc ? ("desc" as const) : ("asc" as const),
      }));

      return getPaginatedBookings({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
          filters: ["customerMobile", "customerName", "carName"],
          ...(orderBy.length > 0 ? { orderBy } : {}),
        },
        whereSearchInput: {
          schoolId,
          status: filterStatus !== "all" ? filterStatus : undefined,
        },
      });
    },
    enabled: schoolId > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const allBookings = useMemo(() => {
    return bookingsResponse?.data?.getPaginatedBooking?.data || [];
  }, [bookingsResponse]);

  const totalBookings = bookingsResponse?.data?.getPaginatedBooking?.total || 0;

  // Callback to track urgent bookings (memoized to prevent re-renders)
  const handleUrgencyDetected = useCallback(
    (bookingId: number, isUrgent: boolean) => {
      setUrgentBookingIds((prev) => {
        const newSet = new Set(prev);
        if (isUrgent) {
          newSet.add(bookingId);
        } else {
          newSet.delete(bookingId);
        }
        return newSet;
      });
    },
    []
  );

  // Filter bookings based on urgent flag
  const bookings = useMemo(() => {
    return showUrgentOnly
      ? allBookings.filter((booking) => urgentBookingIds.has(booking.id))
      : allBookings;
  }, [allBookings, showUrgentOnly, urgentBookingIds]);

  // Calculate the correct total for pagination
  const displayTotal = useMemo(() => {
    if (!showUrgentOnly) return totalBookings;
    return bookings.length;
  }, [showUrgentOnly, totalBookings, bookings.length]);

  // Define columns using TanStack Table
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Booking>();

    return [
      columnHelper.accessor("bookingId", {
        header: "Booking ID",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("customerName", {
        header: "Customer",
        cell: (info) => (
          <div>
            <div className="font-semibold text-gray-900">
              {info.getValue() || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              {info.row.original.customerMobile}
            </div>
          </div>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("courseName", {
        header: "Course",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("carName", {
        header: "Car",
        cell: (info) => info.getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("bookingDate", {
        header: "Date",
        cell: (info) => formatDate(info.getValue()),
        enableSorting: true,
      }),
      columnHelper.accessor("slot", {
        header: "Slot",
        cell: (info) => convertSlotTo12Hour(info.getValue()),
        enableSorting: false,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <Tag
              color={
                status === "COMPLETED"
                  ? "green"
                  : status === "CANCELLED"
                  ? "red"
                  : "blue"
              }
            >
              {status}
            </Tag>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor("totalAmount", {
        header: "Amount",
        cell: (info) => `₹${info.getValue().toLocaleString("en-IN")}`,
        enableSorting: false,
      }),
      columnHelper.display({
        id: "paymentStatus",
        header: "Payment Status",
        cell: (info) => (
          <PaymentStatusCell
            bookingId={info.row.original.id}
            totalAmount={info.row.original.totalAmount}
            booking={info.row.original}
            onUrgencyDetected={handleUrgencyDetected}
          />
        ),
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => (
          <Button
            type="primary"
            onClick={() => {
              const encodedId = encryptURLData(info.row.original.id.toString());
              router.push(`/mtadmin/bookinglist/${encodedId}`);
            }}
          >
            View
          </Button>
        ),
      }),
    ];
  }, [handleUrgencyDetected, router]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Use manual pagination since backend handles it
    manualSorting: true, // Use manual sorting since backend handles it
  });

  // Calculate pagination info for display
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, displayTotal);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking List</h1>
            <p className="text-gray-600 mt-1 text-sm">
              All bookings for your school
            </p>
          </div>
          <Button type="default" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        {urgentBookingIds.size > 0 && (
          <Alert
            message={`${urgentBookingIds.size} Urgent Payment${
              urgentBookingIds.size > 1 ? "s" : ""
            } Required`}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-2"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="text-xs">
                                {{
                                  asc: "↑",
                                  desc: "↓",
                                }[header.column.getIsSorted() as string] ?? "↕"}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.original.id}
                      className={`border-b border-gray-200 transition-colors ${
                        urgentBookingIds.has(row.original.id)
                          ? "bg-red-50 hover:bg-red-100"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
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
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-700">
              {bookings.length > 0 ? (
                <>
                  Showing {startIndex + 1} to {Math.min(endIndex, displayTotal)}{" "}
                  of {displayTotal} bookings
                </>
              ) : (
                <>No bookings to display</>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {Math.ceil(displayTotal / pageSize)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(displayTotal / pageSize), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(displayTotal / pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BookingListPage;
