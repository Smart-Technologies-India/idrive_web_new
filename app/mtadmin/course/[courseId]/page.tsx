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
  InputNumber,
  DatePicker,
  message,
  Progress,
  Statistic,
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AntDesignEditOutlined,
  Fa6SolidArrowLeftLong,
  MaterialSymbolsPersonRounded,
  MaterialSymbolsCheckCircle,
  AntDesignCloseCircleOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

interface EnrolledStudent {
  key: string;
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  status: "active" | "completed" | "dropped";
  amountPaid: number;
}

interface SessionRecord {
  key: string;
  sessionId: string;
  sessionNumber: number;
  date: string;
  time: string;
  topic: string;
  instructor: string;
  studentsAttended: number;
  status: "completed" | "scheduled" | "cancelled";
}

const CourseDetailPage = ({ params }: { params: { courseId: string } }) => {
  const router = useRouter();
  // In real app, use params.courseId to fetch specific course data
  console.log("Course ID:", params.courseId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [sessionForm] = Form.useForm();

  // Mock course data
  const [courseData] = useState({
    courseId: "CRS-001",
    courseName: "Basic Driving Course",
    courseType: "beginner",
    duration: "30 days",
    totalHours: 20,
    totalSessions: 10,
    price: 8500,
    status: "active",
    enrolledStudents: 45,
    maxCapacity: 50,
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    instructor: "Ramesh Kumar",
    instructorId: "DRV-001",
    description:
      "Complete beginner driving course covering all basics including traffic rules, vehicle handling, and road safety.",
    sessionsCompleted: 6,
    totalRevenue: 382500,
    syllabus: [
      "Introduction to vehicle controls",
      "Basic steering and gear handling",
      "Traffic rules and road signs",
      "Parking techniques",
      "Highway driving basics",
    ],
    requirements: "Valid learner's license required",
  });

  const [enrolledStudents] = useState<EnrolledStudent[]>([
    {
      key: "1",
      studentId: "STD-1001",
      studentName: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 98765 43210",
      enrollmentDate: "2024-10-28",
      sessionsCompleted: 6,
      sessionsTotal: 10,
      status: "active",
      amountPaid: 8500,
    },
    {
      key: "2",
      studentId: "STD-1005",
      studentName: "Rahul Verma",
      email: "rahul.verma@email.com",
      phone: "+91 98765 43211",
      enrollmentDate: "2024-10-29",
      sessionsCompleted: 6,
      sessionsTotal: 10,
      status: "active",
      amountPaid: 8500,
    },
    {
      key: "3",
      studentId: "STD-1012",
      studentName: "Anjali Gupta",
      email: "anjali.gupta@email.com",
      phone: "+91 98765 43212",
      enrollmentDate: "2024-10-30",
      sessionsCompleted: 5,
      sessionsTotal: 10,
      status: "active",
      amountPaid: 8500,
    },
    {
      key: "4",
      studentId: "STD-1018",
      studentName: "Karan Singh",
      email: "karan.singh@email.com",
      phone: "+91 98765 43213",
      enrollmentDate: "2024-10-25",
      sessionsCompleted: 10,
      sessionsTotal: 10,
      status: "completed",
      amountPaid: 8500,
    },
    {
      key: "5",
      studentId: "STD-1023",
      studentName: "Sneha Patel",
      email: "sneha.patel@email.com",
      phone: "+91 98765 43214",
      enrollmentDate: "2024-10-31",
      sessionsCompleted: 3,
      sessionsTotal: 10,
      status: "dropped",
      amountPaid: 8500,
    },
  ]);

  const [sessionHistory] = useState<SessionRecord[]>([
    {
      key: "1",
      sessionId: "SES-001",
      sessionNumber: 1,
      date: "2024-11-01",
      time: "09:00 AM - 11:00 AM",
      topic: "Introduction to vehicle controls",
      instructor: "Ramesh Kumar",
      studentsAttended: 42,
      status: "completed",
    },
    {
      key: "2",
      sessionId: "SES-002",
      sessionNumber: 2,
      date: "2024-11-04",
      time: "09:00 AM - 11:00 AM",
      topic: "Basic steering and gear handling",
      instructor: "Ramesh Kumar",
      studentsAttended: 45,
      status: "completed",
    },
    {
      key: "3",
      sessionId: "SES-003",
      sessionNumber: 3,
      date: "2024-11-06",
      time: "09:00 AM - 11:00 AM",
      topic: "Traffic rules and road signs",
      instructor: "Ramesh Kumar",
      studentsAttended: 43,
      status: "completed",
    },
    {
      key: "4",
      sessionId: "SES-004",
      sessionNumber: 4,
      date: "2024-11-08",
      time: "09:00 AM - 11:00 AM",
      topic: "Parking techniques - Part 1",
      instructor: "Ramesh Kumar",
      studentsAttended: 44,
      status: "completed",
    },
    {
      key: "5",
      sessionId: "SES-005",
      sessionNumber: 5,
      date: "2024-11-11",
      time: "09:00 AM - 11:00 AM",
      topic: "Parking techniques - Part 2",
      instructor: "Ramesh Kumar",
      studentsAttended: 0,
      status: "scheduled",
    },
  ]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      inactive: "red",
      upcoming: "blue",
      archived: "default",
      completed: "purple",
      dropped: "orange",
      scheduled: "blue",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: "Active",
      inactive: "Inactive",
      upcoming: "Upcoming",
      archived: "Archived",
      completed: "Completed",
      dropped: "Dropped",
      scheduled: "Scheduled",
      cancelled: "Cancelled",
    };
    return texts[status] || status;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      beginner: "cyan",
      intermediate: "orange",
      advanced: "purple",
      refresher: "magenta",
    };
    return colors[type] || "default";
  };

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      refresher: "Refresher",
    };
    return texts[type] || type;
  };

  const studentColumns: ColumnsType<EnrolledStudent> = [
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
      width: 120,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: 180,
      render: (name, record) => (
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 140,
    },
    {
      title: "Enrollment Date",
      dataIndex: "enrollmentDate",
      key: "enrollmentDate",
      width: 130,
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
      sorter: (a, b) => a.enrollmentDate.localeCompare(b.enrollmentDate),
    },
    {
      title: "Progress",
      key: "progress",
      width: 180,
      render: (_, record) => {
        const percentage =
          (record.sessionsCompleted / record.sessionsTotal) * 100;
        return (
          <div>
            <div className="text-xs text-gray-600 mb-1">
              {record.sessionsCompleted}/{record.sessionsTotal} sessions
            </div>
            <Progress percent={Math.round(percentage)} size="small" />
          </div>
        );
      },
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      width: 120,
      render: (amount) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const icons: Record<string, React.ReactElement> = {
          active: (
            <MaterialSymbolsCheckCircle className="text-green-600 text-base" />
          ),
          completed: (
            <MaterialSymbolsCheckCircle className="text-purple-600 text-base" />
          ),
          dropped: (
            <AntDesignCloseCircleOutlined className="text-orange-600 text-base" />
          ),
        };
        return (
          <Tag
            color={getStatusColor(status)}
            icon={icons[status]}
            className="!flex !items-center !gap-1 !text-sm !px-3 !py-1 !w-fit"
          >
            {getStatusText(status)}
          </Tag>
        );
      },
    },
  ];

  const sessionColumns: ColumnsType<SessionRecord> = [
    {
      title: "Session #",
      dataIndex: "sessionNumber",
      key: "sessionNumber",
      width: 100,
      render: (num) => <span className="font-semibold">#{num}</span>,
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
      width: 160,
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      width: 250,
    },
    {
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
      width: 150,
    },
    {
      title: "Attendance",
      dataIndex: "studentsAttended",
      key: "studentsAttended",
      width: 120,
      align: "center",
      render: (count, record) =>
        record.status === "completed" ? (
          <span className="font-medium">{count} students</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag
          color={getStatusColor(status)}
          className="!text-sm !px-3 !py-1 !font-medium"
        >
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  const handleEditCourse = (values: Record<string, unknown>) => {
    console.log("Edit course:", values);
    message.success("Course details updated successfully");
    setIsEditModalOpen(false);
    form.resetFields();
  };

  const handleUpdateStatus = (values: Record<string, unknown>) => {
    console.log("Update status:", values);
    message.success("Course status updated successfully");
    setIsStatusModalOpen(false);
    statusForm.resetFields();
  };

  const handleAddSession = (values: Record<string, unknown>) => {
    console.log("Add session:", values);
    message.success("Session added successfully");
    setIsSessionModalOpen(false);
    sessionForm.resetFields();
  };

  const enrollmentPercentage =
    (courseData.enrolledStudents / courseData.maxCapacity) * 100;
  const progressPercentage =
    (courseData.sessionsCompleted / courseData.totalSessions) * 100;

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
                onClick={() => router.push("/mtadmin/course")}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseData.courseName}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  {courseData.courseId} •{" "}
                  <Tag
                    color={getTypeColor(courseData.courseType)}
                    className="!text-xs !px-2 !py-0"
                  >
                    {getTypeText(courseData.courseType)}
                  </Tag>
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
                onClick={() => setIsEditModalOpen(true)}
                className="!bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Edit Course
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Total Revenue"
                value={courseData.totalRevenue}
                prefix="₹"
                valueStyle={{ color: "#3f8600", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Enrolled Students"
                value={courseData.enrolledStudents}
                suffix={`/ ${courseData.maxCapacity}`}
                valueStyle={{ fontSize: "24px" }}
              />
              <Progress
                percent={Math.round(enrollmentPercentage)}
                size="small"
                className="mt-2"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Course Progress"
                value={courseData.sessionsCompleted}
                suffix={`/ ${courseData.totalSessions}`}
                valueStyle={{ fontSize: "24px" }}
              />
              <Progress
                percent={Math.round(progressPercentage)}
                size="small"
                className="mt-2"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title="Course Price"
                value={courseData.price}
                prefix="₹"
                valueStyle={{ fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Details */}
        <Card title="Course Details" bordered={false} className="shadow-sm">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Course Name">
              {courseData.courseName}
            </Descriptions.Item>
            <Descriptions.Item label="Course Type">
              <Tag
                color={getTypeColor(courseData.courseType)}
                className="!text-sm !px-3 !py-1"
              >
                {getTypeText(courseData.courseType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={getStatusColor(courseData.status)}
                className="!text-sm !px-3 !py-1 !font-medium"
              >
                {getStatusText(courseData.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {courseData.duration}
            </Descriptions.Item>
            <Descriptions.Item label="Total Hours">
              {courseData.totalHours} hours
            </Descriptions.Item>
            <Descriptions.Item label="Total Sessions">
              {courseData.totalSessions} sessions
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {new Date(courseData.startDate).toLocaleDateString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {new Date(courseData.endDate).toLocaleDateString("en-IN")}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              <span className="font-semibold text-green-600">
                ₹{courseData.price.toLocaleString("en-IN")}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Instructor" span={2}>
              <div className="flex items-center gap-2">
                <MaterialSymbolsPersonRounded className="text-lg text-blue-600" />
                <span className="font-semibold">{courseData.instructor}</span>
                <span className="text-gray-500 text-sm">
                  ({courseData.instructorId})
                </span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Max Capacity">
              {courseData.maxCapacity} students
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {courseData.description}
            </Descriptions.Item>
            <Descriptions.Item label="Requirements" span={3}>
              {courseData.requirements}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Syllabus */}
        <Card title="Course Syllabus" bordered={false} className="shadow-sm">
          <ul className="space-y-2">
            {courseData.syllabus.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Session History */}
        <Card
          title="Session History"
          bordered={false}
          className="shadow-sm"
          extra={
            <Button
              type="primary"
              onClick={() => setIsSessionModalOpen(true)}
            >
              Add Session
            </Button>
          }
        >
          <Table
            columns={sessionColumns}
            dataSource={sessionHistory}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Enrolled Students */}
        <Card
          title="Enrolled Students"
          bordered={false}
          className="shadow-sm"
          extra={
            <span className="text-sm text-gray-600">
              Total: {enrolledStudents.length}
            </span>
          }
        >
          <Table
            columns={studentColumns}
            dataSource={enrolledStudents}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>

      {/* Edit Course Modal */}
      <Modal
        title="Edit Course Details"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditCourse}
          initialValues={{
            courseName: courseData.courseName,
            price: courseData.price,
            maxCapacity: courseData.maxCapacity,
            instructorId: courseData.instructorId,
          }}
        >
          <Form.Item
            name="courseName"
            label="Course Name"
            rules={[{ required: true, message: "Please enter course name" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price (₹)"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber size="large" className="w-full" min={0} />
          </Form.Item>
          <Form.Item
            name="maxCapacity"
            label="Max Capacity"
            rules={[{ required: true, message: "Please enter max capacity" }]}
          >
            <InputNumber size="large" className="w-full" min={1} />
          </Form.Item>
          <Form.Item
            name="instructorId"
            label="Instructor"
            rules={[{ required: true, message: "Please select instructor" }]}
          >
            <Select
              size="large"
              options={[
                { label: "Ramesh Kumar (DRV-001)", value: "DRV-001" },
                { label: "Suresh Sharma (DRV-002)", value: "DRV-002" },
                { label: "Vikram Singh (DRV-003)", value: "DRV-003" },
                { label: "Ajay Verma (DRV-004)", value: "DRV-004" },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Course
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Course Status"
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
            status: courseData.status,
          }}
        >
          <Form.Item
            name="status"
            label="Select Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              size="large"
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Upcoming", value: "upcoming" },
                { label: "Archived", value: "archived" },
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

      {/* Add Session Modal */}
      <Modal
        title="Add New Session"
        open={isSessionModalOpen}
        onCancel={() => {
          setIsSessionModalOpen(false);
          sessionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={sessionForm}
          layout="vertical"
          onFinish={handleAddSession}
        >
          <Form.Item
            name="sessionNumber"
            label="Session Number"
            rules={[
              { required: true, message: "Please enter session number" },
            ]}
          >
            <InputNumber
              size="large"
              className="w-full"
              min={1}
              placeholder="e.g., 11"
            />
          </Form.Item>
          <Form.Item
            name="date"
            label="Session Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker size="large" className="w-full" />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: "Please enter time" }]}
          >
            <Input size="large" placeholder="e.g., 09:00 AM - 11:00 AM" />
          </Form.Item>
          <Form.Item
            name="topic"
            label="Topic"
            rules={[{ required: true, message: "Please enter topic" }]}
          >
            <Input size="large" placeholder="Session topic" />
          </Form.Item>
          <Form.Item
            name="instructor"
            label="Instructor"
            rules={[{ required: true, message: "Please select instructor" }]}
          >
            <Select
              size="large"
              options={[
                { label: "Ramesh Kumar", value: "Ramesh Kumar" },
                { label: "Suresh Sharma", value: "Suresh Sharma" },
                { label: "Vikram Singh", value: "Vikram Singh" },
                { label: "Ajay Verma", value: "Ajay Verma" },
              ]}
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsSessionModalOpen(false);
                  sessionForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Session
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
