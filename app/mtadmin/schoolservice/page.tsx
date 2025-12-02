"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Tag, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEyeOutlined,
  FluentMdl2Search,
  IcBaselineRefresh,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getPaginatedSchoolServices,
  type SchoolService,
} from "@/services/school-service.api";
import { getCookie } from "cookies-next";

const { Search } = Input;

interface SchoolServiceData {
  key: string;
  id: number;
  schoolServiceId: string;
  serviceName: string;
  serviceCategory: string;
  duration: number;
  licensePrice: number;
  addonPrice: number;
  status: string;
}

const SchoolServiceManagementPage = () => {
  const router = useRouter();
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const formatCategory = (category: string) => {
    const categoryLabels: Record<string, string> = {
      NEW_LICENSE: "New License",
      I_HOLD_LICENSE: "I Hold License",
      TRANSPORT: "Transport",
      IDP: "IDP",
    };
    return categoryLabels[category] || category;
  };

  // Fetch school services from API
  const {
    data: servicesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "schoolServices",
      schoolId,
      currentPage,
      pageSize,
      searchText,
      filterStatus,
    ],
    queryFn: () =>
      getPaginatedSchoolServices({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText,
        },
        whereSearchInput: {
          schoolId: schoolId,
          status: filterStatus == "all" ? undefined : filterStatus,
        },
      }),
    enabled: schoolId > 0,
  });

  const schoolServices: SchoolServiceData[] =
    servicesResponse?.data?.getPaginatedSchoolService?.data?.map(
      (service: SchoolService) => ({
        key: service.id.toString(),
        id: service.id,
        schoolServiceId: service.schoolServiceId,
        serviceName: service.service?.serviceName || "",
        serviceCategory: service.service?.category || "",
        duration: service.service?.duration || 0,
        licensePrice: service.licensePrice,
        addonPrice: service.addonPrice,
        status: service.status,
      })
    ) || [];

  const totalServices =
    servicesResponse?.data?.getPaginatedSchoolService?.total || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "green",
      INACTIVE: "red",
    };
    return colors[status] || "default";
  };

  const columns: ColumnsType<SchoolServiceData> = [
    {
      title: "Service ID",
      dataIndex: "schoolServiceId",
      key: "schoolServiceId",
      width: 150,
      sorter: (a, b) => a.schoolServiceId.localeCompare(b.schoolServiceId),
    },
    {
      title: "Service Details",
      key: "serviceDetails",
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {record.serviceName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.serviceName}
            </div>
            <div className="text-xs text-gray-600">{formatCategory(record.serviceCategory)}</div>
            <div className="text-xs text-gray-500">
              Duration: {record.duration} days
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "License Price",
      dataIndex: "licensePrice",
      key: "licensePrice",
      width: 150,
      align: "right",
      sorter: (a, b) => a.licensePrice - b.licensePrice,
      render: (price) => (
        <div className="font-semibold text-green-600">
          ₹{price.toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      title: "Addon Price",
      dataIndex: "addonPrice",
      key: "addonPrice",
      width: 150,
      align: "right",
      sorter: (a, b) => a.addonPrice - b.addonPrice,
      render: (price) => (
        <div className="font-semibold text-blue-600">
          ₹{price.toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center",
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "Inactive", value: "INACTIVE" },
      ],
      onFilter: (value, record) => record.status == value,
      render: (status: string) => (
        <Tag
          color={getStatusColor(status)}
          className="!text-sm !px-3 !py-1 !font-medium"
        >
          {status}
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
          onClick={() =>
            router.push(`/mtadmin/schoolservice/${record.id}`)
          }
          className="!bg-blue-600"
        >
          View Details
        </Button>
      ),
    },
  ];

  const stats = {
    total: schoolServices.length,
    active: schoolServices.filter((s) => s.status == "ACTIVE").length,
    inactive: schoolServices.filter((s) => s.status == "INACTIVE").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                School Service Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage service pricing for your school
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
                onClick={() => router.push("/mtadmin/schoolservice/add")}
                className="!bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Add New Service
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-2xl">📋</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Services</p>
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
                <p className="text-gray-600 text-xs mb-1">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
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
                <p className="text-gray-600 text-xs mb-1">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inactive}
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
                placeholder="Search by service name or ID..."
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
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
              />
            </Space>
          </div>
        </Card>

        {/* Services Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={schoolServices}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalServices,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} services`,
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

export default SchoolServiceManagementPage;
