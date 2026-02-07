"use client";

import { useState, useMemo } from "react";
import { Card, Input, Button, Tag, Space, Select } from "antd";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedBookingServices } from "@/services/service.booking.api";
import type { BookingService } from "@/services/service.booking.api";
import { getCookie } from "cookies-next";
import { PlusOutlined } from "@ant-design/icons";
import { formatDateShort } from "@/utils/date-format";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { encryptURLData } from "@/utils/methods";

const { Search } = Input;

const ServiceBookingListPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const [searchText, setSearchText] = useState("");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 10;

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
      currentPage,
      JSON.stringify(sorting), // Stringify to ensure React Query detects changes
    ],
    queryFn: () => {
      // Convert TanStack sorting to backend orderBy format
      const orderBy = sorting.map((sort) => ({
        field: sort.id,
        direction: sort.desc ? ("desc" as const) : ("asc" as const),
      }));

      return getPaginatedBookingServices({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
          filters: [
            "serviceName",
            "confirmationNumber",
            "user.name",
            "user.surname",
            "user.contact1",
          ],
          orderBy: orderBy.length > 0 ? orderBy : undefined,
        },
        whereSearchInput: {
          schoolId,
          serviceType:
            filterServiceType !== "all" ? filterServiceType : undefined,
        },
      });
    },
    enabled: schoolId > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const bookingServices =
    bookingServicesResponse?.data?.getPaginatedBookingService?.data || [];
  const totalBookingServices =
    bookingServicesResponse?.data?.getPaginatedBookingService?.total || 0;

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<BookingService>[]>(
    () => [
      {
        accessorKey: "licenseApplications",
        header: "License Status",
        cell: (info) => {
          const licenseApps =
            info.getValue() as BookingService["licenseApplications"];
          if (!licenseApps || licenseApps.length === 0) {
            return (
              <span className="text-xs text-gray-400">
                No License Application
              </span>
            );
          }
          const statusColors: Record<string, string> = {
            PENDING: "orange",
            LL_APPLIED: "blue",
            DL_PENDING: "purple",
            DL_APPLIED: "cyan",
            CLOSED: "green",
          };
          // Show the first license application status
          const firstApp = licenseApps[0];
          return (
            <div className="flex flex-col gap-1">
              <Tag color={statusColors[firstApp.status] || "default"}>
                {firstApp.status.replace(/_/g, " ")}
              </Tag>
              {licenseApps.length > 1 && (
                <span className="text-xs text-gray-500">
                  +{licenseApps.length - 1} more
                </span>
              )}
            </div>
          );
        },
        size: 140,
      },
      {
        accessorKey: "user",
        header: "Customer",
        cell: (info) => {
          const user = info.getValue() as BookingService["user"];
          const fullName = [user?.name, user?.surname]
            .filter(Boolean)
            .join(" ");
          return (
            <div>
              <div className="font-semibold text-gray-900">
                {fullName || "N/A"}
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
        accessorKey: "schoolService",
        header: "Category",
        cell: (info) => {
          const schoolService =
            info.getValue() as BookingService["schoolService"];
          return (
            <Tag color="purple">
              {schoolService?.service?.category || "N/A"}
            </Tag>
          );
        },
        size: 140,
        enableSorting: false,
      },
      {
        accessorKey: "serviceType",
        header: "Type",
        cell: (info) => (
          <Tag color={info.getValue() == "LICENSE" ? "green" : "blue"}>
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
        cell: (info) => formatDateShort(info.getValue() as string),
        size: 120,
      },
      {
        id: "actions",
        header: "Action",
        cell: (info) => (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              const encodedId = encryptURLData(info.row.original.id.toString());
              router.push(`/mtadmin/servicebookinglist/${encodedId}`);
            }}
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

  // Initialize TanStack Table
  const table = useReactTable({
    data: bookingServices,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Backend handles pagination
    manualSorting: true, // Backend handles sorting
    pageCount: Math.ceil(totalBookingServices / pageSize),
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
                placeholder="Search by customer name, mobile, service name or confirmation number..."
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
              <Select
                value={filterServiceType}
                onChange={(value) => {
                  setFilterServiceType(value);
                  setCurrentPage(1);
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
            <table className="w-full">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                ) : table.getRowModel().rows.length == 0 ? (
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
                      className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-700">
              {bookingServices.length > 0 ? (
                <>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalBookingServices)} of{" "}
                  {totalBookingServices} service bookings
                </>
              ) : (
                <>No service bookings to display</>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {Math.ceil(totalBookingServices / pageSize)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalBookingServices / pageSize), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalBookingServices / pageSize)}
              >
                Next
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage(Math.ceil(totalBookingServices / pageSize))
                }
                disabled={currentPage >= Math.ceil(totalBookingServices / pageSize)}
              >
                Last
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceBookingListPage;
