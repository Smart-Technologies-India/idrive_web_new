"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatDate } from "@/utils/date-format";
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
  Form,
  Steps,
  Dropdown,
} from "antd";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  getBookingById,
  updateBookingSession,
  updateBooking,
  type BookingSession,
} from "@/services/booking.api";
import {
  getPaymentsByBooking,
  getTotalPaidAmount,
  createPayment,
  updatePayment,
  type Payment,
} from "@/services/payment.api";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  WhatsAppOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { PaymentSchema, type PaymentFormData } from "@/schema/payment";
import { getCookie } from "cookies-next";
import { getUserById } from "@/services/user.api";
import { sendOtp, verifyOtp as verifyUserOtp } from "@/services/auth.api";
import { toast } from "react-toastify";
import { convertSlotTo12Hour } from "@/utils/time-format";
import { decryptURLData, encryptURLData } from "@/utils/methods";
import jsPDF from "jspdf";

const BookingDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const encBookingId: string = params.bookingId as string;
  const bookingId = parseInt(decryptURLData(encBookingId, router));
  const userId = parseInt(getCookie("id")?.toString() || "0");
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceModal, setAttendanceModal] = useState<{
    visible: boolean;
    session: BookingSession | null;
    notes: string;
    status: "completed" | "no_show";
  }>({
    visible: false,
    session: null,
    notes: "",
    status: "completed",
  });
  const [courseCompleteModal, setCourseCompleteModal] = useState(false);

  // Edit payment modal state
  const editTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [editForm] = Form.useForm();
  const [editOtpForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editStep, setEditStep] = useState<"edit" | "otp">("edit");
  const [editAdminContact, setEditAdminContact] = useState("");
  const [editOtpCountdown, setEditOtpCountdown] = useState(0);
  const [editLoading, setEditLoading] = useState(false);

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
  const payments = useMemo(
    () => paymentsData?.data?.getAllPayment || [],
    [paymentsData?.data?.getAllPayment],
  );
  const totalPaid = totalPaidData?.data?.getTotalPaidAmount || 0;
  const remainingAmount = booking ? booking.totalAmount - totalPaid : 0;

  const sortedSessions = useMemo(() => {
    const sessions = booking?.sessions || [];
    return [...sessions].sort((a, b) => {
      const dateDiff =
        new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.dayNumber - b.dayNumber;
    });
  }, [booking?.sessions]);

  // Check if all sessions are completed
  const allSessionsCompleted = useMemo(() => {
    if (!sortedSessions || sortedSessions.length === 0) return false;
    return sortedSessions.every(
      (session) => session.status === "COMPLETED"
    );
  }, [sortedSessions]);

  const orderedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const dateDiff =
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.id - b.id;
    });
  }, [payments]);

  const paymentBalanceMap = useMemo(() => {
    if (!booking) return new Map<number, number>();

    let runningTotal = 0;
    const balanceMap = new Map<number, number>();

    orderedPayments.forEach((payment) => {
      runningTotal += Number(payment.amount) || 0;
      balanceMap.set(
        payment.id,
        Math.max(booking.totalAmount - runningTotal, 0),
      );
    });

    return balanceMap;
  }, [orderedPayments, booking]);

  const getReceiptValidTillDate = (inputDate?: string) => {
    if (!inputDate) return "-";

    const parsedDate = new Date(inputDate);
    if (Number.isNaN(parsedDate.getTime())) return "-";

    parsedDate.setDate(parsedDate.getDate() + 45);
    return formatDate(parsedDate);
  };

  const getCourseDateRange = () => {
    const sessions = booking?.sessions || [];
    if (!sessions.length) {
      return {
        startDate: booking?.bookingDate || "-",
        endDate: "-",
      };
    }

    const sortedSessions = [...sessions].sort(
      (a, b) =>
        new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
    );

    return {
      startDate: sortedSessions[0]?.sessionDate || booking?.bookingDate || "-",
      endDate: sortedSessions[sortedSessions.length - 1]?.sessionDate || "-",
    };
  };

  const drawReceiptCopy = (
    doc: jsPDF,
    startY: number,
    copyLabel: string,
    payment: Payment,
  ) => {
    if (!booking) return;

    const pageWidth = 210;
    const marginX = 12;
    const contentWidth = pageWidth - marginX * 2;

    const tableX = marginX;
    const tableWidth = contentWidth;
    const columnWidths = [31, 85, 31, 39];
    const rowHeight = 7;

    const drawSectionTitle = (title: string, y: number) => {
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(9.5);
      doc.text(title, marginX, y);
    };

    const drawFourColTable = (y: number, rows: string[][]) => {
      const tableHeight = rows.length * rowHeight;

      doc.setLineWidth(0.2);
      doc.rect(tableX, y, tableWidth, tableHeight);

      let runningX = tableX;
      columnWidths.forEach((width) => {
        runningX += width;
        if (runningX < tableX + tableWidth) {
          doc.line(runningX, y, runningX, y + tableHeight);
        }
      });

      rows.forEach((_, index) => {
        if (index < rows.length - 1) {
          const lineY = y + rowHeight * (index + 1);
          doc.line(tableX, lineY, tableX + tableWidth, lineY);
        }
      });

      rows.forEach((row, rowIndex) => {
        const textY = y + rowHeight * rowIndex + 4.8;

        let textX = tableX + 2;
        row.forEach((value, colIndex) => {
          const safeValue = value && value.trim() ? value : "-";
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.text(safeValue, textX, textY, {
            maxWidth: columnWidths[colIndex] - 4,
          });
          textX += columnWidths[colIndex];
        });
      });
    };

    const sessions = booking.sessions || [];
    const instructor = sessions.find((session) => session.driver?.name)?.driver
      ?.name;
    const { startDate, endDate } = getCourseDateRange();

    doc.setLineWidth(0.25);
    doc.rect(marginX - 1, startY - 2, contentWidth + 2, 136);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(copyLabel, pageWidth - marginX, startY + 1, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("CHOHAN MOTOR DRIVING SCHOOL", pageWidth / 2, startY + 9, {
      align: "center",
    });

    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(10);
    doc.text("Payment Receipt", pageWidth / 2, startY + 16, {
      align: "center",
    });

    drawSectionTitle("Student Details", startY + 24);
    drawFourColTable(startY + 26, [
      [
        "Student Name:",
        booking.customerName || booking.customer?.name || "-",
        "Mobile No:",
        booking.customerMobile || booking.customer?.contact1 || "-",
      ],
      [
        "Address:",
        booking.customer?.address || "-",
        "Alternate Mobile:",
        booking.customer?.contact2 || "-",
      ],
    ]);

    drawSectionTitle("Course Details", startY + 45);
    drawFourColTable(startY + 47, [
      [
        "Course Type:",
        booking.courseName || booking.course?.courseName || "-",
        "Vehicle Type:",
        booking.carName || booking.car?.carName || "-",
      ],
      ["Start Date:", formatDate(startDate), "End Date:", formatDate(endDate)],
      [
        "Receipt Valid Till:",
        getReceiptValidTillDate(booking.bookingDate),
        "Instructor:",
        instructor || "-",
      ],
    ]);

    drawSectionTitle("Payment Details", startY + 73);
    drawFourColTable(startY + 75, [
      [
        "Receipt No:",
        payment.paymentNumber || "-",
        "Date:",
        formatDate(payment.paymentDate),
      ],
      [
        "Total Course Fees:",
        `Rs. ${booking.totalAmount.toLocaleString("en-IN")}`,
        "Amount Received:",
        `Rs. ${payment.amount.toLocaleString("en-IN")}`,
      ],
      [
        "Balance:",
        `Rs. ${(paymentBalanceMap.get(payment.id) || 0).toLocaleString("en-IN")}`,
        "Payment Mode:",
        payment.paymentMethod || "-",
      ],
      [
        "Cheque / Ref No:",
        payment.transactionId || "-",
        "Bank Name:",
        payment.bankName || "-",
      ],
    ]);

    doc.setLineWidth(0.2);
    doc.line(marginX + 6, startY + 116, marginX + 78, startY + 116);
    doc.line(marginX + 112, startY + 116, marginX + 184, startY + 116);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Student Signature", marginX + 42, startY + 122, {
      align: "center",
    });
    doc.text("Authorized Signatory", marginX + 148, startY + 122, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.3);
    doc.text(
      "Note: Training sessions must be completed within 45 days from admission.",
      marginX,
      startY + 128,
    );
    doc.text(
      "Receipt validity is subject to course validity or LLR expiry, whichever is earlier. Fees once paid are non-refundable and non-transferable.",
      marginX,
      startY + 133,
    );
  };

  const handleReceiptAction = (
    payment: Payment,
    actionType: "view" | "download" | "whatsapp",
  ) => {
    if (!booking) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    drawReceiptCopy(doc, 8, "CLIENT COPY", payment);
    drawReceiptCopy(doc, 152, "OFFICE COPY", payment);

    const fileName = `receipt-${payment.paymentNumber || payment.id}.pdf`;

    if (actionType === "download") {
      doc.save(fileName);
      return;
    }

    if (actionType === "whatsapp") {
      // Download the PDF first
      doc.save(fileName);
      
      // Get the customer's WhatsApp number
      const phoneNumber = booking.customer?.contact1;
      
      if (!phoneNumber) {
        toast.error("Customer phone number not available");
        return;
      }
      
      // Clean the phone number (remove spaces, dashes, etc.)
      const cleanedNumber = phoneNumber.replace(/[^0-9+]/g, "");
      
      // Create WhatsApp message
      const message = encodeURIComponent(
        `Hello ${booking.customerName || booking.customer?.name || ""}, \n\nHere is your payment receipt for ${booking.courseName || "your course"}.\n\nReceipt Number: ${payment.paymentNumber || payment.id}\nAmount: ₹${payment.amount.toLocaleString("en-IN")}\nDate: ${formatDate(payment.paymentDate)}\n\nThank you for choosing Chohan Motor Driving School.`
      );
      
      // Open WhatsApp Web
      window.open(
        `https://wa.me/${cleanedNumber}?text=${message}`,
        "_blank",
        "noopener,noreferrer"
      );
      
      toast.success("PDF downloaded. WhatsApp opened - please attach the receipt.");
      return;
    }

    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

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

  // Update session mutation for attendance marking
  const updateSessionMutation = useMutation({
    mutationFn: async (data: {
      sessionId: number;
      status: "COMPLETED" | "NO_SHOW";
      notes: string;
    }) => {
      return await updateBookingSession({
        id: data.sessionId,
        status: data.status,
        attended: data.status === "COMPLETED",
        completedAt: new Date(),
        instructorNotes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-details", bookingId] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark attendance");
    },
  });

  // Update booking status to COMPLETED
  const completeCourseMutation = useMutation({
    mutationFn: async () => {
      if (!booking) {
        throw new Error("Booking not found");
      }
      return await updateBooking({
        id: booking.id,
        status: "COMPLETED",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-details", bookingId] });
      toast.success("Course completed successfully!");
      setCourseCompleteModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete course");
    },
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async ({
      id,
      updateType,
    }: {
      id: number;
      updateType: {
        amount?: number;
        paymentMethod?: string;
        transactionId?: string;
        bankName?: string;
        notes?: string;
        status?: string;
      };
    }) => {
      const res = await updatePayment(id, updateType);
      console.log("Update Payment Response:", res);
      if (!res.status || !res.data?.updatePayment) {
        throw new Error(res.message || "Payment update failed");
      }
      return res.data.updatePayment;
    },
    onSuccess: () => {
      toast.success("Payment updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["payments", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["payment-total", bookingId] });
      closeEditModal();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });

  const startEditCountdown = () => {
    setEditOtpCountdown(60);
    if (editTimerRef.current) clearInterval(editTimerRef.current);
    editTimerRef.current = setInterval(() => {
      setEditOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(editTimerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const closeEditModal = () => {
    if (editTimerRef.current) clearInterval(editTimerRef.current);
    setEditModalVisible(false);
    setEditingPayment(null);
    setEditStep("edit");
    setEditAdminContact("");
    setEditOtpCountdown(0);
    editForm.resetFields();
    editOtpForm.resetFields();
  };

  const handleEditPayment = async (payment: Payment) => {
    setEditLoading(true);
    try {
      const res = await getUserById(userId);
      if (!res.status || !res.data.getUserById) {
        toast.error("Unable to load admin profile. Please try again.");
        return;
      }
      const contact = res.data.getUserById.contact1;
      setEditAdminContact(contact);
      setEditingPayment(payment);
      editForm.setFieldsValue({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod || "CASH",
        transactionId: payment.transactionId || "",
        bankName: payment.bankName || "",
        notes: payment.notes || "",
        status: payment.status,
      });
      setEditStep("edit");
      setEditModalVisible(true);
    } catch {
      toast.error("Failed to open edit dialog. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditFormSubmit = async () => {
    setEditLoading(true);
    try {
      const res = await sendOtp(editAdminContact);
      if (!res.status) {
        toast.error(res.message || "Failed to send OTP");
        return;
      }
      startEditCountdown();
      setEditStep("otp");
      toast.success("OTP sent to your registered mobile number.");
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleResendEditOtp = async () => {
    if (editOtpCountdown > 0) return;
    setEditLoading(true);
    try {
      const res = await sendOtp(editAdminContact);
      if (!res.status) {
        toast.error(res.message || "Failed to resend OTP");
        return;
      }
      startEditCountdown();
      toast.success("OTP resent successfully");
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditOtpVerify = async (values: { otp: string }) => {
    if (!editingPayment) return;
    setEditLoading(true);
    try {
      const verifyRes = await verifyUserOtp(editAdminContact, values.otp);
      if (!verifyRes.status) {
        toast.error(verifyRes.message || "Invalid OTP. Please try again.");
        return;
      }
      const editValues = editForm.getFieldsValue() as {
        amount: number;
        paymentMethod: string;
        transactionId: string;
        bankName: string;
        notes: string;
        status: string;
      };
      await updatePaymentMutation.mutateAsync({
        id: editingPayment.id,
        updateType: {
          amount: editValues.amount,
          paymentMethod: editValues.paymentMethod || undefined,
          transactionId: editValues.transactionId || undefined,
          bankName: editValues.bankName || undefined,
          notes: editValues.notes || undefined,
          status: editValues.status,
        },
      });
    } catch {
      toast.error("OTP verification failed. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

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

  // Handle attendance marking
  const handleMarkAttendance = (session: BookingSession) => {
    setAttendanceModal({
      visible: true,
      session,
      notes: session.instructorNotes || "",
      status: "completed",
    });
  };

  const handleAttendanceSubmit = () => {
    if (!attendanceModal.session) return;

    updateSessionMutation.mutate({
      sessionId: attendanceModal.session.id,
      status: attendanceModal.status === "completed" ? "COMPLETED" : "NO_SHOW",
      notes: attendanceModal.notes,
    });

    setAttendanceModal({
      visible: false,
      session: null,
      notes: "",
      status: "completed",
    });
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
          <Descriptions.Item label="Slot">
            {convertSlotTo12Hour(booking.slot)}
          </Descriptions.Item>
          <Descriptions.Item label="Booking Date">
            {formatDate(booking.bookingDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            ₹{booking.totalAmount}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            {booking.location || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            {booking.notes || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-4"></div>

      <Card className="shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Info</h2>
          <div className="grow"></div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const studentKey = `id-${booking.customerId}`;
                router.push(
                  `/mtadmin/reports/students/${encodeURIComponent(studentKey)}`,
                );
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Form No. 15
            </button>
            {allSessionsCompleted && booking.status !== "COMPLETED" && (
              <button
                onClick={() => setCourseCompleteModal(true)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
              >
                <CheckCircleOutlined />
                Course Complete
              </button>
            )}
          </div>
        </div>
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
              sorter: (a, b) =>
                new Date(a.sessionDate).getTime() -
                new Date(b.sessionDate).getTime(),
              defaultSortOrder: "ascend",
              render: (date) => formatDate(date),
            },
            {
              title: "Slot",
              dataIndex: "slot",
              key: "slot",
              width: 110,
              render: (slot: string) => convertSlotTo12Hour(slot),
            },
            {
              title: "Car",
              key: "car",
              width: 150,
              render: (_, rec) => {
                const carData = sortedSessions.find((s) => s.id === rec.id);
                return carData?.carId
                  ? `${booking.car?.carName || booking.carName} (${carData.carId})`
                  : booking.car?.carName || booking.carName || "-";
              },
            },
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
            {
              title: "Mark Attendance",
              key: "markAttendance",
              width: 150,
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleMarkAttendance(record)}
                  disabled={
                    record.status === "COMPLETED" ||
                    record.status === "CANCELLED" ||
                    record.attended
                  }
                >
                  {record.attended || record.status === "COMPLETED"
                    ? "Marked"
                    : "Mark"}
                </Button>
              ),
            },
          ]}
          dataSource={sortedSessions}
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
                        record.schoolService?.service?.category == "NEW_LICENSE"
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
                {
                  title: "Action",
                  key: "action",
                  width: 100,
                  render: (_, record) => (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        const encodedId = encryptURLData(record.id.toString());
                        router.push(`/mtadmin/servicebookinglist/${encodedId}`);
                      }}
                    >
                      View
                    </Button>
                  ),
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
        <div className="flex justify-between items-center">
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
            {
              title: "Receipt",
              key: "receipt",
              width: 130,
              fixed: "right",
              render: (_, record) => (
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      {
                        key: "view",
                        icon: <EyeOutlined />,
                        label: "View PDF",
                      },
                      {
                        key: "download",
                        icon: <DownloadOutlined />,
                        label: "Download PDF",
                      },
                      {
                        key: "whatsapp",
                        icon: <WhatsAppOutlined />,
                        label: "Send on WhatsApp",
                      },
                    ],
                    onClick: ({ key }) =>
                      handleReceiptAction(record, key as "view" | "download" | "whatsapp"),
                  }}
                >
                  <Button icon={<FilePdfOutlined />} size="small">
                    Receipt
                  </Button>
                </Dropdown>
              ),
            },
            {
              title: "Edit",
              key: "edit",
              width: 80,
              fixed: "right",
              render: (_, record) => (
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  loading={editLoading && editingPayment?.id === record.id}
                  onClick={() => handleEditPayment(record)}
                >
                  Edit
                </Button>
              ),
            },
          ]}
          dataSource={payments}
          pagination={false}
          rowKey="id"
          size="small"
          scroll={{ x: 1220 }}
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

      {/* Attendance Marking Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <CheckCircleOutlined className="text-blue-600 text-lg" />
            </div>
            <span className="text-xl font-semibold">Mark Attendance</span>
          </div>
        }
        open={attendanceModal.visible}
        onOk={handleAttendanceSubmit}
        onCancel={() =>
          setAttendanceModal({
            visible: false,
            session: null,
            notes: "",
            status: "completed",
          })
        }
        okText="Submit Attendance"
        okButtonProps={{
          size: "large",
          loading: updateSessionMutation.isPending,
        }}
        cancelButtonProps={{ size: "large" }}
        width={650}
      >
        {attendanceModal.session && (
          <div className="space-y-6 py-4">
            <div className="bg-linear-to-br from-blue-50 to-purple-50 border border-blue-100 p-5 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4 text-base">
                Session Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 block mb-1">Student Name</span>
                  <span className="font-semibold text-gray-900">
                    {booking.customerName || booking.customer?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Mobile</span>
                  <span className="font-semibold text-gray-900">
                    {booking.customerMobile || booking.customer?.contact1}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Session Date</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(attendanceModal.session.sessionDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Time Slot</span>
                  <span className="font-semibold text-gray-900">
                    {convertSlotTo12Hour(attendanceModal.session.slot)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Course</span>
                  <span className="font-semibold text-gray-900">
                    {booking.courseName || booking.course?.courseName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">
                    Session Number
                  </span>
                  <span className="font-semibold text-gray-900">
                    Day {attendanceModal.session.dayNumber}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Attendance Status
              </label>
              <div className="flex gap-3">
                <Button
                  type={
                    attendanceModal.status === "completed"
                      ? "primary"
                      : "default"
                  }
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() =>
                    setAttendanceModal((prev) => ({
                      ...prev,
                      status: "completed",
                    }))
                  }
                  className={
                    attendanceModal.status === "completed"
                      ? "bg-green-600! border-green-600!"
                      : ""
                  }
                >
                  Session Completed
                </Button>
                <Button
                  type={
                    attendanceModal.status === "no_show" ? "primary" : "default"
                  }
                  size="large"
                  danger={attendanceModal.status === "no_show"}
                  icon={<ClockCircleOutlined />}
                  onClick={() =>
                    setAttendanceModal((prev) => ({
                      ...prev,
                      status: "no_show",
                    }))
                  }
                >
                  No Show / Cancelled
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Session Notes (Optional)
              </label>
              <Input.TextArea
                rows={4}
                placeholder="Enter feedback, student performance, areas of improvement, or any issues encountered during the session..."
                value={attendanceModal.notes}
                onChange={(e) =>
                  setAttendanceModal((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="text-base!"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Course Complete Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircleOutlined className="text-green-600 text-lg" />
            </div>
            <span className="text-xl font-semibold">Complete Course</span>
          </div>
        }
        open={courseCompleteModal}
        onOk={() => completeCourseMutation.mutate()}
        onCancel={() => setCourseCompleteModal(false)}
        okText="Complete Course"
        okButtonProps={{
          size: "large",
          loading: completeCourseMutation.isPending,
          className: "!bg-green-600 hover:!bg-green-700",
        }}
        cancelButtonProps={{ size: "large" }}
        width={650}
      >
        <div className="space-y-6 py-4">
          <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 p-5 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-4 text-base">
              Course Completion Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 block mb-1">Student Name</span>
                <span className="font-semibold text-gray-900">
                  {booking?.customerName || booking?.customer?.name}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Booking ID</span>
                <span className="font-semibold text-gray-900">
                  {booking?.bookingId}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Course Name</span>
                <span className="font-semibold text-gray-900">
                  {booking?.courseName || booking?.course?.courseName}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Total Sessions</span>
                <span className="font-semibold text-gray-900">
                  {sortedSessions.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Completed Sessions</span>
                <span className="font-semibold text-green-600">
                  {sortedSessions.filter((s) => s.status === "COMPLETED").length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Car Used</span>
                <span className="font-semibold text-gray-900">
                  {booking?.car?.carName || booking?.carName}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Course Duration</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(getCourseDateRange().startDate)} - {formatDate(getCourseDateRange().endDate)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Total Amount</span>
                <span className="font-semibold text-gray-900">
                  ₹{booking?.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircleOutlined className="text-blue-600 text-xl mt-1" />
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  All Sessions Completed
                </h5>
                <p className="text-sm text-gray-600">
                  All training sessions for this course have been successfully completed. 
                  Click &quot;Complete Course&quot; to mark this booking as completed. This action 
                  will update the booking status and cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {remainingAmount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <ClockCircleOutlined className="text-yellow-600 text-xl mt-1" />
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">
                    Pending Payment
                  </h5>
                  <p className="text-sm text-gray-600">
                    There is a pending payment of <strong>₹{remainingAmount.toLocaleString("en-IN")}</strong>. 
                    Please ensure all payments are collected before completing the course.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-600" />
            <span>
              {editStep === "edit" ? "Edit Payment" : "Verify OTP to Save"}
            </span>
          </div>
        }
        open={editModalVisible}
        onCancel={closeEditModal}
        footer={null}
        width={560}
      >
        <Steps
          current={editStep === "edit" ? 0 : 1}
          items={[{ title: "Edit Details" }, { title: "Verify OTP" }]}
          size="small"
          className="mb-6 mt-2"
        />

        {/* Step 1 — Edit fields */}
        {editStep === "edit" && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditFormSubmit}
            autoComplete="off"
          >
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item
                label="Amount"
                name="amount"
                rules={[
                  { required: true, message: "Amount is required" },
                  {
                    validator(_, value) {
                      if (!value || value < 1)
                        return Promise.reject(
                          new Error("Amount must be greater than 0"),
                        );
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber<number>
                  className="w-full"
                  prefix="₹"
                  min={1}
                  controls={false}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    parseFloat(value?.replace(/,/g, "") || "0")
                  }
                />
              </Form.Item>

              <Form.Item label="Payment Method" name="paymentMethod">
                <Select placeholder="Select method">
                  <Select.Option value="CASH">Cash</Select.Option>
                  <Select.Option value="CARD">Card</Select.Option>
                  <Select.Option value="UPI">UPI</Select.Option>
                  <Select.Option value="NET_BANKING">Net Banking</Select.Option>
                  <Select.Option value="CHEQUE">Cheque</Select.Option>
                  <Select.Option value="OTHER">Other</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item
                label="Transaction ID / Reference"
                name="transactionId"
              >
                <Input placeholder="Optional" />
              </Form.Item>

              <Form.Item label="Bank Name" name="bankName">
                <Input placeholder="Optional" />
              </Form.Item>
            </div>

            <Form.Item label="Status" name="status">
              <Select>
                <Select.Option value="COMPLETED">Completed</Select.Option>
                <Select.Option value="PENDING">Pending</Select.Option>
                <Select.Option value="FAILED">Failed</Select.Option>
                <Select.Option value="REFUNDED">Refunded</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Notes" name="notes">
              <Input.TextArea
                rows={3}
                placeholder="Optional notes about this payment"
              />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={closeEditModal}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={editLoading}
                className="bg-blue-600!"
              >
                Send OTP &amp; Update
              </Button>
            </div>
          </Form>
        )}

        {/* Step 2 — OTP verification */}
        {editStep === "otp" && (
          <Form
            form={editOtpForm}
            layout="vertical"
            onFinish={handleEditOtpVerify}
            autoComplete="off"
          >
            <p className="text-gray-500 text-sm mb-4">
              OTP sent to{" "}
              <span className="font-semibold text-gray-800">
                {editAdminContact}
              </span>
              . Enter it below to confirm the update.
            </p>

            <Form.Item
              label="Enter OTP"
              name="otp"
              rules={[
                { required: true, message: "Please enter the OTP" },
                { len: 6, message: "OTP must be 6 digits" },
                {
                  pattern: /^\d{6}$/,
                  message: "OTP must contain only digits",
                },
              ]}
            >
              <Input
                size="large"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="tracking-widest text-center text-lg font-mono"
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                {editOtpCountdown > 0 ? (
                  <>
                    Resend OTP in{" "}
                    <span className="font-semibold text-blue-600">
                      {editOtpCountdown}s
                    </span>
                  </>
                ) : (
                  "Didn't receive the OTP?"
                )}
              </span>
              <button
                type="button"
                disabled={editOtpCountdown > 0 || editLoading}
                onClick={handleResendEditOtp}
                className={`text-sm font-medium transition-colors ${
                  editOtpCountdown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-purple-600 cursor-pointer"
                }`}
              >
                Resend OTP
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => {
                  if (editTimerRef.current) clearInterval(editTimerRef.current);
                  setEditOtpCountdown(0);
                  editOtpForm.resetFields();
                  setEditStep("edit");
                }}
              >
                Back
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={editLoading || updatePaymentMutation.isPending}
                className="bg-blue-600!"
              >
                Verify &amp; Save
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default BookingDetailsPage;
