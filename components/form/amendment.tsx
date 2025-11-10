"use client";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { useState } from "react";
import { TextInput } from "./inputfields/textinput";
import { TaxtAreaInput } from "./inputfields/textareainput";
import { Modal, Button, Tag, Radio, Checkbox, Card, Empty, Badge, DatePicker } from "antd";
import {
  SearchOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  PhoneOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
  SwapOutlined,
  DeleteOutlined,
  ToolOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { AmendmentFormData, BookingWithDates, AmendmentAction } from "@/schema/amendment";

// Mock bookings data
const generateMockBookings = (mobile?: string, bookingId?: string): BookingWithDates[] => {
  if (bookingId) {
    // Return single booking by ID
    return [{
      id: bookingId,
      bookingReference: `BK${bookingId.slice(-6).toUpperCase()}`,
      customerName: "John Doe",
      customerMobile: "9876543210",
      customerEmail: "john.doe@example.com",
      carId: "car-1",
      carName: "Car 1",
      carModel: "Toyota Camry",
      slot: "09:00-10:00",
      courseName: "Basic Driving Course",
      coursePrice: 5000,
      totalAmount: 6500,
      bookingDates: [
        { id: "bd1", date: "2025-11-11", status: "scheduled" },
        { id: "bd2", date: "2025-11-12", status: "scheduled" },
        { id: "bd3", date: "2025-11-13", status: "scheduled" },
        { id: "bd4", date: "2025-11-14", status: "scheduled" },
        { id: "bd5", date: "2025-11-15", status: "scheduled" },
      ],
      status: "active",
      createdAt: "2025-11-08",
    }];
  }

  // Return multiple bookings by mobile
  return [
    {
      id: "booking-1",
      bookingReference: "BK001234",
      customerName: "John Doe",
      customerMobile: mobile || "9876543210",
      customerEmail: "john.doe@example.com",
      carId: "car-1",
      carName: "Car 1",
      carModel: "Toyota Camry",
      slot: "09:00-10:00",
      courseName: "Basic Driving Course",
      coursePrice: 5000,
      totalAmount: 6500,
      bookingDates: [
        { id: "bd1", date: "2025-11-11", status: "scheduled" },
        { id: "bd2", date: "2025-11-12", status: "scheduled" },
        { id: "bd3", date: "2025-11-13", status: "scheduled" },
        { id: "bd4", date: "2025-11-15", status: "scheduled" },
        { id: "bd5", date: "2025-11-16", status: "scheduled" },
      ],
      status: "active",
      createdAt: "2025-11-08",
    },
    {
      id: "booking-2",
      bookingReference: "BK002345",
      customerName: "John Doe",
      customerMobile: mobile || "9876543210",
      customerEmail: "john.doe@example.com",
      carId: "car-3",
      carName: "Car 3",
      carModel: "Honda Civic",
      slot: "14:00-15:00",
      courseName: "Advanced Driving Course",
      coursePrice: 8000,
      totalAmount: 9000,
      bookingDates: [
        { id: "bd6", date: "2025-11-10", status: "completed" },
        { id: "bd7", date: "2025-11-12", status: "scheduled" },
        { id: "bd8", date: "2025-11-14", status: "scheduled" },
        { id: "bd9", date: "2025-11-17", status: "cancelled", cancelReason: "Customer request", cancelledAt: "2025-11-09" },
      ],
      status: "partial",
      createdAt: "2025-11-05",
    },
    {
      id: "booking-3",
      bookingReference: "BK003456",
      customerName: "John Doe",
      customerMobile: mobile || "9876543210",
      customerEmail: "john.doe@example.com",
      carId: "car-2",
      carName: "Car 2",
      carModel: "Hyundai Creta",
      slot: "11:00-12:00",
      courseName: "Highway Driving Course",
      coursePrice: 6500,
      totalAmount: 6500,
      bookingDates: [
        { id: "bd10", date: "2025-11-20", status: "scheduled" },
        { id: "bd11", date: "2025-11-22", status: "scheduled" },
        { id: "bd12", date: "2025-11-24", status: "scheduled" },
      ],
      status: "active",
      createdAt: "2025-11-09",
    },
  ];
};

const AmendmentForm = () => {
  const router = useRouter();
  const [searchMethod, setSearchMethod] = useState<"mobile" | "bookingId">("mobile");
  const [bookings, setBookings] = useState<BookingWithDates[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDates | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [amendmentAction, setAmendmentAction] = useState<AmendmentAction | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [newDates, setNewDates] = useState<Dayjs[]>([]);

  const methods = useForm<AmendmentFormData>({
    mode: "onChange",
    defaultValues: {
      searchMethod: "mobile",
      customerMobile: "",
      bookingId: "",
      selectedBookingId: "",
      amendmentAction: undefined,
      selectedDates: [],
      newDate: "",
      reason: "",
    },
  });

  const { watch, setValue } = methods;
  const formValues = watch();

  // Search for bookings
  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let results: BookingWithDates[] = [];
      if (searchMethod === "mobile" && formValues.customerMobile) {
        results = generateMockBookings(formValues.customerMobile);
      } else if (searchMethod === "bookingId" && formValues.bookingId) {
        results = generateMockBookings(undefined, formValues.bookingId);
      }

      if (results.length === 0) {
        toast.error("No bookings found");
      } else {
        toast.success(`Found ${results.length} booking${results.length > 1 ? 's' : ''}`);
      }

      setBookings(results);
      setSelectedBooking(null);
      setSelectedDates([]);
      setAmendmentAction(null);
    } catch {
      toast.error("Failed to search bookings");
    } finally {
      setLoadingSearch(false);
    }
  };

  // Select booking
  const handleSelectBooking = (booking: BookingWithDates) => {
    setSelectedBooking(booking);
    setValue("selectedBookingId", booking.id);
    setSelectedDates([]);
    setAmendmentAction(null);
    setNewDates([]);
  };

  // Toggle date selection
  const handleToggleDate = (dateId: string, date: string) => {
    const newSelected = selectedDates.includes(date)
      ? selectedDates.filter(d => d !== date)
      : [...selectedDates, date];
    setSelectedDates(newSelected);
    setValue("selectedDates", newSelected);
  };

  // Handle action change
  const handleActionChange = (action: AmendmentAction) => {
    setAmendmentAction(action);
    setValue("amendmentAction", action);
    setSelectedDates([]);
    setNewDates([]);
  };

  // Handle new date selection for date change
  const handleNewDateChange = (date: Dayjs | null, index: number) => {
    if (!date) return;
    
    const updatedDates = [...newDates];
    updatedDates[index] = date;
    setNewDates(updatedDates);
    
    // Update form value with all new dates
    const dateStrings = updatedDates.map(d => d.format("YYYY-MM-DD")).join(",");
    setValue("newDate", dateStrings);
  };

  // Get the earliest date from course start
  const getMinAllowedDate = () => {
    if (!selectedBooking) return dayjs().add(1, 'day');
    
    // Get the earliest date from the booking
    const earliestBookingDate = selectedBooking.bookingDates
      .filter(d => d.status === "scheduled")
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))[0];
    
    if (earliestBookingDate) {
      return dayjs(earliestBookingDate.date);
    }
    
    return dayjs().add(1, 'day');
  };

  // Validate form
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!selectedBooking) {
      errors.push("Please select a booking");
    }

    if (!amendmentAction) {
      errors.push("Please select an action");
    }

    if (amendmentAction === "CANCEL_BOOKING" && selectedDates.length === 0) {
      errors.push("Please select at least one date to cancel");
    }

    if (amendmentAction === "CHANGE_DATE") {
      if (selectedDates.length === 0) {
        errors.push("Please select dates to change");
      }
      if (newDates.length !== selectedDates.length) {
        errors.push(`Please select ${selectedDates.length} new date${selectedDates.length > 1 ? 's' : ''} to replace the selected dates`);
      }
      // Validate all new dates are filled
      if (newDates.some(d => !d)) {
        errors.push("Please fill all new date fields");
      }
    }

    if (!formValues.reason || formValues.reason.trim() === "") {
      errors.push("Please provide a reason for the amendment");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Handle submit
  const handleSubmit = () => {
    const validation = validateForm();

    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setShowConfirmModal(true);
  };

  // Mutation for amendment
  const { mutate, isPending } = useMutation({
    mutationFn: (data: AmendmentFormData) => {
      return ApiCall({
        query: `mutation AmendBooking($data: AmendmentInput!) {
          amendBooking(data: $data) {
            success
            message
          }
        }`,
        variables: { data },
      });
    },
    onSuccess: () => {
      toast.success("Amendment processed successfully!");
      setShowConfirmModal(false);
      // Reset form
      setBookings([]);
      setSelectedBooking(null);
      setSelectedDates([]);
      setAmendmentAction(null);
      methods.reset();
    },
    onError: () => {
      toast.error("Failed to process amendment. Please try again.");
    },
  });

  const confirmAmendment = () => {
    if (newDates.length > 0) {
      const dateStrings = newDates.map(d => d.format("YYYY-MM-DD")).join(",");
      setValue("newDate", dateStrings);
    }
    mutate(formValues);
  };

  const actionIcons = {
    CANCEL_BOOKING: <DeleteOutlined className="text-red-600" />,
    CHANGE_DATE: <SwapOutlined className="text-blue-600" />,
    CAR_BREAKDOWN: <ToolOutlined className="text-orange-600" />,
    CAR_HOLIDAY: <StopOutlined className="text-purple-600" />,
  };

  const actionColors = {
    CANCEL_BOOKING: "red",
    CHANGE_DATE: "blue",
    CAR_BREAKDOWN: "orange",
    CAR_HOLIDAY: "purple",
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <ExclamationCircleOutlined className="text-orange-600" />
                  Booking Amendment
                </h1>
                <p className="text-gray-600 mt-2">Manage cancellations, date changes, and booking modifications</p>
              </div>
              <Button
                type="default"
                size="large"
                onClick={() => router.push("/mtadmin/scheduler")}
              >
                Back to Schedule
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Section - Left */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search Method Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <SearchOutlined className="text-blue-600" />
                  Search Booking
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Search By
                    </label>
                    <Radio.Group
                      value={searchMethod}
                      onChange={(e) => {
                        setSearchMethod(e.target.value);
                        setValue("searchMethod", e.target.value);
                        setBookings([]);
                        setSelectedBooking(null);
                      }}
                      className="w-full"
                    >
                      <Radio.Button value="mobile" className="w-1/2 text-center">
                        <PhoneOutlined className="mr-2" />
                        Mobile Number
                      </Radio.Button>
                      <Radio.Button value="bookingId" className="w-1/2 text-center">
                        <BookOutlined className="mr-2" />
                        Booking ID
                      </Radio.Button>
                    </Radio.Group>
                  </div>

                  {searchMethod === "mobile" ? (
                    <TextInput
                      name="customerMobile"
                      title="Customer Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      required={true}
                      maxlength={15}
                    />
                  ) : (
                    <TextInput
                      name="bookingId"
                      title="Booking ID"
                      placeholder="Enter booking reference ID"
                      required={true}
                    />
                  )}

                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    loading={loadingSearch}
                    disabled={
                      loadingSearch ||
                      (searchMethod === "mobile" && !formValues.customerMobile) ||
                      (searchMethod === "bookingId" && !formValues.bookingId)
                    }
                  >
                    Search Bookings
                  </Button>
                </div>
              </div>

              {/* Bookings List */}
              {bookings.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Found Bookings ({bookings.length})
                  </h2>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bookings.map((booking) => (
                      <Card
                        key={booking.id}
                        size="small"
                        className={`cursor-pointer transition-all border-2 ${
                          selectedBooking?.id === booking.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => handleSelectBooking(booking)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{booking.bookingReference}</span>
                            <Badge
                              status={
                                booking.status === "active" ? "success" :
                                booking.status === "partial" ? "warning" :
                                booking.status === "cancelled" ? "error" : "default"
                              }
                              text={booking.status.toUpperCase()}
                            />
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <CarOutlined className="text-blue-600" />
                              <span>{booking.carName} - {booking.carModel}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockCircleOutlined className="text-purple-600" />
                              <span>{booking.slot}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOutlined className="text-green-600" />
                              <span>{booking.courseName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarOutlined className="text-orange-600" />
                              <span>{booking.bookingDates.length} sessions</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Section - Right */}
            <div className="lg:col-span-2 space-y-6">
              {!selectedBooking ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
                  <Empty
                    description={
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-700 mb-2">No Booking Selected</p>
                        <p className="text-sm text-gray-500">Search and select a booking to view details and make amendments</p>
                      </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <>
                  {/* Booking Details Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <BookOutlined className="text-blue-600" />
                      Booking Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Booking Reference</div>
                        <div className="font-bold text-lg text-gray-900">{selectedBooking.bookingReference}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <div className="text-xs text-gray-600 mb-1">Customer</div>
                        <div className="font-bold text-lg text-gray-900">{selectedBooking.customerName}</div>
                        <div className="text-sm text-gray-600">{selectedBooking.customerMobile}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">Car & Slot</div>
                        <div className="font-bold text-gray-900">{selectedBooking.carName}</div>
                        <div className="text-sm text-gray-600">{selectedBooking.slot}</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                        <div className="text-xs text-gray-600 mb-1">Course</div>
                        <div className="font-bold text-gray-900">{selectedBooking.courseName}</div>
                        <div className="text-sm text-blue-600 font-semibold">₹{selectedBooking.totalAmount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Dates Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <CalendarOutlined className="text-green-600" />
                      Booked Dates ({selectedBooking.bookingDates.length})
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedBooking.bookingDates.map((bookingDate) => {
                        const isFuture = dayjs(bookingDate.date).isAfter(dayjs(), 'day');
                        const isSelected = selectedDates.includes(bookingDate.date);
                        const isDisabled = bookingDate.status !== "scheduled" || !isFuture;

                        return (
                          <div
                            key={bookingDate.id}
                            className={`relative rounded-lg p-3 border-2 transition-all ${
                              isDisabled
                                ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                                : isSelected
                                ? "bg-blue-100 border-blue-500 cursor-pointer"
                                : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
                            }`}
                            onClick={() => {
                              if (!isDisabled && amendmentAction) {
                                handleToggleDate(bookingDate.id, bookingDate.date);
                              }
                            }}
                          >
                            {amendmentAction && !isDisabled && (
                              <Checkbox
                                checked={isSelected}
                                className="absolute top-2 right-2"
                              />
                            )}
                            <div className="text-center">
                              <div className="font-bold text-gray-900">
                                {dayjs(bookingDate.date).format('DD MMM')}
                              </div>
                              <div className="text-xs text-gray-600">
                                {dayjs(bookingDate.date).format('YYYY')}
                              </div>
                              <div className="mt-2">
                                <Tag
                                  color={
                                    bookingDate.status === "completed" ? "success" :
                                    bookingDate.status === "cancelled" ? "error" :
                                    isFuture ? "processing" : "default"
                                  }
                                  className="text-xs"
                                >
                                  {bookingDate.status === "completed" ? "Done" :
                                   bookingDate.status === "cancelled" ? "Cancelled" :
                                   isFuture ? "Upcoming" : "Past"}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                      <strong>Note:</strong> Only future scheduled dates can be modified
                    </div>
                  </div>

                  {/* Amendment Action Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <ExclamationCircleOutlined className="text-orange-600" />
                      Select Action
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction === "CANCEL_BOOKING"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-red-400"
                        }`}
                        onClick={() => handleActionChange("CANCEL_BOOKING")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <DeleteOutlined className="text-2xl text-red-600" />
                          <span className="font-bold text-gray-900">Cancel Booking</span>
                        </div>
                        <p className="text-sm text-gray-600">Cancel selected dates or entire booking</p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction === "CHANGE_DATE"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                        onClick={() => handleActionChange("CHANGE_DATE")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <SwapOutlined className="text-2xl text-blue-600" />
                          <span className="font-bold text-gray-900">Change Date</span>
                        </div>
                        <p className="text-sm text-gray-600">Reschedule booking to a new date</p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction === "CAR_BREAKDOWN"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300 hover:border-orange-400"
                        }`}
                        onClick={() => handleActionChange("CAR_BREAKDOWN")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <ToolOutlined className="text-2xl text-orange-600" />
                          <span className="font-bold text-gray-900">Car Breakdown</span>
                        </div>
                        <p className="text-sm text-gray-600">Report car breakdown for refund/reschedule</p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction === "CAR_HOLIDAY"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-300 hover:border-purple-400"
                        }`}
                        onClick={() => handleActionChange("CAR_HOLIDAY")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <StopOutlined className="text-2xl text-purple-600" />
                          <span className="font-bold text-gray-900">Car Holiday</span>
                        </div>
                        <p className="text-sm text-gray-600">Mark car as unavailable for holiday</p>
                      </div>
                    </div>

                    {amendmentAction && (
                      <div className="space-y-4 animate-fadeIn">
                        {amendmentAction === "CHANGE_DATE" && selectedDates.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              New Dates (Select {selectedDates.length} replacement date{selectedDates.length > 1 ? 's' : ''})
                            </label>
                            <div className="space-y-3">
                              {selectedDates.map((oldDate, index) => (
                                <div key={oldDate} className="bg-white rounded-lg p-3 border border-blue-300">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="flex-1">
                                      <div className="text-xs text-gray-600 mb-1">
                                        Replacing: <span className="font-semibold text-gray-900">{dayjs(oldDate).format('DD MMM YYYY')}</span>
                                      </div>
                                      <DatePicker
                                        value={newDates[index] || null}
                                        onChange={(date) => handleNewDateChange(date, index)}
                                        format="DD MMM YYYY"
                                        size="large"
                                        className="w-full"
                                        disabledDate={(current) => {
                                          const minDate = getMinAllowedDate();
                                          return current && current.isBefore(minDate, 'day');
                                        }}
                                        placeholder={`Select new date (from ${getMinAllowedDate().format('DD MMM YYYY')})`}
                                      />
                                    </div>
                                    <div className="text-2xl text-blue-600">
                                      <SwapOutlined />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded p-2">
                              <strong>Note:</strong> New dates must be from {getMinAllowedDate().format('DD MMM YYYY')} onwards (based on your course start date)
                            </div>
                          </div>
                        )}

                        <div>
                          <TaxtAreaInput
                            name="reason"
                            title="Reason for Amendment"
                            placeholder="Please provide a detailed reason for this amendment..."
                            required={true}
                          />
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                          <div className="flex items-start gap-3">
                            <ExclamationCircleOutlined className="text-yellow-600 text-xl mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-yellow-800 mb-1">Selected Dates: {selectedDates.length}</p>
                              <p className="text-yellow-700">
                                {selectedDates.length === 0 
                                  ? "Please select dates from the calendar above to proceed"
                                  : `${selectedDates.map(d => dayjs(d).format('DD MMM')).join(', ')}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="primary"
                          size="large"
                          block
                          icon={actionIcons[amendmentAction]}
                          onClick={handleSubmit}
                          disabled={
                            selectedDates.length === 0 || 
                            !formValues.reason ||
                            (amendmentAction === "CHANGE_DATE" && newDates.length !== selectedDates.length)
                          }
                          danger={amendmentAction === "CANCEL_BOOKING"}
                          className="mt-4"
                        >
                          Process Amendment
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl">
            {amendmentAction && actionIcons[amendmentAction]}
            <span>Confirm Amendment</span>
          </div>
        }
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={[
          <Button key="cancel" size="large" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            size="large"
            loading={isPending}
            onClick={confirmAmendment}
            danger={amendmentAction === "CANCEL_BOOKING"}
            icon={amendmentAction ? actionIcons[amendmentAction] : undefined}
          >
            Confirm Amendment
          </Button>,
        ]}
        width={700}
      >
        {selectedBooking && amendmentAction && (
          <div className="space-y-4">
            <div className={`bg-${actionColors[amendmentAction]}-50 rounded-lg p-4 border border-${actionColors[amendmentAction]}-200`}>
              <h3 className="font-bold text-gray-900 mb-3">Amendment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Action:</span>
                  <Tag color={actionColors[amendmentAction]} className="font-semibold">
                    {amendmentAction.replace("_", " ")}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.bookingReference}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Selected Dates:</span>
                  <span className="font-semibold text-gray-900">{selectedDates.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Dates to be Modified</h3>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map(date => (
                  <Tag key={date} color="blue" className="text-sm">
                    {dayjs(date).format('DD MMM YYYY')}
                  </Tag>
                ))}
              </div>
            </div>

            {amendmentAction === "CHANGE_DATE" && newDates.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">Date Changes</h3>
                <div className="space-y-2">
                  {selectedDates.map((oldDate, index) => (
                    <div key={oldDate} className="flex items-center justify-between text-sm bg-white rounded p-2 border border-green-300">
                      <div>
                        <span className="text-gray-600">Old: </span>
                        <span className="font-semibold text-red-600">{dayjs(oldDate).format('DD MMM YYYY')}</span>
                      </div>
                      <SwapOutlined className="text-blue-600" />
                      <div>
                        <span className="text-gray-600">New: </span>
                        <span className="font-semibold text-green-600">
                          {newDates[index] ? newDates[index].format('DD MMM YYYY') : 'Not selected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h3 className="font-bold text-gray-900 mb-2">Reason</h3>
              <p className="text-sm text-gray-700">{formValues.reason}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-300">
              <div className="flex items-start gap-2">
                <ExclamationCircleOutlined className="text-red-600 text-xl mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-red-800 mb-1">Warning</p>
                  <p className="text-red-700">
                    This action cannot be undone. Please confirm that all details are correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </FormProvider>
  );
};

export default AmendmentForm;
