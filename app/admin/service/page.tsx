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
import { getPaginatedServices, type Service } from "@/services/service.api";
import { getCookie } from "cookies-next";
import { description } from "valibot";

const { Search } = Input;

interface ServiceData {
  key: string;
  id: number;
  serviceId: string;
  serviceName: string;
  category: string;
  duration: number; // in days for license validity
  status: "active" | "inactive" | "upcoming" | "discontinued";
  description: string;
}

const ServiceManagementPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch services from API
  const {
    data: servicesResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["services", currentPage, pageSize, filterStatus],
    queryFn: () =>
      getPaginatedServices({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText || undefined,
        },
        whereSearchInput: {
          status:
            filterStatus === "all" ? undefined : filterStatus.toUpperCase(),
        },
      }),
  });

  const services: ServiceData[] =
    servicesResponse?.data?.getPaginatedService?.data
      ?.filter((service: Service) => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
          service.serviceName.toLowerCase().includes(search) ||
          service.serviceId.toLowerCase().includes(search) ||
          service.description.toLowerCase().includes(search) ||
          service.category.toLowerCase().includes(search)
        );
      })
      ?.map((service: Service) => ({
        key: service.id.toString(),
        id: service.id,
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        category: service.category,
        duration: service.duration,
        status: service.status.toLowerCase() as "active" | "inactive" | "upcoming" | "discontinued",
        description: service.description,
      })) || [];

  const totalServices = servicesResponse?.data?.getPaginatedService?.total || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      inactive: "red",
      upcoming: "blue",
      discontinued: "default",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: "Active",
      inactive: "Inactive",
      upcoming: "Upcoming",
      discontinued: "Discontinued",
    };
    return texts[status] || status;
  };

  const getTypeColor = (type: string) => {
    return type === "license" ? "purple" : "cyan";
  };

  const getTypeText = (type: string) => {
    return type === "license" ? "License Service" : "Add-on";
  };

  const columns: ColumnsType<ServiceData> = [
    {
      title: "Service ID",
      dataIndex: "serviceId",
      key: "serviceId",
      width: 120,
      sorter: (a, b) => a.serviceId.localeCompare(b.serviceId),
    },
    {
      title: "Service Name",
      key: "serviceName",
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">
            {record.serviceName}
          </div>
          <div className="text-xs text-gray-500 mt-1">{record.category}</div>
        </div>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (days) => `${days} days`,
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
        { text: "Discontinued", value: "discontinued" },
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
          onClick={() => router.push(`/admin/service/${record.id}`)}
          className="!bg-blue-600"
        >
          View Details
        </Button>
      ),
    },
  ];

  const stats = {
    total: totalServices,
    active: services.filter((s) => s.status === "active").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                License Services & Add-ons
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage license services and additional offerings
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
                onClick={() => router.push("/admin/service/add")}
                className="!bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Add New Service
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
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-2xl">🎫</span>
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
                <p className="text-gray-600 text-xs mb-1">Active Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
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
                placeholder="Search by service name, ID, or description..."
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
                  { label: "Discontinued", value: "discontinued" },
                ]}
              />
            </Space>
          </div>
        </Card>

        {/* Services Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={services}
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
            scroll={{ x: 1400 }}
            size="middle"
          />
        </Card>
      </div>
    </div>
  );
};

export default ServiceManagementPage;
