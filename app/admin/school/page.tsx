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
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { Search } = Input;

interface SchoolData {
  key: string;
  schoolId: string;
  name: string;
  registrationNumber: string;
  email: string;
  phone: string;
  location: string;
  totalStudents: number;
  totalInstructors: number;
  totalVehicles: number;
  status: "active" | "inactive" | "suspended";
  joinedDate: string;
}

const SchoolsListPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mock schools data
  const [schools] = useState<SchoolData[]>([
    {
      key: "1",
      schoolId: "SCH-001",
      name: "iDrive Driving School - Rohini",
      registrationNumber: "DL/DS/2022/12345",
      email: "rohini@idrive.com",
      phone: "+91 9876543210",
      location: "Rohini, New Delhi",
      totalStudents: 245,
      totalInstructors: 12,
      totalVehicles: 15,
      status: "active",
      joinedDate: "2022-01-15",
    },
    {
      key: "2",
      schoolId: "SCH-002",
      name: "iDrive Driving School - Dwarka",
      registrationNumber: "DL/DS/2022/12346",
      email: "dwarka@idrive.com",
      phone: "+91 9876543211",
      location: "Dwarka, New Delhi",
      totalStudents: 198,
      totalInstructors: 10,
      totalVehicles: 12,
      status: "active",
      joinedDate: "2022-03-20",
    },
    {
      key: "3",
      schoolId: "SCH-003",
      name: "iDrive Driving School - Noida",
      registrationNumber: "DL/DS/2022/12347",
      email: "noida@idrive.com",
      phone: "+91 9876543212",
      location: "Noida, Uttar Pradesh",
      totalStudents: 312,
      totalInstructors: 15,
      totalVehicles: 18,
      status: "active",
      joinedDate: "2022-05-10",
    },
    {
      key: "4",
      schoolId: "SCH-004",
      name: "iDrive Driving School - Gurgaon",
      registrationNumber: "DL/DS/2022/12348",
      email: "gurgaon@idrive.com",
      phone: "+91 9876543213",
      location: "Gurgaon, Haryana",
      totalStudents: 156,
      totalInstructors: 8,
      totalVehicles: 10,
      status: "active",
      joinedDate: "2022-07-15",
    },
    {
      key: "5",
      schoolId: "SCH-005",
      name: "iDrive Driving School - Faridabad",
      registrationNumber: "DL/DS/2023/12349",
      email: "faridabad@idrive.com",
      phone: "+91 9876543214",
      location: "Faridabad, Haryana",
      totalStudents: 89,
      totalInstructors: 6,
      totalVehicles: 8,
      status: "inactive",
      joinedDate: "2023-02-20",
    },
    {
      key: "6",
      schoolId: "SCH-006",
      name: "iDrive Driving School - Ghaziabad",
      registrationNumber: "DL/DS/2023/12350",
      email: "ghaziabad@idrive.com",
      phone: "+91 9876543215",
      location: "Ghaziabad, Uttar Pradesh",
      totalStudents: 134,
      totalInstructors: 9,
      totalVehicles: 11,
      status: "active",
      joinedDate: "2023-04-18",
    },
    {
      key: "7",
      schoolId: "SCH-007",
      name: "iDrive Driving School - Vasant Kunj",
      registrationNumber: "DL/DS/2023/12351",
      email: "vasantkunj@idrive.com",
      phone: "+91 9876543216",
      location: "Vasant Kunj, New Delhi",
      totalStudents: 178,
      totalInstructors: 11,
      totalVehicles: 14,
      status: "active",
      joinedDate: "2023-06-25",
    },
    {
      key: "8",
      schoolId: "SCH-008",
      name: "iDrive Driving School - Rajouri Garden",
      registrationNumber: "DL/DS/2023/12352",
      email: "rajourigarden@idrive.com",
      phone: "+91 9876543217",
      location: "Rajouri Garden, New Delhi",
      totalStudents: 201,
      totalInstructors: 10,
      totalVehicles: 13,
      status: "suspended",
      joinedDate: "2023-08-12",
    },
    {
      key: "9",
      schoolId: "SCH-009",
      name: "iDrive Driving School - Greater Noida",
      registrationNumber: "DL/DS/2023/12353",
      email: "greaternoida@idrive.com",
      phone: "+91 9876543218",
      location: "Greater Noida, Uttar Pradesh",
      totalStudents: 267,
      totalInstructors: 13,
      totalVehicles: 16,
      status: "active",
      joinedDate: "2023-09-30",
    },
    {
      key: "10",
      schoolId: "SCH-010",
      name: "iDrive Driving School - Lajpat Nagar",
      registrationNumber: "DL/DS/2023/12354",
      email: "lajpatnagar@idrive.com",
      phone: "+91 9876543219",
      location: "Lajpat Nagar, New Delhi",
      totalStudents: 189,
      totalInstructors: 9,
      totalVehicles: 12,
      status: "active",
      joinedDate: "2023-11-05",
    },
  ]);

  // Filter and search schools
  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchText.toLowerCase()) ||
      school.email.toLowerCase().includes(searchText.toLowerCase()) ||
      school.phone.includes(searchText) ||
      school.schoolId.toLowerCase().includes(searchText.toLowerCase()) ||
      school.location.toLowerCase().includes(searchText.toLowerCase()) ||
      school.registrationNumber
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || school.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<SchoolData> = [
    {
      title: "School ID",
      dataIndex: "schoolId",
      key: "schoolId",
      width: 120,
      sorter: (a, b) => a.schoolId.localeCompare(b.schoolId),
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
              {record.location}
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
      dataIndex: "totalStudents",
      key: "totalStudents",
      width: 100,
      align: "center",
      sorter: (a, b) => a.totalStudents - b.totalStudents,
      render: (count) => (
        <span className="font-semibold text-purple-600">{count}</span>
      ),
    },
    {
      title: "Instructors",
      dataIndex: "totalInstructors",
      key: "totalInstructors",
      width: 110,
      align: "center",
      sorter: (a, b) => a.totalInstructors - b.totalInstructors,
      render: (count) => (
        <span className="font-semibold text-blue-600">{count}</span>
      ),
    },
    {
      title: "Vehicles",
      dataIndex: "totalVehicles",
      key: "totalVehicles",
      width: 100,
      align: "center",
      sorter: (a, b) => a.totalVehicles - b.totalVehicles,
      render: (count) => (
        <span className="font-semibold text-green-600">{count}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: "active" | "inactive" | "suspended") => {
        const config = {
          active: { color: "green", text: "Active" },
          inactive: { color: "red", text: "Inactive" },
          suspended: { color: "orange", text: "Suspended" },
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
      dataIndex: "joinedDate",
      key: "joinedDate",
      width: 130,
      sorter: (a, b) => a.joinedDate.localeCompare(b.joinedDate),
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
            onClick={() => router.push(`/admin/school/${record.schoolId}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<AntDesignEditOutlined />}
            onClick={() =>
              router.push(`/admin/school/${record.schoolId}/edit`)
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
    total: schools.length,
    active: schools.filter((s) => s.status === "active").length,
    inactive: schools.filter((s) => s.status === "inactive").length,
    suspended: schools.filter((s) => s.status === "suspended").length,
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
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "Suspended", value: "suspended" },
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
            dataSource={filteredSchools}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredSchools.length,
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
