"use client";

import { useState, useMemo } from "react";
import { Card, Input, Button, Tag, Space, Select } from "antd";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  AntDesignPlusCircleOutlined,
  IcBaselineCalendarMonth,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedCars, type Car } from "@/services/car.api";
import { getCookie } from "cookies-next";

const { Search } = Input;

interface CarData {
  key: string;
  id?: number;
  carId: string;
  carName: string;
  model: string;
  registrationNumber: string;
  year: number;
  color: string;
  fuelType: "Petrol" | "Diesel" | "Electric" | "Hybrid";
  status: "available" | "in-use" | "maintenance" | "inactive";
  driverName: string | null;
  driverId: string | null;
  totalBookings: number;
  lastService: string;
  nextService: string;
}

const CarManagementPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFuelType, setFilterFuelType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 10;

  // Fetch cars from API
  const { data: carsResponse, isLoading, refetch } = useQuery({
    queryKey: ["cars", schoolId, currentPage, pageSize, searchText, filterStatus, filterFuelType, JSON.stringify(sorting)],
    queryFn: () => {
      // Convert TanStack sorting to backend orderBy format
      const orderBy = sorting.map((sort) => ({
        field: sort.id,
        direction: sort.desc ? ("desc" as const) : ("asc" as const),
      }));

      return getPaginatedCars({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
          filters: ["carName", "model", "registrationNumber", "carId"],
          orderBy: orderBy.length > 0 ? orderBy : undefined,
        },
        whereSearchInput: {
          schoolId: schoolId,
          status: filterStatus == "all" ? undefined : filterStatus,
          fuelType: filterFuelType == "all" ? undefined : filterFuelType,
        },
      });
    },
    enabled: schoolId > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // No longer need to fetch drivers separately - using assignedDriver from car query

  const cars: CarData[] = carsResponse?.data?.getPaginatedCar?.data?.map((car: Car) => {
    // Convert fuel type from API format to display format
    const fuelTypeMap = {
      "PETROL": "Petrol" as const,
      "DIESEL": "Diesel" as const,
      "ELECTRIC": "Electric" as const,
      "HYBRID": "Hybrid" as const,
      "CNG": "Hybrid" as const, // Map CNG to Hybrid for display
    };
    
    // Convert status from API format to display format
    const statusMap = {
      "AVAILABLE": "available" as const,
      "IN_USE": "in-use" as const,
      "MAINTENANCE": "maintenance" as const,
      "INACTIVE": "inactive" as const,
    };

    // Get driver info from the assignedDriver field
    const driverInfo = car.assignedDriver;

    return {
      key: car.id.toString(),
      id: car.id,
      carId: car.carId,
      carName: car.carName,
      model: car.model,
      registrationNumber: car.registrationNumber,
      year: car.year,
      color: car.color,
      fuelType: fuelTypeMap[car.fuelType] || "Petrol",
      status: statusMap[car.status] || "available",
      driverName: driverInfo?.name || null,
      driverId: driverInfo?.driverId || null,
      totalBookings: car.totalBookings,
      lastService: car.lastServiceDate || new Date().toISOString(),
      nextService: car.nextServiceDate || new Date().toISOString(),
    };
  }) || [];

  const totalCars = carsResponse?.data?.getPaginatedCar?.total || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "green",
      "in-use": "blue",
      maintenance: "orange",
      inactive: "red",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      available: "Available",
      "in-use": "In Use",
      maintenance: "Maintenance",
      inactive: "Inactive",
    };
    return texts[status] || status;
  };

  // Define columns using TanStack Table
  const columns = useMemo<ColumnDef<CarData>[]>(
    () => [
      {
        accessorKey: "carId",
        header: "Car ID",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        enableSorting: true,
      },
      {
        id: "carDetails",
        header: "Car Details",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {info.row.original.carName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {info.row.original.carName} - {info.row.original.model}
              </div>
              <div className="text-xs text-gray-600 font-mono">
                {info.row.original.registrationNumber}
              </div>
              <div className="text-xs text-gray-500">
                {info.row.original.year} • {info.row.original.color}
              </div>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "fuelType",
        header: "Fuel Type",
        cell: (info) => (
          <Tag color="purple" className="!text-sm !px-3 !py-1">
            {info.getValue() as string}
          </Tag>
        ),
        enableSorting: true,
      },
      {
        id: "driver",
        header: "Assigned Driver",
        cell: (info) =>
          info.row.original.driverName ? (
            <div>
              <div className="font-medium text-gray-900">{info.row.original.driverName}</div>
              <div className="text-xs text-gray-500">{info.row.original.driverId}</div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Not Assigned</span>
          ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <Tag
              color={getStatusColor(status)}
              className="!text-sm !px-3 !py-1 !font-medium"
            >
              {getStatusText(status)}
            </Tag>
          );
        },
        enableSorting: false,
      },
      {
        id: "action",
        header: "Action",
        cell: (info) => (
          <Button
            type="primary"
            icon={<AntDesignEyeOutlined />}
            onClick={() => router.push(`/mtadmin/car/${info.row.original.id || info.row.original.key}`)}
            className="!bg-blue-600"
          >
            View Details
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [router]
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: cars,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Backend handles pagination
    manualSorting: true, // Backend handles sorting
    pageCount: Math.ceil(totalCars / pageSize),
  });

  const stats = {
    total: totalCars,
    available: cars.filter((c) => c.status === "available").length,
    inUse: cars.filter((c) => c.status === "in-use").length,
    maintenance: cars.filter((c) => c.status === "maintenance").length,
  };

  // Calculate pagination info for display
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCars);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Car Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage and monitor all vehicles in the fleet
              </p>
            </div>
            <Space size="middle">
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
                onClick={() => router.push("/mtadmin/car/add")}
                className="!bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Add New Car
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-2xl">🚗</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.available}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-2xl">🔄</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">In Use</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inUse}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 text-2xl">🔧</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.maintenance}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Search
                placeholder="Search by car name, model, registration number, or driver..."
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
                  { label: "All Status", value: "all" },
                  { label: "Available", value: "available" },
                  { label: "In Use", value: "in-use" },
                  { label: "Maintenance", value: "maintenance" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
              <Select
                value={filterFuelType}
                onChange={(value) => {
                  setFilterFuelType(value);
                  setCurrentPage(1);
                }}
                style={{ width: 150 }}
                size="large"
                options={[
                  { label: "All Fuel Types", value: "all" },
                  { label: "Petrol", value: "Petrol" },
                  { label: "Diesel", value: "Diesel" },
                  { label: "Electric", value: "Electric" },
                  { label: "Hybrid", value: "Hybrid" },
                ]}
              />
            </Space>
          </div>
        </Card>
        {/* Cars Table */}
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
                      No cars found
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
              {cars.length > 0 ? (
                <>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalCars)}{" "}
                  of {totalCars} cars
                </>
              ) : (
                <>No cars to display</>
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
                Page {currentPage} of {Math.ceil(totalCars / pageSize)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalCars / pageSize), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalCars / pageSize)}
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

export default CarManagementPage;
