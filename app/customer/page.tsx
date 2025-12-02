"use client";

import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Spin,
  Empty,
  Descriptions,
  Progress,
  Timeline,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignCheckOutlined,
  Fa6RegularClock,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsCalendarClockRounded,
  IcBaselineRefresh,
  Fa6RegularHourglassHalf,
  MaterialSymbolsFreeCancellation,
  MaterialSymbolsLocationOn,
  MaterialSymbolsCall,
  IcBaselineAccountCircle,
} from "@/components/icons";
import { useQuery } from "@tanstack/react-query";
import {
  getAllBookings,
  type Booking,
  type BookingSession,
} from "@/services/booking.api";
import { getUserById, type User } from "@/services/user.api";
import { getSchoolById, type School } from "@/services/school.api";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import { JSX } from "react";

interface SessionData {
  key: string;
  sessionId: number;
  dayNumber: number;
  date: string;
  slot: string;
  driver: string;
  car: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  attended: boolean;
  notes?: string;
}

const CustomerPage = () => {
  const userId: number = parseInt(getCookie("id")?.toString() || "0");

  // Fetch user data
  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId || userId == 0) throw new Error("User ID not found");
      return await getUserById(userId);
    },
    enabled: userId > 0,
  });

  const user: User | undefined = userResponse?.data?.getUserById;

  // Fetch bookings data
  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["customerBookings", userId],
    queryFn: async () => {
      if (!userId || userId == 0) throw new Error("User ID not found");
      return await getAllBookings({ customerId: userId });
    },
    enabled: userId > 0,
  });

  const bookings: Booking[] = bookingsResponse?.data?.getAllBooking || [];

  // Get school ID from the first booking
  const schoolId = bookings[0]?.schoolId;

  // Fetch school data
  const { data: schoolResponse, isLoading: schoolLoading } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error("School ID not found");
      return await getSchoolById(schoolId);
    },
    enabled: !!schoolId,
  });

  const school: School | undefined = schoolResponse?.data?.getSchoolById;

  // Get all sessions from bookings
  const allSessions: SessionData[] = bookings.flatMap((booking) =>
    (booking.sessions || []).map((session: BookingSession) => ({
      key: `${booking.id}-${session.id}`,
      sessionId: session.id,
      dayNumber: session.dayNumber,
      date: dayjs(session.sessionDate).format("DD MMM, YYYY"),
      slot: session.slot,
      driver: session.driver?.name || "Not assigned",
      car: `${booking.car?.carName || booking.carName}`,
      status: session.status,
      attended: session.attended,
      notes: session.instructorNotes,
    }))
  );

  // Calculate statistics
  const totalSessions = allSessions.length;
  const completedSessions = allSessions.filter(
    (s) => s.status == "COMPLETED"
  ).length;
  const pendingSessions = allSessions.filter(
    (s) => s.status == "PENDING"
  ).length;
  const upcomingSessions = allSessions.filter(
    (s) => s.status == "PENDING" && dayjs(s.date).isAfter(dayjs())
  ).length;

  const completionPercentage =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  // Get next session
  const nextSession = allSessions
    .filter((s) => s.status == "PENDING" && dayjs(s.date).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))[0];

  // Get recent sessions for timeline
  const recentSessions = allSessions
    .filter((s) => s.status == "COMPLETED")
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
    .slice(0, 5);

  // Columns for sessions table
  const columns: ColumnsType<SessionData> = [
    {
      title: "Day",
      dataIndex: "dayNumber",
      key: "dayNumber",
      width: 80,
      render: (dayNumber) => (
        <span className="font-semibold">Day {dayNumber}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 130,
    },
    {
      title: "Time Slot",
      dataIndex: "slot",
      key: "slot",
    },
    {
      title: "Driver",
      dataIndex: "driver",
      key: "driver",
    },
    {
      title: "Car",
      dataIndex: "car",
      key: "car",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (status: string) => {
        const config: Record<
          string,
          { color: string; icon: JSX.Element; text: string }
        > = {
          PENDING: {
            color: "orange",
            icon: <Fa6RegularClock />,
            text: "Pending",
          },
          CONFIRMED: {
            color: "blue",
            icon: <AntDesignCheckOutlined />,
            text: "Confirmed",
          },
          COMPLETED: {
            color: "green",
            icon: <AntDesignCheckOutlined />,
            text: "Completed",
          },
          CANCELLED: {
            color: "red",
            icon: <MaterialSymbolsFreeCancellation />,
            text: "Cancelled",
          },
          NO_SHOW: {
            color: "red",
            icon: <MaterialSymbolsFreeCancellation />,
            text: "No Show",
          },
        };
        const statusConfig = config[status] || config.PENDING;
        return (
          <Tag
            color={statusConfig.color}
            icon={statusConfig.icon}
            className="!text-sm !px-3 !py-1 !flex !items-center !gap-1 !w-fit"
          >
            {statusConfig.text}
          </Tag>
        );
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
      render: (notes) => notes || "-",
    },
  ];

  const isLoading = userLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <Card className="shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.name || "Student"}!
            </h2>
            <p className="text-gray-600 text-sm">
              Track your learning progress and upcoming sessions
            </p>
          </div>
          <Button
            type="default"
            icon={<IcBaselineRefresh className="text-lg" />}
            size="large"
            onClick={() => refetchBookings()}
          >
            Refresh
          </Button>
        </div>
      </Card>
      <div></div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsCalendarClockRounded className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSessions}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <AntDesignCheckOutlined className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedSessions}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Fa6RegularHourglassHalf className="text-orange-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingSessions}
                </p>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <MaterialSymbolsPersonRounded className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-1">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingSessions}
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Progress and Next Session */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <AntDesignCheckOutlined className="text-blue-600 text-xl" />
                <span className="font-semibold">Course Progress</span>
              </div>
            }
            className="shadow-sm h-full"
          >
            {totalSessions > 0 ? (
              <div>
                <div className="mb-6">
                  <Progress
                    percent={completionPercentage}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                    status={completionPercentage == 100 ? "success" : "active"}
                  />
                </div>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Total Sessions">
                    {totalSessions}
                  </Descriptions.Item>
                  <Descriptions.Item label="Completed">
                    {completedSessions}
                  </Descriptions.Item>
                  <Descriptions.Item label="Remaining">
                    {pendingSessions}
                  </Descriptions.Item>
                  <Descriptions.Item label="Progress">
                    {completionPercentage}%
                  </Descriptions.Item>
                </Descriptions>
                {bookings[0] && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Course Details
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Course:</span>{" "}
                      {bookings[0].course?.courseName || bookings[0].courseName}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Booking ID:</span>{" "}
                      {bookings[0].bookingId}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <Empty description="No course enrolled yet" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <MaterialSymbolsCalendarClockRounded className="text-orange-600 text-xl" />
                <span className="font-semibold">Next Session</span>
              </div>
            }
            className="shadow-sm h-full"
          >
            {nextSession ? (
              <div>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 p-5 rounded-xl mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Day {nextSession.dayNumber}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {nextSession.date}
                      </p>
                    </div>
                    <Tag color="orange" className="!text-sm !px-3 !py-1">
                      Upcoming
                    </Tag>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Fa6RegularClock className="text-blue-600 text-base" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Time Slot</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {nextSession.slot}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <MaterialSymbolsPersonRounded className="text-purple-600 text-base" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Instructor</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {nextSession.driver}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-base">🚗</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Vehicle</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {nextSession.car}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Please arrive 10 minutes before your scheduled time
                </p>
              </div>
            ) : (
              <Empty description="No upcoming sessions scheduled" />
            )}
          </Card>
        </Col>
      </Row>

      {/* User Profile and School Info */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <IcBaselineAccountCircle className="text-blue-600 text-xl" />
                <span className="font-semibold">My Profile</span>
              </div>
            }
            className="shadow-sm h-full"
          >
            {user ? (
              <Descriptions column={1} size="middle">
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-2">
                      <MaterialSymbolsPersonRounded className="text-gray-500" />
                      Name
                    </span>
                  }
                >
                  <span className="font-medium">{user.name}</span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-2">
                      <MaterialSymbolsCall className="text-gray-500" />
                      Contact
                    </span>
                  }
                >
                  {user.contact1}
                  {user.contact2 && (
                    <span className="text-gray-500 ml-2">
                      / {user.contact2}
                    </span>
                  )}
                </Descriptions.Item>
                {user.email && (
                  <Descriptions.Item
                    label={
                      <span className="flex items-center gap-2">📧 Email</span>
                    }
                  >
                    {user.email}
                  </Descriptions.Item>
                )}
                {user.address && (
                  <Descriptions.Item
                    label={
                      <span className="flex items-center gap-2">
                        <MaterialSymbolsLocationOn className="text-gray-500" />
                        Address
                      </span>
                    }
                  >
                    {user.address}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Status">
                  <Tag color={user.status == "ACTIVE" ? "green" : "red"}>
                    {user.status}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="Profile information not available" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <span className="text-purple-600 text-xl">🏫</span>
                <span className="font-semibold">School Information</span>
              </div>
            }
            className="shadow-sm h-full"
            loading={schoolLoading}
          >
            {school ? (
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="School Name">
                  <span className="font-medium">{school.name}</span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-2">
                      <MaterialSymbolsCall className="text-gray-500" />
                      Phone
                    </span>
                  }
                >
                  {school.phone}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-2">📧 Email</span>
                  }
                >
                  {school.email}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-2">
                      <MaterialSymbolsLocationOn className="text-gray-500" />
                      Address
                    </span>
                  }
                >
                  {school.address}
                </Descriptions.Item>
                {school.website && (
                  <Descriptions.Item label="Website">
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {school.website}
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Empty description="School information not available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Sessions Timeline */}
      {recentSessions.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <Fa6RegularClock className="text-green-600 text-xl" />
              <span className="font-semibold">Recent Sessions</span>
            </div>
          }
          className="shadow-sm"
        >
          <Timeline
            items={recentSessions.map((session) => ({
              color: "green",
              children: (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      Day {session.dayNumber}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{session.date}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{session.slot}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Instructor:</span>{" "}
                    {session.driver}
                    {session.notes && (
                      <p className="mt-1 text-gray-500 italic">
                        Note: {session.notes}
                      </p>
                    )}
                  </div>
                </div>
              ),
            }))}
          />
        </Card>
      )}
      <div></div>
      {/* All Sessions Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="font-semibold">All Sessions</span>
          </div>
        }
        className="shadow-sm"
      >
        {allSessions.length > 0 ? (
          <Table
            columns={columns}
            dataSource={allSessions}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} sessions`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        ) : (
          <Empty description="No sessions found" />
        )}
      </Card>
    </div>
  );
};

export default CustomerPage;
