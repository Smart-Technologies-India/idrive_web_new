"use client";
import { FormProvider, useForm } from "react-hook-form";
import { onFormError } from "@/utils/methods";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { useState } from "react";
import { DateRangePicker } from "./inputfields/daterangepicker";
import { SlotMultiSelect } from "./inputfields/slotmultiselect";
import { MultiSelect } from "./inputfields/multiselect";
import { TaxtAreaInput } from "./inputfields/textareainput";
import { Radio, Modal, Button, Tag } from "antd";
import { OptionValue } from "@/models/main";
import {
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

type DeclarationType =
  | "ALL_CARS_MULTIPLE_DATES"
  | "ONE_CAR_MULTIPLE_DATES"
  | "ALL_CARS_PARTICULAR_SLOTS"
  | "ONE_CAR_PARTICULAR_SLOTS";

interface FormData {
  declarationType: DeclarationType;
  carId?: string;
  dateRange: string[];
  slots?: string[];
  reason: string;
}

const HolidayDeclarationPage = () => {
  const router = useRouter();
  const [declarationType, setDeclarationType] =
    useState<DeclarationType>("ALL_CARS_MULTIPLE_DATES");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  // Preset reason templates
  const reasonTemplates = [
    { icon: "🔧", label: "Maintenance", value: "Vehicle maintenance and servicing" },
    { icon: "🎉", label: "National Holiday", value: "National holiday - Office closed" },
    { icon: "🎊", label: "Festival", value: "Festival celebration" },
    { icon: "⚠️", label: "Emergency", value: "Emergency unavailability" },
    { icon: "🏖️", label: "Leave", value: "Driver on leave" },
    { icon: "📝", label: "Custom", value: "" },
  ];

  // Generate time slots from 7 AM to 10 PM with 1-hour intervals
  const generateTimeSlots = (): OptionValue[] => {
    const slots: OptionValue[] = [];
    for (let hour = 7; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
      const slotValue = `${startTime}-${endTime}`;
      slots.push({
        value: slotValue,
        label: slotValue,
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      declarationType: "ALL_CARS_MULTIPLE_DATES",
      dateRange: [],
      slots: [],
      reason: "",
      carId: undefined,
    },
  });

  // Reset form when declaration type changes
  const handleDeclarationTypeChange = (value: DeclarationType) => {
    setDeclarationType(value);
    methods.reset({
      declarationType: value,
      dateRange: [],
      slots: [],
      reason: "",
      carId: undefined,
    });
  };

  // Slot selection helpers
  const handleSlotQuickSelect = (type: "morning" | "afternoon" | "evening" | "all" | "clear") => {
    const currentSlots = methods.getValues("slots") || [];
    let newSlots: string[] = [];

    switch (type) {
      case "morning": // 7AM - 12PM
        newSlots = timeSlots.filter((slot) => {
          const hour = parseInt(slot.value.split(":")[0]);
          return hour >= 7 && hour < 12;
        }).map(s => s.value);
        break;
      case "afternoon": // 12PM - 5PM
        newSlots = timeSlots.filter((slot) => {
          const hour = parseInt(slot.value.split(":")[0]);
          return hour >= 12 && hour < 17;
        }).map(s => s.value);
        break;
      case "evening": // 5PM - 10PM
        newSlots = timeSlots.filter((slot) => {
          const hour = parseInt(slot.value.split(":")[0]);
          return hour >= 17 && hour < 22;
        }).map(s => s.value);
        break;
      case "all":
        newSlots = timeSlots.map(s => s.value);
        break;
      case "clear":
        newSlots = [];
        break;
    }

    // Merge with existing if not clear/all
    if (type !== "clear" && type !== "all") {
      newSlots = [...new Set([...currentSlots, ...newSlots])];
    }

    methods.setValue("slots", newSlots, { shouldValidate: true });
  };

  // Handle reason template selection
  const handleReasonTemplate = (template: string) => {
    if (template) {
      methods.setValue("reason", template, { shouldValidate: true });
    }
  };

  // Field completion status
  const formValues = methods.watch();
  const getFieldStatus = (fieldName: keyof FormData): boolean => {
    const value = formValues[fieldName];
    if (fieldName === "dateRange") {
      return Array.isArray(value) && value.length > 0;
    }
    if (fieldName === "slots") {
      return Array.isArray(value) && value.length > 0;
    }
    if (fieldName === "carId") {
      const needsCar = declarationType === "ONE_CAR_MULTIPLE_DATES" || 
                       declarationType === "ONE_CAR_PARTICULAR_SLOTS";
      return needsCar ? !!value : true;
    }
    return !!value && value !== "";
  };

  // Calculate completion percentage
  const calculateProgress = () => {
    const fields: (keyof FormData)[] = ["dateRange", "reason"];
    
    if (declarationType === "ONE_CAR_MULTIPLE_DATES" || 
        declarationType === "ONE_CAR_PARTICULAR_SLOTS") {
      fields.push("carId");
    }
    
    if (declarationType === "ALL_CARS_PARTICULAR_SLOTS" || 
        declarationType === "ONE_CAR_PARTICULAR_SLOTS") {
      fields.push("slots");
    }

    const completed = fields.filter(field => getFieldStatus(field)).length;
    return Math.round((completed / fields.length) * 100);
  };

  const progress = calculateProgress();

  // Custom validation
  const validateForm = (data: FormData): boolean => {
    // Validate date range
    if (!data.dateRange || data.dateRange.length === 0) {
      toast.error("Please select a date range");
      return false;
    }

    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(data.dateRange[0]);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error("Please select future dates only. Past and present dates are not allowed.");
      return false;
    }

    // Validate car selection for ONE_CAR types
    if (
      (declarationType === "ONE_CAR_MULTIPLE_DATES" ||
        declarationType === "ONE_CAR_PARTICULAR_SLOTS") &&
      !data.carId
    ) {
      toast.error("Please select a car");
      return false;
    }

    // Validate slots for PARTICULAR_SLOTS types
    if (
      (declarationType === "ALL_CARS_PARTICULAR_SLOTS" ||
        declarationType === "ONE_CAR_PARTICULAR_SLOTS") &&
      (!data.slots || data.slots.length === 0)
    ) {
      toast.error("Please select at least one time slot");
      return false;
    }

    // Validate reason
    if (!data.reason || data.reason.trim() === "") {
      toast.error("Please enter a reason for the holiday");
      return false;
    }

    return true;
  };

  type HolidayResponse = {
    id: string;
    message: string;
  };

  const createHoliday = useMutation({
    mutationKey: ["createHoliday"],
    mutationFn: async (data: FormData) => {
      const response = await ApiCall({
        query: `mutation CreateHoliday($inputType: CreateHolidayInput!) {
            createHoliday(inputType: $inputType) {
              id,
              message
            }
          }`,
        variables: {
          inputType: {
            declarationType: data.declarationType,
            carId: data.carId,
            dateRange: data.dateRange,
            slots: data.slots,
            reason: data.reason,
          },
        },
      });

      if (!response.status) {
        throw new Error(response.message);
      }

      if (!(response.data as Record<string, unknown>)["createHoliday"]) {
        throw new Error("Value not found in response");
      }
      return (response.data as Record<string, unknown>)[
        "createHoliday"
      ] as HolidayResponse;
    },

    onSuccess: () => {
      toast.success("Holiday declared successfully!");
      methods.reset();
      router.push("/mtadmin");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Sample car options - replace with actual API call
  const carOptions: OptionValue[] = [
    { label: "Car 1 - Toyota Camry (TN01AB1234)", value: "car1" },
    { label: "Car 2 - Honda Civic (TN02CD5678)", value: "car2" },
    { label: "Car 3 - Hyundai Creta (TN03EF9012)", value: "car3" },
    { label: "Car 4 - Maruti Swift (TN04GH3456)", value: "car4" },
    { label: "Car 5 - Mahindra XUV (TN05IJ7890)", value: "car5" },
  ];

  const onSubmit = async (data: FormData) => {
    if (validateForm(data)) {
      setPendingData(data);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmSubmit = () => {
    if (pendingData) {
      createHoliday.mutate(pendingData);
      setShowConfirmModal(false);
      setPendingData(null);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
    setPendingData(null);
  };

  // Calculate date range summary
  const getDateRangeSummary = () => {
    if (!pendingData?.dateRange || pendingData.dateRange.length === 0) return null;
    
    const startDate = new Date(pendingData.dateRange[0]);
    const endDate = new Date(pendingData.dateRange[1]);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      startDate: startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      totalDays: diffDays,
    };
  };

  const getTotalSlotsBlocked = () => {
    if (!pendingData) return 0;
    
    const dateRange = getDateRangeSummary();
    const days = dateRange?.totalDays || 0;
    
    if (declarationType === "ALL_CARS_MULTIPLE_DATES" || declarationType === "ONE_CAR_MULTIPLE_DATES") {
      return days * 15; // 15 slots per day
    } else {
      const slots = pendingData.slots?.length || 0;
      return days * slots;
    }
  };

  const declarationTypeOptions = [
    {
      label: "All Cars - Multiple Dates (Full Day)",
      value: "ALL_CARS_MULTIPLE_DATES",
    },
    {
      label: "One Car - Multiple Dates (Full Day)",
      value: "ONE_CAR_MULTIPLE_DATES",
    },
    {
      label: "All Cars - Specific Slots",
      value: "ALL_CARS_PARTICULAR_SLOTS",
    },
    {
      label: "One Car - Specific Slots",
      value: "ONE_CAR_PARTICULAR_SLOTS",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-4 md:mb-6 transform transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl md:text-4xl">🚫</span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Holiday & Slot Management
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 ml-0 md:ml-14">
            Block car availability by declaring holidays or specific time slots
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit(onSubmit, onFormError)}
                  className="space-y-6"
                >
              {/* Declaration Type Selection */}
              <div>
                <label className="text-base font-semibold mb-3 block text-gray-900">
                  Select Declaration Type
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <Radio.Group
                  value={declarationType}
                  onChange={(e) => handleDeclarationTypeChange(e.target.value)}
                  className="w-full"
                >
                  <div className="grid grid-cols-1 gap-3">
                    {declarationTypeOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`border-2 rounded-lg transition-all ${
                          declarationType === option.value
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <Radio
                          value={option.value}
                          className="w-full p-4"
                        >
                          <span className="ml-2 font-medium text-gray-800">
                            {option.label}
                          </span>
                        </Radio>
                      </div>
                    ))}
                  </div>
                </Radio.Group>
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              {/* Progress Indicator */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Form Completion</span>
                  <span className="text-sm font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Car Selection - Only for ONE_CAR types */}
              {(declarationType === "ONE_CAR_MULTIPLE_DATES" ||
                declarationType === "ONE_CAR_PARTICULAR_SLOTS") && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Select Car
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    {getFieldStatus("carId") && (
                      <CheckCircleOutlined className="text-green-500 text-lg" />
                    )}
                  </div>
                  <MultiSelect<FormData>
                    title=""
                    required={false}
                    name="carId"
                    options={carOptions}
                    placeholder="Choose a car to declare holiday"
                  />
                </div>
              )}

              {/* Date Range Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Select Date Range
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  {getFieldStatus("dateRange") && (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                  )}
                </div>
                <DateRangePicker<FormData>
                  title=""
                  required={false}
                  name="dateRange"
                  placeholder={["From Date", "To Date"]}
                  allowSingleDate={true}
                  futureOnly={true}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Only future dates can be selected. Past and present dates are disabled.
                </p>
              </div>

              {/* Slot Selection - Only for PARTICULAR_SLOTS types */}
              {(declarationType === "ALL_CARS_PARTICULAR_SLOTS" ||
                declarationType === "ONE_CAR_PARTICULAR_SLOTS") && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Select Time Slots to Block
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    {getFieldStatus("slots") && (
                      <CheckCircleOutlined className="text-green-500 text-lg" />
                    )}
                  </div>

                  {/* Quick Slot Selection Buttons */}
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-gray-600 mb-2">Quick Select:</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <Button
                        size="small"
                        onClick={() => handleSlotQuickSelect("morning")}
                        className="w-full"
                      >
                        🌅 Morning
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleSlotQuickSelect("afternoon")}
                        className="w-full"
                      >
                        ☀️ Afternoon
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleSlotQuickSelect("evening")}
                        className="w-full"
                      >
                        🌆 Evening
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleSlotQuickSelect("all")}
                        className="w-full"
                      >
                        ✅ Select All
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => handleSlotQuickSelect("clear")}
                        className="w-full"
                      >
                        ❌ Clear
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 bg-blue-50 rounded p-2 border border-blue-200">
                      <strong>Selected:</strong> {formValues.slots?.length || 0} slot(s)
                    </div>
                  </div>

                  <SlotMultiSelect<FormData>
                    title=""
                    required={false}
                    name="slots"
                    options={timeSlots}
                    placeholder="Choose time slots to block"
                  />
                </div>
              )}

              {/* Reason for Holiday */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Reason for Holiday
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  {getFieldStatus("reason") && (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                  )}
                </div>
                
                {/* Preset Reason Templates */}
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Quick Select:</p>
                  <div className="flex flex-wrap gap-2">
                    {reasonTemplates.map((template) => (
                      <Button
                        key={template.label}
                        size="small"
                        type={formValues.reason === template.value ? "primary" : "default"}
                        onClick={() => handleReasonTemplate(template.value)}
                        className="transition-all duration-200 hover:scale-105 transform"
                      >
                        {template.icon} {template.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <TaxtAreaInput<FormData>
                  title=""
                  required={false}
                  name="reason"
                  placeholder="Enter the reason for declaring this holiday (e.g., Maintenance, Festival, etc.)"
                  maxlength={500}
                />
              </div>

              <button
                type="submit"
                disabled={
                  methods.formState.isSubmitting || createHoliday.isPending || progress < 100
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                {createHoliday.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingOutlined className="animate-spin" />
                    Declaring Holiday...
                  </span>
                ) : progress < 100 ? (
                  `Complete form to submit (${progress}%)`
                ) : (
                  "🚫 Declare Holiday & Block Slots"
                )}
              </button>
                </form>
              </FormProvider>
            </div>
          </div>

          {/* Confirmation Modal */}
          <Modal
            title={
              <div className="flex items-center gap-2 text-xl">
                <span className="text-2xl">⚠️</span>
                <span>Confirm Holiday Declaration</span>
              </div>
            }
            open={showConfirmModal}
            onOk={handleConfirmSubmit}
            onCancel={handleCancelSubmit}
            okText="Confirm & Block"
            cancelText="Cancel"
            okButtonProps={{ 
              danger: true, 
              size: "large",
              loading: createHoliday.isPending 
            }}
            cancelButtonProps={{ size: "large" }}
            width={600}
            centered
          >
            {pendingData && (
              <div className="space-y-4 py-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Warning:</strong> This action will block car availability. Please review the details carefully.
                  </p>
                </div>

                {/* Summary Details */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Declaration Type</p>
                    <p className="font-semibold text-gray-900">
                      {declarationTypeOptions.find(opt => opt.value === declarationType)?.label}
                    </p>
                  </div>

                  {pendingData.carId && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Selected Car</p>
                      <p className="font-semibold text-gray-900">
                        {carOptions.find(car => car.value === pendingData.carId)?.label}
                      </p>
                    </div>
                  )}

                  {getDateRangeSummary() && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Date Range</p>
                      <p className="font-semibold text-gray-900">
                        {getDateRangeSummary()?.startDate} - {getDateRangeSummary()?.endDate}
                        <Tag color="blue" className="ml-2">
                          {getDateRangeSummary()?.totalDays} day(s)
                        </Tag>
                      </p>
                    </div>
                  )}

                  {pendingData.slots && pendingData.slots.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Time Slots</p>
                      <div className="flex flex-wrap gap-1">
                        {pendingData.slots.map((slot) => (
                          <Tag key={slot} color="orange">{slot}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Reason</p>
                    <p className="text-gray-900">{pendingData.reason}</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                    <p className="text-sm font-bold text-red-900 mb-1">
                      Total Slots to be Blocked
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {getTotalSlotsBlocked()} slots
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Info Sidebar - Mobile Responsive */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            {/* Quick Info */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-4 lg:p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-base lg:text-lg font-bold mb-3 flex items-center gap-2">
                📋 Quick Info
              </h3>
              <div className="space-y-2 lg:space-y-3 text-sm">
                <div className="bg-white/20 rounded-lg p-2 lg:p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/30">
                  <p className="font-semibold mb-1 text-xs lg:text-sm">Current Selection:</p>
                  <p className="text-blue-50 text-sm lg:text-base">
                    {
                      declarationTypeOptions.find(
                        (opt) => opt.value === declarationType
                      )?.label
                    }
                  </p>
                </div>
                {(declarationType === "ALL_CARS_MULTIPLE_DATES" ||
                  declarationType === "ALL_CARS_PARTICULAR_SLOTS") && (
                  <div className="bg-white/20 rounded-lg p-2 lg:p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/30">
                    <p className="font-semibold mb-1 text-xs lg:text-sm">Scope:</p>
                    <p className="text-blue-50 text-sm lg:text-base">🚗 Applies to All Cars</p>
                  </div>
                )}
                {(declarationType === "ALL_CARS_MULTIPLE_DATES" ||
                  declarationType === "ONE_CAR_MULTIPLE_DATES") && (
                  <div className="bg-white/20 rounded-lg p-2 lg:p-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/30">
                    <p className="font-semibold mb-1 text-xs lg:text-sm">Duration:</p>
                    <p className="text-blue-50 text-sm lg:text-base">
                      ⏰ Full Day (07:00 - 22:00)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Time Slots Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 transform transition-all duration-300 hover:shadow-md">
              <h3 className="text-base lg:text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
                ⏰ Available Time Slots
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {timeSlots.slice(0, 8).map((slot) => (
                  <div
                    key={slot.value}
                    className="bg-gray-50 rounded px-2 py-1.5 text-center text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    {slot.label}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                ...and {timeSlots.length - 8} more slots
              </p>
            </div>

            {/* Help Section */}
            <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-4 lg:p-6 transform transition-all duration-300 hover:shadow-md">
              <h3 className="text-base lg:text-lg font-bold mb-3 text-amber-900 flex items-center gap-2">
                💡 Tips
              </h3>
              <ul className="text-xs lg:text-sm text-amber-800 space-y-2">
                <li className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-200">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Only future dates can be selected</span>
                </li>
                <li className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-200">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>You can select a single date or a date range</span>
                </li>
                <li className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-200">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Multiple time slots can be selected together</span>
                </li>
                <li className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-200">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Provide a clear reason for better tracking</span>
                </li>
                <li className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-200">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Complete all fields to enable submission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayDeclarationPage;
