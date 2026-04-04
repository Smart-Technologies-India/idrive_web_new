"use client";

import { useState } from "react";
import {
  Button,
  DatePicker,
  Table,
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
  courseName?: string;
  carName?: string;
}

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  booking?: Booking;
  createdAt: string;
}

const REPORT_TITLE = "Revenue Analysis Report";

const RevenueAnalysisPage = () => {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const { data, isLoading } = useQuery<Payment[]>({
    queryKey: ["revenue-analysis-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllPayment($whereSearchInput: SearchPaymentInput!) {
          getAllPayment(whereSearchInput: $whereSearchInput) {
            id amount paymentDate paymentMethod createdAt
            booking { id courseName carName }
          }
        }`,
        variables: { whereSearchInput: {} },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payments = (response?.data as any)?.getAllPayment || [];
      if (dateRange) {
        return payments.filter((p: Payment) => {
          const d = dayjs(p.paymentDate || p.createdAt);
          return d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"));
        });
      }
      return payments;
    },
    enabled: schoolId > 0,
  });

  const totalRevenue = data?.reduce((s, p) => s + (p.amount || 0), 0) || 0;

  const revenueByCourse =
    data?.reduce((acc: Record<string, number>, p) => {
      const course = p.booking?.courseName || "Unknown";
      if (!acc[course]) acc[course] = 0;
      acc[course] += p.amount || 0;
      return acc;
    }, {}) || {};

  const revenueByMethod =
    data?.reduce((acc: Record<string, number>, p) => {
      const method = p.paymentMethod || "Unknown";
      if (!acc[method]) acc[method] = 0;
      acc[method] += p.amount || 0;
      return acc;
    }, {}) || {};

  const courseData = Object.entries(revenueByCourse).map(([course, amount]) => ({
    course,
    amount,
    percentage: totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : "0",
  }));

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
      const statsCards = document.querySelectorAll(".report-content .ant-statistic");
      if (statsCards.length > 0) {
        headerRows.push('"Summary Statistics:"');
        statsCards.forEach((card) => {
          const title = card.querySelector(".ant-statistic-title")?.textContent?.trim() || "";
          const value = card.querySelector(".ant-statistic-content")?.textContent?.trim().replace(/\s+/g, " ") || "";
          if (title && value) headerRows.push(`"${title}: ${value}"`);
        });
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
    { title: "Course Name", dataIndex: "course", key: "course" },
    {
      title: "Revenue",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `₹${amount.toLocaleString()}`,
      sorter: (a: { amount: number }, b: { amount: number }) => a.amount - b.amount,
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (p: string) => `${p}%`,
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button icon={<Fa6SolidArrowLeftLong />} onClick={() => router.back()} size="large">Back</Button>
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-3 rounded-lg">
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
        </div>

        <div className="report-content bg-white rounded-xl border border-gray-200 p-6">
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <div className="bg-linear-to-br from-amber-500 to-amber-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Total Revenue</span>}
                  value={totalRevenue}
                  prefix={<span className="text-white">₹</span>}
                  precision={2}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Cash Revenue</span>}
                  value={revenueByMethod.CASH || 0}
                  prefix={<span className="text-white">₹</span>}
                  precision={2}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Online Revenue</span>}
                  value={(revenueByMethod.CARD || 0) + (revenueByMethod.UPI || 0) + (revenueByMethod.BANK_TRANSFER || 0)}
                  prefix={<span className="text-white">₹</span>}
                  precision={2}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={courseData}
            loading={isLoading}
            rowKey="course"
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

export default RevenueAnalysisPage;
