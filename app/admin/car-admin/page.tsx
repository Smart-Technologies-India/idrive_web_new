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
import { getPaginatedCarAdmins, type CarAdmin } from "@/services/car-admin.api";

const { Search } = Input;

interface CarAdminData {
  key: string;
  id: number;
  name: string;
  manufacturer: string;
  category: "SEDAN" | "MUV" | "SUV" | "HATCHBACK";
  status: "active" | "inactive" | "maintenance";
}

const CarAdminManagementPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch car admins from API
  const {
    data: carAdminsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["carAdmins", currentPage, pageSize, filterStatus, filterCategory],
    queryFn: () =>
      getPaginatedCarAdmins({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText || undefined,
        },
        whereSearchInput: {
          status:
            filterStatus === "all" ? undefined : filterStatus.toUpperCase(),
          category:
            filterCategory === "all" ? undefined : filterCategory.toUpperCase(),
        },
      }),
  });

  const carAdmins: CarAdminData[] =
    carAdminsResponse?.data?.getPaginatedCarAdmin?.data
      ?.filter((carAdmin: CarAdmin) => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
          carAdmin.name.toLowerCase().includes(search) ||
          carAdmin.manufacturer.toLowerCase().includes(search) ||
          carAdmin.category.toLowerCase().includes(search)
        );
      })
      ?.map((carAdmin: CarAdmin) => ({
        key: carAdmin.id.toString(),
        id: carAdmin.id,
        name: carAdmin.name,
        manufacturer: carAdmin.manufacturer,
        category: carAdmin.category,
        status: carAdmin.status.toLowerCase() as "active" | "inactive" | "maintenance",
      })) || [];

  const totalCarAdmins = carAdminsResponse?.data?.getPaginatedCarAdmin?.total || 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      inactive: "red",
      maintenance: "orange",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: "Active",
      inactive: "Inactive",
      maintenance: "Maintenance",
    };
    return texts[status] || status;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SEDAN: "blue",
      MUV: "purple",
      SUV: "green",
      HATCHBACK: "cyan",
    };
    return colors[category] || "default";
  };

  const getCategoryText = (category: string) => {
    const texts: Record<string, string> = {
      SEDAN: "Sedan",
      MUV: "MUV",
      SUV: "SUV",
      HATCHBACK: "Hatchback",
    };
    return texts[category] || category;
  };

  const columns: ColumnsType<CarAdminData> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      sorter: (a, b) => a.id - b.id,
      render: (id) => <span className="font-semibold text-gray-700">#{id}</span>,
    },
    {
      title: "Car Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <span className="font-semibold text-gray-900">{name}</span>
      ),
    },
    {
      title: "Manufacturer",
      dataIndex: "manufacturer",
      key: "manufacturer",
      width: 200,
      sorter: (a, b) => a.manufacturer.localeCompare(b.manufacturer),
      render: (manufacturer) => (
        <span className="text-gray-700">{manufacturer}</span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      align: "center",
      filters: [
        { text: "Sedan", value: "SEDAN" },
        { text: "MUV", value: "MUV" },
        { text: "SUV", value: "SUV" },
        { text: "Hatchback", value: "HATCHBACK" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag
          color={getCategoryColor(category)}
          className="!text-sm !px-3 !py-1 !font-medium"
        >
          {getCategoryText(category)}
        </Tag>
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
        { text: "Maintenance", value: "maintenance" },
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
          onClick={() => router.push(`/admin/car-admin/${record.id}`)}
          className="!bg-blue-600"
        >
          View Details
        </Button>
      ),
    },
  ];

  const stats = {
    total: totalCarAdmins,
    active: carAdmins.filter((c) => c.status === "active").length,
    sedan: carAdmins.filter((c) => c.category === "SEDAN").length,
    suv: carAdmins.filter((c) => c.category === "SUV").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Car Master Data
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage standardized car information for all schools
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
                onClick={() => router.push("/admin/car-admin/add")}
                className="!bg-gradient-to-r from-green-600 to-emerald-600"
              >
                Add New Car
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-4xl">🚗</div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Cars</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Sedans</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sedan}</p>
              </div>
              <div className="text-4xl">🚙</div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">SUVs</p>
                <p className="text-2xl font-bold text-green-600">{stats.suv}</p>
              </div>
              <div className="text-4xl">🚐</div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Search
              placeholder="Search by name or manufacturer..."
              allowClear
              enterButton={<FluentMdl2Search className="text-lg" />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
            />

            <Select
              size="large"
              placeholder="Filter by Category"
              value={filterCategory}
              onChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
              options={[
                { label: "All Categories", value: "all" },
                { label: "Sedan", value: "sedan" },
                { label: "MUV", value: "muv" },
                { label: "SUV", value: "suv" },
                { label: "Hatchback", value: "hatchback" },
              ]}
              className="w-full"
            />

            <Select
              size="large"
              placeholder="Filter by Status"
              value={filterStatus}
              onChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Maintenance", value: "maintenance" },
              ]}
              className="w-full"
            />

            <Button
              size="large"
              onClick={() => {
                setSearchText("");
                setFilterStatus("all");
                setFilterCategory("all");
                setCurrentPage(1);
              }}
              className="w-full"
            >
              Clear All Filters
            </Button>
          </div>
        </Card>

        {/* Car Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={carAdmins}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCarAdmins,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} cars`,
              onChange: (page) => setCurrentPage(page),
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default CarAdminManagementPage;
