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
  Table,
  Statistic,
  Row,
  Col,
  InputNumber,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBookingServiceById } from "@/services/service.booking.api";
import type { BookingService } from "@/services/service.booking.api";
import { formatDate, formatDateTime } from "@/utils/date-format";
import {
  updateLicenseApplication,
  createLicenseApplication,
} from "@/services/license-application.api";
import { getServerDateTime } from "@/services/utils.api";
import {
  getServicePaymentsByBookingService,
  getTotalPaidServiceAmount,
  createServicePayment,
  type ServicePayment,
} from "@/services/service-payment.api";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { toast } from "react-toastify";
import { getCookie } from "cookies-next";
import { useQueryClient } from "@tanstack/react-query";
import { decryptURLData, encryptURLData } from "@/utils/methods";

dayjs.extend(isSameOrAfter);

const ServiceBookingViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const encServiceBookingId: string = params.id as string;
  const bookingServiceId = parseInt(
    decryptURLData(encServiceBookingId, router),
  );

  const queryClient = useQueryClient();
  const userId = parseInt(getCookie("id")?.toString() || "0");
  // const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFullUpdateModalOpen, setIsFullUpdateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDLModalOpen, setIsDLModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedLicenseApp, setSelectedLicenseApp] = useState<{
    id: number;
    status: string;
    llNumber?: string;
    issuedDate?: string;
    applicationNumber?: string;
    dlApplicationNumber?: string;
    testDate?: string;
    testStatus?: string;
    bookingServiceId?: number;
  } | null>(null);
  const [form] = Form.useForm();
  const [submitForm] = Form.useForm();
  const [fullUpdateForm] = Form.useForm();
  const [dlForm] = Form.useForm();
  const [resultForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [testResult, setTestResult] = useState<string>("");

  // Unwrap params
  // useEffect(() => {
  //   params.then((p) => setBookingServiceId(parseInt(p.id)));
  // }, [params]);

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

  // Fetch service payments
  const { data: servicePaymentsData } = useQuery({
    queryKey: ["service-payments", bookingServiceId],
    queryFn: () => getServicePaymentsByBookingService(bookingServiceId!),
    enabled: bookingServiceId !== null && bookingServiceId > 0,
  });

  const { data: totalPaidServiceData } = useQuery({
    queryKey: ["service-payment-total", bookingServiceId],
    queryFn: () => getTotalPaidServiceAmount(bookingServiceId!),
    enabled: bookingServiceId !== null && bookingServiceId > 0,
  });

  const bookingService: BookingService | undefined =
    bookingServiceResponse?.data?.getBookingServiceById;
  const servicePayments: ServicePayment[] =
    servicePaymentsData?.data?.getAllServicePayment || [];
  const totalPaidService =
    totalPaidServiceData?.data?.getTotalPaidServiceAmount || 0;
  const remainingServiceAmount = bookingService
    ? bookingService.price - (bookingService.discount || 0) - totalPaidService
    : 0;

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (inputData: {
      bookingServiceId: number;
      userId: number;
      amount: number;
      paymentMethod: string;
      transactionId: string;
      installmentNumber: number;
      totalInstallments: number;
      notes: string;
      paymentNumber: string;
    }) => {
      return createServicePayment(inputData);
    },
    onSuccess: () => {
      toast.success("Payment recorded successfully!");
      queryClient.invalidateQueries({
        queryKey: ["service-payments", bookingServiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["service-payment-total", bookingServiceId],
      });
      setIsPaymentModalOpen(false);
      paymentForm.resetFields();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record payment");
    },
  });

  // Handle payment form submit
  const onPaymentSubmit = (values: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    installmentNumber: number;
    totalInstallments: number;
    notes: string;
  }) => {
    if (!bookingService) return;

    const paymentNumber = `SPAY${bookingService.id}${Date.now()}`;
    createPaymentMutation.mutate({
      bookingServiceId: bookingService.id,
      userId,
      paymentNumber,
      ...values,
    });
  };

  // Handle open payment modal
  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
    paymentForm.setFieldsValue({
      amount: remainingServiceAmount,
      paymentMethod: "CASH",
      transactionId: "",
      installmentNumber: 1,
      totalInstallments: 1,
      notes: "",
    });
  };

  // Mutation for updating license application
  const { mutate: updateLicense, isPending: isUpdating } = useMutation({
    mutationFn: async (values: {
      llNumber: string;
      issuedDate: string;
      applicationNumber: string;
      dlApplicationNumber?: string;
    }) => {
      if (!selectedLicenseApp) {
        throw new Error("No license application selected for update");
      }
      return await updateLicenseApplication({
        id: selectedLicenseApp.id,
        llNumber: values.llNumber,
        issuedDate: values.issuedDate,
        applicationNumber: values.applicationNumber,
        dlApplicationNumber: values.dlApplicationNumber,
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

  // Mutation for full license application update
  const { mutate: updateLicenseDetails, isPending: isUpdatingFull } =
    useMutation({
      mutationFn: async (values: {
        llNumber?: string;
        issuedDate?: string;
        applicationNumber?: string;
        dlApplicationNumber?: string;
        testStatus?: string;
      }) => {
        if (!selectedLicenseApp) {
          throw new Error("No license application selected for update");
        }
        return await updateLicenseApplication({
          id: selectedLicenseApp.id,
          llNumber: values.llNumber,
          issuedDate: values.issuedDate,
          applicationNumber: values.applicationNumber,
          dlApplicationNumber: values.dlApplicationNumber,
          testStatus: values.testStatus as
            | "PASSED"
            | "FAILED"
            | "ABSENT"
            | "NONE"
            | undefined,
        });
      },
      onSuccess: (response) => {
        if (response.status) {
          toast.success("License application updated successfully!");
          setIsFullUpdateModalOpen(false);
          fullUpdateForm.resetFields();
          setSelectedLicenseApp(null);
          refetch();
        } else {
          toast.error(
            response.message || "Failed to update license application",
          );
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update license application");
      },
    });

  // Mutation for updating application number (I_HOLD_LICENSE)
  const { mutate: updateApplicationNumber, isPending: isUpdatingSubmit } =
    useMutation({
      mutationFn: async (values: { applicationNumber: string }) => {
        if (!selectedLicenseApp) {
          throw new Error("No license application selected for update");
        }
        return await updateLicenseApplication({
          id: selectedLicenseApp.id,
          applicationNumber: values.applicationNumber,
          status: "SUBMIT",
        });
      },
      onSuccess: (response) => {
        if (response.status) {
          toast.success("Application number updated successfully!");
          setIsSubmitModalOpen(false);
          submitForm.resetFields();
          setSelectedLicenseApp(null);
          refetch();
        } else {
          toast.error(response.message || "Failed to update application");
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update application");
      },
    });

  // Mutation for closing application (SUBMIT -> CLOSED)
  const { mutate: closeApplication, isPending: isClosingApplication } =
    useMutation({
      mutationFn: async (licenseAppId: number) => {
        return await updateLicenseApplication({
          id: licenseAppId,
          status: "CLOSED",
        });
      },
      onSuccess: (response) => {
        if (response.status) {
          toast.success("Application closed successfully!");
          refetch();
        } else {
          toast.error(response.message || "Failed to close application");
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to close application");
      },
    });

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
            response.message || "Failed to update license application",
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
            "License application updated to DL APPLIED successfully!",
          );
          setIsDLModalOpen(false);
          dlForm.resetFields();
          setSelectedLicenseApp(null);
          refetch();
        } else {
          toast.error(
            response.message || "Failed to update license application",
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
            "Previous application closed. New application created for retry!",
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
      (server.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24),
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

  // Handle close application (SUBMIT -> CLOSED)
  const handleCloseApplication = (licenseAppId: number) => {
    Modal.confirm({
      title: "Close Application?",
      content: "Are you sure you want to close this license application?",
      okText: "Yes, Close",
      cancelText: "Cancel",
      onOk: () => {
        closeApplication(licenseAppId);
      },
    });
  };

  // Handle edit license application
  const handleEditLicenseApp = (licenseApp: {
    id: number;
    status: string;
    llNumber?: string;
    issuedDate?: string;
    applicationNumber?: string;
    dlApplicationNumber?: string;
  }) => {
    setSelectedLicenseApp(licenseApp);
    form.setFieldsValue({
      llNumber: licenseApp.llNumber || "",
      issuedDate: licenseApp.issuedDate ? dayjs(licenseApp.issuedDate) : null,
      applicationNumber: licenseApp.applicationNumber || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle full update modal open
  const handleFullUpdateOpen = (licenseApp: {
    id: number;
    status: string;
    llNumber?: string;
    issuedDate?: string;
    applicationNumber?: string;
    dlApplicationNumber?: string;
    testStatus?: string;
  }) => {
    setSelectedLicenseApp(licenseApp);
    fullUpdateForm.setFieldsValue({
      llNumber: licenseApp.llNumber || "",
      issuedDate: licenseApp.issuedDate ? dayjs(licenseApp.issuedDate) : null,
      applicationNumber: licenseApp.applicationNumber || "",
      dlApplicationNumber: licenseApp.dlApplicationNumber || "",
      testStatus: licenseApp.testStatus || "NONE",
    });
    setIsFullUpdateModalOpen(true);
  };

  // Handle submit application number modal open (I_HOLD_LICENSE)
  const handleSubmitApplicationOpen = (licenseApp: {
    id: number;
    status: string;
    applicationNumber?: string;
    dlApplicationNumber?: string;
  }) => {
    setSelectedLicenseApp(licenseApp);
    submitForm.setFieldsValue({
      applicationNumber:
        licenseApp.applicationNumber || licenseApp.dlApplicationNumber || "",
    });
    setIsSubmitModalOpen(true);
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
        applicationNumber: values.applicationNumber,
        dlApplicationNumber: values.dlApplicationNumber,
      });
    });
  };

  const handleFullUpdateSubmit = () => {
    fullUpdateForm.validateFields().then((values) => {
      updateLicenseDetails({
        llNumber: values.llNumber || undefined,
        issuedDate: values.issuedDate
          ? values.issuedDate.toISOString()
          : undefined,
        applicationNumber: values.applicationNumber || undefined,
        dlApplicationNumber: values.dlApplicationNumber || undefined,
        testStatus: values.testStatus || undefined,
      });
    });
  };

  // Handle submit application number form submit
  const handleSubmitApplication = () => {
    submitForm.validateFields().then((values) => {
      updateApplicationNumber({
        applicationNumber: values.applicationNumber,
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
                {bookingService.user.contact2
                  ? `${bookingService.user.contact1}/${bookingService.user.contact2}`
                  : bookingService.user.contact1}
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
                  SUBMIT: "blue",
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
                          <Tag
                            color={statusColors[licenseApp.status] || "default"}
                          >
                            {licenseApp.status.replace(/_/g, " ")}
                          </Tag>
                          <Button
                            type="default"
                            icon={<EditOutlined />}
                            onClick={() => handleFullUpdateOpen(licenseApp)}
                          >
                            Update
                          </Button>
                          {licenseApp.status === "PENDING" &&
                            (bookingService.schoolService?.service?.category ===
                            "I_HOLD_LICENSE" ? (
                              <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() =>
                                  handleSubmitApplicationOpen(licenseApp)
                                }
                              >
                                Update Application Number
                              </Button>
                            ) : (
                              <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleEditLicenseApp(licenseApp)}
                              >
                                Update LL Details
                              </Button>
                            ))}
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
                          {licenseApp.status === "SUBMIT" && (
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              onClick={() =>
                                handleCloseApplication(licenseApp.id)
                              }
                              loading={isClosingApplication}
                              style={{ backgroundColor: "#52c41a" }}
                            >
                              Close Application
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
                        <Descriptions.Item label="Application Number">
                          {licenseApp.applicationNumber || "Not provided"}
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
                            ? formatDate(licenseApp.issuedDate)
                            : "Not provided"}
                        </Descriptions.Item>
                        <Descriptions.Item label="DL Application Number">
                          {licenseApp.dlApplicationNumber || "Not provided"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Test Date">
                          {licenseApp.testDate
                            ? formatDate(licenseApp.testDate)
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

        {/* Payment History - Only for LICENSE service type */}
        {bookingService.serviceType === "LICENSE" && (
          <>
            <Card className="shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Payment History
                </h2>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenPaymentModal}
                  disabled={remainingServiceAmount <= 0}
                >
                  Collect Payment
                </Button>
              </div>

              <Row gutter={16} className="mb-6">
                <Col span={8}>
                  <Card bordered={false} className="bg-blue-50">
                    <Statistic
                      title="Total Amount"
                      value={Math.max(
                        bookingService.price - (bookingService.discount || 0),
                        0,
                      )}
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
                      value={totalPaidService}
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
                      value={remainingServiceAmount}
                      prefix="₹"
                      valueStyle={{ color: "#ff4d4f" }}
                      suffix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Table<ServicePayment>
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
                    render: (date) => formatDate(date),
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
                dataSource={servicePayments}
                pagination={false}
                rowKey="id"
                size="small"
                scroll={{ x: 1000 }}
                locale={{
                  emptyText: "No payment records found",
                }}
              />
            </Card>
            <div></div>
          </>
        )}

        {/* Timestamps */}
        <Card title="Booking Timeline" className="shadow-sm">
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }}>
            <Descriptions.Item label="Booked On">
              {formatDateTime(bookingService.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {formatDateTime(bookingService.updatedAt)}
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
                onClick={() => {
                  if (bookingService.booking == null) return;
                  const encodedId = encryptURLData(
                    bookingService.booking.id.toString(),
                  );
                  router.push(`/mtadmin/bookinglist/${encodedId}`);
                }}
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
              label="Application Number"
              name="applicationNumber"
              rules={[
                {
                  required: true,
                  message: "Please enter the application number",
                },
                {
                  min: 5,
                  message: "Application number must be at least 5 characters",
                },
              ]}
            >
              <Input placeholder="Enter application number" size="large" />
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
                format="DD-MM-YYYY"
                placeholder="Select issue date"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Full Update License Application Modal */}
      <Modal
        title="Update License Application"
        open={isFullUpdateModalOpen}
        onCancel={() => {
          setIsFullUpdateModalOpen(false);
          fullUpdateForm.resetFields();
          setSelectedLicenseApp(null);
        }}
        onOk={handleFullUpdateSubmit}
        confirmLoading={isUpdatingFull}
        okText="Update"
        cancelText="Cancel"
        width={650}
      >
        <div className="py-4">
          <Form form={fullUpdateForm} layout="vertical">
            <Form.Item label="LL Number" name="llNumber">
              <Input placeholder="Enter LL number" size="large" />
            </Form.Item>
            <Form.Item label="Issue Date" name="issuedDate">
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                format="DD-MM-YYYY"
                placeholder="Select issue date"
              />
            </Form.Item>
            <Form.Item label="Application Number" name="applicationNumber">
              <Input placeholder="Enter application number" size="large" />
            </Form.Item>
            <Form.Item label="DL Application Number" name="dlApplicationNumber">
              <Input placeholder="Enter DL application number" size="large" />
            </Form.Item>
            <Form.Item label="Test Status" name="testStatus">
              <Select placeholder="Select test status" size="large">
                <Select.Option value="NONE">None</Select.Option>
                <Select.Option value="PASSED">Pass</Select.Option>
                <Select.Option value="FAILED">Fail</Select.Option>
                <Select.Option value="ABSENT">Absent</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Submit Application Number Modal (I_HOLD_LICENSE) */}
      <Modal
        title="Update Application Number"
        open={isSubmitModalOpen}
        onCancel={() => {
          setIsSubmitModalOpen(false);
          submitForm.resetFields();
          setSelectedLicenseApp(null);
        }}
        onOk={handleSubmitApplication}
        confirmLoading={isUpdatingSubmit}
        okText="Submit"
        cancelText="Cancel"
        width={500}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Please enter the application number to submit the license
            application.
          </p>
          <Form form={submitForm} layout="vertical">
            <Form.Item
              label="Application Number"
              name="applicationNumber"
              rules={[
                {
                  required: true,
                  message: "Please enter the application number",
                },
                {
                  min: 5,
                  message: "Application number must be at least 5 characters",
                },
              ]}
            >
              <Input placeholder="Enter application number" size="large" />
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
                format="DD-MM-YYYY"
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
                  format="DD-MM-YYYY"
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

      {/* Payment Collection Modal */}
      <Modal
        title="Collect Payment"
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={onPaymentSubmit}
          className="space-y-4"
        >
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">
                ₹{bookingService?.price.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Already Paid:</span>
              <span className="font-semibold text-green-600">
                ₹{totalPaidService.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="text-gray-900 font-bold">Remaining Due:</span>
              <span className="font-bold text-red-600">
                ₹{remainingServiceAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Form.Item
            label="Payment Amount"
            name="amount"
            rules={[
              { required: true, message: "Please enter payment amount" },
              {
                type: "number",
                min: 1,
                message: "Amount must be greater than 0",
              },
              {
                validator: (_, value) =>
                  value <= remainingServiceAmount
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          `Amount cannot exceed remaining due (₹${remainingServiceAmount})`,
                        ),
                      ),
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              prefix="₹"
              min={0}
              max={remainingServiceAmount}
              placeholder="Enter payment amount"
            />
          </Form.Item>

          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[
              { required: true, message: "Please select payment method" },
            ]}
          >
            <Select size="large" placeholder="Select payment method">
              <Select.Option value="CASH">Cash</Select.Option>
              <Select.Option value="CARD">Card</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
              <Select.Option value="BANK_TRANSFER">Bank Transfer</Select.Option>
              <Select.Option value="CHEQUE">Cheque</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Transaction ID (Optional)" name="transactionId">
            <Input size="large" placeholder="Enter transaction/reference ID" />
          </Form.Item>

          <Form.Item
            label="Installment Number"
            name="installmentNumber"
            rules={[
              { required: true, message: "Please enter installment number" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              min={1}
              placeholder="Enter installment number"
            />
          </Form.Item>

          <Form.Item
            label="Total Installments"
            name="totalInstallments"
            rules={[
              { required: true, message: "Please enter total installments" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              min={1}
              placeholder="Enter total installments"
            />
          </Form.Item>

          <Form.Item label="Notes (Optional)" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Any additional notes about this payment"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button size="large" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={createPaymentMutation.isPending}
                icon={<DollarOutlined />}
              >
                Record Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceBookingViewPage;
