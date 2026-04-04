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
  RiMoneyRupeeCircleLine,
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
  courseName?: string;
}

interface Payment {
  id: number;
  bookingId?: number;
  amount: number;
  paymentNumber?: string;
  paymentDate: string;
  paymentMethod?: string;
  booking?: Booking;
  status?: string;
  notes?: string;
  createdAt: string;
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
  user?: {
    id: number;
    name: string;
    surname?: string;
    contact1: string;
    contact2?: string;
  };
}

interface ServicePaymentRecord {
  id: number;
  bookingServiceId: number;
  amount: number;
  paymentNumber: string;
  paymentDate: string;
  paymentMethod?: string;
  status?: string;
  notes?: string;
  createdAt: string;
}

interface PaymentCollectionRow {
  id: string;
  rawDate: string;
  referenceNumber: string;
  source: "BOOKING" | "SERVICE";
  studentName: string;
  contact: string;
  itemName: string;
  amount: number;
  paymentMethod?: string;
}

interface PaymentByMethod {
  [method: string]: number;
}

const INCLUDED_SERVICE_TYPES: Array<ServiceBooking["serviceType"]> = ["ADDON", "LICENSE"];

const isDefined = <T,>(v: T | null | undefined): v is T => v != null;

const getServiceBookingStudentName = (s: ServiceBooking) =>
  s.user ? `${s.user.name} ${s.user.surname || ""}`.trim() : s.booking?.customerName || "N/A";

const getServiceBookingContact = (s: ServiceBooking) =>
  s.user?.contact1 || s.booking?.customerMobile || "N/A";

const REPORT_TITLE = "Payment Collection Report";

