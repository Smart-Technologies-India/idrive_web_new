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

const AddCarPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: Record<string, unknown>) => {
    setLoading(true);
    console.log("Form values:", values);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success("Car added successfully!");
      router.push("/mtadmin/car");
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
              onClick={() => router.push("/mtadmin/car")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Register a new vehicle to the fleet
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
              status: "available",
              transmission: "Manual",
            }}
          >
            {/* Basic Car Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Basic Information
              </h3>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="carName"
                    label="Car Name"
                    rules={[
                      { required: true, message: "Please enter car name" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., Swift Dzire"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="model"
                    label="Model"
                    rules={[{ required: true, message: "Please enter model" }]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., VXI"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="registrationNumber"
                    label="Registration Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter registration number",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., DL01AB1234"
                      className="!uppercase"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="year"
                    label="Year"
                    rules={[
                      { required: true, message: "Please enter year" },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 2023"
                      min={2000}
                      max={new Date().getFullYear() + 1}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="color"
                    label="Color"
                    rules={[{ required: true, message: "Please enter color" }]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., White"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="fuelType"
                    label="Fuel Type"
                    rules={[
                      { required: true, message: "Please select fuel type" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select fuel type"
                      options={[
                        { label: "Petrol", value: "Petrol" },
                        { label: "Diesel", value: "Diesel" },
                        { label: "Electric", value: "Electric" },
                        { label: "Hybrid", value: "Hybrid" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="transmission"
                    label="Transmission"
                    rules={[
                      {
                        required: true,
                        message: "Please select transmission",
                      },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select transmission"
                      options={[
                        { label: "Manual", value: "Manual" },
                        { label: "Automatic", value: "Automatic" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="seatingCapacity"
                    label="Seating Capacity"
                    rules={[
                      {
                        required: true,
                        message: "Please enter seating capacity",
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 5"
                      min={2}
                      max={10}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
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
                        { label: "Available", value: "available" },
                        { label: "In Use", value: "in-use" },
                        { label: "Maintenance", value: "maintenance" },
                        { label: "Inactive", value: "inactive" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Technical Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Technical Details
              </h3>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="engineNumber"
                    label="Engine Number"
                    rules={[
                      { required: true, message: "Please enter engine number" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., K15B-987654"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="chassisNumber"
                    label="Chassis Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter chassis number",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., MA3ERLF1S00123456"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="currentMileage"
                    label="Current Mileage (km)"
                    rules={[
                      {
                        required: true,
                        message: "Please enter current mileage",
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 12500"
                      min={0}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="purchaseCost"
                    label="Purchase Cost (₹)"
                    rules={[
                      {
                        required: true,
                        message: "Please enter purchase cost",
                      },
                    ]}
                  >
                    <InputNumber
                      size="large"
                      placeholder="e.g., 850000"
                      min={0}
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="purchaseDate"
                    label="Purchase Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select purchase date",
                      },
                    ]}
                  >
                    <DatePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Documents & Compliance */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Documents & Compliance
              </h3>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="insuranceNumber"
                    label="Insurance Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter insurance number",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="e.g., INC-2023-12345"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="insuranceExpiry"
                    label="Insurance Expiry Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select insurance expiry date",
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
                    name="pucExpiry"
                    label="PUC Expiry Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select PUC expiry date",
                      },
                    ]}
                  >
                    <DatePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="fitnessExpiry"
                    label="Fitness Expiry Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select fitness expiry date",
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
                    name="lastService"
                    label="Last Service Date"
                  >
                    <DatePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="nextService"
                    label="Next Service Date"
                  >
                    <DatePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Driver Assignment */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Driver Assignment
              </h3>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="driverId"
                    label="Assign Driver (Optional)"
                  >
                    <Select
                      size="large"
                      placeholder="Select driver"
                      showSearch
                      allowClear
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

            {/* Additional Notes */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Additional Information
              </h3>
              <Form.Item
                name="notes"
                label="Notes (Optional)"
              >
                <TextArea
                  rows={4}
                  placeholder="Any additional notes about the car..."
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
                  onClick={() => router.push("/mtadmin/car")}
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
                  Add Car
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AddCarPage;
