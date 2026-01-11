"use client";

import { use, useMemo } from "react";
import {
  Card,
  Button,
  Tag,
  Space,
  Descriptions,
  Table,
  Spin,
  Alert,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEditOutlined,
  Fa6SolidArrowLeftLong,
  MaterialSymbolsCheckCircle,
  AntDesignCloseCircleOutlined,
  IcBaselineCalendarMonth,
  AntDesignBookOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCarById } from "@/services/car.api";
import { getAllCarCourses, type CarCourse } from "@/services/carcourse.api";
import { getPaginatedBookings, type Booking } from "@/services/booking.api";
import { getCookie } from "cookies-next";
import { formatDate } from "@/utils/date-format";

interface BookingRecord {
  key: string;
  bookingId: string;
  studentName: string;
  date: string;
  time: string;
  status: "completed" | "cancelled" | "upcoming";
  duration: string;
}

const CarDetailPage = ({ params }: { params: Promise<{ carId: string }> }) => {
  const router = useRouter();
  const { carId } = use(params);
  const numericCarId = parseInt(carId);
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Fetch car data
  const {
    data: carResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["car", numericCarId],
    queryFn: async () => {
      if (!numericCarId || isNaN(numericCarId)) {
        throw new Error("Invalid car ID");
      }
      return await getCarById(numericCarId);
    },
    enabled: !isNaN(numericCarId),
  });

  const carData = carResponse?.data?.getCarById;

  // Fetch bookings for this car
  const { data: bookingsResponse, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings", numericCarId, schoolId],
    queryFn: () => getPaginatedBookings({
      searchPaginationInput: {
        skip: 0,
        take: 100, // Get all bookings for this car
      },
      whereSearchInput: {
        schoolId: schoolId,
        carId: numericCarId,
      },
    }),
    enabled: !isNaN(numericCarId) && schoolId > 0,
  });

  const bookingHistory: BookingRecord[] = useMemo(() => {
    const bookings = bookingsResponse?.data?.getPaginatedBooking?.data || [];
    return bookings.map((booking: Booking) => {
      // Map status from backend to frontend format
      const statusMap: Record<string, "completed" | "cancelled" | "upcoming"> = {
        "COMPLETED": "completed",
        "CANCELLED": "cancelled",
        "NO_SHOW": "cancelled",
        "PENDING": "upcoming",
        "CONFIRMED": "upcoming",
      };

      return {
        key: booking.id.toString(),
        bookingId: booking.bookingId,
        studentName: booking.customerName || booking.customer?.name || "N/A",
        date: booking.bookingDate,
        time: booking.slot || "N/A",
        status: statusMap[booking.status] || "upcoming",
        duration: "-", // Duration not directly available in booking
      };
    });
  }, [bookingsResponse]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "green",
      "in-use": "blue",
      maintenance: "orange",
      inactive: "red",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      available: "Available",
      "in-use": "In Use",
      maintenance: "Maintenance",
      inactive: "Inactive",
    };
    return texts[status] || status;
  };

  const bookingColumns: ColumnsType<BookingRecord> = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      width: 120,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 180,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => formatDate(date),
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: 180,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: "green",
          cancelled: "red",
          upcoming: "blue",
        };
        const icons: Record<string, React.ReactElement> = {
          completed: (
            <MaterialSymbolsCheckCircle className="text-green-600 text-base" />
          ),
          cancelled: (
            <AntDesignCloseCircleOutlined className="text-red-600 text-base" />
          ),
          upcoming: (
            <IcBaselineCalendarMonth className="text-blue-600 text-base" />
          ),
        };
        return (
          <Tag
            color={colors[status]}
            icon={icons[status]}
            className="!flex !items-center !gap-1 !text-sm !px-3 !py-1 !w-fit"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading car details..." />
      </div>
    );
  }

  if (isError || !carData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Alert
          message="Error Loading Car"
          description={error?.message || "Failed to load car details"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<Fa6SolidArrowLeftLong className="text-lg" />}
                size="large"
                onClick={() => router.push("/mtadmin/car")}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {carData.carAdmin
                    ? `${carData.carAdmin.name} - ${carData.carAdmin.manufacturer}`
                    : `${carData.carName} - ${carData.model}`}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {carData.registrationNumber} • {carData.carId}
                  {carData.carAdmin && ` • ${carData.carAdmin.category}`}
                </p>
              </div>
            </div>
            <Space size="middle">
              <Button
                type="primary"
                icon={<AntDesignEditOutlined className="text-lg" />}
                size="large"
                onClick={() => router.push(`/mtadmin/car/${numericCarId}/edit`)}
                className="!bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Edit Car
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Basic Details */}
        <Card title="Car Details" className="shadow-sm">
          {carData.carAdminId && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Master Data:</strong> This car is linked to
                standardized master data. Car details are managed centrally to
                ensure consistency.
              </p>
            </div>
          )}
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            {carData.carAdmin ? (
              <>
                <Descriptions.Item label="Car Name">
                  {carData.carAdmin.name}
                </Descriptions.Item>
                <Descriptions.Item label="Manufacturer">
                  {carData.carAdmin.manufacturer}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  <Tag color="blue" className="!text-sm !px-3 !py-1">
                    {carData.carAdmin.category}
                  </Tag>
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="Car Name">
                  {carData.carName}
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  {carData.model}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Registration">
              <span className="font-mono font-semibold">
                {carData.registrationNumber}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Year">{carData.year}</Descriptions.Item>
            <Descriptions.Item label="Color">{carData.color}</Descriptions.Item>
            <Descriptions.Item label="Fuel Type">
              <Tag color="purple" className="!text-sm !px-3 !py-1">
                {carData.fuelType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={getStatusColor(carData.status)}
                className="!text-sm !px-3 !py-1 !font-medium"
              >
                {getStatusText(carData.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Transmission">
              {carData.transmission}
            </Descriptions.Item>
            <Descriptions.Item label="Seating Capacity">
              {carData.seatingCapacity} Seats
            </Descriptions.Item>
            <Descriptions.Item label="Engine Number">
              <span className="font-mono text-xs">{carData.engineNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Chassis Number" span={2}>
              <span className="font-mono text-xs">{carData.chassisNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Current Mileage">
              {carData.currentMileage.toLocaleString("en-IN")} km
            </Descriptions.Item>
            <Descriptions.Item label="Purchase Date">
              {formatDate(carData.purchaseDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Purchase Cost">
              ₹{carData.purchaseCost?.toLocaleString("en-IN") || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Driver Details */}
        <Card title="Assigned Driver" className="shadow-sm">
          {carData.assignedDriver ? (
            <Descriptions bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Driver ID">
                {carData.assignedDriver.driverId}
              </Descriptions.Item>
              <Descriptions.Item label="Driver Name">
                {carData.assignedDriver.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {carData.assignedDriver.email}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile">
                {carData.assignedDriver.mobile}
              </Descriptions.Item>
              <Descriptions.Item label="License Number">
                {carData.assignedDriver.licenseNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="License Type">
                {carData.assignedDriver.licenseType || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {carData.assignedDriver.experience
                  ? `${carData.assignedDriver.experience} years`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    carData.assignedDriver.status == "ACTIVE" ? "green" : "red"
                  }
                >
                  {carData.assignedDriver.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-4">No driver assigned</p>
            </div>
          )}
        </Card>
        <div></div>

        {/* Documents & Compliance */}
        <Card title="Documents & Compliance" className="shadow-sm">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Insurance Number">
              {carData.insuranceNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Expiry">
              <span
                className={
                  carData.insuranceExpiry &&
                  new Date(carData.insuranceExpiry) < new Date()
                    ? "text-red-600 font-semibold"
                    : ""
                }
              >
                {formatDate(carData.insuranceExpiry)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="PUC Expiry">
              <span
                className={
                  carData.pucExpiry && new Date(carData.pucExpiry) < new Date()
                    ? "text-red-600 font-semibold"
                    : ""
                }
              >
                {formatDate(carData.pucExpiry)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Fitness Expiry">
              {formatDate(carData.fitnessExpiry)}
            </Descriptions.Item>
            <Descriptions.Item label="Last Service">
              {formatDate(carData.lastServiceDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Next Service">
              <span className="font-semibold text-orange-600">
                {formatDate(carData.nextServiceDate)}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <div></div>
        {/* Connected Courses Section */}
        <ConnectedCoursesSection carId={numericCarId} />
        <div></div>

        {/* Booking History */}
        <Card
          title="Booking History"
          className="shadow-sm"
          extra={
            <span className="text-sm text-gray-600">
              Total Bookings: {bookingHistory.length}
            </span>
          }
        >
          <Table
            columns={bookingColumns}
            dataSource={bookingHistory}
            loading={isLoadingBookings}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
          />
        </Card>
      </div>
    </div>
  );
};

// Connected Courses Section Component
const ConnectedCoursesSection = ({ carId }: { carId: number }) => {
  const router = useRouter();

  const { data: carCoursesResponse, isLoading } = useQuery({
    queryKey: ["carCoursesByCar", carId],
    queryFn: () => getAllCarCourses({ carId }),
    enabled: !!carId,
  });

  const carCourses = useMemo<CarCourse[]>(() => {
    const response = carCoursesResponse as {
      data?: { getAllCarCourse?: CarCourse[] };
    };
    return response?.data?.getAllCarCourse || [];
  }, [carCoursesResponse]);

  // Filter out soft-deleted courses
  const activeCourses = carCourses.filter((cc) => !cc.deletedAt);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BEGINNER: "blue",
      INTERMEDIATE: "orange",
      ADVANCED: "purple",
      REFRESHER: "cyan",
    };
    return colors[type] || "default";
  };

  const columns: ColumnsType<CarCourse> = [
    {
      title: "Course ID",
      key: "courseId",
      render: (_, record) => (
        <span className="font-mono text-sm">
          {record.course?.courseId || "N/A"}
        </span>
      ),
    },
    {
      title: "Course Name",
      key: "courseName",
      render: (_, record) => (
        <span className="font-medium text-gray-900">
          {record.course?.courseName || "N/A"}
        </span>
      ),
    },
    {
      title: "Course Type",
      key: "courseType",
      render: (_, record) => {
        const type = record.course?.courseType || "";
        return (
          <Tag color={getTypeColor(type)} className="!text-sm !px-3 !py-1">
            {type}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => router.push(`/mtadmin/course/${record.courseId}`)}
          className="!px-0"
        >
          View Details →
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <AntDesignBookOutlined className="text-xl text-blue-600" />
          <span>Connected Courses ({activeCourses.length})</span>
        </div>
      }
      className="shadow-sm"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : activeCourses.length == 0 ? (
        <Empty
          description="This car is not assigned to any courses yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => router.push("/mtadmin/course")}>
            View All Courses
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={activeCourses}
          rowKey="id"
          pagination={false}
          className="overflow-x-auto"
        />
      )}
    </Card>
  );
};

export default CarDetailPage;
