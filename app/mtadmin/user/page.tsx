"use client";

import { useState, useMemo } from "react";
import { Card, Input, Button, Space, Select } from "antd";
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
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedUsers } from "@/services/user.api";
import { formatDate } from "@/utils/date-format";

const { Search } = Input;

interface UserData {
  id: number;
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 10;
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Fetch users from backend
  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "user-list",
      schoolId,
      searchText,
      filterStatus,
      currentPage,
      JSON.stringify(sorting), // Stringify to ensure React Query detects changes
    ],
    queryFn: () => {
      // Convert TanStack sorting to backend orderBy format
      const orderBy = sorting.map((sort) => ({
        field: sort.id === "userId" ? "id" : sort.id, // Map userId to id for backend
        direction: sort.desc ? ("desc" as const) : ("asc" as const),
      }));

      return getPaginatedUsers({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
          filters: ["name", "email", "contact1"],
          orderBy: orderBy.length > 0 ? orderBy : undefined,
        },
        whereSearchInput: {
          schoolId,
          role: "USER",
          status:
            filterStatus !== "all" ? filterStatus.toUpperCase() : undefined,
        },
      });
    },
    enabled: schoolId > 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  interface BackendUser {
    id: number;
    name: string;
    email?: string;
    contact1: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
  }

  const users: UserData[] = (
    usersResponse?.data?.getPaginatedUser?.data || []
  ).map((u: BackendUser) => ({
    id: u.id,
    key: u.id.toString(),
    userId: `USR-${u.id.toString().padStart(3, "0")}`,
    name: u.name,
    email: u.email || "",
    mobile: u.contact1,
    status: u.status,
    joinedDate: u.createdAt,
  }));
  const totalUsers = usersResponse?.data?.getPaginatedUser?.total || 0;

  // Define columns using TanStack Table
  const columns = useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        accessorKey: "userId",
        header: "User ID",
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => (
          <span className="font-semibold text-gray-900">{info.getValue() as string}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => (
          <span className="text-xs text-gray-500">{info.getValue() as string}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
        cell: (info) => (
          <span className="text-xs text-gray-600">{info.getValue() as string}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "joinedDate",
        header: "Joined Date",
        cell: (info) => formatDate(info.getValue() as string),
        enableSorting: true,
      },
      {
        id: "action",
        header: "Action",
        cell: (info) => (
          <Button
            type="primary"
            icon={<AntDesignEyeOutlined />}
            onClick={() => router.push(`/mtadmin/user/${info.row.original.id}`)}
            className="!bg-blue-600"
          >
            View Profile
          </Button>
        ),
      },
    ],
    [router]
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Backend handles pagination
    manualSorting: true, // Backend handles sorting
    pageCount: Math.ceil(totalUsers / pageSize),
  });

  // Calculate pagination info for display
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalUsers);

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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-2xl">👥</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalUsers}
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
                <p className="text-gray-600 text-xs mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === "ACTIVE").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-2xl">✕</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === "INACTIVE").length}
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
        {/* Users Table */}
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
                      No users found
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
              {users.length > 0 ? (
                <>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalUsers)}{" "}
                  of {totalUsers} users
                </>
              ) : (
                <>No users to display</>
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
                Page {currentPage} of {Math.ceil(totalUsers / pageSize)}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalUsers / pageSize), prev + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(totalUsers / pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default UserManagementPage;
