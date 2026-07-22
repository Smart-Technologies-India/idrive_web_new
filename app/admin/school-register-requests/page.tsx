"use client";

import { useState } from "react";
import { Card, Table, Input, Button, Space, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FluentMdl2Search, IcBaselineRefresh } from "@/components/icons";
import { useQuery } from "@tanstack/react-query";
import {
  type DriverSchoolRegistration,
  getPaginatedDriverSchoolRegistrations,
} from "@/services/driver-school-registration.api";
import { formatDate } from "@/utils/date-format";

const { Search } = Input;

const SchoolRegisterRequestsPage = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["school-register-requests", currentPage, pageSize, searchText],
    queryFn: () =>
      getPaginatedDriverSchoolRegistrations({
        searchPaginationInput: {
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          search: searchText || undefined,
        },
        whereSearchInput: {},
      }),
  });

  const requestData =
    data?.data?.getPaginatedDriverSchoolRegistration?.data || [];
  const totalRequests =
    data?.data?.getPaginatedDriverSchoolRegistration?.total || 0;

  const filteredData = requestData.filter((request) => {
    if (!searchText.trim()) return true;
    const key = searchText.toLowerCase();
    return (
      request.name.toLowerCase().includes(key) ||
      request.number.toLowerCase().includes(key) ||
      request.schoolName.toLowerCase().includes(key) ||
      request.schoolAddress.toLowerCase().includes(key)
    );
  });

  const columns: ColumnsType<DriverSchoolRegistration> = [
    {
      title: "Request ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: number) => `REQ-${String(id).padStart(4, "0")}`,
    },
    {
      title: "Applicant",
      key: "applicant",
      width: 260,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-linear-to-r from-indigo-600 to-blue-600 shrink-0"
          >
            {record.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {record.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{record.number}</p>
          </div>
        </div>
      ),
    },
    {
      title: "School Name",
      dataIndex: "schoolName",
      key: "schoolName",
      width: 240,
      render: (schoolName: string) => (
        <p className="font-medium text-gray-900 truncate">{schoolName}</p>
      ),
    },
    {
      title: "School Address",
      dataIndex: "schoolAddress",
      key: "schoolAddress",
      ellipsis: true,
      render: (schoolAddress: string) => (
        <p className="text-sm text-gray-700">{schoolAddress}</p>
      ),
    },
    {
      title: "Requested On",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                School Register Requests
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                View all school registration requests submitted by users
              </p>
            </div>
            <Button
              type="default"
              icon={<IcBaselineRefresh className="text-lg" />}
              size="large"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRequests}
                </p>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm md:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <Search
                  placeholder="Search by name, mobile, school, or address..."
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
              <Space>
                <p className="text-sm text-gray-500 mb-0">
                  Showing {filteredData.length} of {requestData.length} on this page
                </p>
              </Space>
            </div>
          </Card>
        </div>

        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalRequests,
              onChange: (page) => setCurrentPage(page),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} requests`,
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

export default SchoolRegisterRequestsPage;
