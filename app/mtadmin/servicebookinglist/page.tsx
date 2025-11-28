"use client";

import { useState, useMemo } from "react";
import { Card, Input, Button, Tag, Space, Select } from "antd";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedBookingServices } from "@/services/service.booking.api";
import type { BookingService } from "@/services/service.booking.api";
import { getCookie } from "cookies-next";
import { PlusOutlined } from "@ant-design/icons";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";

const { Search } = Input;

const ServiceBookingListPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const [searchText, setSearchText] = useState("");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch booking services
  const {
    data: bookingServicesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "service-booking-list",
      schoolId,
      searchText,
      filterServiceType,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      getPaginatedBookingServices({
        searchPaginationInput: {
          skip: pagination.pageIndex * pagination.pageSize,
          take: pagination.pageSize,
          search: searchText,
        },
        whereSearchInput: {
          schoolId,
          serviceType:
            filterServiceType !== "all" ? filterServiceType : undefined,
        },
      }),
    enabled: schoolId > 0,
  });

  const bookingServices =
    bookingServicesResponse?.data?.getPaginatedBookingService?.data || [];
  const totalBookingServices =
    bookingServicesResponse?.data?.getPaginatedBookingService?.total || 0;

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<BookingService>[]>(
    () => [
      {
        accessorKey: "confirmationNumber",
        header: "Confirmation #",
        cell: (info) => (
          <span className="font-medium text-blue-600">
            {(info.getValue() as string) || "N/A"}
          </span>
        ),
        size: 140,
      },
      {
        accessorKey: "user",
        header: "Customer",
        cell: (info) => {
          const user = info.getValue() as BookingService["user"];
          return (
            <div>
              <div className="font-semibold text-gray-900">
                {user?.name || "N/A"}
              </div>
              <div className="text-xs text-gray-500">
                {user?.contact1 || ""}
              </div>
            </div>
          );
        },
        size: 200,
        enableSorting: false,
      },
      {
        accessorKey: "serviceName",
        header: "Service Name",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        size: 200,
      },
      {
        accessorKey: "serviceType",
        header: "Type",
        cell: (info) => (
          <Tag color={info.getValue() === "LICENSE" ? "green" : "blue"}>
            {info.getValue() as string}
          </Tag>
        ),
        size: 100,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: (info) => (
          <span className="font-semibold text-green-600">
            ₹{(info.getValue() as number).toFixed(2)}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "booking",
        header: "Booking Reference",
        cell: (info) => {
          const booking = info.getValue() as BookingService["booking"];
          return booking ? (
            <span className="text-sm text-blue-600">{booking.bookingId}</span>
          ) : (
            <span className="text-xs text-gray-400">Direct Service</span>
          );
        },
        size: 150,
        enableSorting: false,
      },
      {
        accessorKey: "createdAt",
        header: "Booked Date",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        size: 120,
      },
      {
        id: "actions",
        header: "Action",
        cell: (info) => (
          <Button
            type="primary"
            size="small"
            onClick={() =>
              router.push(`/mtadmin/servicebookinglist/${info.row.original.id}`)
            }
          >
            View
          </Button>
        ),
        size: 100,
        enableSorting: false,
      },
    ],
    [router]
  );

  // Create table instance
  const table = useReactTable({
    data: bookingServices,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalBookingServices / pagination.pageSize),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Service Booking List
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              All service bookings for your school
            </p>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/mtadmin/servicebooking")}
            >
              New Service Booking
            </Button>
            <Button type="default" onClick={() => refetch()}>
              Refresh
            </Button>
          </Space>
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        <Card className="shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Search
                placeholder="Search by customer, service, or confirmation number..."
                allowClear
                size="large"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
              />
            </div>
            <Space size="middle">
              <Select
                value={filterServiceType}
                onChange={(value) => {
                  setFilterServiceType(value);
                  setPagination({ ...pagination, pageIndex: 0 });
                }}
                style={{ width: 150 }}
                size="large"
                options={[
                  { label: "All Types", value: "all" },
                  { label: "License", value: "LICENSE" },
                  { label: "Add-on", value: "ADDON" },
                ]}
              />
            </Space>
          </div>
        </Card>
        <div></div>

        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50"
                        style={{ width: header.getSize() }}
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
                            {header.column.getCanSort() && (
                              <span className="text-gray-400">
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
                      No service bookings found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-sm text-gray-900"
                        >
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalBookingServices
              )}{" "}
              of {totalBookingServices} service bookings
            </div>
            <Space>
              <Button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                First
              </Button>
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
              <Button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                Last
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceBookingListPage;