const PaymentCollectionPage = () => {
  const router = useRouter();
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const { data, isLoading } = useQuery<PaymentCollectionRow[]>({
    queryKey: ["payment-collection-report", dateRange, schoolId],
    queryFn: async () => {
      const [paymentsResponse, servicePaymentsResponse, bookingServicesResponse] = await Promise.all([
        ApiCall<{ getAllPayment: Payment[] }>({
          query: `query GetAllPayment($whereSearchInput: SearchPaymentInput!) {
            getAllPayment(whereSearchInput: $whereSearchInput) {
              id bookingId amount paymentNumber paymentDate paymentMethod status notes createdAt
              booking { id bookingId customerName customerMobile courseName }
            }
          }`,
          variables: { whereSearchInput: {} },
        }),
        ApiCall<{ getAllServicePayment: ServicePaymentRecord[] }>({
          query: `query GetAllServicePayment($whereSearchInput: SearchServicePaymentInput!) {
            getAllServicePayment(whereSearchInput: $whereSearchInput) {
              id bookingServiceId amount paymentNumber paymentDate paymentMethod status notes createdAt
            }
          }`,
          variables: { whereSearchInput: {} },
        }),
        ApiCall<{ getAllBookingService: ServiceBooking[] }>({
          query: `query GetAllBookingService($whereSearchInput: WhereBookingServiceSearchInput!) {
            getAllBookingService(whereSearchInput: $whereSearchInput) {
              id schoolId serviceName serviceType price discount confirmationNumber createdAt
              booking { id bookingId customerName customerMobile courseName }
              user { id name surname contact1 contact2 }
            }
          }`,
          variables: { whereSearchInput: { schoolId } },
        }),
      ]);

      const bookingPayments = paymentsResponse.data?.getAllPayment || [];
      const servicePayments = servicePaymentsResponse.data?.getAllServicePayment || [];
      const bookingServices = bookingServicesResponse.data?.getAllBookingService || [];

      const serviceBookingMap = new Map(
        bookingServices
          .filter((s) => INCLUDED_SERVICE_TYPES.includes(s.serviceType))
          .map((s) => [s.id, s]),
      );

      const bookingRows: PaymentCollectionRow[] = bookingPayments.map((p) => ({
        id: `BOOKING-${p.id}`,
        rawDate: p.paymentDate || p.createdAt,
        referenceNumber: p.booking?.bookingId || p.paymentNumber || "N/A",
        source: "BOOKING",
        studentName: p.booking?.customerName || "N/A",
        contact: p.booking?.customerMobile || "N/A",
        itemName: p.booking?.courseName || "Course Booking",
        amount: p.amount || 0,
        paymentMethod: p.paymentMethod,
      }));

      const serviceRows: PaymentCollectionRow[] = servicePayments
        .map<PaymentCollectionRow | null>((p) => {
          const sb = serviceBookingMap.get(p.bookingServiceId);
          if (!sb) return null;
          return {
            id: `SERVICE-${p.id}`,
            rawDate: p.paymentDate || p.createdAt,
            referenceNumber: sb.confirmationNumber || p.paymentNumber,
            source: "SERVICE",
            studentName: getServiceBookingStudentName(sb),
            contact: getServiceBookingContact(sb),
            itemName: sb.serviceName || "Service Booking",
            amount: p.amount || 0,
            paymentMethod: p.paymentMethod,
          };
        })
        .filter(isDefined);

      return [...bookingRows, ...serviceRows]
        .filter((row) => {
          if (!dateRange) return true;
          const d = dayjs(row.rawDate);
          return d.isAfter(dateRange[0].startOf("day")) && d.isBefore(dateRange[1].endOf("day"));
        })
        .sort((a, b) => dayjs(a.rawDate).unix() - dayjs(b.rawDate).unix());
    },
    enabled: schoolId > 0,
  });

  const totalAmount = data?.reduce((s, p) => s + (p.amount || 0), 0) || 0;
  const paymentByMethod: PaymentByMethod =
    data?.reduce((acc: PaymentByMethod, p) => {
      const method = p.paymentMethod || "UNKNOWN";
      if (!acc[method]) acc[method] = 0;
      acc[method] += p.amount || 0;
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
    {
      title: "Date",
      dataIndex: "rawDate",
      key: "date",
      render: (d: string) => dayjs(d).format("DD MMM YYYY"),
      sorter: (a: PaymentCollectionRow, b: PaymentCollectionRow) => dayjs(a.rawDate).unix() - dayjs(b.rawDate).unix(),
      defaultSortOrder: "ascend" as const,
    },
    { title: "Reference", dataIndex: "referenceNumber", key: "referenceNumber" },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: PaymentCollectionRow["source"]) => (
        <Tag color={source === "SERVICE" ? "purple" : "blue"}>{source}</Tag>
      ),
    },
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Course / Service", dataIndex: "itemName", key: "itemName" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `₹${amount.toLocaleString()}`,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => (
        <Tag color={method === "CASH" ? "green" : method === "CARD" ? "blue" : method === "UPI" ? "purple" : "orange"}>
          {method}
        </Tag>
      ),
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
              <div className="bg-orange-500 p-3 rounded-lg">
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
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content bg-white rounded-xl border border-gray-200 p-6">
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <div className="bg-linear-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Total Collection</span>}
                  value={totalAmount}
                  prefix={<span className="text-white">₹</span>}
                  precision={2}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Total Payments</span>}
                  value={data?.length || 0}
                  prefix={<RiMoneyRupeeCircleLine className="text-white" />}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Cash Payments</span>}
                  value={paymentByMethod?.CASH || 0}
                  prefix={<span className="text-white">₹</span>}
                  precision={2}
                  valueStyle={{ color: "white" }}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="bg-linear-to-br from-cyan-500 to-cyan-600 text-white p-4 rounded-lg">
                <Statistic
                  title={<span className="text-white text-opacity-90">Online Payments</span>}
                  value={(paymentByMethod?.CARD || 0) + (paymentByMethod?.UPI || 0) + (paymentByMethod?.BANK_TRANSFER || 0)}
                  prefix={<span className="text-white">₹</span>}
                  precision={2}
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
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-gray-50 font-bold">
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <strong className="text-base">Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong className="text-base text-orange-600">₹{totalAmount.toLocaleString()}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentCollectionPage;
