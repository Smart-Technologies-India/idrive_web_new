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
import { convertSlotTo12Hour } from "@/utils/time-format";

const { RangePicker } = DatePicker;

interface Car {
  id: number;
  carName: string;
  registrationNumber: string;
}

interface Payment {
  id: number;
  amount: number;
}

interface Booking {
  id: number;
  bookingId: string;
  customerName: string;
  customerMobile: string;
  location?: string;
  totalAmount: number;
  payments?: Payment[];
}

interface BookingSession {
  id: number;
  sessionDate: string;
  slot: string;
  status: string;
  attended: boolean;
  booking?: Booking;
  car?: Car;
}

const REPORT_TITLE = "Car Training Report";

const CarTrainingPage = () => {
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
            id
            carName
            registrationNumber
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
    queryKey: ["car-training-report", selectedCarId, schoolId],
    queryFn: async () => {
      if (!selectedCarId) return [];
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            sessionDate
            slot
            status
            attended
            booking { 
              id 
              customerName 
              customerMobile 
              bookingId 
              location
              totalAmount
              payments {
                id
                amount
              }
            }
            car { id carName registrationNumber }
          }
        }`,
        variables: { whereSearchInput: { carId: selectedCarId } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];
      return sessions;
    },
    enabled: schoolId > 0 && !!selectedCarId,
  });

  // Filter data by date range for display, but keep original data for calculations
  const filteredData = dateRange && data 
    ? data.filter((s: BookingSession) => {
        const d = dayjs(s.sessionDate);
        return d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"));
      })
    : data;

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

  // Calculate start and end dates from all sessions for each booking
  const getBookingDateRange = (bookingId: number) => {
    if (!data) return { startDate: null, endDate: null };
    const bookingSessions = data.filter(s => s.booking?.id === bookingId);
    if (bookingSessions.length === 0) return { startDate: null, endDate: null };
    
    const dates = bookingSessions.map(s => dayjs(s.sessionDate));
    const startDate = dates.reduce((min, date) => date.isBefore(min) ? date : min, dates[0]);
    const endDate = dates.reduce((max, date) => date.isAfter(max) ? date : max, dates[0]);
    
    return { startDate, endDate };
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "sessionDate",
      key: "sessionDate",
      render: (d: string) => dayjs(d).format("DD MMM YYYY"),
      sorter: (a: BookingSession, b: BookingSession) => {
        const dateCompare = dayjs(a.sessionDate).unix() - dayjs(b.sessionDate).unix();
        if (dateCompare !== 0) return dateCompare;
        // If dates are equal, sort by time slot
        return a.slot.localeCompare(b.slot);
      },
      defaultSortOrder: "ascend" as const,
    },
    { 
      title: "Time Slot", 
      dataIndex: "slot", 
      key: "slot",
      render: (slot: string) => convertSlotTo12Hour(slot),
      sorter: (a: BookingSession, b: BookingSession) => a.slot.localeCompare(b.slot),
    },
    { title: "Student Name", key: "studentName", render: (r: BookingSession) => r.booking?.customerName || "N/A" },
    { title: "Contact", key: "contact", render: (r: BookingSession) => r.booking?.customerMobile || "N/A" },
    { 
      title: "Location", 
      key: "location", 
      render: (r: BookingSession) => r.booking?.location || "-" 
    },
    {
      title: "Start Date",
      key: "startDate",
      render: (r: BookingSession) => {
        if (!r.booking) return "-";
        const { startDate } = getBookingDateRange(r.booking.id);
        return startDate ? startDate.format("DD MMM YYYY") : "-";
      },
    },
    {
      title: "End Date",
      key: "endDate",
      render: (r: BookingSession) => {
        if (!r.booking) return "-";
        const { endDate } = getBookingDateRange(r.booking.id);
        return endDate ? endDate.format("DD MMM YYYY") : "-";
      },
    },
    {
      title: "Balance",
      key: "balance",
      render: (r: BookingSession) => {
        if (!r.booking) return <Tag color="gray">N/A</Tag>;
        const totalPaid = r.booking.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
        const pending = Math.max((r.booking.totalAmount || 0) - totalPaid, 0);
        return <Tag color={pending > 0 ? "red" : "green"}>Rs. {pending.toLocaleString()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "COMPLETED" ? "green" : status === "CANCELLED" ? "red" : "blue"}>{status}</Tag>
      ),
    },
    {
      title: "Attended",
      dataIndex: "attended",
      key: "attended",
      render: (attended: boolean) => <Tag color={attended ? "green" : "red"}>{attended ? "Yes" : "No"}</Tag>,
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
              <div className="bg-green-500 p-3 rounded-lg">
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
                <AntDesignCarOutlined className="inline mr-1" /> Select Car
              </label>
              <Select
                className="w-full"
                placeholder="Select a car"
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
          {!selectedCarId ? (
            <div className="text-center py-8 text-gray-500">Please select a car to view the training report</div>
          ) : (
            <>
              <Row gutter={16} className="mb-6">
                <Col span={8}>
                  <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                    <Statistic
                      title={<span className="text-white text-opacity-90">Total Sessions</span>}
                      value={filteredData?.length || 0}
                      prefix={<MaterialSymbolsCalendarClockRounded className="text-white" />}
                      valueStyle={{ color: "white" }}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                    <Statistic
                      title={<span className="text-white text-opacity-90">Attended</span>}
                      value={filteredData?.filter((s) => s.attended).length || 0}
                      prefix={<AntDesignCheckOutlined className="text-white" />}
                      valueStyle={{ color: "white" }}
                    />
                  </div>
                </Col>
                <Col span={8}>
                  <div className="bg-linear-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
                    <Statistic
                      title={<span className="text-white text-opacity-90">Absent</span>}
                      value={filteredData?.filter((s) => !s.attended).length || 0}
                      valueStyle={{ color: "white" }}
                    />
                  </div>
                </Col>
              </Row>
              <Table
                columns={columns}
                dataSource={filteredData || []}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarTrainingPage;
