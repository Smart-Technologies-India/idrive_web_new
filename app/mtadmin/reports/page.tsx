"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Modal,
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
  AntDesignPlusCircleOutlined,
  AntDesignCarOutlined,
  AntDesignCheckOutlined,
  RiMoneyRupeeCircleLine,
  AntDesignEyeOutlined,
  AntDesignBookOutlined,
  MaterialSymbolsCalendarClockRounded,
} from "@/components/icons";
import dayjs, { Dayjs } from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { ApiCall } from "@/services/api";

const { RangePicker } = DatePicker;

type ReportType =
  | "student-join"
  | "car-training"
  | "attendance"
  | "payment-collection"
  | "driver-performance"
  | "course-completion"
  | "revenue-analysis"
  | "pending-payments"
  | "car-utilization"
  | "session-cancellation"
  | "license-applications"
  | "peak-hours"
  | "student-progress"
  | "monthly-revenue"
  | "booking-conversion"
  | "active-students";

interface ReportCard {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface Car {
  id: number;
  carName: string;
  registrationNumber: string;
}

interface User {
  id: number;
  name: string;
  surname: string;
  contact1: string;
  email: string;
  createdAt: string;
}

interface Booking {
  id: number;
  bookingId: string;
  customerName: string;
  customerMobile: string;
  courseName?: string;
  carName?: string;
  totalAmount: number;
  bookingDate?: string;
  status?: string;
  payments?: Payment[];
  sessions?: BookingSession[];
}

interface Driver {
  id: number;
  name: string;
}

interface BookingSession {
  id: number;
  sessionDate: string;
  slot: string;
  status: string;
  attended: boolean;
  booking?: Booking;
  car?: Car;
  driver?: Driver;
}

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  booking?: Booking;
  createdAt: string;
}

interface LicenseApplication {
  id: number;
  llNumber?: string;
  testDate?: string;
  issuedDate?: string;
  status: string;
  testStatus?: string;
  bookingService?: {
    booking?: Booking;
    serviceName?: string;
  };
}

interface GroupedAttendance {
  [date: string]: {
    [car: string]: BookingSession[];
  };
}

interface PaymentByMethod {
  [method: string]: number;
}

