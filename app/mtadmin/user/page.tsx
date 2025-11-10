"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Tag, Space, Select, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  MaterialSymbolsPersonRounded,
  RiMoneyRupeeCircleLine,
  IcBaselineCalendarMonth,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { Search } = Input;

interface UserData {
  key: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  walletBalance: number;
  activeCourses: number;
  totalBookings: number;
  status: "active" | "inactive";
  joinedDate: string;
}

const UserManagementPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mock user data
  const [users] = useState<UserData[]>([
    {
      key: "1",
      userId: "USR-001",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      mobile: "9876543210",
      walletBalance: 5000,
      activeCourses: 2,
      totalBookings: 15,
      status: "active",
      joinedDate: "2024-01-15",
    },
    {
      key: "2",
      userId: "USR-002",
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      mobile: "9876543211",
      walletBalance: 3200,
      activeCourses: 1,
      totalBookings: 8,
      status: "active",
      joinedDate: "2024-02-20",
    },
    {
      key: "3",
      userId: "USR-003",
      name: "Amit Singh",
      email: "amit.singh@email.com",
      mobile: "9876543212",
      walletBalance: 0,
      activeCourses: 0,
      totalBookings: 5,
      status: "inactive",
      joinedDate: "2024-01-10",
    },
    {
      key: "4",
      userId: "USR-004",
      name: "Sneha Reddy",
      email: "sneha.reddy@email.com",
      mobile: "9876543213",
      walletBalance: 8500,
      activeCourses: 3,
      totalBookings: 22,
      status: "active",
      joinedDate: "2023-12-05",
    },
    {
      key: "5",
      userId: "USR-005",
      name: "Vikram Patel",
      email: "vikram.patel@email.com",
      mobile: "9876543214",
      walletBalance: 1200,
      activeCourses: 1,
      totalBookings: 3,
      status: "active",
      joinedDate: "2024-03-18",
    },
    {
      key: "6",
      userId: "USR-006",
      name: "Neha Gupta",
      email: "neha.gupta@email.com",
      mobile: "9876543215",
      walletBalance: 4500,
      activeCourses: 2,
      totalBookings: 12,
      status: "active",
      joinedDate: "2024-02-28",
    },
    {
      key: "7",
      userId: "USR-007",
      name: "Arjun Verma",
      email: "arjun.verma@email.com",
      mobile: "9876543216",
      walletBalance: 0,
      activeCourses: 0,
      totalBookings: 18,
      status: "inactive",
      joinedDate: "2023-11-20",
    },
    {
      key: "8",
      userId: "USR-008",
      name: "Kavya Nair",
      email: "kavya.nair@email.com",
      mobile: "9876543217",
      walletBalance: 6700,
      activeCourses: 2,
      totalBookings: 10,
      status: "active",
      joinedDate: "2024-01-25",
    },
    {
      key: "9",
      userId: "USR-009",
      name: "Rohan Malhotra",
      email: "rohan.malhotra@email.com",
      mobile: "9876543218",
      walletBalance: 2100,
      activeCourses: 1,
      totalBookings: 6,
      status: "active",
      joinedDate: "2024-03-05",
    },
    {
      key: "10",
      userId: "USR-010",
      name: "Meera Kapoor",
      email: "meera.kapoor@email.com",
      mobile: "9876543219",
      walletBalance: 9500,
      activeCourses: 4,
      totalBookings: 28,
      status: "active",
      joinedDate: "2023-10-12",
    },
    {
      key: "11",
      userId: "USR-011",
      name: "Siddharth Roy",
      email: "siddharth.roy@email.com",
      mobile: "9876543220",
      walletBalance: 3800,
      activeCourses: 1,
      totalBookings: 9,
      status: "active",
      joinedDate: "2024-02-14",
    },
    {
      key: "12",
      userId: "USR-012",
      name: "Ananya Das",
      email: "ananya.das@email.com",
      mobile: "9876543221",
      walletBalance: 0,
      activeCourses: 0,
      totalBookings: 14,
      status: "inactive",
      joinedDate: "2023-09-30",
    },
  ]);

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.mobile.includes(searchText) ||
      user.userId.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<UserData> = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 120,
      sorter: (a, b) => a.userId.localeCompare(b.userId),
    },
    {
      title: "User Details",
      key: "userDetails",
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<MaterialSymbolsPersonRounded />}
            className="bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0"
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
      title: "Wallet Balance",
      dataIndex: "walletBalance",
      key: "walletBalance",
      width: 150,
      sorter: (a, b) => a.walletBalance - b.walletBalance,
      render: (balance) => (
        <div className="flex items-center gap-2">
          <RiMoneyRupeeCircleLine className="text-green-600 text-lg" />
          <span className="font-semibold text-gray-900">₹{balance}</span>
        </div>
      ),
    },
    {
      title: "Active Courses",
      dataIndex: "activeCourses",
      key: "activeCourses",
      width: 140,
      align: "center",
      sorter: (a, b) => a.activeCourses - b.activeCourses,
      render: (courses) => (
        <Tag
          color={courses > 0 ? "blue" : "default"}
          className="!text-sm !px-3 !py-1"
        >
          {courses} {courses === 1 ? "Course" : "Courses"}
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
          <IcBaselineCalendarMonth className="text-purple-600 text-lg" />
          <span className="font-medium">{bookings}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: "active" | "inactive") => (
        <Tag
          color={status === "active" ? "green" : "red"}
          className="!text-sm !px-3 !py-1"
        >
          {status === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Joined Date",
      dataIndex: "joinedDate",
      key: "joinedDate",
      width: 130,
      sorter: (a, b) => a.joinedDate.localeCompare(b.joinedDate),
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
          onClick={() => router.push(`/mtadmin/user/${record.userId}`)}
          className="!bg-blue-600"
        >
          View Profile
        </Button>
      ),
    },
  ];

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    totalWalletBalance: users.reduce((sum, u) => sum + u.walletBalance, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage and view all registered users
              </p>
            </div>
            <Button
              type="default"
              icon={<IcBaselineRefresh className="text-lg" />}
              size="large"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card bordered={false} className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-red-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <RiMoneyRupeeCircleLine className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Wallet</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.totalWalletBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div></div>

        {/* Filters and Search */}
        <Card bordered={false} className="shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Search
                placeholder="Search by name, email, mobile, or user ID..."
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
                  { label: "All Users", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </Space>
          </div>
        </Card>
        <div></div>

        {/* Users Table */}
        <Card bordered={false} className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredUsers}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredUsers.length,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
              showSizeChanger: false,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default UserManagementPage;
