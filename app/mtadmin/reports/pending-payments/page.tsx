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

interface Booking {
  id: number;
  bookingId: string;
  customerName: string;
  customerMobile: string;
  totalAmount: number;
  bookingDate?: string;
  courseName?: string;
  payments?: { id: number; amount: number }[];
}

interface ServiceBooking {
  id: number;
  schoolId: number;
  serviceName: string;
  serviceType: "LICENSE" | "ADDON";
  price: number;
  discount?: number;
  confirmationNumber?: string;
  createdAt: string;
  booking?: Booking;
  user?: { id: number; name: string; surname?: string; contact1: string };
}

interface ServicePaymentRecord {
  id: number;
  bookingServiceId: number;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

interface PendingPaymentRow {
  id: string;
  rawDate: string;
  referenceNumber: string;
  source: "BOOKING" | "SERVICE";
  studentName: string;
  contact: string;
  itemName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

const INCLUDED_SERVICE_TYPES: Array<ServiceBooking["serviceType"]> = ["ADDON", "LICENSE"];
const isDefined = <T,>(v: T | null | undefined): v is T => v != null;

const getServiceBookingStudentName = (s: ServiceBooking) =>
  s.user ? `${s.user.name} ${s.user.surname || ""}`.trim() : s.booking?.customerName || "N/A";

const getServiceBookingContact = (s: ServiceBooking) =>
  s.user?.contact1 || s.booking?.customerMobile || "N/A";

const REPORT_TITLE = "Pending Payments Report";

const PendingPaymentsPage = () => {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const { data, isLoading } = useQuery<PendingPaymentRow[]>({
    queryKey: ["pending-payments-report", dateRange, schoolId],
    queryFn: async () => {
      const [bookingsResponse, bookingServicesResponse, servicePaymentsResponse] = await Promise.all([
        ApiCall<{ getAllBooking: Booking[] }>({
          query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
            getAllBooking(whereSearchInput: $whereSearchInput) {
              id bookingId customerName customerMobile totalAmount bookingDate courseName
              payments { id amount }
            }
          }`,
          variables: { whereSearchInput: { schoolId } },
        }),
        ApiCall<{ getAllBookingService: ServiceBooking[] }>({
          query: `query GetAllBookingService($whereSearchInput: WhereBookingServiceSearchInput!) {
            getAllBookingService(whereSearchInput: $whereSearchInput) {
              id schoolId serviceName serviceType price discount confirmationNumber createdAt
              booking { id bookingId customerName customerMobile }
              user { id name surname contact1 }
            }
          }`,
          variables: { whereSearchInput: { schoolId } },
        }),
        ApiCall<{ getAllServicePayment: ServicePaymentRecord[] }>({
          query: `query GetAllServicePayment($whereSearchInput: SearchServicePaymentInput!) {
            getAllServicePayment(whereSearchInput: $whereSearchInput) {
              id bookingServiceId amount paymentDate createdAt
            }
          }`,
          variables: { whereSearchInput: {} },
        }),
      ]);

      const bookings = bookingsResponse.data?.getAllBooking || [];
      const bookingServices = bookingServicesResponse.data?.getAllBookingService || [];
      const servicePayments = servicePaymentsResponse.data?.getAllServicePayment || [];

      const serviceBookingMap = new Map(
        bookingServices
          .filter((s) => INCLUDED_SERVICE_TYPES.includes(s.serviceType))
          .map((s) => [s.id, s]),
      );

      const paidServiceMap = servicePayments.reduce((acc, p) => {
        const current = acc.get(p.bookingServiceId) || 0;
        acc.set(p.bookingServiceId, current + p.amount);
        return acc;
      }, new Map<number, number>());

      const bookingRows: PendingPaymentRow[] = bookings
        .map<PendingPaymentRow | null>((b) => {
          const paidAmount = b.payments?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
          const pendingAmount = Math.max((b.totalAmount || 0) - paidAmount, 0);
          if (pendingAmount <= 0) return null;
          return {
            id: `BOOKING-${b.id}`,
            rawDate: b.bookingDate || "",
            referenceNumber: b.bookingId,
            source: "BOOKING",
            studentName: b.customerName,
            contact: b.customerMobile,
            itemName: b.courseName || "Course Booking",
            totalAmount: b.totalAmount || 0,
            paidAmount,
            pendingAmount,
          };
        })
        .filter(isDefined);

      const serviceRows: PendingPaymentRow[] = Array.from(serviceBookingMap.values())
        .map<PendingPaymentRow | null>((sb) => {
          const totalAmount = Math.max((sb.price || 0) - (sb.discount || 0), 0);
          const paidAmount = paidServiceMap.get(sb.id) || 0;
          const pendingAmount = Math.max(totalAmount - paidAmount, 0);
          if (pendingAmount <= 0) return null;
          return {
            id: `SERVICE-${sb.id}`,
            rawDate: sb.createdAt,
            referenceNumber: sb.confirmationNumber || `SVC-${sb.id}`,
            source: "SERVICE",
            studentName: getServiceBookingStudentName(sb),
            contact: getServiceBookingContact(sb),
            itemName: sb.serviceName || "Service Booking",
            totalAmount,
            paidAmount,
            pendingAmount,
          };
        })
        .filter(isDefined);

      return [...bookingRows, ...serviceRows].filter((row) => {
        if (!dateRange) return true;
        const d = dayjs(row.rawDate);
        return d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"));
      });
    },
    enabled: schoolId > 0,
  });

  const totalPending = data?.reduce((s, r) => s + r.pendingAmount, 0) || 0;

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
          let text = cell.textContent?.trim().replace(/\s+/g, " ") || "";
          text = text.replace(/₹\s*/g, "");
          rowData.push(text);
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
    { title: "Reference", dataIndex: "referenceNumber", key: "referenceNumber" },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: PendingPaymentRow["source"]) => (
        <Tag color={source === "SERVICE" ? "purple" : "blue"}>{source}</Tag>
      ),
    },
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Course / Service", dataIndex: "itemName", key: "itemName" },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `₹${amount?.toLocaleString()}`,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (amount: number) => `₹${amount.toLocaleString()}`,
    },
    {
      title: "Pending",
      dataIndex: "pendingAmount",
      key: "pendingAmount",
      render: (amount: number) => <Tag color="red">₹{amount.toLocaleString()}</Tag>,
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button icon={<Fa6SolidArrowLeftLong />} onClick={() => router.back()} size="large">Back</Button>
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-lg">
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
              <div className="bg-linear-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Total Pending Amount</span>}
                  value={totalPending}
                  prefix={<span className="text-white">₹</span>}
                  precision={2}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Bookings with Pending Payment</span>}
                  value={data?.length || 0}
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

export default PendingPaymentsPage;
