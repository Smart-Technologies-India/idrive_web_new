"use client";

import { useState } from "react";
import {
  Button,
  DatePicker,
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

interface BookingSession {
  id: number;
  sessionDate: string;
  slot: string;
  status: string;
}

const REPORT_TITLE = "Peak Hours Analysis";

const PeakHoursPage = () => {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["peak-hours-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id sessionDate slot status
          }
        }`,
        variables: { whereSearchInput: {} },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];
      if (dateRange) {
        return sessions.filter((s: BookingSession) => {
          const d = dayjs(s.sessionDate);
          return d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"));
        });
      }
      return sessions;
    },
    enabled: schoolId > 0,
  });

  const slotStats = data?.reduce((acc: Record<string, number>, s) => {
    const slot = s.slot || "Unknown";
    if (!acc[slot]) acc[slot] = 0;
    acc[slot]++;
    return acc;
  }, {}) || {};

  const dayStats = data?.reduce((acc: Record<string, number>, s) => {
    const day = dayjs(s.sessionDate).format("dddd");
    if (!acc[day]) acc[day] = 0;
    acc[day]++;
    return acc;
  }, {}) || {};

  const slotData = Object.entries(slotStats).map(([slot, count]) => ({ slot, count })).sort((a, b) => b.count - a.count);
  const dayData = Object.entries(dayStats).map(([day, count]) => ({ day, count })).sort((a, b) => b.count - a.count);

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

  const slotColumns = [
    { title: "Time Slot", dataIndex: "slot", key: "slot" },
    {
      title: "Total Bookings",
      dataIndex: "count",
      key: "count",
      render: (count: number) => <Tag color="blue">{count}</Tag>,
      sorter: (a: { count: number }, b: { count: number }) => b.count - a.count,
    },
  ];

  const dayColumns = [
    { title: "Day of Week", dataIndex: "day", key: "day" },
    {
      title: "Total Bookings",
      dataIndex: "count",
      key: "count",
      render: (count: number) => <Tag color="purple">{count}</Tag>,
      sorter: (a: { count: number }, b: { count: number }) => b.count - a.count,
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button icon={<Fa6SolidArrowLeftLong />} onClick={() => router.back()} size="large">Back</Button>
            <div className="flex items-center gap-3">
              <div className="bg-rose-500 p-3 rounded-lg">
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
            <Col span={12}>
              <div className="bg-linear-to-br from-rose-500 to-rose-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Total Sessions Analyzed</span>}
                  value={data?.length || 0}
                  prefix={<span className="text-white text-2xl">⏰</span>}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="bg-linear-to-br from-pink-500 to-pink-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Peak Time Slot</span>}
                  value={slotData[0]?.slot || "N/A"}
                  valueStyle={{ color: "white", fontSize: "24px" }}
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <h3 className="text-lg font-semibold mb-4">Bookings by Time Slot</h3>
              <Table
                columns={slotColumns}
                dataSource={slotData}
                loading={isLoading}
                rowKey="slot"
                pagination={false}
                className="shadow-sm"
              />
            </Col>
            <Col span={12}>
              <h3 className="text-lg font-semibold mb-4">Bookings by Day</h3>
              <Table
                columns={dayColumns}
                dataSource={dayData}
                loading={isLoading}
                rowKey="day"
                pagination={false}
                className="shadow-sm"
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default PeakHoursPage;
