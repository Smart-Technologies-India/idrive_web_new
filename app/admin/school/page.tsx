"use client";

import { useState, useEffect } from "react";
import { Card, Table, Input, Button, Tag, Space, Select, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEyeOutlined,
  AntDesignEditOutlined,
  AntDesignPlusCircleOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getPaginatedSchools, School } from "@/services/school.api";
import { toast } from "react-toastify";

const { Search } = Input;

type SchoolStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

const SchoolsListPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Fetch schools from API
  const fetchSchools = async () => {
    setLoading(true);
    try {
      // Build where clause for filtering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      // Status filter
      if (filterStatus !== "all") {
        where.status = filterStatus as SchoolStatus;
      }

      // Search filter
      if (searchText.trim()) {
        where.OR = [
          { name: { contains: searchText, mode: "insensitive" } },
          { email: { contains: searchText, mode: "insensitive" } },
          { phone: { contains: searchText } },
          { registrationNumber: { contains: searchText, mode: "insensitive" } },
          { address: { contains: searchText, mode: "insensitive" } },
        ];
      }

      const skip = (currentPage - 1) * pageSize;
      const response = await getPaginatedSchools({
        searchPaginationInput: {
          skip,
          take: pageSize,
          search: searchText.trim() || undefined,
        },
        whereSearchInput: Object.keys(where).length > 0 ? where : {},
      });

      if (response.status) {
        const schoolData = response.data.getPaginatedSchool;
        setSchools(schoolData.data || []);
        setTotal(schoolData.total || 0);
      } else {
        toast.error(response.message || "Failed to fetch schools");
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  // Fetch schools on mount and when filters change
  useEffect(() => {
    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus, searchText]);

  const columns: ColumnsType<School> = [
    {
      title: "School ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: number) => `SCH-${String(id).padStart(3, "0")}`,
    },
    {
      title: "School Details",
      key: "schoolDetails",
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 flex-shrink-0"
            style={{ fontSize: "1.2rem" }}
          >
            {record.name.charAt(0)}
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {record.address}
            </div>
            <div className="text-xs text-gray-600">
              {record.registrationNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm truncate">{record.email}</div>
          <div className="text-xs text-gray-600">{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Students",
      key: "totalStudents",
      width: 100,
      align: "center",
      render: () => <span className="font-semibold text-purple-600">-</span>,
    },
    {
      title: "Instructors",
      key: "totalInstructors",
      width: 110,
      align: "center",
      render: () => <span className="font-semibold text-blue-600">-</span>,
    },
    {
      title: "Vehicles",
      key: "totalVehicles",
      width: 100,
      align: "center",
      render: () => <span className="font-semibold text-green-600">-</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: SchoolStatus) => {
        const config = {
          ACTIVE: { color: "green", text: "Active" },
          INACTIVE: { color: "red", text: "Inactive" },
          SUSPENDED: { color: "orange", text: "Suspended" },
        };
        return (
          <Tag color={config[status].color} className="!text-sm !px-3 !py-1">
            {config[status].text}
          </Tag>
        );
      },
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (date: string) => new Date(date).toLocaleDateString("en-IN"),
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
            onClick={() => router.push(`/admin/school/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<AntDesignEditOutlined />}
            onClick={() => router.push(`/admin/school/${record.id}/edit`)}
            className="!bg-blue-600"
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: schools.length,
    active: schools.filter((s) => s.status == "ACTIVE").length,
    inactive: schools.filter((s) => s.status == "INACTIVE").length,
    suspended: schools.filter((s) => s.status == "SUSPENDED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Schools Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage all registered driving schools
              </p>
            </div>
            <Space>
              <Button
                type="default"
                icon={<IcBaselineRefresh className="text-lg" />}
                size="large"
                onClick={fetchSchools}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<AntDesignPlusCircleOutlined className="text-lg" />}
                size="large"
                onClick={() => router.push("/admin/school/add")}
                className="!bg-gradient-to-r from-indigo-600 to-blue-600 border-0"
              >
                Add New School
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
                <span className="text-2xl">🏫</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Schools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Active Schools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.suspended}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Inactive Schools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
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
                placeholder="Search by name, email, phone, ID, or location..."
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
                  { label: "All Schools", value: "all" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                  { label: "Suspended", value: "SUSPENDED" },
                ]}
              />
            </Space>
          </div>
        </Card>
        <div></div>

        {/* Schools Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={schools}
            loading={loading}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} schools`,
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

export default SchoolsListPage;
