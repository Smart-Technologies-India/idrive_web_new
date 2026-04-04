"use client";

import { useState } from "react";
import {
  Button,
  DatePicker,
  Select,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  message,
} from "antd";
import {
  Fa6RegularFileLines,
  AntDesignBookOutlined,
  MaterialSymbolsCalendarClockRounded,
  Fa6SolidArrowLeftLong,
} from "@/components/icons";
import dayjs, { Dayjs } from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";

const { RangePicker } = DatePicker;

interface Booking {
  id: number;
  customerName: string;
  customerMobile: string;
}

interface LicenseApplication {
  id: number;
  dlApplicationNumber?: string;
  llNumber?: string;
  status: string;
  testStatus?: string;
  testDate?: string;
  issuedDate?: string;
  bookingService?: {
    booking?: Booking;
    serviceName?: string;
    user?: { name: string; surname?: string; contact1: string };
  };
}

const REPORT_TITLE = "License Applications Report";

const LicenseApplicationsPage = () => {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery<LicenseApplication[]>({
    queryKey: ["license-applications-report", dateRange, schoolId, statusFilter],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllLicenseApplication($whereSearchInput: WhereLicenseApplicationSearchInput!) {
          getAllLicenseApplication(whereSearchInput: $whereSearchInput) {
            id dlApplicationNumber llNumber status testStatus testDate issuedDate
            bookingService {
              user { name surname contact1 }
              booking { customerName customerMobile }
              serviceName
            }
          }
        }`,
        variables: { whereSearchInput: {} },
      });
      let applications: LicenseApplication[] =
        (response?.data as { getAllLicenseApplication: LicenseApplication[] })?.getAllLicenseApplication || [];

      if (dateRange) {
        applications = applications.filter((app) => {
          const d = dayjs(app.testDate || app.issuedDate);
          return d && d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"));
        });
      }
      if (statusFilter) {
        applications = applications.filter((app) => app.status === statusFilter);
      }
      return applications;
    },
    enabled: schoolId > 0,
  });

  const statusCounts =
    data?.reduce((acc: Record<string, number>, app) => {
      const status = app.status || "PENDING";
      if (!acc[status]) acc[status] = 0;
      acc[status]++;
      return acc;
    }, {}) || {};

  const handleExport = (exportAll = false) => {
    try {
      const tableElement = document.querySelector(".report-content table");
      if (!tableElement) { message.error("No data to export"); return; }
      const generatedDate = dayjs().format("DD MMM YYYY, hh:mm A");
      const headerRows = [`"${REPORT_TITLE}"`, `"Generated on: ${generatedDate}"`, ""];
      if (dateRange?.[0] && dateRange?.[1]) {
        headerRows.push(`"Period: ${dateRange[0].format("DD MMM YYYY")} to ${dateRange[1].format("DD MMM YYYY")}"`);
        headerRows.push("");
      }
      const headers: string[] = [];
      tableElement.querySelectorAll("thead th").forEach((cell) => {
        const text = cell.textContent?.trim() || "";
        if (text) headers.push(text);
      });
      const rows: string[][] = [];
      const bodyRows = exportAll
        ? tableElement.querySelectorAll("tbody tr.ant-table-row")
        : tableElement.querySelectorAll("tbody tr");
      bodyRows.forEach((row) => {
        const rowData: string[] = [];
        row.querySelectorAll("td").forEach((cell) => {
          rowData.push(cell.textContent?.trim().replace(/\s+/g, " ") || "");
        });
        if (rowData.length > 0) rows.push(rowData);
      });
      const csvContent = [
        ...headerRows,
        headers.join(","),
        ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", `${REPORT_TITLE.replace(/\s+/g, "_")}${exportAll ? "_ALL" : ""}_${dayjs().format("YYYY-MM-DD_HH-mm")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(`Report exported!${exportAll ? " (All records)" : ""}`);
    } catch {
      message.error("Failed to export report");
    }
  };

  const columns = [
    {
      title: "LL Number",
      dataIndex: "llNumber",
      key: "llNumber",
      render: (v: string) => v || "N/A",
    },
    {
      title: "DL Application No.",
      dataIndex: "dlApplicationNumber",
      key: "dlApplicationNumber",
      render: (v: string) => v || "N/A",
    },
    {
      title: "Student Name",
      key: "studentName",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => {
        return record.bookingService?.user
          ? `${record.bookingService.user.name} ${record.bookingService.user.surname || ""}`.trim()
          : record.bookingService?.booking?.customerName || "N/A";
      },
    },
    {
      title: "Contact",
      key: "contact",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) =>
        record.bookingService?.user?.contact1 || record.bookingService?.booking?.customerMobile || "N/A",
    },
    {
      title: "Service Type",
      key: "serviceType",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => record.bookingService?.serviceName || "N/A",
    },
    {
      title: "Test Date",
      dataIndex: "testDate",
      key: "testDate",
      render: (d: string) => (d ? dayjs(d).format("DD MMM YYYY") : "N/A"),
    },
    {
      title: "Test Status",
      dataIndex: "testStatus",
      key: "testStatus",
      render: (testStatus: string) => {
        const colors: Record<string, string> = { PASSED: "green", FAILED: "red", ABSENT: "orange", NONE: "default" };
        return <Tag color={colors[testStatus] || "default"}>{testStatus}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          CLOSED: "green", DL_APPLIED: "blue", DL_PENDING: "orange", LL_APPLIED: "cyan", PENDING: "orange",
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Issued Date",
      dataIndex: "issuedDate",
      key: "issuedDate",
      render: (d: string) => (d ? dayjs(d).format("DD MMM YYYY") : "N/A"),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button icon={<Fa6SolidArrowLeftLong />} onClick={() => router.back()} size="large">Back</Button>
            <div className="flex items-center gap-3">
              <div className="bg-violet-500 p-3 rounded-lg">
                <Fa6RegularFileLines className="text-xl text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{REPORT_TITLE}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button icon={<AntDesignBookOutlined />} onClick={() => handleExport(false)} size="large">Export Current Page</Button>
            <Button type="primary" icon={<AntDesignBookOutlined />} onClick={() => handleExport(true)} size="large">Export All Records</Button>
          </div>
        </div>

        <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">🔍 Filters</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MaterialSymbolsCalendarClockRounded className="inline mr-1" /> Date Range
              </label>
              <RangePicker
                className="w-full"
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                format="DD MMM YYYY"
                size="large"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select
                placeholder="Filter by Status"
                allowClear
                style={{ width: "100%" }}
                onChange={(value) => setStatusFilter(value || null)}
                value={statusFilter}
                size="large"
                options={[
                  { label: "Pending", value: "PENDING" },
                  { label: "Closed", value: "CLOSED" },
                  { label: "LL Applied", value: "LL_APPLIED" },
                  { label: "DL Pending", value: "DL_PENDING" },
                  { label: "DL Applied", value: "DL_APPLIED" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="report-content bg-white rounded-xl border border-gray-200 p-6">
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <div className="bg-linear-to-br from-violet-500 to-violet-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Total Applications</span>}
                  value={data?.length || 0}
                  prefix={<span className="text-white text-2xl">📄</span>}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Closed</span>}
                  value={statusCounts.CLOSED || 0}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Pending</span>}
                  value={(statusCounts.PENDING || 0) + (statusCounts.DL_PENDING || 0)}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Applied</span>}
                  value={(statusCounts.LL_APPLIED || 0) + (statusCounts.DL_APPLIED || 0)}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "25", "50", "100"],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
            className="shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default LicenseApplicationsPage;
