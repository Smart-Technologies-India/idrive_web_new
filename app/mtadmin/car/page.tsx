"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Tag, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
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
  const pageSize = 10;

  // Fetch cars from API
  const { data: carsResponse, isLoading, refetch } = useQuery({
    queryKey: ["cars", schoolId, currentPage, pageSize, searchText, filterStatus, filterFuelType],
    queryFn: () => getPaginatedCars({
      searchPaginationInput: {
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        search: searchText,
      },
      whereSearchInput: {
        schoolId: schoolId,
        status: filterStatus === "all" ? undefined : filterStatus,
        fuelType: filterFuelType === "all" ? undefined : filterFuelType,
      },
    }),
    enabled: schoolId > 0,
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

  const columns: ColumnsType<CarData> = [
    {
      title: "Car ID",
      dataIndex: "carId",
      key: "carId",
      width: 120,
      sorter: (a, b) => a.carId.localeCompare(b.carId),
    },
    {
      title: "Car Details",
      key: "carDetails",
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {record.carName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.carName} - {record.model}
            </div>
            <div className="text-xs text-gray-600 font-mono">
              {record.registrationNumber}
            </div>
            <div className="text-xs text-gray-500">
              {record.year} • {record.color}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Fuel Type",
      dataIndex: "fuelType",
      key: "fuelType",
      width: 120,
      filters: [
        { text: "Petrol", value: "Petrol" },
        { text: "Diesel", value: "Diesel" },
        { text: "Electric", value: "Electric" },
        { text: "Hybrid", value: "Hybrid" },
      ],
      onFilter: (value, record) => record.fuelType === value,
      render: (fuelType) => (
        <Tag color="purple" className="!text-sm !px-3 !py-1">
          {fuelType}
        </Tag>
      ),
    },
    {
      title: "Assigned Driver",
      key: "driver",
      width: 180,
      render: (_, record) =>
        record.driverName ? (
          <div>
            <div className="font-medium text-gray-900">{record.driverName}</div>
            <div className="text-xs text-gray-500">{record.driverId}</div>
          </div>
        ) : (
          <span className="text-gray-400 italic">Not Assigned</span>
        ),
    },
    {
      title: "Total Bookings",
      dataIndex: "totalBookings",
      key: "totalBookings",
      width: 140,
      align: "center",
      sorter: (a, b) => a.totalBookings - b.totalBookings,
      render: (bookings) => (
        <div className="flex items-center justify-center gap-2">
          <IcBaselineCalendarMonth className="text-purple-600 text-lg" />
          <span className="font-medium">{bookings}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center",
      filters: [
        { text: "Available", value: "available" },
        { text: "In Use", value: "in-use" },
        { text: "Maintenance", value: "maintenance" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag
          color={getStatusColor(status)}
          className="!text-sm !px-3 !py-1 !font-medium"
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Next Service",
      dataIndex: "nextService",
      key: "nextService",
      width: 130,
      sorter: (a, b) => a.nextService.localeCompare(b.nextService),
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<AntDesignEyeOutlined />}
          onClick={() => router.push(`/mtadmin/car/${(record as CarData & { id?: number }).id || record.key}`)}
          className="!bg-blue-600"
        >
          View Details
        </Button>
      ),
    },
  ];

  const stats = {
    total: cars.length,
    available: cars.filter((c) => c.status === "available").length,
    inUse: cars.filter((c) => c.status === "in-use").length,
    maintenance: cars.filter((c) => c.status === "maintenance").length,
  };

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
        <div></div>
        {/* Cars Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={cars}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCars,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} cars`,
              showSizeChanger: false,
            }}
            scroll={{ x: 1400 }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default CarManagementPage;
