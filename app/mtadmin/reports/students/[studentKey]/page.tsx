"use client";

import { useMemo } from "react";
import { Button, Card, Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import {
  Fa6SolidAngleLeft,
  AntDesignBookOutlined,
  IcBaselineRefresh,
} from "@/components/icons";
import {
  getAllBookings,
  type Booking,
  type BookingSession,
} from "@/services/booking.api";

interface SessionRow {
  key: string;
  bookingId: string;
  date: string;
  slot: string;
  carName: string;
  courseName: string;
  status: string;
  remark: string;
}

const getStudentKey = (booking: Booking) => {
  if (booking.customerId) return `id-${booking.customerId}`;
  return `mobile-${booking.customer?.contact1 || booking.customerMobile || "unknown"}`;
};

const StudentReportDetailPage = () => {
  const router = useRouter();
  const params = useParams<{ studentKey: string }>();
  const selectedStudentKey = decodeURIComponent(params.studentKey || "");
  const schoolId = parseInt(getCookie("school")?.toString() || "0");

  const {
    data: bookingsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["student-report-detail", schoolId, selectedStudentKey],
    queryFn: () => getAllBookings({ schoolId }),
    enabled: schoolId > 0 && !!selectedStudentKey,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const studentBookings = useMemo(() => {
    const bookings = bookingsResponse?.data?.getAllBooking || [];
    return bookings.filter(
      (booking: Booking) => getStudentKey(booking) === selectedStudentKey,
    );
  }, [bookingsResponse, selectedStudentKey]);

  const student = studentBookings[0];

  const bookingIds = useMemo(() => {
    const uniqueBookingIds = Array.from(
      new Set(
        studentBookings.map((booking) => booking.bookingId).filter(Boolean),
      ),
    );
    return uniqueBookingIds.length > 0 ? uniqueBookingIds.join(", ") : "-";
  }, [studentBookings]);

  const reportStats = useMemo(() => {
    const sessions = studentBookings.flatMap(
      (booking: Booking) => booking.sessions || [],
    );

    const present = sessions.filter(
      (session: BookingSession) =>
        session.attended || session.status === "COMPLETED",
    ).length;
    const absent = sessions.filter(
      (session: BookingSession) => session.status === "NO_SHOW",
    ).length;

    const totalAmount = studentBookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0,
    );
    const paidAmount = studentBookings.reduce((sum, booking) => {
      const bookingPaid =
        booking.payments?.reduce(
          (paymentSum: number, payment: { id: number; amount: number }) =>
            paymentSum + (payment.amount || 0),
          0,
        ) || 0;
      return sum + bookingPaid;
    }, 0);

    const allDates = sessions
      .map((session: BookingSession) => dayjs(session.sessionDate))
      .sort((a, b) => a.valueOf() - b.valueOf());

    const driverDetails = Array.from(
      new Set(
        sessions
          .map((session: BookingSession) => session.driver?.name)
          .filter((name): name is string => !!name),
      ),
    );

    const carDetails = Array.from(
      new Set(
        studentBookings
          .map((booking: Booking) => {
            const carName = booking.car?.carName || booking.carName;
            const regNo = booking.car?.registrationNumber;
            if (!carName) return null;
            return regNo ? `${carName} (${regNo})` : carName;
          })
          .filter((car): car is string => !!car),
      ),
    );

    const courseDetails = Array.from(
      new Set(
        studentBookings
          .map(
            (booking: Booking) =>
              booking.course?.courseName || booking.courseName,
          )
          .filter((course): course is string => !!course),
      ),
    );

    return {
      totalBookings: studentBookings.length,
      totalSessions: sessions.length,
      present,
      absent,
      startDate: allDates.length ? allDates[0].format("DD MMM YYYY") : "-",
      endDate: allDates.length
        ? allDates[allDates.length - 1].format("DD MMM YYYY")
        : "-",
      totalAmount,
      paidAmount,
      balance: Math.max(totalAmount - paidAmount, 0),
      driverDetails: driverDetails.length > 0 ? driverDetails.join(", ") : "-",
      carDetails: carDetails.length > 0 ? carDetails.join(", ") : "-",
      courseDetails: courseDetails.length > 0 ? courseDetails.join(", ") : "-",
    };
  }, [studentBookings]);

  const sessionRows: SessionRow[] = useMemo(() => {
    return studentBookings.flatMap((booking: Booking) =>
      (booking.sessions || []).map((session: BookingSession) => ({
        key: `${booking.id}-${session.id}`,
        bookingId: booking.bookingId,
        date: dayjs(session.sessionDate).format("DD MMM YYYY"),
        slot: session.slot,
        carName: booking.car?.carName || booking.carName,
        courseName: booking.course?.courseName || booking.courseName,
        status: session.status,
        remark: session.instructorNotes || booking.notes || "-",
      })),
    );
  }, [studentBookings]);

  const columns = [
    {
      title: "Sr. No",
      key: "srNo",
      width: 80,
      render: (_: SessionRow, __: SessionRow, index: number) => index + 1,
    },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Slot", dataIndex: "slot", key: "slot" },
    {
      title: "Schedule",
      key: "schedule",
      render: () => <span className="inline-block min-w-[100px] text-xs">&nbsp;</span>,
    },
    {
      title: "Signature",
      key: "signature",
      render: () => <span className="inline-block min-w-[100px] text-xs">&nbsp;</span>,
    },
  ];

  return (
    <div className="student-report-page min-h-screen bg-gray-50 p-6 md:p-8 space-y-6 print:bg-white print:p-0">
      <Card className="shadow-sm print:shadow-none print:border print:rounded-none print:mx-0 print:my-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 print:hidden">
          <div>
            <h1 className="text-xl font-bold text-gray-900 text-center">
              Since 1954
            </h1>
            <p className="text-gray-600 text-2xl text-center">
              CHOHAN MOTOR DRIVING SCHOOL
            </p>
            <p className="text-gray-600 text-2xl text-center">FORM NO. 15</p>
            <p className="text-gray-600 text-lg text-center">
              (See Rule 27 (i))
            </p>
            <p className="text-gray-600 text-lg text-center">
              Register Showing the driving hours spent by the student
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={<Fa6SolidAngleLeft />}
              onClick={() => router.push("/mtadmin/reports/students")}
            >
              Back
            </Button>
            <Button icon={<IcBaselineRefresh />} onClick={() => refetch()}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<AntDesignBookOutlined />}
              onClick={() => window.print()}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        <div className="hidden print:block border-b pb-2 mb-2">
          <div className="flex justify-between">
            <p className="text-gray-700 text-2xl text-center font-medium leading-tight">
              FORM NO. 15
            </p>
            <p className="text-gray-700 text-2xl text-center font-medium leading-tight">
              CHOHAN MOTOR DRIVING SCHOOL- Since 1954
            </p>

            <p className="text-gray-700 text-lg text-center leading-tight">
              (See Rule 27 (i))
            </p>
          </div>
          <p className="text-gray-700 text-lg text-center leading-tight">
            Register Showing the driving hours spent by the student
          </p>
        </div>

        <div className="report-layout grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 print:mt-0 print:gap-2">
          <div className="report-left lg:col-span-1 space-y-4">
            <div className="border rounded-lg p-4 bg-white print:rounded-none">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {student?.customer?.name || student?.customerName || "-"}{" "}
                  {student?.customer?.surname || "-"}
                </p>
                <p>
                  <span className="font-medium">Father&apos;s Name:</span>{" "}
                  {student?.customer?.fatherName || "-"}
                </p>
                <p>
                  <span className="font-medium">Booking ID:</span> {bookingIds}
                </p>
                <p>
                  <span className="font-medium">Mobile No:</span>{" "}
                  {student?.customer?.contact1 ||
                    student?.customerMobile ||
                    "-"}
                </p>
                <p>
                  <span className="font-medium">Alt Mobile No:</span>{" "}
                  {student?.customer?.contact2 || "-"}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {student?.customer?.address || "-"}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {student?.customer?.address || "-"}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {reportStats.startDate}
                </p>
                <p>
                  <span className="font-medium">End Date:</span>{" "}
                  {reportStats.endDate}
                </p>
                <p>
                  <span className="font-medium">
                    Present - {reportStats.present}
                  </span>{" "}
                  <span className="font-medium">
                    Absent - {reportStats.absent}
                  </span>
                </p>
                <p>
                  <span className="font-medium">
                    Bookings - {reportStats.totalBookings}
                  </span>{" "}
                  <span className="font-medium">
                    Sessions - {reportStats.totalSessions}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ₹
                  {reportStats.totalAmount.toLocaleString("en-IN")}
                </p>
                <p>
                  <span className="font-medium">Balance:</span> ₹
                  {reportStats.balance.toLocaleString("en-IN")}
                </p>
                <p className="col-span-2 wrap-break-word">
                  <span className="font-medium">Driver Details:</span>{" "}
                  {reportStats.driverDetails}
                </p>
                <p className="col-span-2 wrap-break-word">
                  <span className="font-medium">Car Details:</span>{" "}
                  {reportStats.carDetails}
                </p>
                <p className="col-span-2 wrap-break-word">
                  <span className="font-medium">Course Details:</span>{" "}
                  {reportStats.courseDetails}
                </p>
              </div>
            </div>

            <div className="training-rules-card border rounded-lg p-4 bg-white print:rounded-none">
              <h3 className="text-base font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Training Rules:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  One training session = approximately 10 km driving within 1
                  hour.
                </li>
                <li>
                  Students must record date, time, kms and sign after each
                  session.
                </li>
                <li>
                  Training sessions must be completed within 45 days from
                  admission.
                </li>
                <li>Maximum 1–2 leaves allowed with 24 hours prior notice.</li>
                <li>
                  Students must be ready 10 minutes before scheduled pickup
                  time.
                </li>
                <li>
                  Training vehicles are not allowed inside society premises or
                  narrow lanes.
                </li>
              </ul>
            </div>
          </div>

          <div className="report-right lg:col-span-2">
            <div className="border rounded-lg p-2 bg-white print:rounded-none h-full">
              <h3 className="text-base font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Session Details
              </h3>
              <Table
                columns={columns}
                dataSource={sessionRows}
                rowKey="key"
                rowClassName={() => "session-detail-row"}
                pagination={false}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        @page {
          size: A4 landscape;
          margin: 10mm;
        }

        @media print {
          html,
          body {
            background: #fff !important;
          }

          .ant-layout-sider,
          .ant-menu,
          .ant-dropdown,
          .ant-btn,
          .print\:hidden {
            display: none !important;
          }

          .ant-layout > .ant-layout {
            margin-left: 0 !important;
          }

          .student-report-page {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .report-layout {
            display: grid !important;
            grid-template-columns: 32% 68% !important;
            gap: 6px !important;
            align-items: start !important;
            margin-top: 0 !important;
          }

          .report-left {
            grid-column: 1 !important;
          }

          .report-right {
            grid-column: 2 !important;
          }

          .ant-card-body {
            padding: 6px !important;
          }

          .ant-table {
            font-size: 11px !important;
          }

          .ant-table-thead > tr > th {
            padding: 4px 6px !important;
            line-height: 1.1 !important;
          }

          .ant-table-tbody > tr > td {
            padding: 5px 6px !important;
            line-height: 1.25 !important;
          }

          .session-detail-row > td {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }

          .training-rules-card {
            margin-top: 6px !important;
          }

          .training-rules-card h3 {
            margin-bottom: 4px !important;
            font-size: 12px !important;
            line-height: 1.1 !important;
          }

          .training-rules-card ul {
            margin: 0 !important;
            padding-left: 14px !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
          }

          .training-rules-card li {
            margin: 0 !important;
            padding: 0 !important;
          }

          .ant-table-cell {
            vertical-align: middle !important;
          }

          .ant-table-pagination {
            display: none !important;
          }
        }

        .session-detail-row > td {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default StudentReportDetailPage;
