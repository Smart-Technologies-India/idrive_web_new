"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  Descriptions,
  Tag,
  Table,
  Button,
  Statistic,
  Row,
  Col,
  Modal,
  Input,
  Select,
  InputNumber,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { getBookingById } from "@/services/booking.api";
import {
  getPaymentsByBooking,
  getTotalPaidAmount,
  createPayment,
  type Payment,
} from "@/services/payment.api";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PaymentSchema, type PaymentFormData } from "@/schema/payment";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";

const BookingDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const bookingId = parseInt(params.bookingId as string);
  const userId = parseInt(getCookie("id")?.toString() || "0");
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking-details", bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["payments", bookingId],
    queryFn: () => getPaymentsByBooking(bookingId),
    enabled: !!bookingId,
  });

  const { data: totalPaidData } = useQuery({
    queryKey: ["payment-total", bookingId],
    queryFn: () => getTotalPaidAmount(bookingId),
    enabled: !!bookingId,
  });

  const booking = data?.data?.getBookingById;
  const payments = paymentsData?.data?.getAllPayment || [];
  const totalPaid = totalPaidData?.data?.getTotalPaidAmount || 0;
  const remainingAmount = booking ? booking.totalAmount - totalPaid : 0;

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: valibotResolver(PaymentSchema),
    defaultValues: {
      bookingId,
      userId,
      amount: 0,
      paymentMethod: "CASH",
      transactionId: "",
      installmentNumber: 1,
      totalInstallments: 1,
      notes: "",
    },
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (inputData: PaymentFormData & { paymentNumber: string }) => {
      return createPayment(inputData);
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["payments", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["payment-total", bookingId] });
      setIsModalOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });

  // Handle form submission
  const onSubmit = (data: PaymentFormData) => {
    const installmentNum = payments.length + 1;
    
    createPaymentMutation.mutate({
      ...data,
      bookingId,
      userId,
      installmentNumber: installmentNum,
      totalInstallments: installmentNum,
      paymentNumber: `PAY${bookingId}${installmentNum}${new Date().getTime()}`,
    });
  };

  // Open modal and reset form with updated values
  const handleOpenModal = () => {
    reset({
      bookingId,
      userId,
      amount: remainingAmount > 0 ? remainingAmount : 0,
      paymentMethod: "CASH",
      transactionId: "",
      installmentNumber: 1,
      totalInstallments: 1,
      notes: "",
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error || !booking) {
    return (
      <div className="p-8 text-center text-red-600">Booking not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        <div className="flex gap-4">
          <Button type="default" onClick={() => router.back()}>
            Back
          </Button>
          <Button
            type="primary"
            onClick={() =>
              router.push(`/mtadmin/amendment?bookingId=${booking.bookingId}`)
            }
          >
            Go to Amendment
          </Button>
        </div>
      </div>
      <Card className="shadow-sm mb-6">
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="Booking ID">
            {booking.bookingId}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                booking.status == "COMPLETED"
                  ? "green"
                  : booking.status == "CANCELLED"
                  ? "red"
                  : "blue"
              }
            >
              {booking.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Customer Name">
            {booking.customerName}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Mobile">
            {booking.customerMobile}
          </Descriptions.Item>
          <Descriptions.Item label="Customer Email">
            {booking.customerEmail}
          </Descriptions.Item>
          <Descriptions.Item label="Course">
            {booking.courseName}
          </Descriptions.Item>
          <Descriptions.Item label="Car">{booking.carName}</Descriptions.Item>
          <Descriptions.Item label="Slot">{booking.slot}</Descriptions.Item>
          <Descriptions.Item label="Booking Date">
            {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            ₹{booking.totalAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            {booking.notes || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Info</h2>
        <Table
          columns={[
            {
              title: "Session #",
              dataIndex: "dayNumber",
              key: "dayNumber",
              width: 100,
            },
            {
              title: "Date",
              dataIndex: "sessionDate",
              key: "sessionDate",
              width: 130,
              render: (date) => new Date(date).toLocaleDateString("en-IN"),
            },
            { title: "Slot", dataIndex: "slot", key: "slot", width: 110 },
            { title: "Car", dataIndex: "carId", key: "carId", width: 100 },
            {
              title: "Driver",
              key: "driver",
              width: 160,
              render: (_, rec) => rec.driver?.name || "-",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              width: 120,
              render: (status) => (
                <Tag
                  color={
                    status == "COMPLETED"
                      ? "green"
                      : status == "CANCELLED"
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
              width: 100,
              render: (att) => (att ? "Yes" : "No"),
            },
          ]}
          dataSource={booking.sessions || []}
          pagination={false}
          rowKey="id"
          size="small"
        />
      </Card>
      <div className="mt-4"></div>
      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Info</h2>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Name">
            {booking.customer?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {booking.customer?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Contact">
            {booking.customer?.contact1}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {booking.customer?.address}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Car Info</h2>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Car Name">
            {booking.car?.carName}
          </Descriptions.Item>
          <Descriptions.Item label="Model">
            {booking.car?.model}
          </Descriptions.Item>
          <Descriptions.Item label="Registration">
            {booking.car?.registrationNumber}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      <Card className="shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Course Info</h2>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Course Name">
            {booking.course?.courseName}
          </Descriptions.Item>
          <Descriptions.Item label="Price">
            ₹{booking.course?.price}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      {/* Booking Services Section */}
      {booking.bookingServices && booking.bookingServices.length > 0 && (
        <>
          <Card className="shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Additional Services
            </h2>
            <Table
              columns={[
                {
                  title: "Service Name",
                  dataIndex: "serviceName",
                  key: "serviceName",
                  width: 200,
                },
                {
                  title: "Type",
                  dataIndex: "serviceType",
                  key: "serviceType",
                  width: 120,
                  render: (type) => (
                    <Tag color={type == "LICENSE" ? "purple" : "cyan"}>
                      {type}
                    </Tag>
                  ),
                },
                {
                  title: "Category",
                  key: "category",
                  width: 150,
                  render: (_, record) => (
                    <Tag
                      color={
                        record.schoolService?.service?.category ==
                        "NEW_LICENSE"
                          ? "purple"
                          : record.schoolService?.service?.category ==
                            "I_HOLD_LICENSE"
                          ? "blue"
                          : "cyan"
                      }
                    >
                      {record.schoolService?.service?.category || "-"}
                    </Tag>
                  ),
                },
                {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  width: 120,
                  render: (price) => `₹${price.toLocaleString("en-IN")}`,
                },
                {
                  title: "Description",
                  dataIndex: "description",
                  key: "description",
                  ellipsis: true,
                  render: (desc) => desc || "-",
                },
                {
                  title: "Confirmation #",
                  dataIndex: "confirmationNumber",
                  key: "confirmationNumber",
                  width: 150,
                  render: (num) => num || "-",
                },
              ]}
              dataSource={booking.bookingServices}
              pagination={false}
              rowKey="id"
              size="small"
              locale={{
                emptyText: "No additional services booked",
              }}
            />
          </Card>
          <div className="mt-4"></div>
        </>
      )}

      <Card className="shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
            disabled={remainingAmount <= 0}
          >
            Collect Payment
          </Button>
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card bordered={false} className="bg-blue-50">
              <Statistic
                title="Total Amount"
                value={booking.totalAmount}
                prefix="₹"
                valueStyle={{ color: "#1890ff" }}
                suffix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} className="bg-green-50">
              <Statistic
                title="Total Paid"
                value={totalPaid}
                prefix="₹"
                valueStyle={{ color: "#52c41a" }}
                suffix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} className="bg-red-50">
              <Statistic
                title="Remaining Due"
                value={booking.totalAmount - totalPaid}
                prefix="₹"
                valueStyle={{ color: "#ff4d4f" }}
                suffix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Table<Payment>
          columns={[
            {
              title: "Payment #",
              dataIndex: "paymentNumber",
              key: "paymentNumber",
              width: 150,
              fixed: "left",
            },
            {
              title: "Date",
              dataIndex: "paymentDate",
              key: "paymentDate",
              width: 130,
              render: (date) => new Date(date).toLocaleDateString("en-IN"),
            },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "amount",
              width: 120,
              render: (amount) => `₹${amount.toLocaleString("en-IN")}`,
            },
            {
              title: "Method",
              dataIndex: "paymentMethod",
              key: "paymentMethod",
              width: 120,
              render: (method) => method || "-",
            },
            {
              title: "Transaction ID",
              dataIndex: "transactionId",
              key: "transactionId",
              width: 150,
              render: (id) => id || "-",
            },
            {
              title: "Installment",
              key: "installment",
              width: 120,
              render: (_, record) =>
                `${record.installmentNumber}/${record.totalInstallments}`,
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              width: 120,
              render: (status) => (
                <Tag
                  color={
                    status == "COMPLETED"
                      ? "green"
                      : status == "PENDING"
                      ? "orange"
                      : status == "FAILED"
                      ? "red"
                      : status == "REFUNDED"
                      ? "purple"
                      : "default"
                  }
                >
                  {status}
                </Tag>
              ),
            },
            {
              title: "Notes",
              dataIndex: "notes",
              key: "notes",
              ellipsis: true,
              render: (notes) => notes || "-",
            },
          ]}
          dataSource={payments}
          pagination={false}
          rowKey="id"
          size="small"
          scroll={{ x: 1000 }}
          locale={{
            emptyText: "No payment records found",
          }}
        />
      </Card>

      {/* Payment Collection Modal */}
      <Modal
        title="Collect Payment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">
                ₹{booking?.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Already Paid:</span>
              <span className="font-semibold text-green-600">
                ₹{totalPaid.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Due:</span>
              <span className="font-semibold text-red-600">
                ₹{remainingAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  status={errors.amount ? "error" : undefined}
                  className="w-full"
                  placeholder="Enter payment amount"
                  prefix="₹"
                  min={1}
                  max={remainingAmount}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value?.replace(/,/g, "") as unknown as number
                  }
                />
              )}
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.amount.message}
              </p>
            )}
            {!errors.amount && remainingAmount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum allowed: ₹{remainingAmount.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  status={errors.paymentMethod ? "error" : undefined}
                  className="w-full"
                  placeholder="Select payment method"
                >
                  <Select.Option value="CASH">Cash</Select.Option>
                  <Select.Option value="CARD">Card</Select.Option>
                  <Select.Option value="UPI">UPI</Select.Option>
                  <Select.Option value="NET_BANKING">Net Banking</Select.Option>
                  <Select.Option value="CHEQUE">Cheque</Select.Option>
                  <Select.Option value="OTHER">Other</Select.Option>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-xs text-red-500 mt-1">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction ID / Reference
            </label>
            <Controller
              name="transactionId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  status={errors.transactionId ? "error" : undefined}
                  placeholder="Enter transaction ID or reference number (optional)"
                />
              )}
            />
            {errors.transactionId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.transactionId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  status={errors.notes ? "error" : undefined}
                  rows={3}
                  placeholder="Add any notes about this payment (optional)"
                />
              )}
            />
            {errors.notes && (
              <p className="text-xs text-red-500 mt-1">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createPaymentMutation.isPending}
            >
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingDetailsPage;
