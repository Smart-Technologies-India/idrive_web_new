"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Tag, Space, Select, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  AntDesignPlusCircleOutlined,
  AntDesignDeleteOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPaginatedHolidays,
  deleteHoliday,
  type Holiday,
} from "@/services/holiday.api";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";

const { Search } = Input;

interface HolidayData {
  key: string;
  id: number;
  declarationType: string;
  carInfo: string | null;
  dateRange: string;
  duration: number;
  slots: string[] | null;
  reason: string;
  status: "active" | "expired" | "upcoming";
  createdAt: string;
}

const HolidayManagementPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const userId: number = parseInt(getCookie("userId")?.toString() || "1");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch holidays from API
  const {
    data: holidaysResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "holidays",
      schoolId,
      currentPage,
      pageSize,
      searchText,
      filterType,
    ],
    queryFn: () =>
      getPaginatedHolidays({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
        },
        whereSearchInput: {
          schoolId: schoolId,
          declarationType:
            filterType == "all" ? undefined : filterType.toUpperCase(),
        },
      }),
    enabled: schoolId > 0,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id, userid }: { id: number; userid: number }) =>
      deleteHoliday(id, userid),
    onSuccess: () => {
      toast.success("Holiday deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete holiday");
    },
  });

  const handleDelete = (holiday: HolidayData) => {
    Modal.confirm({
      title: "Delete Holiday",
      content: `Are you sure you want to delete this holiday declaration for ${holiday.reason}?`,
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate({ id: holiday.id, userid: userId }),
    });
  };

  // Calculate status based on dates
  const getHolidayStatus = (
    startDate: string,
    endDate: string
  ): "active" | "expired" | "upcoming" => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (today > end) return "expired";
    if (today < start) return "upcoming";
    return "active";
  };

  // Calculate duration in days
  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const holidays: HolidayData[] =
    holidaysResponse?.data?.getPaginatedHoliday?.data
      ?.map((holiday: Holiday) => {
        const status = getHolidayStatus(holiday.startDate, holiday.endDate);

        // Apply status filter
        if (filterStatus !== "all" && status !== filterStatus) {
          return null;
        }

        // Parse slots from JSON string to array
        let parsedSlots: string[] | null = null;
        if (holiday.slots) {
          try {
            parsedSlots = JSON.parse(holiday.slots);
          } catch (e) {
            console.error("Failed to parse slots:", e);
            parsedSlots = null;
          }
        }

        return {
          key: holiday.id.toString(),
          id: holiday.id,
          declarationType: holiday.declarationType,
          carInfo: holiday.car
            ? `${holiday.car.carName} ${holiday.car.model} (${holiday.car.registrationNumber})`
            : null,
          dateRange: formatDateRange(holiday.startDate, holiday.endDate),
          duration: calculateDuration(holiday.startDate, holiday.endDate),
          slots: parsedSlots,
          reason: holiday.reason,
          status,
          createdAt: holiday.createdAt,
        };
      })
      .filter((h): h is HolidayData => h !== null) || [];

  const totalHolidays = holidaysResponse?.data?.getPaginatedHoliday?.total || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      expired: "default",
      upcoming: "blue",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: "Active",
      expired: "Expired",
      upcoming: "Upcoming",
    };
    return texts[status] || status;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ALL_CARS_MULTIPLE_DATES: "purple",
      ONE_CAR_MULTIPLE_DATES: "blue",
      ALL_CARS_PARTICULAR_SLOTS: "orange",
      ONE_CAR_PARTICULAR_SLOTS: "cyan",
    };
    return colors[type] || "default";
  };

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      ALL_CARS_MULTIPLE_DATES: "All Cars - Full Day",
      ONE_CAR_MULTIPLE_DATES: "One Car - Full Day",
      ALL_CARS_PARTICULAR_SLOTS: "All Cars - Slots",
      ONE_CAR_PARTICULAR_SLOTS: "One Car - Slots",
    };
    return texts[type] || type;
  };

  const columns: ColumnsType<HolidayData> = [
    {
      title: "Type",
      dataIndex: "declarationType",
      key: "declarationType",
      width: 180,
      render: (type) => (
        <Tag
          color={getTypeColor(type)}
          className="!text-xs !px-2 !py-1 !font-medium"
        >
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: "Car / Scope",
      dataIndex: "carInfo",
      key: "carInfo",
      width: 200,
      render: (carInfo) => (
        <span className="text-sm">
          {carInfo || <Tag color="purple">All Cars</Tag>}
        </span>
      ),
    },
    {
      title: "Date Range",
      key: "dateRange",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium">{record.dateRange}</div>
          <div className="text-xs text-gray-500">
            {record.duration} day{record.duration > 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Slots",
      dataIndex: "slots",
      key: "slots",
      width: 120,
      render: (slots) => {
        if (!slots || slots.length == 0) {
          return <Tag color="purple">Full Day</Tag>;
        }
        return (
          <Tag color="orange">
            {slots.length} slot{slots.length > 1 ? "s" : ""}
          </Tag>
        );
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
      render: (reason) => (
        <span className="text-sm text-gray-700">{reason}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
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
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<AntDesignEyeOutlined />}
            onClick={() => router.push(`/mtadmin/holiday/${record.id}`)}
          >
            View
          </Button>
          <Button
            danger
            size="small"
            icon={<AntDesignDeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const stats = {
    total: holidays.length,
    active: holidays.filter((h) => h.status == "active").length,
    upcoming: holidays.filter((h) => h.status == "upcoming").length,
    expired: holidays.filter((h) => h.status == "expired").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">🚫</span>
                Holiday Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage car availability holidays and blocked slots
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
                onClick={() => router.push("/mtadmin/holiday/add")}
                className="!bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Declare Holiday
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
                <span className="text-blue-600 text-2xl">📅</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Holidays</p>
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
                <p className="text-gray-600 text-xs mb-1">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-2xl">🔜</span>
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
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-2xl">⌛</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.expired}
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
                placeholder="Search by holiday ID, reason, or car info..."
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
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Expired", value: "expired" },
                ]}
              />
              <Select
                value={filterType}
                onChange={(value) => {
                  setFilterType(value);
                  setCurrentPage(1);
                }}
                style={{ width: 200 }}
                size="large"
                options={[
                  { label: "All Types", value: "all" },
                  {
                    label: "All Cars - Full Day",
                    value: "ALL_CARS_MULTIPLE_DATES",
                  },
                  {
                    label: "One Car - Full Day",
                    value: "ONE_CAR_MULTIPLE_DATES",
                  },
                  {
                    label: "All Cars - Slots",
                    value: "ALL_CARS_PARTICULAR_SLOTS",
                  },
                  {
                    label: "One Car - Slots",
                    value: "ONE_CAR_PARTICULAR_SLOTS",
                  },
                ]}
              />
            </Space>
          </div>
        </Card>
        <div></div>

        {/* Holidays Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={holidays}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalHolidays,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} holidays`,
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

export default HolidayManagementPage;
