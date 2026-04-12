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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      const allData = filteredData || [];
      if (allData.length === 0) { message.error("No data to export"); return; }

      const sourceData = (exportAll
        ? allData
        : allData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      ).slice().sort((a, b) => {
        const dateDiff = dayjs(a.sessionDate).unix() - dayjs(b.sessionDate).unix();
        if (dateDiff !== 0) return dateDiff;
        return a.slot.localeCompare(b.slot);
      });

      const generatedDate = dayjs().format("DD MMM YYYY, hh:mm A");
      const car = carsData?.find((c) => c.id === selectedCarId);

      const headerParts: string[] = [
        `<b>${REPORT_TITLE}</b>`,
        `Generated: ${generatedDate}`,
        car ? `Car: ${car.carName} (${car.registrationNumber})` : "",
        dateRange?.[0] && dateRange?.[1]
          ? `Period: ${dateRange[0].format("DD/MM/YY")} – ${dateRange[1].format("DD/MM/YY")}`
          : "",
      ].filter(Boolean);
      const headerLine = headerParts.join(" &nbsp;|&nbsp; ");

      const headers = ["Date", "Time Slot", "Student Name", "Contact", "Location", "Start Date", "End Date", "Balance", "Next"];

      const tableRows = sourceData.map((session) => {
        const { startDate, endDate } = session.booking
          ? getBookingDateRange(session.booking.id)
          : { startDate: null, endDate: null };
        const totalPaid = session.booking?.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
        const pending = Math.max((session.booking?.totalAmount || 0) - totalPaid, 0);
        const next = getNextStudent(session);

        const cells = [
          dayjs(session.sessionDate).format("DD/MM/YY"),
          convertSlotTo12Hour(session.slot),
          session.booking?.customerName || "N/A",
          session.booking?.customerMobile || "N/A",
          session.booking?.location || "-",
          startDate ? startDate.format("DD/MM/YY") : "-",
          endDate ? endDate.format("DD/MM/YY") : "-",
          `Rs. ${pending.toLocaleString()}`,
          next ? `${next.name} [${next.mobile}] - ${next.startDate} | ${next.endDate}` : "-",
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

  // Find next student with same car and time slot after current booking ends
  const getNextStudent = (session: BookingSession) => {
    if (!data || !session.booking) return null;
    
    // Get current booking's end date
    const { endDate: currentEndDate } = getBookingDateRange(session.booking.id);
    if (!currentEndDate) return null;
    
    // Get all unique bookings with same car and time slot (excluding current booking)
    const sameCarSameTimeBookings = new Map<number, BookingSession>();
    data.forEach(s => {
      if (
        s.car?.id === session.car?.id && 
        s.slot === session.slot && 
        s.booking?.id !== session.booking?.id
      ) {
        if (!sameCarSameTimeBookings.has(s.booking?.id || 0)) {
          sameCarSameTimeBookings.set(s.booking?.id || 0, s);
        }
      }
    });
    
    if (sameCarSameTimeBookings.size === 0) return null;
    
    // Find booking that starts after current booking ends, with earliest start date
    let nextBooking: BookingSession | null = null;
    let earliestStartDate: dayjs.Dayjs | null = null;
    
    for (const s of sameCarSameTimeBookings.values()) {
      if (s.booking) {
        const { startDate } = getBookingDateRange(s.booking.id);
        if (startDate && startDate.isAfter(currentEndDate)) {
          if (!earliestStartDate || startDate.isBefore(earliestStartDate)) {
            earliestStartDate = startDate;
            nextBooking = s;
          }
        }
      }
    }
    
    if (!nextBooking) return null;
    const nb = nextBooking as BookingSession;
    if (!nb.booking) return null;
    
    const { startDate, endDate } = getBookingDateRange(nb.booking.id);
    const startDateStr = startDate ? startDate.format("DD/MM/YY") : "";
    const endDateStr = endDate ? endDate.format("DD/MM/YY") : "";
    
    return {
      name: nb.booking.customerName,
      mobile: nb.booking.customerMobile,
      startDate: startDateStr,
      endDate: endDateStr,
    };
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "sessionDate",
      key: "sessionDate",
      render: (d: string) => dayjs(d).format("DD/MM/YY"),
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
        return startDate ? startDate.format("DD/MM/YY") : "-";
      },
    },
    {
      title: "End Date",
      key: "endDate",
      render: (r: BookingSession) => {
        if (!r.booking) return "-";
        const { endDate } = getBookingDateRange(r.booking.id);
        return endDate ? endDate.format("DD/MM/YY") : "-";
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
      title: "Next",
      key: "next",
      render: (r: BookingSession) => {
        const next = getNextStudent(r);
        if (!next) return "-";
        return `${next.name} [${next.mobile}] - ${next.startDate} | ${next.endDate}`;
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
                format="DD/MM/YY"
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
                  current: currentPage,
                  pageSize: pageSize,
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "25", "50", "100"],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                  onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
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
