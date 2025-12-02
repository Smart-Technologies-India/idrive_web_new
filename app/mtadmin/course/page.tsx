"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Tag, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  AntDesignPlusCircleOutlined,
  MaterialSymbolsPersonRounded,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedCourses, type Course } from "@/services/course.api";
import { getCookie } from "cookies-next";

const { Search } = Input;

interface CourseData {
  key: string;
  id: number;
  courseId: string;
  courseName: string;
  courseType: "beginner" | "intermediate" | "advanced" | "refresher";
  minsPerDay: number;
  courseDays: number;
  price: number;
  status: "active" | "inactive" | "upcoming" | "archived";
  enrolledStudents: number;
  description: string;
}

const CourseManagementPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch courses from API
  const {
    data: coursesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "courses",
      schoolId,
      currentPage,
      pageSize,
      searchText,
      filterStatus,
      filterType,
    ],
    queryFn: () =>
      getPaginatedCourses({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
        },
        whereSearchInput: {
          schoolId: schoolId,
          status:
            filterStatus == "all" ? undefined : filterStatus.toUpperCase(),
          courseType:
            filterType == "all" ? undefined : filterType.toUpperCase(),
        },
      }),
    enabled: schoolId > 0,
  });

  const courses: CourseData[] =
    coursesResponse?.data?.getPaginatedCourse?.data?.map((course: Course) => ({
      key: course.id.toString(),
      id: course.id,
      courseId: course.courseId,
      courseName: course.courseName,
      courseType: course.courseType.toLowerCase() as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "refresher",
      minsPerDay: course.minsPerDay,
      courseDays: course.courseDays,
      price: course.price,
      status: course.status.toLowerCase() as
        | "active"
        | "inactive"
        | "upcoming"
        | "archived",
      enrolledStudents: course.enrolledStudents,
      description: course.description,
    })) || [];

  const totalCourses = coursesResponse?.data?.getPaginatedCourse?.total || 0;

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
            {record.courseDays} days • {record.minsPerDay} min/day
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
      onFilter: (value, record) => record.courseType == value,
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
      title: "Hours/Day",
      dataIndex: "minsPerDay",
      key: "minsPerDay",
      width: 110,
      render: (hours) => `${hours} min`,
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
      width: 120,
      align: "center",
      sorter: (a, b) => a.enrolledStudents - b.enrolledStudents,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <MaterialSymbolsPersonRounded className="text-gray-600" />
          <span className="font-medium">{record.enrolledStudents}</span>
        </div>
      ),
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
      onFilter: (value, record) => record.status == value,
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
          onClick={() => router.push(`/mtadmin/course/${record.id}`)}
          className="!bg-blue-600"
        >
          View Details
        </Button>
      ),
    },
  ];

  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.status == "active").length,
    upcoming: courses.filter((c) => c.status == "upcoming").length,
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
                onClick={() => refetch()}
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
          <Card className="shadow-sm">
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

          <Card className="shadow-sm">
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

          <Card className="shadow-sm">
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

          <Card className="shadow-sm">
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
        <Card className="shadow-sm">
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
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={courses}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCourses,
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
