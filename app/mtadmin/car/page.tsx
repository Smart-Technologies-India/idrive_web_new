"use client";

import { useState } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Tag,
  Space,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  AntDesignPlusCircleOutlined,
  IcBaselineCalendarMonth,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { Search } = Input;

interface CarData {
  key: string;
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
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFuelType, setFilterFuelType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mock car data
  const [cars] = useState<CarData[]>([
    {
      key: "1",
      carId: "CAR-001",
      carName: "Swift Dzire",
      model: "VXI",
      registrationNumber: "DL01AB1234",
      year: 2023,
      color: "White",
      fuelType: "Petrol",
      status: "available",
      driverName: "Ramesh Kumar",
      driverId: "DRV-001",
      totalBookings: 245,
      lastService: "2024-10-15",
      nextService: "2024-12-15",
    },
    {
      key: "2",
      carId: "CAR-002",
      carName: "Honda City",
      model: "ZX CVT",
      registrationNumber: "DL01AB2345",
      year: 2022,
      color: "Silver",
      fuelType: "Petrol",
      status: "in-use",
      driverName: "Suresh Sharma",
      driverId: "DRV-002",
      totalBookings: 189,
      lastService: "2024-09-20",
      nextService: "2024-11-20",
    },
    {
      key: "3",
      carId: "CAR-003",
      carName: "Hyundai Venue",
      model: "SX Plus",
      registrationNumber: "DL01AB3456",
      year: 2024,
      color: "Blue",
      fuelType: "Diesel",
      status: "available",
      driverName: "Vikram Singh",
      driverId: "DRV-003",
      totalBookings: 156,
      lastService: "2024-10-25",
      nextService: "2024-12-25",
    },
    {
      key: "4",
      carId: "CAR-004",
      carName: "Maruti Baleno",
      model: "Alpha",
      registrationNumber: "DL01AB4567",
      year: 2023,
      color: "Red",
      fuelType: "Petrol",
      status: "maintenance",
      driverName: null,
      driverId: null,
      totalBookings: 203,
      lastService: "2024-11-01",
      nextService: "2025-01-01",
    },
    {
      key: "5",
      carId: "CAR-005",
      carName: "Tata Nexon",
      model: "XZ Plus",
      registrationNumber: "DL01AB5678",
      year: 2024,
      color: "Black",
      fuelType: "Electric",
      status: "available",
      driverName: "Ajay Verma",
      driverId: "DRV-004",
      totalBookings: 98,
      lastService: "2024-10-10",
      nextService: "2024-12-10",
    },
    {
      key: "6",
      carId: "CAR-006",
      carName: "Swift Dzire",
      model: "ZXI Plus",
      registrationNumber: "DL01AB6789",
      year: 2022,
      color: "Grey",
      fuelType: "Diesel",
      status: "in-use",
      driverName: "Ramesh Kumar",
      driverId: "DRV-001",
      totalBookings: 278,
      lastService: "2024-09-15",
      nextService: "2024-11-15",
    },
    {
      key: "7",
      carId: "CAR-007",
      carName: "Honda Amaze",
      model: "VX",
      registrationNumber: "DL01AB7890",
      year: 2021,
      color: "White",
      fuelType: "Petrol",
      status: "inactive",
      driverName: null,
      driverId: null,
      totalBookings: 412,
      lastService: "2024-08-20",
      nextService: "2024-10-20",
    },
    {
      key: "8",
      carId: "CAR-008",
      carName: "Hyundai Creta",
      model: "SX Diesel",
      registrationNumber: "DL01AB8901",
      year: 2023,
      color: "Brown",
      fuelType: "Diesel",
      status: "available",
      driverName: "Suresh Sharma",
      driverId: "DRV-002",
      totalBookings: 167,
      lastService: "2024-10-05",
      nextService: "2024-12-05",
    },
    {
      key: "9",
      carId: "CAR-009",
      carName: "Kia Seltos",
      model: "HTX",
      registrationNumber: "DL01AB9012",
      year: 2024,
      color: "White",
      fuelType: "Petrol",
      status: "available",
      driverName: "Vikram Singh",
      driverId: "DRV-003",
      totalBookings: 89,
      lastService: "2024-10-28",
      nextService: "2024-12-28",
    },
    {
      key: "10",
      carId: "CAR-010",
      carName: "MG Hector",
      model: "Smart Hybrid",
      registrationNumber: "DL01AB0123",
      year: 2023,
      color: "Silver",
      fuelType: "Hybrid",
      status: "in-use",
      driverName: "Ajay Verma",
      driverId: "DRV-004",
      totalBookings: 134,
      lastService: "2024-09-30",
      nextService: "2024-11-30",
    },
    {
      key: "11",
      carId: "CAR-011",
      carName: "Maruti Ertiga",
      model: "ZXI Plus",
      registrationNumber: "DL01AB1235",
      year: 2022,
      color: "Blue",
      fuelType: "Petrol",
      status: "available",
      driverName: null,
      driverId: null,
      totalBookings: 198,
      lastService: "2024-10-12",
      nextService: "2024-12-12",
    },
    {
      key: "12",
      carId: "CAR-012",
      carName: "Toyota Innova Crysta",
      model: "GX",
      registrationNumber: "DL01AB2346",
      year: 2023,
      color: "Grey",
      fuelType: "Diesel",
      status: "maintenance",
      driverName: null,
      driverId: null,
      totalBookings: 223,
      lastService: "2024-11-05",
      nextService: "2025-01-05",
    },
  ]);

  // Filter and search cars
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.carName.toLowerCase().includes(searchText.toLowerCase()) ||
      car.model.toLowerCase().includes(searchText.toLowerCase()) ||
      car.registrationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      car.carId.toLowerCase().includes(searchText.toLowerCase()) ||
      (car.driverName &&
        car.driverName.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus = filterStatus === "all" || car.status === filterStatus;
    const matchesFuelType =
      filterFuelType === "all" || car.fuelType === filterFuelType;

    return matchesSearch && matchesStatus && matchesFuelType;
  });

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
            <div className="font-medium text-gray-900">
              {record.driverName}
            </div>
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
          onClick={() => router.push(`/mtadmin/car/${record.carId}`)}
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
          <Card bordered={false} className="shadow-sm">
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

          <Card bordered={false} className="shadow-sm">
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

          <Card bordered={false} className="shadow-sm">
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

          <Card bordered={false} className="shadow-sm">
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
        <Card bordered={false} className="shadow-sm">
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
        <Card bordered={false} className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredCars}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredCars.length,
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
