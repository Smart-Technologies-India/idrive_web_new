"use client";
import { FormProvider, useForm } from "react-hook-form";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { TextInput } from "./inputfields/textinput";
import { TaxtAreaInput } from "./inputfields/textareainput";
import { Modal, Button, Tag, Select, Checkbox, Spin } from "antd";
import {
  CheckCircleOutlined,
  CarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "antd";
import type {
  BookingFormData,
  Course,
  Addon,
  Customer,
} from "@/schema/booking";

// Mock data - Replace with API calls
const COURSES: Course[] = [
  {
    id: "course-1",
    name: "Basic Driving Course",
    description: "Learn fundamental driving skills",
    price: 5000,
    duration: "30 days",
  },
  {
    id: "course-2",
    name: "Advanced Driving Course",
    description: "Master advanced driving techniques",
    price: 8000,
    duration: "45 days",
  },
  {
    id: "course-3",
    name: "Highway Driving Course",
    description: "Highway and long-distance driving",
    price: 6500,
    duration: "20 days",
  },
  {
    id: "course-4",
    name: "Defensive Driving Course",
    description: "Safety-focused driving techniques",
    price: 7000,
    duration: "35 days",
  },
];

const ADDONS: Addon[] = [
  {
    id: "addon-1",
    name: "License Application Service",
    description: "Assistance with license application process",
    price: 1500,
  },
  {
    id: "addon-2",
    name: "RTO Documentation Support",
    description: "Complete RTO documentation support",
    price: 1000,
  },
  {
    id: "addon-3",
    name: "Medical Certificate Arrangement",
    description: "Medical certificate facilitation",
    price: 500,
  },
  {
    id: "addon-4",
    name: "Online Test Practice Access",
    description: "1-year access to online test platform",
    price: 800,
  },
  {
    id: "addon-5",
    name: "Extra Practice Sessions (5 hours)",
    description: "Additional 5 hours of driving practice",
    price: 2000,
  },
];

const BookingForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<BookingFormData | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [bookingDate, setBookingDate] = useState<Dayjs | null>(null);

  // Get car and slot from URL params
  const carId = searchParams.get("carId") || "";
  const carName = searchParams.get("carName") || "";
  const slot = searchParams.get("slot") || "";
  const minDateParam = searchParams.get("minDate") || ""; // For booked slots - free from date

  const methods = useForm<BookingFormData>({
    mode: "onChange",
    defaultValues: {
      carId,
      carName,
      slot,
      bookingDate: "",
      customerMobile: "",
      customerName: "",
      customerEmail: "",
      courseId: "",
      courseName: "",
      coursePrice: 0,
      addons: [],
      selectedAddons: [],
      totalAmount: 0,
      notes: "",
    },
  });

  const { watch, setValue } = methods;
  const formValues = watch();

  // Fetch customer details when mobile number is entered
  const fetchCustomerDetails = async (mobile: string) => {
    if (mobile.length < 10) {
      setCustomerData(null);
      return;
    }

    setLoadingCustomer(true);
    try {
      // Mock API call - Replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock customer data
      const mockCustomer: Customer = {
        mobile: mobile,
        name: "John Doe",
        email: "john.doe@example.com",
        licenseNumber: "TN1234567890",
        address: "123 Main Street, Chennai",
      };

      setCustomerData(mockCustomer);
      setValue("customerName", mockCustomer.name);
      setValue("customerEmail", mockCustomer.email);
      toast.success("Customer details loaded successfully!");
    } catch {
      toast.error("Failed to fetch customer details");
      setCustomerData(null);
    } finally {
      setLoadingCustomer(false);
    }
  };

  // Handle mobile number change with debounce
  useEffect(() => {
    const mobile = formValues.customerMobile;
    if (mobile && mobile.length >= 10) {
      const timer = setTimeout(() => {
        fetchCustomerDetails(mobile);
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.customerMobile]);

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setValue("courseId", course.id);
      setValue("courseName", course.name);
      setValue("coursePrice", course.price);
      calculateTotal(course.price, selectedAddons);
    }
  };

  // Handle addon selection
  const handleAddonToggle = (addonId: string) => {
    const newSelectedAddons = selectedAddons.includes(addonId)
      ? selectedAddons.filter((id) => id !== addonId)
      : [...selectedAddons, addonId];

    setSelectedAddons(newSelectedAddons);
    setValue("addons", newSelectedAddons);

    const addonsData = ADDONS.filter((a) => newSelectedAddons.includes(a.id));
    setValue("selectedAddons", addonsData);

    calculateTotal(selectedCourse?.price || 0, newSelectedAddons);
  };

  // Calculate total amount
  const calculateTotal = (coursePrice: number, addonIds: string[]) => {
    const addonsTotal = ADDONS.filter((a) => addonIds.includes(a.id)).reduce(
      (sum, addon) => sum + addon.price,
      0
    );

    const total = coursePrice + addonsTotal;
    setValue("totalAmount", total);
  };

  // Calculate progress
  const calculateProgress = (): number => {
    let completed = 0;
    const total = 6; // Total required fields

    if (formValues.carId && formValues.slot) completed++;
    if (formValues.bookingDate) completed++;
    if (formValues.customerMobile && formValues.customerMobile.length >= 10)
      completed++;
    if (customerData) completed++;
    if (formValues.courseId) completed++;
    if (formValues.totalAmount > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  // Validate form
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formValues.carId || !formValues.slot) {
      errors.push("Car and slot information is missing");
    }

    if (!formValues.bookingDate) {
      errors.push("Please select a booking date");
    } else {
      const selectedDate = dayjs(formValues.bookingDate);
      if (selectedDate.isBefore(dayjs(), "day")) {
        errors.push("Booking date must be in the future");
      }
    }

    if (!formValues.customerMobile || formValues.customerMobile.length < 10) {
      errors.push("Please enter a valid mobile number");
    }

    if (!customerData) {
      errors.push("Customer details could not be loaded");
    }

    if (!formValues.courseId) {
      errors.push("Please select a course");
    }

    if (formValues.totalAmount <= 0) {
      errors.push("Invalid booking amount");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Handle form submission
  const handleSubmit = () => {
    const validation = validateForm();

    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setPendingData(formValues);
    setShowConfirmModal(true);
  };

  // Mutation for API call
  const { mutate, isPending } = useMutation({
    mutationFn: (data: BookingFormData) => {
      return ApiCall({
        query: `mutation CreateBooking($data: BookingInput!) {
          createBooking(data: $data) {
            id
            success
          }
        }`,
        variables: { data },
      });
    },
    onSuccess: () => {
      toast.success("Booking created successfully!");
      setShowConfirmModal(false);
      router.push("/mtadmin/scheduler");
    },
    onError: () => {
      toast.error("Failed to create booking. Please try again.");
    },
  });

  // Confirm booking
  const confirmBooking = () => {
    if (pendingData) {
      mutate(pendingData);
    }
  };

  const progress = calculateProgress();

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOutlined className="text-blue-600" />
                  New Booking
                </h1>
                <p className="text-gray-600 mt-2">
                  Create a new car booking with course selection
                </p>
              </div>
              <Button
                type="default"
                size="large"
                onClick={() => router.push("/mtadmin/scheduler")}
              >
                Back to Schedule
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Booking Progress
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info Banner for Rebooked Slots */}
              {minDateParam && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-orange-300">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <p className="font-bold text-orange-800">This slot is currently booked</p>
                      <p className="text-sm text-orange-700">
                        Available for rebooking from <span className="font-bold">{dayjs(minDateParam).format('DD MMM YYYY')}</span> onwards
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Details Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CarOutlined className="text-blue-600" />
                  Booking Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CarOutlined className="text-blue-600" />
                      <span className="text-xs font-semibold text-gray-600">
                        Car
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {carName || "Not selected"}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <ClockCircleOutlined className="text-purple-600" />
                      <span className="text-xs font-semibold text-gray-600">
                        Time Slot
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {slot || "Not selected"}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarOutlined className="text-green-600" />
                      <span className="text-xs font-semibold text-gray-600">
                        Date
                      </span>
                    </div>
                    <DatePicker
                      value={bookingDate}
                      onChange={(date) => {
                        setBookingDate(date);
                        setValue(
                          "bookingDate",
                          date ? date.format("YYYY-MM-DD") : ""
                        );
                      }}
                      format="DD MMM YYYY"
                      size="large"
                      className="w-full"
                      disabledDate={(current) => {
                        // If coming from booked slot, allow dates from free date onwards
                        if (minDateParam) {
                          const minDate = dayjs(minDateParam);
                          return current && current.isBefore(minDate, "day");
                        }
                        // Otherwise, allow dates from tomorrow onwards
                        return (
                          current &&
                          current.isBefore(dayjs().add(1, "day"), "day")
                        );
                      }}
                      placeholder={minDateParam ? `Available from ${dayjs(minDateParam).format('DD MMM YYYY')}` : "Select date"}
                    />
                  </div>
                </div>
              </div>

              {/* Customer Details Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <UserOutlined className="text-blue-600" />
                  Customer Details
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <TextInput
                      name="customerMobile"
                      title="Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      required
                      maxlength={15}
                    />
                    {loadingCustomer && (
                      <div className="absolute right-3 top-11">
                        <Spin size="small" />
                      </div>
                    )}
                  </div>

                  {customerData && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircleOutlined className="text-green-600 text-xl" />
                        <span className="font-bold text-green-700">
                          Customer Found!
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-semibold text-gray-900">
                            {customerData.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-semibold text-gray-900">
                            {customerData.email}
                          </p>
                        </div>
                        {customerData.licenseNumber && (
                          <div>
                            <span className="text-gray-600">License:</span>
                            <p className="font-semibold text-gray-900">
                              {customerData.licenseNumber}
                            </p>
                          </div>
                        )}
                        {customerData.address && (
                          <div>
                            <span className="text-gray-600">Address:</span>
                            <p className="font-semibold text-gray-900">
                              {customerData.address}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Selection Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOutlined className="text-blue-600" />
                  Select Course
                </h2>

                <Select
                  size="large"
                  placeholder="Choose a driving course"
                  className="w-full mb-4"
                  onChange={handleCourseChange}
                  value={formValues.courseId || undefined}
                  popupClassName="course-dropdown"
                  options={COURSES.map((course) => ({
                    value: course.id,
                    label: course.name,
                  }))}
                  optionRender={(option) => {
                    const course = COURSES.find((c) => c.id === option.value);
                    if (!course) return null;
                    return (
                      <div className="py-1">
                        <div className="font-bold text-gray-900 text-sm">
                          {course.name}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {course.description}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-semibold text-blue-600">
                            ₹{course.price}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {course.duration}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <div className=" my-4"></div>
                {selectedCourse && (
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">
                          {selectedCourse.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedCourse.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Duration: {selectedCourse.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{selectedCourse.price}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Addons Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckSquareOutlined className="text-blue-600" />
                  License Services & Add-ons
                  <Tag color="blue" className="ml-2">
                    Optional
                  </Tag>
                </h2>

                <div className="space-y-3">
                  {ADDONS.map((addon) => (
                    <div
                      key={addon.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddons.includes(addon.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                      onClick={() => handleAddonToggle(addon.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedAddons.includes(addon.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900">
                              {addon.name}
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              ₹{addon.price}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {addon.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Additional Notes
                </h2>
                <TaxtAreaInput
                  name="notes"
                  title=""
                  placeholder="Any special requirements or notes..."
                  required={false}
                />
              </div>
            </div>

            {/* Summary - Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarOutlined className="text-green-600" />
                  Booking Summary
                </h2>

                <div className="space-y-4">
                  {/* Booking Info */}
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Car:</span>
                      <span className="font-semibold text-gray-900">
                        {carName || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Slot:</span>
                      <span className="font-semibold text-gray-900">
                        {slot || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingDate ? bookingDate.format("DD MMM YYYY") : "-"}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  {customerData && (
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-semibold text-gray-900">
                          {customerData.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-semibold text-gray-900">
                          {customerData.mobile}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Course */}
                  {selectedCourse && (
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Course:</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 text-sm">
                          {selectedCourse.name}
                        </span>
                        <span className="font-bold text-blue-600">
                          ₹{selectedCourse.price}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Addons */}
                  {selectedAddons.length > 0 && (
                    <div className="pb-4 border-b border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Add-ons:</div>
                      {ADDONS.filter((a) => selectedAddons.includes(a.id)).map(
                        (addon) => (
                          <div
                            key={addon.id}
                            className="flex items-center justify-between mb-2"
                          >
                            <span className="text-sm text-gray-900">
                              {addon.name}
                            </span>
                            <span className="text-sm font-semibold text-blue-600">
                              ₹{addon.price}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Total */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-3xl font-bold text-blue-600">
                        ₹{formValues.totalAmount || 0}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Including all courses and add-ons
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleSubmit}
                    disabled={progress < 100}
                    className="mt-6 h-12 text-lg font-semibold"
                    icon={<CheckCircleOutlined />}
                  >
                    Create Booking
                  </Button>

                  {progress < 100 && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Complete all required fields to create booking
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl">
            <CheckCircleOutlined className="text-blue-600" />
            <span>Confirm Booking</span>
          </div>
        }
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={[
          <Button
            key="cancel"
            size="large"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            size="large"
            loading={isPending}
            onClick={confirmBooking}
            icon={<CheckCircleOutlined />}
          >
            Confirm & Create Booking
          </Button>,
        ]}
        width={700}
      >
        {pendingData && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-3">Booking Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Car:</span>
                  <p className="font-semibold text-gray-900">
                    {pendingData.carName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Slot:</span>
                  <p className="font-semibold text-gray-900">
                    {pendingData.slot}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <p className="font-semibold text-gray-900">
                    {dayjs(pendingData.bookingDate).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-gray-900 mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-semibold text-gray-900">
                    {pendingData.customerName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Mobile:</span>
                  <p className="font-semibold text-gray-900">
                    {pendingData.customerMobile}
                  </p>
                </div>
                {pendingData.customerEmail && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Email:</span>
                    <p className="font-semibold text-gray-900">
                      {pendingData.customerEmail}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-3">Course & Add-ons</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {pendingData.courseName}
                  </span>
                  <span className="text-blue-600 font-bold">
                    ₹{pendingData.coursePrice}
                  </span>
                </div>
                {pendingData.selectedAddons &&
                  pendingData.selectedAddons.length > 0 && (
                    <div className="pt-2 border-t border-purple-200">
                      <p className="text-xs text-gray-600 mb-2">
                        Selected Add-ons:
                      </p>
                      {pendingData.selectedAddons.map((addon) => (
                        <div
                          key={addon.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700">• {addon.name}</span>
                          <span className="text-blue-600 font-semibold">
                            ₹{addon.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-300">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  Total Amount
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  ₹{pendingData.totalAmount}
                </span>
              </div>
            </div>

            {pendingData.notes && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-700">{pendingData.notes}</p>
              </div>
            )}
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

        .course-dropdown .ant-select-item {
          padding: 8px 12px !important;
        }

        .course-dropdown .ant-select-item-option-content {
          white-space: normal !important;
        }
      `}</style>
    </FormProvider>
  );
};

export default BookingForm;
