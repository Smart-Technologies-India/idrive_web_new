"use client";

import { useState, useMemo } from "react";
import { Card, Input, Button, Tag, Space, Select } from "antd";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
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
  automaticPrice?: number;
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
  const [sorting, setSorting] = useState<SortingState>([]);
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
      JSON.stringify(sorting),
    ],
    queryFn: () => {
      // Convert TanStack sorting to backend orderBy format
      const orderBy = sorting.map((sort) => ({
        field: sort.id,
        direction: sort.desc ? ("desc" as const) : ("asc" as const),
      }));

      return getPaginatedCourses({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
          filters: ["courseName", "courseId", "description"],
          orderBy: orderBy.length > 0 ? orderBy : undefined,
        },
        whereSearchInput: {
          schoolId: schoolId,
          status:
            filterStatus == "all" ? undefined : filterStatus.toUpperCase(),
          courseType:
            filterType == "all" ? undefined : filterType.toUpperCase(),
        },
      });
    },
    enabled: schoolId > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
      automaticPrice: course.automaticPrice,
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

  // Define columns using TanStack Table
  const columns = useMemo<ColumnDef<CourseData>[]>(
    () => [
      {
        accessorKey: "courseId",
        header: "Course ID",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        enableSorting: true,
      },
      {
        id: "courseName",
        header: "Course Name",
        cell: (info) => (
          <div>
            <div className="font-semibold text-gray-900">
              {info.row.original.courseName}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {info.row.original.courseDays} days • {info.row.original.minsPerDay} min/day
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "courseType",
        header: "Type",
        cell: (info) => {
          const type = info.getValue() as string;
          return (
            <Tag
              color={getTypeColor(type)}
              className="!text-sm !px-3 !py-1 !font-medium"
            >
              {getTypeText(type)}
            </Tag>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "minsPerDay",
        header: "Hours/Day",
        cell: (info) => `${info.getValue() as number} min`,
        enableSorting: true,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: (info) => (
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              ₹{(info.getValue() as number).toLocaleString("en-IN")}
            </div>
            {info.row.original.automaticPrice && (
              <div className="text-xs text-blue-600 mt-1">
                Auto: ₹{info.row.original.automaticPrice.toLocaleString("en-IN")}
              </div>
            )}
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "enrolledStudents",
        header: "Enrollment",
        cell: (info) => (
          <div className="flex items-center justify-center gap-2">
            <MaterialSymbolsPersonRounded className="text-gray-600" />
            <span className="font-medium">{info.getValue() as number}</span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <Tag
              color={getStatusColor(status)}
              className="!text-sm !px-3 !py-1 !font-medium"
            >
              {getStatusText(status)}
            </Tag>
          );
        },
        enableSorting: false,
      },
      {
        id: "action",
        header: "Action",
        cell: (info) => (
          <Button
            type="primary"
            icon={<AntDesignEyeOutlined />}
            onClick={() => router.push(`/mtadmin/course/${info.row.original.id}`)}
            className="!bg-blue-600"
          >
            View Details
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [router]
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: courses,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Backend handles pagination
    manualSorting: true, // Backend handles sorting
    pageCount: Math.ceil(totalCourses / pageSize),
  });

  const stats = {
    total: totalCourses,
    active: courses.filter((c) => c.status === "active").length,
    upcoming: courses.filter((c) => c.status === "upcoming").length,
    totalStudents: courses.reduce((sum, c) => sum + c.enrolledStudents, 0),
  };

  // Calculate pagination info for display
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCourses);

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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center gap-2"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="text-xs">
                                {{
                                  asc: "↑",
                                  desc: "↓",
                                }[header.column.getIsSorted() as string] ?? "↕"}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No courses found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.original.id}
                      className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-700">
              {courses.length > 0 ? (
                <>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalCourses)}{" "}
                  of {totalCourses} courses
                </>
              ) : (
                <>No courses to display</>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {currentPage} of {Math.ceil(totalCourses / pageSize)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalCourses / pageSize), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalCourses / pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CourseManagementPage;
