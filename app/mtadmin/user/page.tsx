"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedUsers } from "@/services/user.api";

const { Search } = Input;

interface UserData {
  key: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  status: "ACTIVE" | "INACTIVE";
  joinedDate: string;
}

function UserManagementPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Fetch users from backend
  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-list", schoolId, searchText, filterStatus, currentPage],
    queryFn: () =>
      getPaginatedUsers({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
        },
        whereSearchInput: {
          schoolId,
          role: "USER",
          status:
            filterStatus !== "all" ? filterStatus.toUpperCase() : undefined,
        },
      }),
    enabled: schoolId > 0,
  });

  interface BackendUser {
    id: number | string;
    name: string;
    email?: string;
    contact1: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
  }

  const users: UserData[] = (
    usersResponse?.data?.getPaginatedUser?.data || []
  ).map((u: BackendUser) => ({
    key: u.id.toString(),
    userId: `USR-${u.id.toString().padStart(3, "0")}`,
    name: u.name,
    email: u.email || "",
    mobile: u.contact1,
    status: u.status,
    joinedDate: u.createdAt,
  }));
  const totalUsers = usersResponse?.data?.getPaginatedUser?.total || 0;

  const columns: ColumnsType<UserData> = [
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 120,
      sorter: (a, b) => a.userId.localeCompare(b.userId),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (name: string) => (
        <span className="font-semibold text-gray-900">{name}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (email: string) => (
        <span className="text-xs text-gray-500">{email}</span>
      ),
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 140,
      render: (mobile: string) => (
        <span className="text-xs text-gray-600">{mobile}</span>
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
    total: totalUsers,
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
              onClick={() => refetch()}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        {/* Filters and Search */}
        <Card className="shadow-sm">
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
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
              />
            </Space>
          </div>
        </Card>
        <div></div>
        {/* Users Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={users}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalUsers,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
              showSizeChanger: false,
            }}
            scroll={{ x: 1200 }}
            size="middle"
            rowKey="key"
          />
        </Card>
      </div>
    </div>
  );
}

export default UserManagementPage;
