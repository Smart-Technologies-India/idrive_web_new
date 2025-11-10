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
  MaterialSymbolsPersonRounded,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { Search } = Input;

interface CourseData {
  key: string;
  courseId: string;
  courseName: string;
  courseType: "beginner" | "intermediate" | "advanced" | "refresher";
  duration: string;
  totalHours: number;
  totalSessions: number;
  price: number;
  status: "active" | "inactive" | "upcoming" | "archived";
  enrolledStudents: number;
  maxCapacity: number;
  startDate: string;
  endDate: string;
  instructor: string;
  description: string;
}

const CourseManagementPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mock course data
  const [courses] = useState<CourseData[]>([
    {
      key: "1",
      courseId: "CRS-001",
      courseName: "Basic Driving Course",
      courseType: "beginner",
      duration: "30 days",
      totalHours: 20,
      totalSessions: 10,
      price: 8500,
      status: "active",
      enrolledStudents: 45,
      maxCapacity: 50,
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      instructor: "Ramesh Kumar",
      description: "Complete beginner driving course covering all basics",
    },
    {
      key: "2",
      courseId: "CRS-002",
      courseName: "Advanced Driving Training",
      courseType: "advanced",
      duration: "45 days",
      totalHours: 30,
      totalSessions: 15,
      price: 15000,
      status: "active",
      enrolledStudents: 28,
      maxCapacity: 30,
      startDate: "2024-10-15",
      endDate: "2024-11-29",
      instructor: "Suresh Sharma",
      description: "Advanced techniques and highway driving",
    },
    {
      key: "3",
      courseId: "CRS-003",
      courseName: "License Test Preparation",
      courseType: "intermediate",
      duration: "15 days",
      totalHours: 12,
      totalSessions: 6,
      price: 5500,
      status: "active",
      enrolledStudents: 35,
      maxCapacity: 40,
      startDate: "2024-11-05",
      endDate: "2024-11-20",
      instructor: "Vikram Singh",
      description: "Focused preparation for driving license test",
    },
    {
      key: "4",
      courseId: "CRS-004",
      courseName: "Refresher Driving Course",
      courseType: "refresher",
      duration: "10 days",
      totalHours: 8,
      totalSessions: 4,
      price: 4000,
      status: "active",
      enrolledStudents: 18,
      maxCapacity: 25,
      startDate: "2024-11-10",
      endDate: "2024-11-20",
      instructor: "Ajay Verma",
      description: "Quick refresher for licensed drivers",
    },
    {
      key: "5",
      courseId: "CRS-005",
      courseName: "Defensive Driving Course",
      courseType: "advanced",
      duration: "20 days",
      totalHours: 16,
      totalSessions: 8,
      price: 12000,
      status: "upcoming",
      enrolledStudents: 12,
      maxCapacity: 20,
      startDate: "2024-12-01",
      endDate: "2024-12-20",
      instructor: "Ramesh Kumar",
      description: "Learn defensive driving techniques and safety",
    },
    {
      key: "6",
      courseId: "CRS-006",
      courseName: "Night Driving Training",
      courseType: "intermediate",
      duration: "10 days",
      totalHours: 10,
      totalSessions: 5,
      price: 6500,
      status: "active",
      enrolledStudents: 22,
      maxCapacity: 25,
      startDate: "2024-11-01",
      endDate: "2024-11-11",
      instructor: "Suresh Sharma",
      description: "Specialized training for night driving",
    },
    {
      key: "7",
      courseId: "CRS-007",
      courseName: "Two Wheeler Training",
      courseType: "beginner",
      duration: "15 days",
      totalHours: 10,
      totalSessions: 5,
      price: 3500,
      status: "active",
      enrolledStudents: 38,
      maxCapacity: 40,
      startDate: "2024-10-25",
      endDate: "2024-11-09",
      instructor: "Vikram Singh",
      description: "Learn to ride two wheelers safely",
    },
    {
      key: "8",
      courseId: "CRS-008",
      courseName: "Highway Driving Mastery",
      courseType: "advanced",
      duration: "25 days",
      totalHours: 20,
      totalSessions: 10,
      price: 13500,
      status: "active",
      enrolledStudents: 15,
      maxCapacity: 20,
      startDate: "2024-11-08",
      endDate: "2024-12-03",
      instructor: "Ajay Verma",
      description: "Master highway and expressway driving",
    },
    {
      key: "9",
      courseId: "CRS-009",
      courseName: "Quick Learn - 7 Days",
      courseType: "beginner",
      duration: "7 days",
      totalHours: 14,
      totalSessions: 7,
      price: 7000,
      status: "active",
      enrolledStudents: 42,
      maxCapacity: 45,
      startDate: "2024-11-04",
      endDate: "2024-11-11",
      instructor: "Ramesh Kumar",
      description: "Intensive 7-day crash course",
    },
    {
      key: "10",
      courseId: "CRS-010",
      courseName: "Automatic Transmission Course",
      courseType: "beginner",
      duration: "20 days",
      totalHours: 15,
      totalSessions: 8,
      price: 9500,
      status: "active",
      enrolledStudents: 31,
      maxCapacity: 35,
      startDate: "2024-10-28",
      endDate: "2024-11-17",
      instructor: "Suresh Sharma",
      description: "Learn to drive automatic transmission vehicles",
    },
    {
      key: "11",
      courseId: "CRS-011",
      courseName: "Commercial Vehicle Training",
      courseType: "advanced",
      duration: "60 days",
      totalHours: 40,
      totalSessions: 20,
      price: 25000,
      status: "upcoming",
      enrolledStudents: 8,
      maxCapacity: 15,
      startDate: "2024-12-15",
      endDate: "2025-02-15",
      instructor: "Vikram Singh",
      description: "Training for commercial vehicle license",
    },
    {
      key: "12",
      courseId: "CRS-012",
      courseName: "Women's Special Batch",
      courseType: "beginner",
      duration: "30 days",
      totalHours: 20,
      totalSessions: 10,
      price: 8000,
      status: "inactive",
      enrolledStudents: 0,
      maxCapacity: 30,
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      instructor: "Ramesh Kumar",
      description: "Exclusive batch for women drivers",
    },
  ]);

  // Filter and search courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      course.courseId.toLowerCase().includes(searchText.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;
    const matchesType = filterType === "all" || course.courseType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      inactive: "red",
      upcoming: "blue",
      archived: "default",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: "Active",
      inactive: "Inactive",
      upcoming: "Upcoming",
      archived: "Archived",
    };
    return texts[status] || status;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      beginner: "cyan",
      intermediate: "orange",
      advanced: "purple",
      refresher: "magenta",
    };
    return colors[type] || "default";
  };

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      refresher: "Refresher",
    };
    return texts[type] || type;
  };

  const columns: ColumnsType<CourseData> = [
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
      width: 120,
      sorter: (a, b) => a.courseId.localeCompare(b.courseId),
    },
    {
      title: "Course Name",
      key: "courseName",
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">{record.courseName}</div>
          <div className="text-xs text-gray-500 mt-1">
            {record.totalSessions} Sessions • {record.totalHours} Hours
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "courseType",
      key: "courseType",
      width: 130,
      filters: [
        { text: "Beginner", value: "beginner" },
        { text: "Intermediate", value: "intermediate" },
        { text: "Advanced", value: "advanced" },
        { text: "Refresher", value: "refresher" },
      ],
      onFilter: (value, record) => record.courseType === value,
      render: (type) => (
        <Tag
          color={getTypeColor(type)}
          className="!text-sm !px-3 !py-1 !font-medium"
        >
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 110,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      align: "right",
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
        <span className="font-semibold text-gray-900">
          ₹{price.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Enrollment",
      key: "enrollment",
      width: 150,
      align: "center",
      sorter: (a, b) => a.enrolledStudents - b.enrolledStudents,
      render: (_, record) => {
        const percentage = (record.enrolledStudents / record.maxCapacity) * 100;
        const color =
          percentage >= 90 ? "red" : percentage >= 70 ? "orange" : "green";
        return (
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <MaterialSymbolsPersonRounded className="text-gray-600" />
              <span className="font-medium">
                {record.enrolledStudents}/{record.maxCapacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${color}-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
      width: 150,
      render: (instructor) => (
        <span className="text-gray-900">{instructor}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Upcoming", value: "upcoming" },
        { text: "Archived", value: "archived" },
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
      title: "Action",
      key: "action",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<AntDesignEyeOutlined />}
          onClick={() => router.push(`/mtadmin/course/${record.courseId}`)}
          className="!bg-blue-600"
        >
          View Details
        </Button>
      ),
    },
  ];

  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.status === "active").length,
    upcoming: courses.filter((c) => c.status === "upcoming").length,
    totalStudents: courses.reduce((sum, c) => sum + c.enrolledStudents, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Course Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage and monitor all driving courses
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
                onClick={() => router.push("/mtadmin/course/add")}
                className="!bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Add New Course
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
                <span className="text-blue-600 text-2xl">📚</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Courses</p>
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
                <p className="text-gray-600 text-xs mb-1">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-2xl">📅</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.upcoming}
                </p>
              </div>
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-2xl">👥</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents}
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
                placeholder="Search by course name, ID, instructor, or description..."
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
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Archived", value: "archived" },
                ]}
              />
              <Select
                value={filterType}
                onChange={(value) => {
                  setFilterType(value);
                  setCurrentPage(1);
                }}
                style={{ width: 150 }}
                size="large"
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Beginner", value: "beginner" },
                  { label: "Intermediate", value: "intermediate" },
                  { label: "Advanced", value: "advanced" },
                  { label: "Refresher", value: "refresher" },
                ]}
              />
            </Space>
          </div>
        </Card>

        {/* Courses Table */}
        <Card bordered={false} className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredCourses}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredCourses.length,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} courses`,
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

export default CourseManagementPage;
