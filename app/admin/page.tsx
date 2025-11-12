"use client";

import { Card, Row, Col, Statistic, Table, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  IcBaselineRefresh,
  AntDesignEyeOutlined,
  AntDesignPlusCircleOutlined,
  AntDesignEditOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";

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

const AdminDashboard = () => {
  const router = useRouter();

  // Mock data for statistics
  const stats = {
    totalSchools: 15,
    activeSchools: 12,
    totalStudents: 1245,
    totalRevenue: 2456000,
  };

  // Mock data for schools
  const schools: SchoolData[] = [
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
  ];

  const columns: ColumnsType<SchoolData> = [
    {
      title: "School ID",
      dataIndex: "schoolId",
      key: "schoolId",
      width: 120,
    },
    {
      title: "School Name",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-900">{text}</div>
          <div className="text-xs text-gray-500">{record.location}</div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.email}</div>
          <div className="text-xs text-gray-500">{record.phone}</div>
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
    },
    {
      title: "Instructors",
      dataIndex: "totalInstructors",
      key: "totalInstructors",
      width: 110,
      align: "center",
      sorter: (a, b) => a.totalInstructors - b.totalInstructors,
    },
    {
      title: "Vehicles",
      dataIndex: "totalVehicles",
      key: "totalVehicles",
      width: 100,
      align: "center",
      sorter: (a, b) => a.totalVehicles - b.totalVehicles,
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
        <div className="flex gap-2">
          <Button
            type="default"
            icon={<AntDesignEyeOutlined />}
            size="small"
            onClick={() => router.push(`/admin/school/${record.schoolId}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<AntDesignEditOutlined />}
            size="small"
            onClick={() =>
              router.push(`/admin/school/${record.schoolId}/edit`)
            }
            className="!bg-blue-600"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage all driving schools from one place
            </p>
          </div>
          <div className="flex gap-3">
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
              className="!bg-gradient-to-r from-indigo-600 to-blue-600 border-0 shadow-md"
            >
              Add New School
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Statistics Cards */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-all">
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">Total Schools</span>
                }
                value={stats.totalSchools}
                prefix={<span className="text-3xl">🏫</span>}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-all">
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">Active Schools</span>
                }
                value={stats.activeSchools}
                prefix={<span className="text-3xl">✅</span>}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-all">
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">Total Students</span>
                }
                value={stats.totalStudents}
                prefix={<span className="text-3xl">👥</span>}
                valueStyle={{
                  color: "#722ed1",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm hover:shadow-md transition-all">
              <Statistic
                title={
                  <span className="text-gray-600 text-sm">Total Revenue</span>
                }
                value={stats.totalRevenue}
                prefix="₹"
                valueStyle={{
                  color: "#fa8c16",
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
        </Row>
        <div></div>

        {/* Schools Table */}
        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">All Schools</span>
              <Button
                type="link"
                onClick={() => router.push("/admin/school")}
                className="text-blue-600"
              >
                View All →
              </Button>
            </div>
          }
          className="shadow-sm"
        >
          <Table
            columns={columns}
            dataSource={schools}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1300 }}
            size="middle"
          />
        </Card>
        <div></div>

        {/* Quick Actions */}
        <Card
          title={<span className="font-semibold text-lg">Quick Actions</span>}
          className="shadow-sm"
        >
          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <div
                className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all bg-white"
                onClick={() => router.push("/admin/school/add")}
              >
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AntDesignPlusCircleOutlined className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Add New School
                </h3>
                <p className="text-gray-500 text-sm">
                  Register a new driving school
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:shadow-md transition-all bg-white"
                onClick={() => router.push("/admin/school")}
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏫</span>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Manage Schools
                </h3>
                <p className="text-gray-500 text-sm">
                  View and manage all schools
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:shadow-md transition-all bg-white"
              >
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  View Reports
                </h3>
                <p className="text-gray-500 text-sm">
                  Analytics and performance reports
                </p>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
