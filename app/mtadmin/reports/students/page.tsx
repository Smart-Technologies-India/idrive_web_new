"use client";

import { useMemo, useState } from "react";
import { Avatar, Button, Card, Input, Select, Space, Tag } from "antd";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  MaterialSymbolsPersonRounded,
  Fa6SolidAngleLeft,
} from "@/components/icons";
import { getAllBookings, type Booking } from "@/services/booking.api";

const { Search } = Input;

interface StudentRow {
  key: string;
  studentKey: string;
  customerId?: number;
  fullName: string;
  name: string;
  mobile: string;
  altMobile: string;
  address: string;
  location: string;
  carDetails: string[];
  instructorDetails: string[];
  totalBookings: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  firstBookingDate: string;
  lastBookingDate: string;
}

const getStudentKey = (booking: Booking) => {
  if (booking.customerId) return `id-${booking.customerId}`;
  return `mobile-${booking.customer?.contact1 || booking.customerMobile || "unknown"}`;
};

const getFullName = (booking: Booking) => {
  const firstName = booking.customer?.name?.trim() || booking.customerName?.trim() || "";
  const surname = booking.customer?.surname?.trim() || "";
  const fullName = [firstName, surname].filter(Boolean).join(" ").trim();
  return fullName || "Unknown Student";
};

const StudentReportListPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  const [searchText, setSearchText] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: bookingsResponse, isLoading, refetch } = useQuery({
    queryKey: ["student-report-list", schoolId],
    queryFn: () => getAllBookings({ schoolId }),
    enabled: schoolId > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo<StudentRow[]>(() => {
    const bookings = bookingsResponse?.data?.getAllBooking || [];
    const grouped = new Map<string, Booking[]>();

    bookings.forEach((booking: Booking) => {
      const key = getStudentKey(booking);
      const current = grouped.get(key) || [];
      grouped.set(key, [...current, booking]);
    });

    return Array.from(grouped.entries()).map(([studentKey, studentBookings]) => {
      const first = studentBookings[0];
      const sortedByDate = [...studentBookings].sort(
        (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
      );

      const totalAmount = studentBookings.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
      );
      const paidAmount = studentBookings.reduce((sum, booking) => {
        const paid =
          booking.payments?.reduce(
            (paymentSum: number, payment: { id: number; amount: number }) =>
              paymentSum + (payment.amount || 0),
            0
          ) || 0;
        return sum + paid;
      }, 0);

      const carDetails = Array.from(
        new Set(
          studentBookings
            .map((booking) => {
              const carName = booking.car?.carName || booking.carName;
              const model = booking.car?.model;
              const registration = booking.car?.registrationNumber;
              return [carName, model, registration].filter(Boolean).join(" • ").trim();
            })
            .filter(Boolean)
        )
      );

      const instructorDetails = Array.from(
        new Set(
          studentBookings
            .flatMap((booking) => booking.sessions || [])
            .map((session) => {
              const instructorName = session.driver?.name;
              const instructorId = session.driver?.driverId;
              const instructorMobile = session.driver?.mobile;
              if (!instructorName && !instructorId && !instructorMobile) return "";
              return [
                instructorName
                  ? `${instructorName}${instructorId ? ` (${instructorId})` : ""}`
                  : instructorId,
                instructorMobile,
              ]
                .filter(Boolean)
                .join(" • ")
                .trim();
            })
            .filter(Boolean)
        )
      );

      const fullName = getFullName(first);

      return {
        key: studentKey,
        studentKey,
        customerId: first.customerId,
        fullName,
        name: fullName,
        mobile: first.customer?.contact1 || first.customerMobile || "-",
        altMobile: first.customer?.contact2 || "-",
        address: first.customer?.address || "-",
        location: first.customer?.address || "-",
        carDetails,
        instructorDetails,
        totalBookings: studentBookings.length,
        totalAmount,
        paidAmount,
        balance: Math.max(totalAmount - paidAmount, 0),
        firstBookingDate: sortedByDate[0]?.createdAt,
        lastBookingDate: sortedByDate[sortedByDate.length - 1]?.createdAt,
      };
    });
  }, [bookingsResponse]);

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return rows.filter((row) => {
      const isSearchMatch =
        !search ||
        row.fullName.toLowerCase().includes(search) ||
        row.mobile.toLowerCase().includes(search) ||
        row.altMobile.toLowerCase().includes(search) ||
        row.carDetails.some((car) => car.toLowerCase().includes(search)) ||
        row.instructorDetails.some((instructor) => instructor.toLowerCase().includes(search));

      const isBalanceMatch =
        balanceFilter === "all" ||
        (balanceFilter === "pending" && row.balance > 0) ||
        (balanceFilter === "paid" && row.balance === 0);

      return isSearchMatch && isBalanceMatch;
    });
  }, [rows, searchText, balanceFilter]);

  const columns = useMemo<ColumnDef<StudentRow>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              icon={<MaterialSymbolsPersonRounded />}
              className="bg-linear-to-r from-blue-600 to-indigo-600 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">{info.row.original.fullName}</div>
              <div className="text-xs text-gray-600 truncate">{info.row.original.mobile}</div>
              <div className="text-xs text-gray-500 truncate">{info.row.original.altMobile}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "carDetails",
        header: "Car Details",
        cell: (info) => {
          const cars = info.getValue() as string[];
          if (!cars || cars.length === 0) {
            return <span className="text-gray-400">-</span>;
          }

          return (
            <div className="space-y-1 min-w-[220px]">
              {cars.slice(0, 2).map((car) => (
                <div key={car} className="text-xs text-gray-700 truncate" title={car}>
                  {car}
                </div>
              ))}
              {cars.length > 2 && (
                <div className="text-xs text-gray-500">+{cars.length - 2} more</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "instructorDetails",
        header: "Instructor Details",
        cell: (info) => {
          const instructors = info.getValue() as string[];
          if (!instructors || instructors.length === 0) {
            return <span className="text-gray-400">-</span>;
          }

          return (
            <div className="space-y-1 min-w-[220px]">
              {instructors.slice(0, 2).map((instructor) => (
                <div key={instructor} className="text-xs text-gray-700 truncate" title={instructor}>
                  {instructor}
                </div>
              ))}
              {instructors.length > 2 && (
                <div className="text-xs text-gray-500">+{instructors.length - 2} more</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "totalBookings",
        header: "Bookings",
      },
      {
        accessorKey: "totalAmount",
        header: "Amount",
        cell: (info) => `₹${(info.getValue() as number).toLocaleString("en-IN")}`,
      },
      {
        accessorKey: "paidAmount",
        header: "Paid",
        cell: (info) => `₹${(info.getValue() as number).toLocaleString("en-IN")}`,
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <Tag color={value > 0 ? "red" : "green"}>
              ₹{value.toLocaleString("en-IN")}
            </Tag>
          );
        },
      },
      {
        accessorKey: "lastBookingDate",
        header: "Last Booking",
        cell: (info) => dayjs(info.getValue() as string).format("DD MMM YYYY"),
      },
      {
        id: "action",
        header: "Action",
        cell: (info) => (
          <Button
            type="primary"
            icon={<AntDesignEyeOutlined />}
            onClick={() => router.push(`/mtadmin/reports/students/${encodeURIComponent(info.row.original.studentKey)}`)}
          >
            View Report
          </Button>
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalRows = table.getRowModel().rows;
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = totalRows.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 space-y-6">
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form - 15</h1>
            <p className="text-gray-600 text-sm mt-1">All students with quick report access</p>
          </div>
          <Space>
            <Button
              icon={<Fa6SolidAngleLeft />}
              onClick={() => router.push("/mtadmin/reports")}
            >
              Back to Reports
            </Button>
            <Button icon={<IcBaselineRefresh />} onClick={() => refetch()}>
              Refresh
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <Search
              placeholder="Search by student name or mobile"
              allowClear
              prefix={<FluentMdl2Search className="text-gray-400" />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              size="large"
            />
          </div>
          <Select
            value={balanceFilter}
            onChange={(value) => {
              setBalanceFilter(value);
              setCurrentPage(1);
            }}
            size="large"
            style={{ width: 220 }}
            options={[
              { label: "All Students", value: "all" },
              { label: "Pending Balance", value: "pending" },
              { label: "Fully Paid", value: "paid" },
            ]}
          />
        </div>
      </Card>

      <Card className="shadow-sm" loading={isLoading}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
              {pageRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle text-sm text-gray-800">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalRows.length > pageSize && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, totalRows.length)} of {totalRows.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <span className="px-2">Page {currentPage}</span>
              <Button
                disabled={startIndex + pageSize >= totalRows.length}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentReportListPage;
