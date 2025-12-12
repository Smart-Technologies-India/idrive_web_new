"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Spin,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBookingServiceById } from "@/services/service.booking.api";
import type { BookingService } from "@/services/service.booking.api";
import {
  updateLicenseApplication,
  createLicenseApplication,
} from "@/services/license-application.api";
import { getServerDateTime } from "@/services/utils.api";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { toast } from "react-toastify";

dayjs.extend(isSameOrAfter);

interface ServiceBookingViewPageProps {
  params: Promise<{ id: string }>;
}

const ServiceBookingViewPage = ({ params }: ServiceBookingViewPageProps) => {
  const router = useRouter();
  const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDLModalOpen, setIsDLModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedLicenseApp, setSelectedLicenseApp] = useState<{
    id: number;
    status: string;
    llNumber?: string;
    issuedDate?: string;
    dlApplicationNumber?: string;
    testDate?: string;
    bookingServiceId?: number;
  } | null>(null);
  const [form] = Form.useForm();
  const [dlForm] = Form.useForm();
  const [resultForm] = Form.useForm();
  const [testResult, setTestResult] = useState<string>("");

  // Unwrap params
  useEffect(() => {
    params.then((p) => setBookingServiceId(parseInt(p.id)));
  }, [params]);

  // Fetch server date time
  const { data: serverDateTimeResponse } = useQuery({
    queryKey: ["server-date-time"],
    queryFn: () => getServerDateTime(),
  });

  const serverDateTime =
    serverDateTimeResponse?.data?.getServerDateTime?.serverDateTime;

  // Fetch booking service details
  const {
    data: bookingServiceResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["service-booking-detail", bookingServiceId],
    queryFn: () => getBookingServiceById(bookingServiceId!),
    enabled: bookingServiceId !== null && bookingServiceId > 0,
  });

  // Mutation for updating license application
  const { mutate: updateLicense, isPending: isUpdating } = useMutation({
    mutationFn: async (values: { llNumber: string; issuedDate: string }) => {
      if (!selectedLicenseApp) {
        throw new Error("No license application selected for update");
      }
      return await updateLicenseApplication({
        id: selectedLicenseApp.id,
        llNumber: values.llNumber,
        issuedDate: values.issuedDate,
        status: "LL_APPLIED",
      });
    },
    onSuccess: (response) => {
      if (response.status) {
        toast.success("License application updated successfully!");
        setIsEditModalOpen(false);
        form.resetFields();
        setSelectedLicenseApp(null);
        refetch();
      } else {
        toast.error(response.message || "Failed to update license application");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update license application");
    },
  });
  console.log("Booking Service Response:", bookingServiceResponse);

  // Mutation for updating to DL_PENDING
  const { mutate: updateToDLPending, isPending: isUpdatingDLPending } =
    useMutation({
      mutationFn: async (licenseAppId: number) => {
        return await updateLicenseApplication({
          id: licenseAppId,
          status: "DL_PENDING",
        });
      },
      onSuccess: (response) => {
        if (response.status) {
          toast.success("License application status updated to DL PENDING!");
          refetch();
        } else {
          toast.error(
            response.message || "Failed to update license application"
          );
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update license application");
      },
    });

  // Mutation for updating to DL_APPLIED
  const { mutate: updateToDLApplied, isPending: isUpdatingDLApplied } =
    useMutation({
      mutationFn: async (values: {
        testDate: string;
        dlApplicationNumber: string;
      }) => {
        if (!selectedLicenseApp) {
          throw new Error("No license application selected for update");
        }
        return await updateLicenseApplication({
          id: selectedLicenseApp.id,
          testDate: values.testDate,
          dlApplicationNumber: values.dlApplicationNumber,
          status: "DL_APPLIED",
        });
      },
      onSuccess: (response) => {
        if (response.status) {
          toast.success(
            "License application updated to DL APPLIED successfully!"
          );
          setIsDLModalOpen(false);
          dlForm.resetFields();
          setSelectedLicenseApp(null);
          refetch();
        } else {
          toast.error(
            response.message || "Failed to update license application"
          );
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update license application");
      },
    });

  // Mutation for updating test result to PASSED (close application)
  const { mutate: updateTestResultPass, isPending: isUpdatingTestResult } =
    useMutation({
      mutationFn: async (values: { id: number; testStatus: string }) => {
        return await updateLicenseApplication({
          id: values.id,
          testStatus: values.testStatus as
            | "PASSED"
            | "FAILED"
            | "ABSENT"
            | "NONE",
          status: "CLOSED",
        });
      },
      onSuccess: (response) => {
        if (response.status) {
          toast.success("Test result updated! Application closed.");
          setIsResultModalOpen(false);
          resultForm.resetFields();
          setTestResult("");
          setSelectedLicenseApp(null);
          refetch();
        } else {
          toast.error(response.message || "Failed to update test result");
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update test result");
      },
    });

  // Mutation for handling FAIL/ABSENT - close current and create new application
  const { mutate: retryLicenseApplication, isPending: isRetrying } =
    useMutation({
      mutationFn: async (values: {
        oldId: number;
        testStatus: string;
        newTestDate: string;
        bookingServiceId: number;
        llNumber: string;
        issuedDate: string;
        dlApplicationNumber: string;
      }) => {
        // First update the old one to CLOSED with test status
        await updateLicenseApplication({
          id: values.oldId,
          testStatus: values.testStatus as
            | "FAILED"
            | "ABSENT"
            | "NONE"
            | "PASSED",
          status: "CLOSED",
        });
        // Then create new license application with DL_APPLIED status
        return await createLicenseApplication({
          bookingServiceId: values.bookingServiceId,
          llNumber: values.llNumber,
          issuedDate: values.issuedDate,
          dlApplicationNumber: values.dlApplicationNumber,
          testDate: values.newTestDate,
          status: "DL_APPLIED",
        });
      },
      onSuccess: (response) => {
        if (response.status) {
          toast.success(
            "Previous application closed. New application created for retry!"
          );
          setIsResultModalOpen(false);
          resultForm.resetFields();
          setTestResult("");
          setSelectedLicenseApp(null);
          refetch();
        } else {
          toast.error(response.message || "Failed to process retry");
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to process retry");
      },
    });

  // Check if 30 days have passed since issue date
  const canApplyForDL = (issuedDate?: string) => {
    if (!issuedDate || !serverDateTime) return false;
    const issued = new Date(issuedDate);
    const server = new Date(serverDateTime);
    const daysDiff = Math.floor(
      (server.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff >= 30;
  };

  // Handle DL pending update
  const handleDLPendingUpdate = (licenseAppId: number) => {
    Modal.confirm({
      title: "Update to DL PENDING?",
      content:
        "Are you sure you want to update this license application status to DL PENDING?",
      okText: "Yes, Update",
      cancelText: "Cancel",
      onOk: () => {
        updateToDLPending(licenseAppId);
      },
    });
  };

  // Handle edit license application
  const handleEditLicenseApp = (licenseApp: {
    id: number;
    status: string;
    llNumber?: string;
    issuedDate?: string;
  }) => {
    setSelectedLicenseApp(licenseApp);
    form.setFieldsValue({
      llNumber: licenseApp.llNumber || "",
      issuedDate: licenseApp.issuedDate ? dayjs(licenseApp.issuedDate) : null,
    });
    setIsEditModalOpen(true);
  };

  // Handle DL applied modal open
  const handleDLAppliedOpen = (licenseApp: {
    id: number;
    status: string;
    llNumber?: string;
    issuedDate?: string;
  }) => {
    setSelectedLicenseApp(licenseApp);
    dlForm.resetFields();
    setIsDLModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      updateLicense({
        llNumber: values.llNumber,
        issuedDate: values.issuedDate.toISOString(),
      });
    });
  };

  // Handle DL form submit
  const handleDLFormSubmit = () => {
    dlForm.validateFields().then((values) => {
      updateToDLApplied({
        testDate: values.testDate.toISOString(),
        dlApplicationNumber: values.dlApplicationNumber,
      });
    });
  };

  // Check if can show result button (DL_APPLIED and testDate has passed)
  const canShowResultButton = (licenseApp: {
    status: string;
    testDate?: string;
  }) => {
    if (licenseApp.status !== "DL_APPLIED" || !licenseApp.testDate)
      return false;
    const testDate = dayjs(licenseApp.testDate);
    const today = dayjs();
    return today.isSameOrAfter(testDate, "day");
  };

  // Handle result modal open
  const handleResultOpen = (licenseApp: {
    id: number;
    status: string;
    llNumber?: string;
    issuedDate?: string;
    dlApplicationNumber?: string;
    testDate?: string;
    bookingServiceId?: number;
  }) => {
    setSelectedLicenseApp(licenseApp);
    setIsResultModalOpen(true);
    resultForm.resetFields();
    setTestResult("");
  };

  // Handle result form submit
  const handleResultFormSubmit = () => {
    resultForm.validateFields().then((values) => {
      if (values.testStatus === "PASSED") {
        // Update current application to CLOSED with PASSED status
        updateTestResultPass({
          id: selectedLicenseApp!.id,
          testStatus: "PASSED",
        });
      } else {
        // FAILED or ABSENT - create new application
        retryLicenseApplication({
          oldId: selectedLicenseApp!.id,
          testStatus: values.testStatus,
          newTestDate: values.newTestDate.toISOString(),
          bookingServiceId: bookingService!.id,
          llNumber: selectedLicenseApp!.llNumber!,
          issuedDate: selectedLicenseApp!.issuedDate!,
          dlApplicationNumber: selectedLicenseApp!.dlApplicationNumber!,
        });
      }
    });
  };

  const bookingService: BookingService | undefined =
    bookingServiceResponse?.data?.getBookingServiceById;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!bookingService) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <h2 className="text-xl text-gray-600">Service booking not found</h2>
          <Button
            type="primary"
            onClick={() => router.push("/mtadmin/servicebookinglist")}
            className="mt-4"
          >
            Back to List
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/mtadmin/servicebookinglist")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Service Booking Details
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {bookingService.confirmationNumber || "N/A"}
              </p>
            </div>
          </div>
          <Tag
            color={bookingService.serviceType == "LICENSE" ? "green" : "blue"}
            className="text-base px-4 py-1"
          >
            {bookingService.serviceType}
          </Tag>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Service Information */}
        <Card title="Service Information" className="shadow-sm">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2, lg: 3 }}>
            <Descriptions.Item label="Service Name" span={2}>
              <span className="font-semibold">
                {bookingService.serviceName}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Service Type">
              <Tag
                color={
                  bookingService.serviceType == "LICENSE" ? "green" : "blue"
                }
              >
                {bookingService.serviceType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Price" span={1}>
              <span className="text-lg font-bold text-green-600">
                ₹{bookingService.price.toFixed(2)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Confirmation Number" span={2}>
              <span className="font-medium text-blue-600">
                {bookingService.confirmationNumber || "N/A"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {bookingService.description || "No description available"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Customer Information */}
        <Card title="Customer Information" className="shadow-sm">
          {bookingService.user ? (
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
              <Descriptions.Item label="Customer Name">
                <span className="font-semibold">
                  {bookingService.user.name}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {bookingService.user.contact1}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {bookingService.user.email || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <p className="text-gray-500">Customer information not available</p>
          )}
        </Card>
        <div></div>

        {/* Related Booking Information */}
        {bookingService.booking && (
          <Card title="Related Booking Information" className="shadow-sm">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
              <Descriptions.Item label="Booking ID">
                <span className="font-medium text-blue-600">
                  {bookingService.booking.bookingId}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Name">
                {bookingService.booking.customerName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Mobile">
                {bookingService.booking.customerMobile}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Email">
                {bookingService.booking.customerEmail || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
        <div></div>

        {/* School Service Details */}
        {bookingService.schoolService && (
          <Card title="School Service Details" className="shadow-sm">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
              <Descriptions.Item label="School Service ID">
                {bookingService.schoolService.schoolServiceId}
              </Descriptions.Item>
              <Descriptions.Item label="Service Category">
                <Tag color="purple">
                  {bookingService.schoolService.service?.category || "N/A"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Service Name">
                {bookingService.schoolService.service?.serviceName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Service Description">
                {bookingService.schoolService.service?.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="License Price">
                <span className="font-semibold text-green-600">
                  ₹{bookingService.schoolService.licensePrice.toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Add-on Price">
                <span className="font-semibold text-blue-600">
                  ₹{bookingService.schoolService.addonPrice.toFixed(2)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
        <div></div>
        {/* License Applications */}
        {bookingService.licenseApplications &&
          bookingService.licenseApplications.length > 0 && (
            <Card title="License Applications" className="shadow-sm">
              {bookingService.licenseApplications.map((licenseApp, index) => {
                const statusColors: Record<string, string> = {
                  PENDING: "orange",
                  LL_APPLIED: "blue",
                  DL_PENDING: "purple",
                  DL_APPLIED: "cyan",
                  CLOSED: "green",
                };

                return (
                  <div key={licenseApp.id} className="mt-4">
                    <Card
                      type="inner"
                      title={`License Application #${index + 1}`}
                      className={index > 0 ? "mt-4" : ""}
                      extra={
                        <Space>
                          {licenseApp.status === "PENDING" && (
                            <Button
                              type="primary"
                              icon={<EditOutlined />}
                              onClick={() => handleEditLicenseApp(licenseApp)}
                            >
                              Update LL Details
                            </Button>
                          )}
                          {licenseApp.status === "LL_APPLIED" &&
                            canApplyForDL(licenseApp.issuedDate) && (
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() =>
                                  handleDLPendingUpdate(licenseApp.id)
                                }
                                loading={isUpdatingDLPending}
                                style={{ backgroundColor: "#52c41a" }}
                              >
                                DL PENDING
                              </Button>
                            )}
                          {licenseApp.status === "DL_PENDING" && (
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleDLAppliedOpen(licenseApp)}
                              style={{ backgroundColor: "#1890ff" }}
                            >
                              DL APPLIED
                            </Button>
                          )}
                          {licenseApp.status === "DL_APPLIED" &&
                            canShowResultButton(licenseApp) && (
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleResultOpen(licenseApp)}
                                style={{ backgroundColor: "#52c41a" }}
                              >
                                RESULT
                              </Button>
                            )}
                        </Space>
                      }
                    >
                      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                        <Descriptions.Item label="Status">
                          <Tag
                            color={statusColors[licenseApp.status] || "default"}
                          >
                            {licenseApp.status.replace(/_/g, " ")}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Test Status">
                          <Tag
                            color={
                              licenseApp.testStatus === "PASSED"
                                ? "green"
                                : licenseApp.testStatus === "FAILED"
                                ? "red"
                                : "default"
                            }
                          >
                            {licenseApp.testStatus}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="LL Number">
                          {licenseApp.llNumber || "Not provided"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Issue Date">
                          {licenseApp.issuedDate
                            ? new Date(
                                licenseApp.issuedDate
                              ).toLocaleDateString("en-IN")
                            : "Not provided"}
                        </Descriptions.Item>
                        <Descriptions.Item label="DL Application Number">
                          {licenseApp.dlApplicationNumber || "Not provided"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Test Date">
                          {licenseApp.testDate
                            ? new Date(licenseApp.testDate).toLocaleDateString(
                                "en-IN"
                              )
                            : "Not scheduled"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </div>
                );
              })}
            </Card>
          )}

        <div></div>

        {/* Timestamps */}
        <Card title="Booking Timeline" className="shadow-sm">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Booked On">
              {new Date(bookingService.createdAt).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(bookingService.updatedAt).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <div></div>

        {/* Action Buttons */}
        <Card className="shadow-sm">
          <Space>
            <Button
              type="primary"
              onClick={() => router.push("/mtadmin/servicebookinglist")}
            >
              Back to Service Booking List
            </Button>
            {bookingService.booking && (
              <Button
                onClick={() =>
                  router.push(
                    `/mtadmin/bookinglist/${bookingService.booking!.id}`
                  )
                }
              >
                View Related Booking
              </Button>
            )}
          </Space>
        </Card>
      </div>

      {/* Edit License Application Modal */}
      <Modal
        title="Update License Application"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
          setSelectedLicenseApp(null);
        }}
        onOk={handleFormSubmit}
        confirmLoading={isUpdating}
        okText="Update"
        cancelText="Cancel"
        width={600}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Please enter the Learner&apos;s License details to update the
            application status.
          </p>
          <Form form={form} layout="vertical">
            <Form.Item
              label="LL Number"
              name="llNumber"
              rules={[
                { required: true, message: "Please enter the LL number" },
                { min: 5, message: "LL number must be at least 5 characters" },
              ]}
            >
              <Input
                placeholder="Enter Learner's License number"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Issue Date"
              name="issuedDate"
              rules={[
                { required: true, message: "Please select the issue date" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                format="DD/MM/YYYY"
                placeholder="Select issue date"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* DL Application Modal */}
      <Modal
        title="Update DL Application Details"
        open={isDLModalOpen}
        onCancel={() => {
          setIsDLModalOpen(false);
          dlForm.resetFields();
          setSelectedLicenseApp(null);
        }}
        onOk={handleDLFormSubmit}
        confirmLoading={isUpdatingDLApplied}
        okText="Update"
        cancelText="Cancel"
        width={600}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Please enter the Driving License application details to update the
            status to DL APPLIED.
          </p>
          <Form form={dlForm} layout="vertical">
            <Form.Item
              label="DL Application Number"
              name="dlApplicationNumber"
              rules={[
                {
                  required: true,
                  message: "Please enter the DL application number",
                },
                {
                  min: 5,
                  message:
                    "DL application number must be at least 5 characters",
                },
              ]}
            >
              <Input
                placeholder="Enter Driving License application number"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Test Date"
              name="testDate"
              rules={[
                { required: true, message: "Please select the test date" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                format="DD/MM/YYYY"
                placeholder="Select test date"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Test Result Modal */}
      <Modal
        title="Update Test Result"
        open={isResultModalOpen}
        onCancel={() => {
          setIsResultModalOpen(false);
          resultForm.resetFields();
          setTestResult("");
          setSelectedLicenseApp(null);
        }}
        onOk={handleResultFormSubmit}
        confirmLoading={isUpdatingTestResult || isRetrying}
        okText="Submit"
        cancelText="Cancel"
        width={600}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Please enter the test result. If the candidate failed or was absent,
            you&apos;ll need to schedule a new test date.
          </p>
          <Form
            form={resultForm}
            layout="vertical"
            onValuesChange={(changedValues) => {
              if (changedValues.testStatus) {
                setTestResult(changedValues.testStatus);
              }
            }}
          >
            <Form.Item
              label="Test Result"
              name="testStatus"
              rules={[{ required: true, message: "Please select test result" }]}
            >
              <Select placeholder="Select test result" size="large">
                <Select.Option value="PASSED">Pass</Select.Option>
                <Select.Option value="FAILED">Fail</Select.Option>
                <Select.Option value="ABSENT">Absent</Select.Option>
              </Select>
            </Form.Item>

            {(testResult === "FAILED" || testResult === "ABSENT") && (
              <Form.Item
                label="New Test Date"
                name="newTestDate"
                rules={[
                  { required: true, message: "Please select new test date" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder="Select new test date"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                />
              </Form.Item>
            )}
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceBookingViewPage;
