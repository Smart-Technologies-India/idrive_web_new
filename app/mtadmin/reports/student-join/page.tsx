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
  Switch,
} from "antd";
import {
  Fa6RegularFileLines,
  AntDesignPlusCircleOutlined,
  AntDesignBookOutlined,
  Fa6SolidArrowLeftLong,
} from "@/components/icons";
import dayjs, { Dayjs } from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { ApiCall } from "@/services/api";
import { useRouter } from "next/navigation";

const { RangePicker } = DatePicker;

interface Payment {
  id: number;
  amount: number;
}

interface Booking {
  id: number;
  bookingId: string;
  customerName: string;
  customerMobile: string;
  courseName?: string;
  carName?: string;
  totalAmount: number;
  createdAt?: string;
  payments?: Payment[];
}

interface BookingService {
  id: number;
  confirmationNumber?: string;
  serviceName: string;
  serviceType: string;
  price: number;
  discount?: number;
  createdAt?: string;
  user?: {
    name: string;
    surname: string;
    contact1: string;
  };
  servicePayments?: {
    id: number;
    amount: number;
  }[];
}

type ViewMode = "bookings" | "services";

const REPORT_TITLE = "Student Enrollment Report";

const StudentJoinPage = () => {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("bookings");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["student-join-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
          getAllBooking(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            customerName
            customerMobile
            carName
            courseName
            totalAmount
            createdAt
            payments {
              id
              amount
            }
          }
        }`,
        variables: { whereSearchInput: { schoolId } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookings = (response?.data as any)?.getAllBooking || [];
      if (dateRange) {
        return bookings.filter((b: Booking) => {
          const d = dayjs(b.createdAt);
          return (
            d.isAfter(dateRange[0].startOf("day")) &&
            d.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return bookings;
    },
    enabled: schoolId > 0 && viewMode === "bookings",
  });

  const { data: servicesData, isLoading: isLoadingServices } = useQuery<BookingService[]>({
    queryKey: ["student-service-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBookingService($whereSearchInput: WhereBookingServiceSearchInput!) {
          getAllBookingService(whereSearchInput: $whereSearchInput) {
            id
            confirmationNumber
            serviceName
            serviceType
            price
            discount
            createdAt
            user {
              name
              surname
              contact1
            }
            servicePayments {
              id
              amount
            }
          }
        }`,
        variables: { whereSearchInput: { schoolId } },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let services = (response?.data as any)?.getAllBookingService || [];
      
      // Filter out ADDON service types
      services = services.filter((s: BookingService) => s.serviceType !== "ADDON");
      
      if (dateRange) {
        return services.filter((s: BookingService) => {
          const d = dayjs(s.createdAt);
          return (
            d.isAfter(dateRange[0].startOf("day")) &&
            d.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return services;
    },
    enabled: schoolId > 0 && viewMode === "services",
  });

  const handleExport = (exportAll = false) => {
    try {
      const allData = viewMode === "bookings" ? (bookingsData || []) : (servicesData || []);
      if (allData.length === 0) { message.error("No data to export"); return; }

      const sourceData = (exportAll
        ? allData
        : allData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      ).slice().sort((a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix());

      const generatedDate = dayjs().format("DD MMM YYYY, hh:mm A");
      const headerParts: string[] = [
        `<b>${REPORT_TITLE}</b>`,
        `Generated: ${generatedDate}`,
        viewMode === "bookings" ? "Type: Course Bookings" : "Type: Services",
        dateRange?.[0] && dateRange?.[1]
          ? `Period: ${dateRange[0].format("DD/MM/YY")} – ${dateRange[1].format("DD/MM/YY")}`
          : "",
      ].filter(Boolean);
      const headerLine = headerParts.join(" &nbsp;|&nbsp; ");

      let headers: string[];
      let tableRows: string;

      if (viewMode === "bookings") {
        headers = ["Ref No", "Join Date", "Student Name", "Contact", "Car Name", "Course", "Balance"];
        tableRows = (sourceData as Booking[]).map((record) => {
          const totalPaid = record.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
          const pending = Math.max((record.totalAmount || 0) - totalPaid, 0);
          const cells = [
            record.bookingId || "-",
            record.createdAt ? dayjs(record.createdAt).format("DD/MM/YY") : "-",
            record.customerName || "-",
            record.customerMobile || "-",
            record.carName || "-",
            record.courseName || "-",
            `Rs. ${pending.toLocaleString()}`,
          ];
          return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
        }).join("\n");
      } else {
        headers = ["Confirmation No", "Join Date", "Student Name", "Contact", "Service Name", "Price", "Balance"];
        tableRows = (sourceData as BookingService[]).map((record) => {
          const finalPrice = (record.price || 0) - (record.discount || 0);
          const totalPaid = record.servicePayments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
          const pending = Math.max(finalPrice - totalPaid, 0);
          const cells = [
            record.confirmationNumber || "-",
            record.createdAt ? dayjs(record.createdAt).format("DD/MM/YY") : "-",
            record.user ? `${record.user.name} ${record.user.surname}`.trim() : "-",
            record.user?.contact1 || "-",
            record.serviceName || "-",
            `Rs. ${finalPrice.toLocaleString()}`,
            `Rs. ${pending.toLocaleString()}`,
          ];
          return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
        }).join("\n");
      }

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
    { title: "Ref No", dataIndex: "bookingId", key: "bookingId" },
    {
      title: "Join Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (date ? dayjs(date).format("DD MMM YYYY") : "-"),
    },
    { title: "Student Name", dataIndex: "customerName", key: "customerName" },
    { title: "Contact", dataIndex: "customerMobile", key: "customerMobile" },
    {
      title: "Car Name",
      dataIndex: "carName",
      key: "carName",
      render: (v: string) => v || "-",
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      render: (v: string) => v || "-",
    },
    {
      title: "Balance",
      key: "balance",
      render: (record: Booking) => {
        const totalPaid = record.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
        const pending = Math.max((record.totalAmount || 0) - totalPaid, 0);
        return <Tag color={pending > 0 ? "red" : "green"}>Rs. {pending.toLocaleString()}</Tag>;
      },
    },
  ];

  const serviceColumns = [
    { 
      title: "Confirmation No", 
      dataIndex: "confirmationNumber", 
      key: "confirmationNumber",
      render: (v: string) => v || "-",
    },
    {
      title: "Join Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (date ? dayjs(date).format("DD MMM YYYY") : "-"),
    },
    { 
      title: "Student Name", 
      key: "studentName",
      render: (record: BookingService) => 
        record.user ? `${record.user.name} ${record.user.surname}`.trim() : "-"
    },
    { 
      title: "Contact", 
      key: "contact",
      render: (record: BookingService) => record.user?.contact1 || "-"
    },
    {
      title: "Service Name",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Price",
      key: "price",
      render: (record: BookingService) => {
        const finalPrice = (record.price || 0) - (record.discount || 0);
        return (
          <div>
            {record.discount ? (
              <>
                <div className="text-gray-400 line-through text-xs">
                  Rs. {record.price.toLocaleString()}
                </div>
                <div className="font-semibold text-green-600">
                  Rs. {finalPrice.toLocaleString()}
                </div>
              </>
            ) : (
              <div className="font-semibold">Rs. {record.price.toLocaleString()}</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Balance",
      key: "balance",
      render: (record: BookingService) => {
        const totalAmount = (record.price || 0) - (record.discount || 0);
        const totalPaid = record.servicePayments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
        const pending = Math.max(totalAmount - totalPaid, 0);
        return <Tag color={pending > 0 ? "red" : "green"}>Rs. {pending.toLocaleString()}</Tag>;
      },
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button icon={<Fa6SolidArrowLeftLong />} onClick={() => router.back()} size="large">
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Fa6RegularFileLines className="text-xl text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{REPORT_TITLE}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button icon={<AntDesignBookOutlined />} onClick={() => handleExport(false)} size="large">
              Export Current Page
            </Button>
            <Button type="primary" icon={<AntDesignBookOutlined />} onClick={() => handleExport(true)} size="large">
              Export All Records
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">🔍 Filters</h3>
          <div className="flex gap-4 flex-wrap items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                <span className={`font-medium ${viewMode === "bookings" ? "text-blue-600" : "text-gray-500"}`}>
                  Course Bookings
                </span>
                <Switch
                  checked={viewMode === "services"}
                  onChange={(checked) => setViewMode(checked ? "services" : "bookings")}
                  size="default"
                />
                <span className={`font-medium ${viewMode === "services" ? "text-blue-600" : "text-gray-500"}`}>
                  Services
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <RangePicker
                className="w-full"
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                format="DD MMM YYYY"
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content bg-white rounded-xl border border-gray-200 p-6">
          <Row gutter={16} className="mb-6">
            <Col span={24}>
              <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <Statistic
                  title={
                    <span className="text-white text-opacity-90">
                      {viewMode === "bookings" ? "Total Students Enrolled" : "Total Services Booked"}
                    </span>
                  }
                  value={viewMode === "bookings" ? (bookingsData?.length || 0) : (servicesData?.length || 0)}
                  prefix={<AntDesignPlusCircleOutlined className="text-white" />}
                  valueStyle={{ color: "white", fontSize: "32px" }}
                />
              </div>
            </Col>
          </Row>
          {viewMode === "bookings" ? (
            <Table
              columns={columns}
              dataSource={bookingsData || []}
              loading={isLoadingBookings}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ["10", "25", "50", "100"],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
              }}
              className="shadow-sm"
            />
          ) : (
            <Table
              columns={serviceColumns}
              dataSource={servicesData || []}
              loading={isLoadingServices}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ["10", "25", "50", "100"],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
              }}
              className="shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentJoinPage;
