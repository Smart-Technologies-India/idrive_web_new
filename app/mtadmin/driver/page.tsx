"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Tag, Space, Select, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
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

const { Search } = Input;

interface DriverData {
  key: string;
  id: number;
  driverId: string;
  name: string;
  email: string | undefined;
  mobile: string;
  licenseNumber: string;
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
  const pageSize = 10;

  // Fetch drivers from API
  const { data: driversResponse, isLoading, refetch } = useQuery({
    queryKey: ["drivers", schoolId, currentPage, pageSize, searchText, filterStatus],
    queryFn: () => getPaginatedDrivers({
      searchPaginationInput: {
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        search: searchText,
      },
      whereSearchInput: {
        schoolId: schoolId,
        status: filterStatus === "all" ? undefined : filterStatus,
      },
    }),
    enabled: schoolId > 0,
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

  const columns: ColumnsType<DriverData> = [
    {
      title: "Driver ID",
      dataIndex: "driverId",
      key: "driverId",
      width: 120,
      sorter: (a, b) => a.driverId.localeCompare(b.driverId),
    },
    {
      title: "Driver Details",
      key: "driverDetails",
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<MaterialSymbolsPersonRounded />}
            className="bg-gradient-to-r from-green-600 to-teal-600 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.name}
            </div>
            <div className="text-xs text-gray-500 truncate">{record.email}</div>
            <div className="text-xs text-gray-600">{record.mobile}</div>
          </div>
        </div>
      ),
    },
    {
      title: "License Number",
      dataIndex: "licenseNumber",
      key: "licenseNumber",
      width: 180,
      render: (license) => (
        <span className="font-mono text-sm text-gray-700">{license}</span>
      ),
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      width: 120,
      align: "center",
      sorter: (a, b) => a.experience - b.experience,
      render: (exp) => (
        <Tag color="purple" className="!text-sm !px-3 !py-1">
          {exp} {exp === 1 ? "Year" : "Years"}
        </Tag>
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
          <IcBaselineCalendarMonth className="text-blue-600 text-lg" />
          <span className="font-medium">{bookings}</span>
        </div>
      ),
    },
    {
      title: "Completed",
      dataIndex: "completedBookings",
      key: "completedBookings",
      width: 120,
      align: "center",
      sorter: (a, b) => a.completedBookings - b.completedBookings,
      render: (completed) => (
        <span className="font-medium text-green-600">{completed}</span>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 100,
      align: "center",
      sorter: (a, b) => a.rating - b.rating,
      render: (rating) => (
        <div className="flex items-center justify-center gap-1">
          <span className="text-yellow-500">⭐</span>
          <span className="font-semibold">{rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "SUSPENDED") => {
        const config = {
          ACTIVE: { color: "green", text: "Active" },
          INACTIVE: { color: "red", text: "Inactive" },
          ON_LEAVE: { color: "orange", text: "On Leave" },
          SUSPENDED: { color: "volcano", text: "Suspended" },
        };
        return (
          <Tag
            color={config[status].color}
            className="!text-sm !px-3 !py-1"
          >
            {config[status].text}
          </Tag>
        );
      },
    },
    {
      title: "Joined Date",
      dataIndex: "joiningDate",
      key: "joiningDate",
      width: 130,
      sorter: (a, b) => a.joiningDate.localeCompare(b.joiningDate),
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<AntDesignEyeOutlined />}
            onClick={() => router.push(`/mtadmin/driver/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<AntDesignEditOutlined />}
            onClick={() =>
              router.push(`/mtadmin/driver/${record.id}/edit`)
            }
            className="!bg-blue-600"
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "ACTIVE").length,
    inactive: drivers.filter((d) => d.status === "INACTIVE").length,
    onLeave: drivers.filter((d) => d.status === "ON_LEAVE").length,
    avgRating: drivers.length > 0 
      ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)
      : "0.0",
  };

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
          <Table
            columns={columns}
            dataSource={drivers}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalDrivers,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} drivers`,
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

export default DriverManagementPage;
