"use client";

import { useState, useMemo } from "react";
import { Card, Input, Button, Tag, Space, Select, Avatar } from "antd";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  AntDesignEyeOutlined,
  AntDesignEditOutlined,
  AntDesignPlusCircleOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  MaterialSymbolsPersonRounded,
  IcBaselineCalendarMonth,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedDrivers, type Driver } from "@/services/driver.api";
import { getCookie } from "cookies-next";
import { formatDate } from "@/utils/date-format";

const { Search } = Input;

interface DriverData {
  key: string;
  id: number;
  driverId: string;
  name: string;
  email: string | undefined;
  mobile: string;
  licenseNumber: string | undefined;
  experience: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rating: number;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "SUSPENDED";
  joiningDate: string;
}

const DriverManagementPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 10;

  // Fetch drivers from API
  const { data: driversResponse, isLoading, refetch } = useQuery({
    queryKey: ["drivers", schoolId, currentPage, pageSize, searchText, filterStatus, JSON.stringify(sorting)],
    queryFn: () => {
      // Convert TanStack sorting to backend orderBy format
      const orderBy = sorting.map((sort) => ({
        field: sort.id,
        direction: sort.desc ? ("desc" as const) : ("asc" as const),
      }));

      return getPaginatedDrivers({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
          filters: ["name", "email", "mobile", "licenseNumber", "driverId"],
          orderBy: orderBy.length > 0 ? orderBy : undefined,
        },
        whereSearchInput: {
          schoolId: schoolId,
          status: filterStatus == "all" ? undefined : filterStatus,
        },
      });
    },
    enabled: schoolId > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const drivers: DriverData[] = driversResponse?.data?.getPaginatedDriver?.data?.map((driver: Driver) => ({
    key: driver.id.toString(),
    id: driver.id,
    driverId: driver.driverId,
    name: driver.name,
    email: driver.email,
    mobile: driver.mobile,
    licenseNumber: driver.licenseNumber,
    experience: driver.experience,
    totalBookings: driver.totalBookings,
    completedBookings: driver.completedBookings,
    cancelledBookings: driver.cancelledBookings,
    rating: driver.rating,
    status: driver.status,
    joiningDate: driver.joiningDate,
  })) || [];

  const totalDrivers = driversResponse?.data?.getPaginatedDriver?.total || 0;

  // Define columns using TanStack Table
  const columns = useMemo<ColumnDef<DriverData>[]>(
    () => [
      {
        accessorKey: "driverId",
        header: "Driver ID",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        enableSorting: true,
      },
      {
        id: "driverDetails",
        header: "Driver Details",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              icon={<MaterialSymbolsPersonRounded />}
              className="bg-gradient-to-r from-green-600 to-teal-600 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {info.row.original.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {info.row.original.email}
              </div>
              <div className="text-xs text-gray-600">
                {info.row.original.mobile}
              </div>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "licenseNumber",
        header: "License Number",
        cell: (info) => (
          <span className="font-mono text-sm text-gray-700">
            {info.getValue() as string}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "experience",
        header: "Experience",
        cell: (info) => {
          const exp = info.getValue() as number;
          return (
            <Tag color="purple" className="!text-sm !px-3 !py-1">
              {exp} {exp === 1 ? "Year" : "Years"}
            </Tag>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "totalBookings",
        header: "Total Bookings",
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <IcBaselineCalendarMonth className="text-blue-600 text-lg" />
            <span className="font-medium">{info.getValue() as number}</span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "completedBookings",
        header: "Completed",
        cell: (info) => (
          <span className="font-medium text-green-600">
            {info.getValue() as number}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: (info) => {
          const rating = info.getValue() as number;
          return (
            <div className="flex items-center justify-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "SUSPENDED";
          const config = {
            ACTIVE: { color: "green", text: "Active" },
            INACTIVE: { color: "red", text: "Inactive" },
            ON_LEAVE: { color: "orange", text: "On Leave" },
            SUSPENDED: { color: "volcano", text: "Suspended" },
          };
          return (
            <Tag color={config[status].color} className="!text-sm !px-3 !py-1">
              {config[status].text}
            </Tag>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "joiningDate",
        header: "Joined Date",
        cell: (info) => formatDate(info.getValue() as string),
        enableSorting: true,
      },
      {
        id: "action",
        header: "Action",
        cell: (info) => (
          <Space>
            <Button
              type="default"
              icon={<AntDesignEyeOutlined />}
              onClick={() => router.push(`/mtadmin/driver/${info.row.original.id}`)}
            >
              View
            </Button>
            <Button
              type="primary"
              icon={<AntDesignEditOutlined />}
              onClick={() =>
                router.push(`/mtadmin/driver/${info.row.original.id}/edit`)
              }
              className="!bg-blue-600"
            >
              Edit
            </Button>
          </Space>
        ),
        enableSorting: false,
      },
    ],
    [router]
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: drivers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Backend handles pagination
    manualSorting: true, // Backend handles sorting
    pageCount: Math.ceil(totalDrivers / pageSize),
  });

  const stats = {
    total: totalDrivers,
    active: drivers.filter((d) => d.status === "ACTIVE").length,
    inactive: drivers.filter((d) => d.status === "INACTIVE").length,
    onLeave: drivers.filter((d) => d.status === "ON_LEAVE").length,
    avgRating: drivers.length > 0 
      ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)
      : "0.0",
  };

  // Calculate pagination info for display
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalDrivers);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Driver Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage and view all registered drivers
              </p>
            </div>
            <Space>
              <Button
                type="default"
                icon={<IcBaselineRefresh className="text-lg" />}
                size="large"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<AntDesignPlusCircleOutlined className="text-lg" />}
                size="large"
                onClick={() => router.push("/mtadmin/driver/add")}
                className="!bg-green-600"
              >
                Add New Driver
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-orange-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">On Leave</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.onLeave}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-red-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Inactive Drivers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgRating}
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div></div>

        {/* Filters and Search */}
        <Card className="shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Search
                placeholder="Search by name, email, mobile, license or driver ID..."
                allowClear
                size="large"
                prefix={<FluentMdl2Search className="text-gray-400" />}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Space size="middle">
              <Select
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
                style={{ width: 150 }}
                size="large"
                options={[
                  { label: "All Drivers", value: "all" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "On Leave", value: "ON_LEAVE" },
                  { label: "Inactive", value: "INACTIVE" },
                  { label: "Suspended", value: "SUSPENDED" },
                ]}
              />
            </Space>
          </div>
        </Card>
        <div></div>

        {/* Drivers Table */}
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
                      No drivers found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.original.id}
                      className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
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
              {drivers.length > 0 ? (
                <>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalDrivers)}{" "}
                  of {totalDrivers} drivers
                </>
              ) : (
                <>No drivers to display</>
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
                Page {currentPage} of {Math.ceil(totalDrivers / pageSize)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalDrivers / pageSize), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalDrivers / pageSize)}
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

export default DriverManagementPage;
