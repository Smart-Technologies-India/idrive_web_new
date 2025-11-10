"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Tag,
  Space,
  Descriptions,
  Table,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEditOutlined,
  IcBaselineCalendarMonth,
  MaterialSymbolsCheckCircle,
  AntDesignCloseCircleOutlined,
  Fa6SolidArrowLeftLong,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

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

const CarDetailPage = ({ params }: { params: { carId: string } }) => {
  const router = useRouter();
  // In real app, use params.carId to fetch specific car data
  console.log("Car ID:", params.carId);
  const [isEditDriverModalOpen, setIsEditDriverModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [maintenanceForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  // Mock car data (in real app, fetch based on carId)
  const [carData] = useState({
    carId: "CAR-001",
    carName: "Swift Dzire",
    model: "VXI",
    registrationNumber: "DL01AB1234",
    year: 2023,
    color: "White",
    fuelType: "Petrol",
    status: "available",
    engineNumber: "K15B-987654",
    chassisNumber: "MA3ERLF1S00123456",
    seatingCapacity: 5,
    transmission: "Manual",
    insuranceNumber: "INC-2023-12345",
    insuranceExpiry: "2025-06-15",
    pucExpiry: "2024-12-30",
    fitnessExpiry: "2028-05-20",
    purchaseDate: "2023-01-15",
    purchaseCost: 850000,
    currentMileage: 12500,
    driverName: "Ramesh Kumar",
    driverId: "DRV-001",
    driverPhone: "+91 98765 43210",
    totalBookings: 245,
    lastService: "2024-10-15",
    nextService: "2024-12-15",
  });

  const [bookingHistory] = useState<BookingRecord[]>([
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
  ]);

  const [maintenanceHistory] = useState<MaintenanceRecord[]>([
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
  ]);

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
          upcoming: <IcBaselineCalendarMonth className="text-blue-600 text-base" />,
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

  const handleEditDriver = (values: Record<string, unknown>) => {
    console.log("Edit driver:", values);
    message.success("Driver assignment updated successfully");
    setIsEditDriverModalOpen(false);
    form.resetFields();
  };

  const handleAddMaintenance = (values: Record<string, unknown>) => {
    console.log("Add maintenance:", values);
    message.success("Maintenance record added successfully");
    setIsMaintenanceModalOpen(false);
    maintenanceForm.resetFields();
  };

  const handleUpdateStatus = (values: Record<string, unknown>) => {
    console.log("Update status:", values);
    message.success("Car status updated successfully");
    setIsStatusModalOpen(false);
    statusForm.resetFields();
  };

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
                type="default"
                icon={<AntDesignEditOutlined className="text-lg" />}
                size="large"
                onClick={() => setIsStatusModalOpen(true)}
              >
                Update Status
              </Button>
              <Button
                type="primary"
                icon={<AntDesignEditOutlined className="text-lg" />}
                size="large"
                onClick={() => setIsEditDriverModalOpen(true)}
                className="!bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Edit Driver
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Basic Details */}
        <Card title="Car Details" bordered={false} className="shadow-sm">
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
              {new Date(carData.purchaseDate).toLocaleDateString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="Purchase Cost">
              ₹{carData.purchaseCost.toLocaleString("en-IN")}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Driver Details */}
        <Card title="Assigned Driver" bordered={false} className="shadow-sm">
          {carData.driverName ? (
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Driver Name">
                <span className="font-semibold">{carData.driverName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Driver ID">
                {carData.driverId}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {carData.driverPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Total Bookings" span={3}>
                <span className="text-lg font-semibold text-blue-600">
                  {carData.totalBookings}
                </span>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg mb-4">No driver assigned</p>
              <Button
                type="primary"
                onClick={() => setIsEditDriverModalOpen(true)}
              >
                Assign Driver
              </Button>
            </div>
          )}
        </Card>

        {/* Documents & Compliance */}
        <Card
          title="Documents & Compliance"
          bordered={false}
          className="shadow-sm"
        >
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Insurance Number">
              {carData.insuranceNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Insurance Expiry">
              <span
                className={
                  new Date(carData.insuranceExpiry) < new Date()
                    ? "text-red-600 font-semibold"
                    : ""
                }
              >
                {new Date(carData.insuranceExpiry).toLocaleDateString("en-IN")}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="PUC Expiry">
              <span
                className={
                  new Date(carData.pucExpiry) < new Date()
                    ? "text-red-600 font-semibold"
                    : ""
                }
              >
                {new Date(carData.pucExpiry).toLocaleDateString("en-IN")}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Fitness Expiry">
              {new Date(carData.fitnessExpiry).toLocaleDateString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="Last Service">
              {new Date(carData.lastService).toLocaleDateString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="Next Service">
              <span className="font-semibold text-orange-600">
                {new Date(carData.nextService).toLocaleDateString("en-IN")}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Maintenance History */}
        <Card
          title="Maintenance History"
          bordered={false}
          className="shadow-sm"
          extra={
            <Button
              type="primary"
              onClick={() => setIsMaintenanceModalOpen(true)}
            >
              Add Maintenance Record
            </Button>
          }
        >
          <Table
            columns={maintenanceColumns}
            dataSource={maintenanceHistory}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 900 }}
          />
        </Card>

        {/* Booking History */}
        <Card
          title="Booking History"
          bordered={false}
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

      {/* Edit Driver Modal */}
      <Modal
        title="Edit Driver Assignment"
        open={isEditDriverModalOpen}
        onCancel={() => {
          setIsEditDriverModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditDriver}
          initialValues={{
            driverId: carData.driverId,
          }}
        >
          <Form.Item
            name="driverId"
            label="Select Driver"
            rules={[{ required: true, message: "Please select a driver" }]}
          >
            <Select
              placeholder="Select driver"
              size="large"
              showSearch
              options={[
                { label: "Ramesh Kumar (DRV-001)", value: "DRV-001" },
                { label: "Suresh Sharma (DRV-002)", value: "DRV-002" },
                { label: "Vikram Singh (DRV-003)", value: "DRV-003" },
                { label: "Ajay Verma (DRV-004)", value: "DRV-004" },
                { label: "Unassign Driver", value: null },
              ]}
            />
          </Form.Item>
          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea rows={3} placeholder="Any additional notes..." />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsEditDriverModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Driver
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Maintenance Modal */}
      <Modal
        title="Add Maintenance Record"
        open={isMaintenanceModalOpen}
        onCancel={() => {
          setIsMaintenanceModalOpen(false);
          maintenanceForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={maintenanceForm}
          layout="vertical"
          onFinish={handleAddMaintenance}
        >
          <Form.Item
            name="type"
            label="Service Type"
            rules={[
              { required: true, message: "Please select service type" },
            ]}
          >
            <Select
              placeholder="Select service type"
              size="large"
              options={[
                { label: "Regular Service", value: "Regular Service" },
                { label: "Tire Replacement", value: "Tire Replacement" },
                { label: "AC Service", value: "AC Service" },
                { label: "Battery Replacement", value: "Battery Replacement" },
                { label: "Brake Service", value: "Brake Service" },
                { label: "Other", value: "Other" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="date"
            label="Service Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker size="large" className="w-full" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={3} placeholder="Service details..." />
          </Form.Item>
          <Form.Item
            name="cost"
            label="Cost (₹)"
            rules={[{ required: true, message: "Please enter cost" }]}
          >
            <Input type="number" size="large" placeholder="Enter cost" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              placeholder="Select status"
              size="large"
              options={[
                { label: "Completed", value: "completed" },
                { label: "Pending", value: "pending" },
                { label: "Scheduled", value: "scheduled" },
              ]}
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsMaintenanceModalOpen(false);
                  maintenanceForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Record
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Car Status"
        open={isStatusModalOpen}
        onCancel={() => {
          setIsStatusModalOpen(false);
          statusForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleUpdateStatus}
          initialValues={{
            status: carData.status,
          }}
        >
          <Form.Item
            name="status"
            label="Select Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              placeholder="Select status"
              size="large"
              options={[
                { label: "Available", value: "available" },
                { label: "In Use", value: "in-use" },
                { label: "Maintenance", value: "maintenance" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </Form.Item>
          <Form.Item name="reason" label="Reason (Optional)">
            <TextArea rows={3} placeholder="Reason for status change..." />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsStatusModalOpen(false);
                  statusForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Status
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CarDetailPage;
