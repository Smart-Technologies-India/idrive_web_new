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
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
        if (tableData.length === 0) { message.error("No data to export"); return; }

        const allData = tableData.slice().sort((a, b) => {
          const dateDiff = dayjs(a.date).unix() - dayjs(b.date).unix();
          if (dateDiff !== 0) return dateDiff;
          return a.car.localeCompare(b.car);
        });

        const sourceData = exportAll
          ? allData
          : allData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        const generatedDate = dayjs().format("DD MMM YYYY, hh:mm A");
        const car = selectedCarId ? carsData?.find((c) => c.id === selectedCarId) : null;

        const headerParts: string[] = [
          `<b>${REPORT_TITLE}</b>`,
          `Generated: ${generatedDate}`,
          car ? `Car: ${car.carName} (${car.registrationNumber})` : "",
          dateRange?.[0] && dateRange?.[1]
            ? `Period: ${dateRange[0].format("DD/MM/YY")} – ${dateRange[1].format("DD/MM/YY")}`
            : "",
        ].filter(Boolean);
        const headerLine = headerParts.join(" &nbsp;|&nbsp; ");

        const headers = ["Date", "Car", "Total Sessions", "Present", "Absent", "Attendance Rate"];

        const tableRows = sourceData.map((record) => {
          const rate = record.totalSessions > 0
            ? ((record.present / record.totalSessions) * 100).toFixed(1)
            : "0";
          const cells = [
            dayjs(record.date).format("DD/MM/YY"),
            record.car,
            String(record.totalSessions),
            String(record.present),
            String(record.absent),
            `${rate}%`,
          ];
          return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
        }).join("\n");

        const html = `<!DOCTYPE html>
  <html><head><meta charset="utf-8"/><title>${REPORT_TITLE}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 8px; }
    .info { margin-bottom: 5px; color: #333; }
    .print-btn { margin-bottom: 8px; padding: 5px 14px; font-size: 12px; cursor: pointer; background: #1677ff; color: #fff; border: none; border-radius: 4px; }
    .print-btn:hover { background: #0958d9; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #999; padding: 4px 7px; text-align: left; white-space: nowrap; }
    th { background: #e0e0e0; font-weight: bold; }
    tr:nth-child(even) { background: #f5f5f5; }
    @media print { .print-btn { display: none; } }
  </style>
  </head><body>
  <button class="print-btn" onclick="window.print()">🖨 Print</button>
  <div class="info">${headerLine}</div>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  </body></html>`;

        const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute(
          "download",
          `${REPORT_TITLE.replace(/\s+/g, "_")}${exportAll ? "_ALL" : "_PAGE"}_${dayjs().format("YYYY-MM-DD_HH-mm")}.html`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success(`Report exported!${exportAll ? " (All records)" : " (Current page)"}`);
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
                onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
            }}
            className="shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