const Reports = () => {
  const schoolId = parseInt((getCookie("school") as string) || "0");
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const reportCards: ReportCard[] = [
    {
      id: "student-join",
      title: "Student Enrollment Report",
      description: "View students who joined between specific dates",
      icon: <span className="text-3xl">👥</span>,
      color: "bg-blue-500",
    },
    {
      id: "car-training",
      title: "Car Training Report",
      description: "View student training on particular car within date range",
      icon: <span className="text-3xl">🚗</span>,
      color: "bg-green-500",
    },
    {
      id: "attendance",
      title: "Daily Attendance Report",
      description: "Day and car wise student attendance tracking",
      icon: <span className="text-3xl">✅</span>,
      color: "bg-purple-500",
    },
    {
      id: "payment-collection",
      title: "Payment Collection Report",
      description: "Track payment collections between date range",
      icon: <span className="text-3xl">💵</span>,
      color: "bg-orange-500",
    },
    {
      id: "driver-performance",
      title: "Driver Performance Report",
      description: "Analyze driver activity and session statistics",
      icon: <span className="text-3xl">👨‍✈️</span>,
      color: "bg-indigo-500",
    },
    {
      id: "course-completion",
      title: "Course Completion Report",
      description: "Students who completed courses in date range",
      icon: <span className="text-3xl">🎓</span>,
      color: "bg-emerald-500",
    },
    {
      id: "revenue-analysis",
      title: "Revenue Analysis Report",
      description: "Revenue breakdown by course, car, and payment method",
      icon: <span className="text-3xl">💰</span>,
      color: "bg-amber-500",
    },
    {
      id: "pending-payments",
      title: "Pending Payments Report",
      description: "Track outstanding and pending payments",
      icon: <span className="text-3xl">⏳</span>,
      color: "bg-red-500",
    },
    {
      id: "car-utilization",
      title: "Car Utilization Report",
      description: "Analyze which cars are being used most frequently",
      icon: <span className="text-3xl">🚙</span>,
      color: "bg-cyan-500",
    },
    {
      id: "session-cancellation",
      title: "Session Cancellation Report",
      description: "View cancelled sessions with reasons and trends",
      icon: <span className="text-3xl">❌</span>,
      color: "bg-pink-500",
    },
    {
      id: "license-applications",
      title: "License Applications Report",
      description: "Track license application status and approvals",
      icon: <span className="text-3xl">📄</span>,
      color: "bg-violet-500",
    },
    {
      id: "peak-hours",
      title: "Peak Hours Analysis",
      description: "Identify busiest time slots and days for bookings",
      icon: <span className="text-3xl">⏰</span>,
      color: "bg-rose-500",
    },
    {
      id: "student-progress",
      title: "Student Progress Report",
      description: "Track individual student learning progress and milestones",
      icon: <span className="text-3xl">📊</span>,
      color: "bg-teal-500",
    },
    {
      id: "monthly-revenue",
      title: "Monthly Revenue Comparison",
      description: "Compare revenue across different months",
      icon: <span className="text-3xl">📈</span>,
      color: "bg-lime-500",
    },
    {
      id: "booking-conversion",
      title: "Booking Conversion Report",
      description: "Analyze booking to completion conversion rates",
      icon: <span className="text-3xl">🎯</span>,
      color: "bg-fuchsia-500",
    },
    {
      id: "active-students",
      title: "Active Students Report",
      description: "View currently active students with ongoing sessions",
      icon: <span className="text-3xl">🔥</span>,
      color: "bg-sky-500",
    },
  ];

  // Fetch cars for dropdown
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
        variables: {
          whereSearchInput: { schoolId },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response?.data as any)?.getAllCar || [];
    },
    enabled: schoolId > 0,
  });

  const handleViewReport = (reportId: ReportType) => {
    setSelectedReport(reportId);
    setDateRange(null);
    setSelectedCarId(null);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    setDateRange(null);
    setSelectedCarId(null);
  };

  const handleExportReport = (exportAll: boolean = false) => {
    if (!selectedReport) return;

    try {
      // Get the table element from the modal
      const tableElement = document.querySelector(".ant-modal-body table");
      if (!tableElement) {
        message.error("No data to export");
        return;
      }

      // Extract headers
      const headers: string[] = [];
      const headerCells = tableElement.querySelectorAll("thead th");
      headerCells.forEach((cell) => {
        const text = cell.textContent?.trim() || "";
        if (text) headers.push(text);
      });

      // Extract rows
      const rows: string[][] = [];
      // If exportAll is true, get all rows including those not visible
      const bodyRows = exportAll 
        ? tableElement.querySelectorAll("tbody tr.ant-table-row") 
        : tableElement.querySelectorAll("tbody tr");
      
      bodyRows.forEach((row) => {
        const rowData: string[] = [];
        const cells = row.querySelectorAll("td");
        cells.forEach((cell) => {
          // Get text content, handling tags and nested elements
          const text = cell.textContent?.trim().replace(/\s+/g, " ") || "";
          rowData.push(text);
        });
        if (rowData.length > 0) {
          rows.push(rowData);
        }
      });

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const reportName = getModalTitle().replace(/\s+/g, "_");
      const dateStr = dayjs().format("YYYY-MM-DD_HH-mm");
      const fileName = exportAll 
        ? `${reportName}_ALL_${dateStr}.csv` 
        : `${reportName}_${dateStr}.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`Report exported successfully! ${exportAll ? '(All records)' : ''}`);
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export report");
    }
  };

  const renderReportContent = () => {
    if (!selectedReport) return null;

    switch (selectedReport) {
      case "student-join":
        return <StudentJoinReport dateRange={dateRange} schoolId={schoolId} />;
      case "car-training":
        return (
          <CarTrainingReport
            dateRange={dateRange}
            carId={selectedCarId}
            schoolId={schoolId}
          />
        );
      case "attendance":
        return (
          <AttendanceReport
            dateRange={dateRange}
            carId={selectedCarId}
            schoolId={schoolId}
          />
        );
      case "payment-collection":
        return (
          <PaymentCollectionReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "driver-performance":
        return (
          <DriverPerformanceReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "course-completion":
        return (
          <CourseCompletionReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "revenue-analysis":
        return (
          <RevenueAnalysisReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "pending-payments":
        return (
          <PendingPaymentsReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "car-utilization":
        return (
          <CarUtilizationReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "session-cancellation":
        return (
          <SessionCancellationReport
            dateRange={dateRange}
            schoolId={schoolId}
          />
        );
      case "license-applications":
        return (
          <LicenseApplicationsReport
            dateRange={dateRange}
            schoolId={schoolId}
          />
        );
      case "peak-hours":
        return <PeakHoursReport dateRange={dateRange} schoolId={schoolId} />;
      case "student-progress":
        return (
          <StudentProgressReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "monthly-revenue":
        return (
          <MonthlyRevenueReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "booking-conversion":
        return (
          <BookingConversionReport dateRange={dateRange} schoolId={schoolId} />
        );
      case "active-students":
        return (
          <ActiveStudentsReport dateRange={dateRange} schoolId={schoolId} />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const report = reportCards.find((r) => r.id === selectedReport);
    return report?.title || "Report";
  };

  const requiresCarSelection =
    selectedReport === "car-training" || selectedReport === "attendance";

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Fa6RegularFileLines className="text-2xl text-white" />
            </div>
            Reports
          </h1>
          <p className="text-gray-600 text-lg">
            Generate and view various reports for your driving school
          </p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {reportCards.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400"
              hoverable
              style={{
                padding: "10px",
              }}
            >
              <div className="text-center">
                {/* Icon */}
                <div
                  className={`${report.color} bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <div className={`${report.color.replace("bg-", "text-")}`}>
                    {report.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {report.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                  {report.description}
                </p>

                {/* Button */}
                <Button
                  type="primary"
                  icon={<AntDesignEyeOutlined />}
                  onClick={() => handleViewReport(report.id)}
                  className="w-full"
                  size="large"
                >
                  View Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-xl font-bold">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Fa6RegularFileLines className="text-lg text-white" />
            </div>
            <span>{getModalTitle()}</span>
          </div>
        }
        open={!!selectedReport}
        onCancel={handleCloseModal}
        width={1400}
        footer={[
          <Button key="close" onClick={handleCloseModal} size="large">
            Close
          </Button>,
          <Button
            key="download-current"
            icon={<AntDesignBookOutlined />}
            onClick={() => handleExportReport(false)}
            size="large"
          >
            Export Current Page
          </Button>,
          <Button
            key="download-all"
            type="primary"
            icon={<AntDesignBookOutlined />}
            onClick={() => handleExportReport(true)}
            size="large"
          >
            Export All Records
          </Button>,
        ]}
        styles={{ body: { paddingTop: "24px" } }}
      >
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-lg">🔍</span>
              Filters
            </h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MaterialSymbolsCalendarClockRounded className="inline mr-1" />
                  Date Range
                </label>
                <RangePicker
                  className="w-full"
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                  format="DD MMM YYYY"
                  size="large"
                />
              </div>

              {requiresCarSelection && (
                <div className="flex-1 min-w-[250px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AntDesignCarOutlined className="inline mr-1" />
                    Select Car
                  </label>
                  <Select
                    className="w-full"
                    placeholder="Select a car"
                    value={selectedCarId}
                    onChange={setSelectedCarId}
                    size="large"
                    options={carsData?.map((car) => ({
                      label: `${car.carName} (${car.registrationNumber})`,
                      value: car.id,
                    }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {renderReportContent()}
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Student Join Report Component
const StudentJoinReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<User[]>({
    queryKey: ["student-join-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllUser($whereSearchInput: WhereUserSearchInput!) {
          getAllUser(whereSearchInput: $whereSearchInput) {
            id
            name
            surname
            contact1
            email
            createdAt
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId,
            role: "USER",
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = (response?.data as any)?.getAllUser || [];

      // Filter by date range if provided
      if (dateRange) {
        return users.filter((user: User) => {
          const createdDate = dayjs(user.createdAt);
          return (
            createdDate.isAfter(dateRange[0].startOf("day")) &&
            createdDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return users;
    },
    enabled: schoolId > 0,
  });

  const columns = [
    {
      title: "Student Name",
      key: "name",
      render: (record: User) => `${record.name} ${record.surname}`,
    },
    {
      title: "Contact",
      dataIndex: "contact1",
      key: "contact1",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={24}>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Students Enrolled
                </span>
              }
              value={data?.length || 0}
              prefix={<AntDesignPlusCircleOutlined className="text-white" />}
              valueStyle={{ color: "white", fontSize: "32px" }}
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Car Training Report Component
const CarTrainingReport = ({
  dateRange,
  carId,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  carId: number | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["car-training-report", dateRange, carId, schoolId],
    queryFn: async () => {
      if (!carId) return [];

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
            }
            car {
              id
              carName
              registrationNumber
            }
            driver {
              id
              name
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            carId,
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];

      // Filter by date range if provided
      if (dateRange) {
        return sessions.filter((session: BookingSession) => {
          const sessionDate = dayjs(session.sessionDate);
          return (
            sessionDate.isAfter(dateRange[0].startOf("day")) &&
            sessionDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return sessions;
    },
    enabled: schoolId > 0 && !!carId,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "sessionDate",
      key: "sessionDate",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Time Slot",
      dataIndex: "slot",
      key: "slot",
    },
    {
      title: "Student Name",
      key: "studentName",
      render: (record: BookingSession) => record.booking?.customerName || "N/A",
    },
    {
      title: "Contact",
      key: "contact",
      render: (record: BookingSession) =>
        record.booking?.customerMobile || "N/A",
    },
    {
      title: "Driver",
      key: "driver",
      render: (record: BookingSession) => record.driver?.name || "Not Assigned",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "COMPLETED"
              ? "green"
              : status === "CANCELLED"
              ? "red"
              : "blue"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Attended",
      dataIndex: "attended",
      key: "attended",
      render: (attended: boolean) => (
        <Tag color={attended ? "green" : "red"}>{attended ? "Yes" : "No"}</Tag>
      ),
    },
  ];

  if (!carId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a car to view the training report
      </div>
    );
  }

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Sessions
                </span>
              }
              value={data?.length || 0}
              prefix={
                <MaterialSymbolsCalendarClockRounded className="text-white" />
              }
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">Attended</span>
              }
              value={data?.filter((s) => s.attended).length || 0}
              prefix={<AntDesignCheckOutlined className="text-white" />}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
            <Statistic
              title={<span className="text-white text-opacity-90">Absent</span>}
              value={data?.filter((s) => !s.attended).length || 0}
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Attendance Report Component
const AttendanceReport = ({
  dateRange,
  carId,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  carId: number | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["attendance-report", dateRange, carId, schoolId],
    queryFn: async () => {
      const whereInput: Record<string, number> = {};
      if (carId) whereInput.carId = carId;

      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            sessionDate
            slot
            attended
            booking {
              id
              customerName
              customerMobile
            }
            car {
              id
              carName
            }
          }
        }`,
        variables: {
          whereSearchInput: whereInput,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];

      // Filter by date range if provided
      if (dateRange) {
        return sessions.filter((session: BookingSession) => {
          const sessionDate = dayjs(session.sessionDate);
          return (
            sessionDate.isAfter(dateRange[0].startOf("day")) &&
            sessionDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return sessions;
    },
    enabled: schoolId > 0,
  });

  // Group by date and car
  const groupedData: GroupedAttendance =
    data?.reduce((acc: GroupedAttendance, session: BookingSession) => {
      const dateKey = dayjs(session.sessionDate).format("YYYY-MM-DD");
      const carName = session.car?.carName || "Unknown";

      if (!acc[dateKey]) acc[dateKey] = {};
      if (!acc[dateKey][carName]) acc[dateKey][carName] = [];

      acc[dateKey][carName].push(session);
      return acc;
    }, {}) || {};

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Car",
      dataIndex: "car",
      key: "car",
    },
    {
      title: "Total Sessions",
      dataIndex: "totalSessions",
      key: "totalSessions",
    },
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
        const rate =
          record.totalSessions > 0
            ? ((record.present / record.totalSessions) * 100).toFixed(1)
            : 0;
        return `${rate}%`;
      },
    },
  ];

  const tableData = groupedData
    ? Object.entries(groupedData).flatMap(
        ([date, cars]: [string, Record<string, BookingSession[]>]) =>
          Object.entries(cars).map(
            ([carName, sessions]: [string, BookingSession[]]) => ({
              key: `${date}-${carName}`,
              date,
              car: carName,
              totalSessions: sessions.length,
              present: sessions.filter((s) => s.attended).length,
              absent: sessions.filter((s) => !s.attended).length,
            })
          )
      )
    : [];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Attendance Records
                </span>
              }
              value={data?.length || 0}
              prefix={<AntDesignCheckOutlined className="text-white" />}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Overall Attendance Rate
                </span>
              }
              value={
                data && data.length > 0
                  ? (
                      (data.filter((s) => s.attended).length / data.length) *
                      100
                    ).toFixed(1)
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Payment Collection Report Component
const PaymentCollectionReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<Payment[]>({
    queryKey: ["payment-collection-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllPayment($whereSearchInput: SearchPaymentInput!) {
          getAllPayment(whereSearchInput: $whereSearchInput) {
            id
            amount
            paymentDate
            paymentMethod
            booking {
              id
              bookingId
              customerName
              customerMobile
            }
            createdAt
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payments = (response?.data as any)?.getAllPayment || [];

      // Filter by date range if provided
      if (dateRange) {
        return payments.filter((payment: Payment) => {
          const paymentDate = dayjs(payment.paymentDate || payment.createdAt);
          return (
            paymentDate.isAfter(dateRange[0].startOf("day")) &&
            paymentDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return payments;
    },
    enabled: schoolId > 0,
  });

  const columns = [
    {
      title: "Date",
      key: "date",
      render: (record: Payment) =>
        dayjs(record.paymentDate || record.createdAt).format("DD MMM YYYY"),
    },
    {
      title: "Booking ID",
      key: "bookingId",
      render: (record: Payment) => record.booking?.bookingId || "N/A",
    },
    {
      title: "Student Name",
      key: "studentName",
      render: (record: Payment) => record.booking?.customerName || "N/A",
    },
    {
      title: "Contact",
      key: "contact",
      render: (record: Payment) => record.booking?.customerMobile || "N/A",
    },
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
        <Tag
          color={
            method === "CASH"
              ? "green"
              : method === "CARD"
              ? "blue"
              : method === "UPI"
              ? "purple"
              : "orange"
          }
        >
          {method}
        </Tag>
      ),
    },
  ];

  const totalAmount =
    data?.reduce((sum: number, payment) => sum + (payment.amount || 0), 0) || 0;

  const paymentByMethod: PaymentByMethod =
    data?.reduce((acc: PaymentByMethod, payment) => {
      const method = payment.paymentMethod || "UNKNOWN";
      if (!acc[method]) acc[method] = 0;
      acc[method] += payment.amount || 0;
      return acc;
    }, {}) || {};

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Collection
                </span>
              }
              value={totalAmount}
              prefix={<span className="text-white">₹</span>}
              precision={2}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Payments
                </span>
              }
              value={data?.length || 0}
              prefix={<RiMoneyRupeeCircleLine className="text-white" />}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Cash Payments
                </span>
              }
              value={paymentByMethod?.CASH || 0}
              prefix={<span className="text-white">₹</span>}
              precision={2}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Online Payments
                </span>
              }
              value={
                (paymentByMethod?.CARD || 0) +
                (paymentByMethod?.UPI || 0) +
                (paymentByMethod?.BANK_TRANSFER || 0)
              }
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
          pageSizeOptions: ['10', '25', '50', '100'],
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
                <strong className="text-base text-orange-600">
                  ₹{totalAmount.toLocaleString()}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
};

// Driver Performance Report Component
const DriverPerformanceReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["driver-performance-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            sessionDate
            status
            attended
            driver {
              id
              name
            }
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];

      if (dateRange) {
        return sessions.filter((session: BookingSession) => {
          const sessionDate = dayjs(session.sessionDate);
          return (
            sessionDate.isAfter(dateRange[0].startOf("day")) &&
            sessionDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return sessions;
    },
    enabled: schoolId > 0,
  });

  // Group by driver
  const driverStats =
    data?.reduce(
      (
        acc: Record<
          string,
          {
            name: string;
            total: number;
            completed: number;
            attended: number;
            cancelled: number;
          }
        >,
        session
      ) => {
        const driverName = session.driver?.name || "Unassigned";
        if (!acc[driverName]) {
          acc[driverName] = {
            name: driverName,
            total: 0,
            completed: 0,
            attended: 0,
            cancelled: 0,
          };
        }
        acc[driverName].total++;
        if (session.status === "COMPLETED") acc[driverName].completed++;
        if (session.attended) acc[driverName].attended++;
        if (session.status === "CANCELLED") acc[driverName].cancelled++;
        return acc;
      },
      {}
    ) || {};

  const tableData = Object.values(driverStats);

  const columns = [
    {
      title: "Driver Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Total Sessions",
      dataIndex: "total",
      key: "total",
      sorter: (a: { total: number }, b: { total: number }) => a.total - b.total,
    },
    {
      title: "Completed",
      dataIndex: "completed",
      key: "completed",
      render: (count: number) => <Tag color="green">{count}</Tag>,
    },
    {
      title: "Attended",
      dataIndex: "attended",
      key: "attended",
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Cancelled",
      dataIndex: "cancelled",
      key: "cancelled",
      render: (count: number) => <Tag color="red">{count}</Tag>,
    },
    {
      title: "Attendance Rate",
      key: "rate",
      render: (record: { total: number; attended: number }) => {
        const rate =
          record.total > 0
            ? ((record.attended / record.total) * 100).toFixed(1)
            : "0";
        return `${rate}%`;
      },
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Drivers
                </span>
              }
              value={tableData.length}
              prefix={<span className="text-white">👨‍✈️</span>}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Sessions
                </span>
              }
              value={data?.length || 0}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        rowKey="name"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Course Completion Report Component
const CourseCompletionReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["course-completion-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
          getAllBooking(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            customerName
            customerMobile
            courseName
            coursePrice
            status
            bookingDate
            sessions {
              id
              status
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId,
            status: "COMPLETED",
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookings = (response?.data as any)?.getAllBooking || [];

      if (dateRange) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return bookings.filter((booking: any) => {
          const bookingDate = dayjs(booking.bookingDate);
          return (
            bookingDate.isAfter(dateRange[0].startOf("day")) &&
            bookingDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return bookings;
    },
    enabled: schoolId > 0,
  });

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Student Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Contact",
      dataIndex: "customerMobile",
      key: "customerMobile",
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Course Price",
      dataIndex: "coursePrice",
      key: "coursePrice",
      render: (price: number) => `₹${price?.toLocaleString()}`,
    },
    {
      title: "Completion Date",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="green">COMPLETED</Tag>,
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={24}>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Completed Courses
                </span>
              }
              value={data?.length || 0}
              prefix={<span className="text-white text-3xl">🎓</span>}
              valueStyle={{ color: "white", fontSize: "32px" }}
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Revenue Analysis Report Component
const RevenueAnalysisReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<Payment[]>({
    queryKey: ["revenue-analysis-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllPayment($whereSearchInput: SearchPaymentInput!) {
          getAllPayment(whereSearchInput: $whereSearchInput) {
            id
            amount
            paymentDate
            paymentMethod
            booking {
              id
              courseName
              carName
            }
            createdAt
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payments = (response?.data as any)?.getAllPayment || [];

      if (dateRange) {
        return payments.filter((payment: Payment) => {
          const paymentDate = dayjs(payment.paymentDate || payment.createdAt);
          return (
            paymentDate.isAfter(dateRange[0].startOf("day")) &&
            paymentDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return payments;
    },
    enabled: schoolId > 0,
  });

  const totalRevenue =
    data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  // Group by course
  const revenueByCourse =
    data?.reduce((acc: Record<string, number>, payment) => {
      const course = payment.booking?.courseName || "Unknown";
      if (!acc[course]) acc[course] = 0;
      acc[course] += payment.amount || 0;
      return acc;
    }, {}) || {};

  // Group by payment method
  const revenueByMethod =
    data?.reduce((acc: Record<string, number>, payment) => {
      const method = payment.paymentMethod || "Unknown";
      if (!acc[method]) acc[method] = 0;
      acc[method] += payment.amount || 0;
      return acc;
    }, {}) || {};

  const courseData = Object.entries(revenueByCourse).map(
    ([course, amount]) => ({
      course,
      amount,
      percentage:
        totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : "0",
    })
  );

  const columns = [
    {
      title: "Course Name",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Revenue",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `₹${amount.toLocaleString()}`,
      sorter: (a: { amount: number }, b: { amount: number }) =>
        a.amount - b.amount,
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: string) => `${percentage}%`,
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Revenue
                </span>
              }
              value={totalRevenue}
              prefix={<span className="text-white">₹</span>}
              precision={2}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">Cash Revenue</span>
              }
              value={revenueByMethod.CASH || 0}
              prefix={<span className="text-white">₹</span>}
              precision={2}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Online Revenue
                </span>
              }
              value={
                (revenueByMethod.CARD || 0) +
                (revenueByMethod.UPI || 0) +
                (revenueByMethod.BANK_TRANSFER || 0)
              }
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Pending Payments Report Component
const PendingPaymentsReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["pending-payments-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
          getAllBooking(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            customerName
            customerMobile
            totalAmount
            bookingDate
            courseName
            payments {
              id
              amount
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId,
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookings = (response?.data as any)?.getAllBooking || [];

      // Filter bookings with pending payments
      const pendingBookings = bookings.filter((booking: Booking) => {
        const totalPaid =
          booking.payments?.reduce(
            (sum: number, payment: Payment) => sum + (payment.amount || 0),
            0
          ) || 0;
        return totalPaid < booking.totalAmount;
      });

      if (dateRange) {
        return pendingBookings.filter((booking: Booking) => {
          const bookingDate = dayjs(booking.bookingDate);
          return (
            bookingDate.isAfter(dateRange[0].startOf("day")) &&
            bookingDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return pendingBookings;
    },
    enabled: schoolId > 0,
  });

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Student Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Contact",
      dataIndex: "customerMobile",
      key: "customerMobile",
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `₹${amount?.toLocaleString()}`,
    },
    {
      title: "Paid",
      key: "paid",
      render: (record: Booking) => {
        const totalPaid =
          record.payments?.reduce(
            (sum: number, payment: Payment) => sum + (payment.amount || 0),
            0
          ) || 0;
        return `₹${totalPaid.toLocaleString()}`;
      },
    },
    {
      title: "Pending",
      key: "pending",
      render: (record: Booking) => {
        const totalPaid =
          record.payments?.reduce(
            (sum: number, payment: Payment) => sum + (payment.amount || 0),
            0
          ) || 0;
        const pending = record.totalAmount - totalPaid;
        return <Tag color="red">₹{pending.toLocaleString()}</Tag>;
      },
    },
  ];

  const totalPending =
    data?.reduce((sum: number, booking: Booking) => {
      const totalPaid =
        booking.payments?.reduce(
          (s: number, payment: Payment) => s + (payment.amount || 0),
          0
        ) || 0;
      return sum + (booking.totalAmount - totalPaid);
    }, 0) || 0;

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Pending Amount
                </span>
              }
              value={totalPending}
              prefix={<span className="text-white">₹</span>}
              precision={2}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Bookings with Pending Payment
                </span>
              }
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Car Utilization Report Component
const CarUtilizationReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["car-utilization-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            sessionDate
            status
            car {
              id
              carName
              registrationNumber
            }
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];

      if (dateRange) {
        return sessions.filter((session: BookingSession) => {
          const sessionDate = dayjs(session.sessionDate);
          return (
            sessionDate.isAfter(dateRange[0].startOf("day")) &&
            sessionDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return sessions;
    },
    enabled: schoolId > 0,
  });

  // Group by car
  const carStats =
    data?.reduce(
      (
        acc: Record<
          string,
          {
            carName: string;
            regNo: string;
            total: number;
            completed: number;
            cancelled: number;
          }
        >,
        session
      ) => {
        const carName = session.car?.carName || "Unknown";
        const regNo = session.car?.registrationNumber || "N/A";
        const key = `${carName}-${regNo}`;
        if (!acc[key]) {
          acc[key] = { carName, regNo, total: 0, completed: 0, cancelled: 0 };
        }
        acc[key].total++;
        if (session.status === "COMPLETED") acc[key].completed++;
        if (session.status === "CANCELLED") acc[key].cancelled++;
        return acc;
      },
      {}
    ) || {};

  const tableData = Object.values(carStats);

  const columns = [
    {
      title: "Car Name",
      dataIndex: "carName",
      key: "carName",
    },
    {
      title: "Registration No.",
      dataIndex: "regNo",
      key: "regNo",
    },
    {
      title: "Total Sessions",
      dataIndex: "total",
      key: "total",
      sorter: (a: { total: number }, b: { total: number }) => b.total - a.total,
    },
    {
      title: "Completed",
      dataIndex: "completed",
      key: "completed",
      render: (count: number) => <Tag color="green">{count}</Tag>,
    },
    {
      title: "Cancelled",
      dataIndex: "cancelled",
      key: "cancelled",
      render: (count: number) => <Tag color="red">{count}</Tag>,
    },
    {
      title: "Utilization Rate",
      key: "rate",
      render: (record: { total: number; completed: number }) => {
        const rate =
          record.total > 0
            ? ((record.completed / record.total) * 100).toFixed(1)
            : "0";
        return `${rate}%`;
      },
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">Total Cars</span>
              }
              value={tableData.length}
              prefix={<span className="text-white text-2xl">🚗</span>}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Sessions
                </span>
              }
              value={data?.length || 0}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        rowKey={(record) => `${record.carName}-${record.regNo}`}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Session Cancellation Report Component
const SessionCancellationReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["session-cancellation-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            sessionDate
            slot
            status
            booking {
              id
              bookingId
              customerName
              customerMobile
            }
            car {
              id
              carName
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            status: "CANCELLED",
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];

      if (dateRange) {
        return sessions.filter((session: BookingSession) => {
          const sessionDate = dayjs(session.sessionDate);
          return (
            sessionDate.isAfter(dateRange[0].startOf("day")) &&
            sessionDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return sessions;
    },
    enabled: schoolId > 0,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "sessionDate",
      key: "sessionDate",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Time Slot",
      dataIndex: "slot",
      key: "slot",
    },
    {
      title: "Booking ID",
      key: "bookingId",
      render: (record: BookingSession) => record.booking?.bookingId || "N/A",
    },
    {
      title: "Student Name",
      key: "studentName",
      render: (record: BookingSession) => record.booking?.customerName || "N/A",
    },
    {
      title: "Contact",
      key: "contact",
      render: (record: BookingSession) =>
        record.booking?.customerMobile || "N/A",
    },
    {
      title: "Car",
      key: "car",
      render: (record: BookingSession) => record.car?.carName || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="red">CANCELLED</Tag>,
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={24}>
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Cancelled Sessions
                </span>
              }
              value={data?.length || 0}
              prefix={<span className="text-white text-3xl">❌</span>}
              valueStyle={{ color: "white", fontSize: "32px" }}
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// License Applications Report Component
const LicenseApplicationsReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["license-applications-report", dateRange, schoolId, statusFilter],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllLicenseApplication($whereSearchInput: WhereLicenseApplicationSearchInput!) {
          getAllLicenseApplication(whereSearchInput: $whereSearchInput) {
            id
            dlApplicationNumber
            llNumber
            status
            testStatus
            testDate
            issuedDate
            bookingService {
              user {
                name
                surname
                contact1
              }
              booking {
                customerName
                customerMobile
              }
              serviceName
            }
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      const applications: LicenseApplication[] =
        (response?.data as { getAllLicenseApplication: LicenseApplication[] })?.getAllLicenseApplication || [];

      let filteredApplications = applications;

      // Apply date range filter
      if (dateRange) {
        filteredApplications = filteredApplications.filter((app: LicenseApplication) => {
          const appDate = dayjs(app.testDate || app.issuedDate);
          return (
            appDate &&
            appDate.isAfter(dateRange[0].startOf("day")) &&
            appDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }

      // Apply status filter
      if (statusFilter) {
        filteredApplications = filteredApplications.filter((app: LicenseApplication) => {
          return app.status === statusFilter;
        });
      }

      return filteredApplications;
    },
    enabled: schoolId > 0,
  });

  const statusCounts =
    data?.reduce((acc: Record<string, number>, app: LicenseApplication) => {
      const status = app.status || "PENDING";
      if (!acc[status]) acc[status] = 0;
      acc[status]++;
      return acc;
    }, {} as Record<string, number>) || {};

  const columns = [
    {
      title: "LL Number",
      dataIndex: "llNumber",
      key: "llNumber",
      render: (llNumber: string) => llNumber || "N/A",
    },
    {
      title: "DL Application No.",
      dataIndex: "dlApplicationNumber",
      key: "dlApplicationNumber",
      render: (dlNumber: string) => dlNumber || "N/A",
    },
    {
      title: "Student Name",
      key: "studentName",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => {
        const userName = record.bookingService?.user
          ? `${record.bookingService.user.name} ${
              record.bookingService.user.surname || ""
            }`.trim()
          : record.bookingService?.booking?.customerName || "N/A";
        return userName;
      },
    },
    {
      title: "Contact",
      key: "contact",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => {
        return (
          record.bookingService?.user?.contact1 ||
          record.bookingService?.booking?.customerMobile ||
          "N/A"
        );
      },
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
      render: (date: string) =>
        date ? dayjs(date).format("DD MMM YYYY") : "N/A",
    },
    {
      title: "Test Status",
      dataIndex: "testStatus",
      key: "testStatus",
      render: (testStatus: string) => {
        const colors: Record<string, string> = {
          PASSED: "green",
          FAILED: "red",
          ABSENT: "orange",
          NONE: "default",
        };
        return <Tag color={colors[testStatus] || "default"}>{testStatus}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          CLOSED: "green",
          DL_APPLIED: "blue",
          DL_PENDING: "orange",
          LL_APPLIED: "cyan",
          PENDING: "orange",
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Issued Date",
      dataIndex: "issuedDate",
      key: "issuedDate",
      render: (date: string) =>
        date ? dayjs(date).format("DD MMM YYYY") : "N/A",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Select
          placeholder="Filter by Status"
          allowClear
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value || null)}
          value={statusFilter}
          options={[
            { label: "Pending", value: "PENDING" },
            { label: "Closed", value: "CLOSED" },
            { label: "LL Applied", value: "LL_APPLIED" },
            { label: "DL Pending", value: "DL_PENDING" },
            { label: "DL Applied", value: "DL_APPLIED" },
          ]}
        />
      </div>
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Applications
                </span>
              }
              value={data?.length || 0}
              prefix={<span className="text-white text-2xl">📄</span>}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <Statistic
              title={<span className="text-white text-opacity-90">Closed</span>}
              value={statusCounts.CLOSED || 0}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">Pending</span>
              }
              value={statusCounts.PENDING || statusCounts.DL_PENDING || 0}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">Applied</span>
              }
              value={
                (statusCounts.LL_APPLIED || 0) + (statusCounts.DL_APPLIED || 0)
              }
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Peak Hours Report Component
const PeakHoursReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<BookingSession[]>({
    queryKey: ["peak-hours-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            sessionDate
            slot
            status
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response?.data as any)?.getAllBookingSession || [];

      if (dateRange) {
        return sessions.filter((session: BookingSession) => {
          const sessionDate = dayjs(session.sessionDate);
          return (
            sessionDate.isAfter(dateRange[0].startOf("day")) &&
            sessionDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return sessions;
    },
    enabled: schoolId > 0,
  });

  // Group by time slot
  const slotStats =
    data?.reduce((acc: Record<string, number>, session) => {
      const slot = session.slot || "Unknown";
      if (!acc[slot]) acc[slot] = 0;
      acc[slot]++;
      return acc;
    }, {}) || {};

  // Group by day of week
  const dayStats =
    data?.reduce((acc: Record<string, number>, session) => {
      const day = dayjs(session.sessionDate).format("dddd");
      if (!acc[day]) acc[day] = 0;
      acc[day]++;
      return acc;
    }, {}) || {};

  const slotData = Object.entries(slotStats)
    .map(([slot, count]) => ({ slot, count }))
    .sort((a, b) => b.count - a.count);

  const dayData = Object.entries(dayStats)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count);

  const slotColumns = [
    {
      title: "Time Slot",
      dataIndex: "slot",
      key: "slot",
    },
    {
      title: "Total Bookings",
      dataIndex: "count",
      key: "count",
      render: (count: number) => <Tag color="blue">{count}</Tag>,
      sorter: (a: { count: number }, b: { count: number }) => b.count - a.count,
    },
  ];

  const dayColumns = [
    {
      title: "Day of Week",
      dataIndex: "day",
      key: "day",
    },
    {
      title: "Total Bookings",
      dataIndex: "count",
      key: "count",
      render: (count: number) => <Tag color="purple">{count}</Tag>,
      sorter: (a: { count: number }, b: { count: number }) => b.count - a.count,
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Sessions Analyzed
                </span>
              }
              value={data?.length || 0}
              prefix={<span className="text-white text-2xl">⏰</span>}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Peak Time Slot
                </span>
              }
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
  );
};

// Student Progress Report Component
const StudentProgressReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["student-progress-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
          getAllBooking(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            customerName
            customerMobile
            courseName
            bookingDate
            sessions {
              id
              status
              attended
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId,
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookings = (response?.data as any)?.getAllBooking || [];

      if (dateRange) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return bookings.filter((booking: any) => {
          const bookingDate = dayjs(booking.bookingDate);
          return (
            bookingDate.isAfter(dateRange[0].startOf("day")) &&
            bookingDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return bookings;
    },
    enabled: schoolId > 0,
  });

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Student Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Contact",
      dataIndex: "customerMobile",
      key: "customerMobile",
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Total Sessions",
      key: "totalSessions",
      render: (record: Booking) => record.sessions?.length || 0,
    },
    {
      title: "Completed",
      key: "completed",
      render: (record: Booking) => {
        const completed =
          record.sessions?.filter((s: BookingSession) => s.status === "COMPLETED")
            .length || 0;
        return <Tag color="green">{completed}</Tag>;
      },
    },
    {
      title: "Attended",
      key: "attended",
      render: (record: Booking) => {
        const attended =
          record.sessions?.filter((s: BookingSession) => s.attended).length || 0;
        return <Tag color="blue">{attended}</Tag>;
      },
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: Booking) => {
        const total = record.sessions?.length || 0;
        const completed =
          record.sessions?.filter((s: BookingSession) => s.status === "COMPLETED")
            .length || 0;
        const progress =
          total > 0 ? ((completed / total) * 100).toFixed(0) : "0";
        return `${progress}%`;
      },
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={24}>
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Students Being Tracked
                </span>
              }
              value={data?.length || 0}
              prefix={<span className="text-white text-3xl">📊</span>}
              valueStyle={{ color: "white", fontSize: "32px" }}
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Monthly Revenue Report Component
const MonthlyRevenueReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery<Payment[]>({
    queryKey: ["monthly-revenue-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllPayment($whereSearchInput: SearchPaymentInput!) {
          getAllPayment(whereSearchInput: $whereSearchInput) {
            id
            amount
            paymentDate
            createdAt
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response?.data as any)?.getAllPayment || [];
    },
    enabled: schoolId > 0,
  });

  // Group by month
  const monthlyData =
    data?.reduce((acc: Record<string, number>, payment) => {
      const month = dayjs(payment.paymentDate || payment.createdAt).format(
        "MMM YYYY"
      );
      if (!acc[month]) acc[month] = 0;
      acc[month] += payment.amount || 0;
      return acc;
    }, {}) || {};

  const tableData = Object.entries(monthlyData)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort(
      (a, b) =>
        dayjs(a.month, "MMM YYYY").valueOf() -
        dayjs(b.month, "MMM YYYY").valueOf()
    );

  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue: number) => `₹${revenue.toLocaleString()}`,
      sorter: (a: { revenue: number }, b: { revenue: number }) =>
        a.revenue - b.revenue,
    },
    {
      title: "Growth",
      key: "growth",
      render: (_: unknown, __: unknown, index: number) => {
        if (index === 0) return <Tag>Baseline</Tag>;
        const current = tableData[index].revenue;
        const previous = tableData[index - 1].revenue;
        const growth =
          previous > 0
            ? (((current - previous) / previous) * 100).toFixed(1)
            : "0";
        const isPositive = parseFloat(growth) >= 0;
        return (
          <Tag color={isPositive ? "green" : "red"}>
            {isPositive ? "+" : ""}
            {growth}%
          </Tag>
        );
      },
    },
  ];

  const totalRevenue = Object.values(monthlyData).reduce(
    (sum, val) => sum + val,
    0
  );
  const avgRevenue = tableData.length > 0 ? totalRevenue / tableData.length : 0;

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <div className="bg-gradient-to-br from-lime-500 to-lime-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Revenue
                </span>
              }
              value={totalRevenue}
              prefix={<span className="text-white">₹</span>}
              precision={2}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Average Monthly
                </span>
              }
              value={avgRevenue}
              prefix={<span className="text-white">₹</span>}
              precision={2}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={8}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Months Tracked
                </span>
              }
              value={tableData.length}
              prefix={<span className="text-white text-2xl">📈</span>}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        rowKey="month"
        pagination={{
          defaultPageSize: 12,
          showSizeChanger: true,
          pageSizeOptions: ['10', '12', '25', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

// Booking Conversion Report Component
const BookingConversionReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["booking-conversion-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
          getAllBooking(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            customerName
            status
            bookingDate
            courseName
            sessions {
              id
              status
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId,
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookings = (response?.data as any)?.getAllBooking || [];

      if (dateRange) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return bookings.filter((booking: any) => {
          const bookingDate = dayjs(booking.bookingDate);
          return (
            bookingDate.isAfter(dateRange[0].startOf("day")) &&
            bookingDate.isBefore(dateRange[1].endOf("day"))
          );
        });
      }
      return bookings;
    },
    enabled: schoolId > 0,
  });

  const statusCounts =
    data?.reduce((acc: Record<string, number>, booking: Booking) => {
      const status = booking.status || "PENDING";
      if (!acc[status]) acc[status] = 0;
      acc[status]++;
      return acc;
    }, {} as Record<string, number>) || {};

  const totalBookings = data?.length || 0;
  const completed = statusCounts.COMPLETED || 0;
  const cancelled = statusCounts.CANCELLED || 0;
  const pending = statusCounts.PENDING || 0;
  const conversionRate =
    totalBookings > 0 ? ((completed / totalBookings) * 100).toFixed(1) : "0";
  const cancellationRate =
    totalBookings > 0 ? ((cancelled / totalBookings) * 100).toFixed(1) : "0";

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage:
      totalBookings > 0
        ? (((count as number) / totalBookings) * 100).toFixed(1)
        : "0",
  }));

  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          COMPLETED: "green",
          PENDING: "orange",
          CANCELLED: "red",
        };
        return <Tag color={colors[status] || "blue"}>{status}</Tag>;
      },
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: string) => `${percentage}%`,
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <div className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Total Bookings
                </span>
              }
              value={totalBookings}
              prefix={<span className="text-white text-2xl">🎯</span>}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Conversion Rate
                </span>
              }
              value={conversionRate}
              suffix="%"
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Cancellation Rate
                </span>
              }
              value={cancellationRate}
              suffix="%"
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">Pending</span>
              }
              value={pending}
              valueStyle={{ color: "white" }}
            />
          </div>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={statusData}
        loading={isLoading}
        rowKey="status"
        pagination={false}
        className="shadow-sm"
      />
    </div>
  );
};

// Active Students Report Component
const ActiveStudentsReport = ({
  dateRange,
  schoolId,
}: {
  dateRange: [Dayjs, Dayjs] | null;
  schoolId: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["active-students-report", dateRange, schoolId],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
          getAllBooking(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            customerName
            customerMobile
            customerEmail
            courseName
            status
            bookingDate
            sessions {
              id
              sessionDate
              status
              attended
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId,
            status: "PENDING",
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookings = (response?.data as any)?.getAllBooking || [];

      // Filter for active students (have upcoming or recent sessions)
      const today = dayjs();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return bookings.filter((booking: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasUpcomingSessions = booking.sessions?.some((s: any) => {
          const sessionDate = dayjs(s.sessionDate);
          return sessionDate.isAfter(today.subtract(7, "day"));
        });
        return hasUpcomingSessions;
      });
    },
    enabled: schoolId > 0,
  });

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Student Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Contact",
      dataIndex: "customerMobile",
      key: "customerMobile",
    },
    {
      title: "Email",
      dataIndex: "customerEmail",
      key: "customerEmail",
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Total Sessions",
      key: "totalSessions",
      render: (record: Booking) => record.sessions?.length || 0,
    },
    {
      title: "Completed",
      key: "completed",
      render: (record: Booking) => {
        const completed =
          record.sessions?.filter((s: BookingSession) => s.status === "COMPLETED")
            .length || 0;
        return <Tag color="green">{completed}</Tag>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="blue">ACTIVE</Tag>,
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-6">
        <Col span={24}>
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 rounded-lg">
            <Statistic
              title={
                <span className="text-white text-opacity-90">
                  Currently Active Students
                </span>
              }
              value={data?.length || 0}
              prefix={<span className="text-white text-3xl">🔥</span>}
              valueStyle={{ color: "white", fontSize: "32px" }}
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
          pageSizeOptions: ['10', '25', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
      />
    </div>
  );
};

export default Reports;
