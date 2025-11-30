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

interface BookingRecord {
  key: string;
  bookingId: string;
  studentName: string;
  date: string;
  time: string;
  status: "completed" | "cancelled" | "upcoming";
  duration: string;
}

interface MaintenanceRecord {
  key: string;
  serviceId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  status: "completed" | "pending" | "scheduled";
}

const CarDetailPage = ({ params }: { params: Promise<{ carId: string }> }) => {
  const router = useRouter();
  const { carId } = use(params);
  const numericCarId = parseInt(carId);

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

  // Mock data for bookings and maintenance (to be replaced with API calls later)
  const bookingHistory: BookingRecord[] = [
    {
      key: "1",
      bookingId: "BKG-1245",
      studentName: "Priya Sharma",
      date: "2024-11-15",
      time: "09:00 AM - 11:00 AM",
      status: "completed",
      duration: "2 hours",
    },
    {
      key: "2",
      bookingId: "BKG-1298",
      studentName: "Rahul Verma",
      date: "2024-11-16",
      time: "02:00 PM - 04:00 PM",
      status: "completed",
      duration: "2 hours",
    },
    {
      key: "3",
      bookingId: "BKG-1304",
      studentName: "Anjali Gupta",
      date: "2024-11-17",
      time: "10:00 AM - 12:00 PM",
      status: "upcoming",
      duration: "2 hours",
    },
    {
      key: "4",
      bookingId: "BKG-1289",
      studentName: "Karan Singh",
      date: "2024-11-14",
      time: "03:00 PM - 05:00 PM",
      status: "cancelled",
      duration: "2 hours",
    },
    {
      key: "5",
      bookingId: "BKG-1312",
      studentName: "Sneha Patel",
      date: "2024-11-18",
      time: "11:00 AM - 01:00 PM",
      status: "upcoming",
      duration: "2 hours",
    },
  ];

  const maintenanceHistory: MaintenanceRecord[] = [
    {
      key: "1",
      serviceId: "SRV-1001",
      date: "2024-10-15",
      type: "Regular Service",
      description: "Oil change, filter replacement, general checkup",
      cost: 3500,
      status: "completed",
    },
    {
      key: "2",
      serviceId: "SRV-0987",
      date: "2024-08-20",
      type: "Tire Replacement",
      description: "Replaced front tires",
      cost: 8000,
      status: "completed",
    },
    {
      key: "3",
      serviceId: "SRV-1045",
      date: "2024-12-15",
      type: "Regular Service",
      description: "Scheduled service",
      cost: 0,
      status: "scheduled",
    },
    {
      key: "4",
      serviceId: "SRV-0956",
      date: "2024-06-10",
      type: "AC Service",
      description: "AC gas refill and cleaning",
      cost: 2500,
      status: "completed",
    },
    {
      key: "5",
      serviceId: "SRV-0912",
      date: "2024-04-05",
      type: "Regular Service",
      description: "Oil change, filter replacement",
      cost: 3200,
      status: "completed",
    },
  ];

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
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
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

  const maintenanceColumns: ColumnsType<MaintenanceRecord> = [
    {
      title: "Service ID",
      dataIndex: "serviceId",
      key: "serviceId",
      width: 120,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 150,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 250,
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      width: 120,
      render: (cost: number) =>
        cost > 0 ? `₹${cost.toLocaleString("en-IN")}` : "-",
      sorter: (a, b) => a.cost - b.cost,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: "green",
          pending: "orange",
          scheduled: "blue",
        };
        return (
          <Tag
            color={colors[status]}
            className="!text-sm !px-3 !py-1 !font-medium"
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
                  {carData.carName} - {carData.model}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {carData.registrationNumber} • {carData.carId}
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
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Car Name">
              {carData.carName}
            </Descriptions.Item>
            <Descriptions.Item label="Model">{carData.model}</Descriptions.Item>
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
              {carData.purchaseDate
                ? new Date(carData.purchaseDate).toLocaleDateString("en-IN")
                : "N/A"}
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
                    carData.assignedDriver.status === "ACTIVE" ? "green" : "red"
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
                {carData.insuranceExpiry
                  ? new Date(carData.insuranceExpiry).toLocaleDateString(
                      "en-IN"
                    )
                  : "N/A"}
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
                {carData.pucExpiry
                  ? new Date(carData.pucExpiry).toLocaleDateString("en-IN")
                  : "N/A"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Fitness Expiry">
              {carData.fitnessExpiry
                ? new Date(carData.fitnessExpiry).toLocaleDateString("en-IN")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Last Service">
              {carData.lastServiceDate
                ? new Date(carData.lastServiceDate).toLocaleDateString("en-IN")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Next Service">
              <span className="font-semibold text-orange-600">
                {carData.nextServiceDate
                  ? new Date(carData.nextServiceDate).toLocaleDateString(
                      "en-IN"
                    )
                  : "N/A"}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <div></div>
        {/* Connected Courses Section */}
        <ConnectedCoursesSection carId={numericCarId} />
        <div></div>

        {/* Maintenance History */}
        <Card title="Maintenance History" className="shadow-sm">
          <Table
            columns={maintenanceColumns}
            dataSource={maintenanceHistory}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 900 }}
          />
        </Card>
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
            pagination={{ pageSize: 5 }}
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
      ) : activeCourses.length === 0 ? (
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
