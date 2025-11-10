"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Space,
  InputNumber,
  message,
  Row,
  Col,
} from "antd";
import {
  Fa6SolidArrowLeftLong,
  AntDesignPlusCircleOutlined,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

const AddCoursePage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: Record<string, unknown>) => {
    setLoading(true);
    console.log("Form values:", values);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success("Course added successfully!");
      router.push("/mtadmin/course");
    }, 1500);
  };

  const handleReset = () => {
    form.resetFields();
    message.info("Form reset");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<Fa6SolidArrowLeftLong className="text-lg" />}
              size="large"
              onClick={() => router.push("/mtadmin/course")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Course
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Create a new driving course with all details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl">
        <Card bordered={false} className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            initialValues={{
              status: "upcoming",
              courseType: "beginner",
            }}
          >
            {/* Basic Course Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Basic Information
              </h3>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="courseName"
                    label="Course Name"
                    rules={[
                      { required: true, message: "Please enter course name" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., Basic Driving Course"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="courseType"
                    label="Course Type"
                    rules={[
                      { required: true, message: "Please select course type" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select course type"
                      options={[
                        { label: "Beginner", value: "beginner" },
                        { label: "Intermediate", value: "intermediate" },
                        { label: "Advanced", value: "advanced" },
                        { label: "Refresher", value: "refresher" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="duration"
                    label="Duration"
                    rules={[
                      { required: true, message: "Please enter duration" },
                    ]}
                  >
                    <Input size="large" placeholder="e.g., 30 days" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="totalHours"
                    label="Total Hours"
                    rules={[
                      {
                        required: true,
                        message: "Please enter total hours",
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 20"
                      min={1}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="totalSessions"
                    label="Total Sessions"
                    rules={[
                      {
                        required: true,
                        message: "Please enter total sessions",
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 10"
                      min={1}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="price"
                    label="Course Price (₹)"
                    rules={[{ required: true, message: "Please enter price" }]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 8500"
                      min={0}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="maxCapacity"
                    label="Maximum Capacity"
                    rules={[
                      {
                        required: true,
                        message: "Please enter max capacity",
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 50"
                      min={1}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="startDate"
                    label="Start Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select start date",
                      },
                    ]}
                  >
                    <DatePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="endDate"
                    label="End Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select end date",
                      },
                    ]}
                  >
                    <DatePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[
                      { required: true, message: "Please select status" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select status"
                      options={[
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                        { label: "Upcoming", value: "upcoming" },
                        { label: "Archived", value: "archived" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Instructor Assignment */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Instructor Assignment
              </h3>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="instructorId"
                    label="Primary Instructor"
                    rules={[
                      {
                        required: true,
                        message: "Please select instructor",
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select instructor"
                      showSearch
                      options={[
                        { label: "Ramesh Kumar (DRV-001)", value: "DRV-001" },
                        { label: "Suresh Sharma (DRV-002)", value: "DRV-002" },
                        { label: "Vikram Singh (DRV-003)", value: "DRV-003" },
                        { label: "Ajay Verma (DRV-004)", value: "DRV-004" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Course Content */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Course Content
              </h3>
              <Form.Item
                name="description"
                label="Course Description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Provide a detailed description of the course..."
                />
              </Form.Item>

              <Form.Item name="syllabus" label="Course Syllabus">
                <TextArea
                  rows={6}
                  placeholder="Enter syllabus topics (one per line)&#10;e.g.,&#10;Introduction to vehicle controls&#10;Basic steering and gear handling&#10;Traffic rules and road signs"
                />
              </Form.Item>

              <Form.Item name="requirements" label="Requirements">
                <TextArea
                  rows={3}
                  placeholder="Prerequisites or requirements for enrollment (e.g., Valid learner's license required)"
                />
              </Form.Item>
            </div>

            {/* Session Planning */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Session Planning (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You can add individual sessions after creating the course
              </p>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="sessionDuration" label="Session Duration">
                    <Input size="large" placeholder="e.g., 2 hours" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="sessionFrequency" label="Session Frequency">
                    <Select
                      size="large"
                      placeholder="Select frequency"
                      options={[
                        { label: "Daily", value: "daily" },
                        { label: "Alternate Days", value: "alternate" },
                        { label: "Weekly", value: "weekly" },
                        { label: "Custom", value: "custom" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Additional Information
              </h3>
              <Form.Item name="notes" label="Notes (Optional)">
                <TextArea
                  rows={3}
                  placeholder="Any additional notes or information about the course..."
                />
              </Form.Item>
            </div>

            {/* Form Actions */}
            <Form.Item className="mb-0">
              <Space size="middle" className="w-full justify-end">
                <Button size="large" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  size="large"
                  onClick={() => router.push("/mtadmin/course")}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<AntDesignPlusCircleOutlined className="text-lg" />}
                  className="!bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Add Course
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddCoursePage;
