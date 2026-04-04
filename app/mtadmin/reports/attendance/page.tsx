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
  AntDesignCarOutlined,
  AntDesignCheckOutlined,
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

interface Car {
  id: number;
  carName: string;
  registrationNumber: string;
}

interface Booking {
  id: number;
  customerName: string;
  customerMobile: string;
}

interface BookingSession {
  id: number;
  sessionDate: string;
  slot: string;
  attended: boolean;
  booking?: Booking;
  car?: Car;
}

interface GroupedAttendance {
  [date: string]: { [car: string]: BookingSession[] };
}

const REPORT_TITLE = "Daily Attendance Report";

const AttendancePage = () => {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const { data: carsData } = useQuery<Car[]>({
    queryKey: ["cars", schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllCar($whereSearchInput: SearchCarInput!) {
          getAllCar(whereSearchInput: $whereSearchInput) {
            id carName registrationNumber
          }
        }`,
        variables: { whereSearchInput: { schoolId } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response?.data as any)?.getAllCar || [];
    },
    enabled: schoolId > 0,
  });

  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["attendance-report", dateRange, selectedCarId, schoolId],
    queryFn: async () => {
      const whereInput: Record<string, number> = {};
      if (selectedCarId) whereInput.carId = selectedCarId;
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id sessionDate slot attended
            booking { id customerName customerMobile }
            car { id carName }
          }
        }`,
        variables: { whereSearchInput: whereInput },
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

  const groupedData: GroupedAttendance =
    data?.reduce((acc: GroupedAttendance, session: BookingSession) => {
      const dateKey = dayjs(session.sessionDate).format("YYYY-MM-DD");
      const carName = session.car?.carName || "Unknown";
      if (!acc[dateKey]) acc[dateKey] = {};
      if (!acc[dateKey][carName]) acc[dateKey][carName] = [];
      acc[dateKey][carName].push(session);
      return acc;
    }, {}) || {};

  const tableData = Object.entries(groupedData).flatMap(([date, cars]) =>
    Object.entries(cars).map(([carName, sessions]) => ({
      key: `${date}-${carName}`,
      date,
      car: carName,
      totalSessions: sessions.length,
      present: sessions.filter((s) => s.attended).length,
      absent: sessions.filter((s) => !s.attended).length,
    })),
  );

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
      if (selectedCarId) {
        const car = carsData?.find((c) => c.id === selectedCarId);
        if (car) { headerRows.push(`"Car: ${car.carName} (${car.registrationNumber})"`); headerRows.push(""); }
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
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d: string) => dayjs(d).format("DD MMM YYYY"),
      sorter: (a: { date: string }, b: { date: string }) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: "ascend" as const,
    },
    { title: "Car", dataIndex: "car", key: "car" },
    { title: "Total Sessions", dataIndex: "totalSessions", key: "totalSessions" },
    {
      title: "Present",
      dataIndex: "present",
      key: "present",
      render: (count: number) => <Tag color="green">{count}</Tag>,
    },
    {
      title: "Absent",
      dataIndex: "absent",
      key: "absent",
      render: (count: number) => <Tag color="red">{count}</Tag>,
    },
    {
      title: "Attendance Rate",
      key: "rate",
      render: (record: { totalSessions: number; present: number }) => {
        const rate = record.totalSessions > 0 ? ((record.present / record.totalSessions) * 100).toFixed(1) : 0;
        return `${rate}%`;
      },
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button icon={<Fa6SolidArrowLeftLong />} onClick={() => router.back()} size="large">Back</Button>
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-3 rounded-lg">
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

        {/* Filters */}
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
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AntDesignCarOutlined className="inline mr-1" /> Select Car (Optional)
              </label>
              <Select
                className="w-full"
                placeholder="All Cars"
                value={selectedCarId}
                onChange={setSelectedCarId}
                size="large"
                allowClear
                options={carsData?.map((car) => ({
                  label: `${car.carName} (${car.registrationNumber})`,
                  value: car.id,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content bg-white rounded-xl border border-gray-200 p-6">
          <Row gutter={16} className="mb-6">
            <Col span={12}>
              <div className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Total Attendance Records</span>}
                  value={data?.length || 0}
                  prefix={<AntDesignCheckOutlined className="text-white" />}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="bg-linear-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Overall Attendance Rate</span>}
                  value={
                    data && data.length > 0
                      ? ((data.filter((s) => s.attended).length / data.length) * 100).toFixed(1)
                      : "0"
                  }
                  suffix="%"
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={isLoading}
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

export default AttendancePage;
