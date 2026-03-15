"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, Button, Tag, Descriptions, Spin, Empty, Timeline } from "antd";
import { IcBaselineArrowBack } from "@/components/icons";
import { getHolidayById } from "@/services/holiday.api";
import { formatDate, formatDateShort, formatDateTime } from "@/utils/date-format";

const HolidayViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const holidayId = parseInt(params.holidayId as string);

  const {
    data: holidayResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["holiday", holidayId],
    queryFn: () => getHolidayById(holidayId),
    enabled: !!holidayId && !isNaN(holidayId),
  });

  const holiday = holidayResponse?.data?.getHolidayById;
  console.log("Fetched holiday data:", holiday);

  // Calculate status based on dates
  const getHolidayStatus = (
    startDate: string,
    endDate: string
  ): "active" | "expired" | "upcoming" => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (today > end) return "expired";
    if (today < start) return "upcoming";
    return "active";
  };

  // Calculate duration in days
  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };


  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      expired: "default",
      upcoming: "blue",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: "Active",
      expired: "Expired",
      upcoming: "Upcoming",
    };
    return texts[status] || status;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ALL_CARS_MULTIPLE_DATES: "purple",
      ONE_CAR_MULTIPLE_DATES: "blue",
      ALL_CARS_PARTICULAR_SLOTS: "orange",
      ONE_CAR_PARTICULAR_SLOTS: "cyan",
    };
    return colors[type] || "default";
  };

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      ALL_CARS_MULTIPLE_DATES: "All Cars - Multiple Dates (Full Day)",
      ONE_CAR_MULTIPLE_DATES: "One Car - Multiple Dates (Full Day)",
      ALL_CARS_PARTICULAR_SLOTS: "All Cars - Particular Slots",
      ONE_CAR_PARTICULAR_SLOTS: "One Car - Particular Slots",
    };
    return texts[type] || type;
  };

  // Get slots array, parse if needed
  const getSlots = (slotsData: string[] | string | null | undefined): string[] => {
    if (!slotsData) return [];
    // Safety check: parse slots if it's a string
    if (typeof slotsData === 'string') {
      try {
        return JSON.parse(slotsData);
      } catch (error) {
        console.error('Error parsing slots:', error);
        return [];
      }
    }
    return slotsData;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading holiday details..." />
      </div>
    );
  }

  if (error || !holiday) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card>
          <Empty
            description="Holiday not found or failed to load"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => router.back()}>
              Go Back
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const status = getHolidayStatus(holiday.startDate, holiday.endDate);
  const duration = calculateDuration(holiday.startDate, holiday.endDate);
  const slots = getSlots(holiday.slots);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button
                type="text"
                icon={<IcBaselineArrowBack />}
                onClick={() => router.back()}
                className="mb-2"
              >
                Back to Holidays
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">🚫</span>
                Holiday Details
                <Tag
                  color={getStatusColor(status)}
                  className="!text-base !px-4 !py-1"
                >
                  {getStatusText(status)}
                </Tag>
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                View complete holiday declaration information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Declaration Type & Scope */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-xl">ℹ️</span>
                  <span>Declaration Information</span>
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Holiday ID">
                  <span className="font-mono font-semibold">#{holiday.id}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Declaration Type">
                  <Tag
                    color={getTypeColor(holiday.declarationType)}
                    className="!text-sm !px-3 !py-1"
                  >
                    {getTypeText(holiday.declarationType)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Scope">
                  {holiday.car ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚗</span>
                      <span className="font-medium">
                        {holiday.car.carName} {holiday.car.model}
                      </span>
                      <Tag color="blue">{holiday.car.registrationNumber}</Tag>
                    </div>
                  ) : (
                    <Tag color="purple" className="!text-sm !px-3 !py-1">
                      All Cars in School
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={getStatusColor(status)}
                    className="!text-sm !px-3 !py-1 !font-medium"
                  >
                    {getStatusText(status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <div></div>
            {/* Date Information */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <span>Date & Duration</span>
                </div>
              }
              className="shadow-sm"
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Start Date">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base">
                      {formatDate(holiday.startDate)}
                    </span>
                    {status == "upcoming" && (
                      <Tag color="blue">Starts Soon</Tag>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base">
                      {formatDate(holiday.endDate)}
                    </span>
                    {status == "active" && (
                      <Tag color="green">In Progress</Tag>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Duration / Impact">
                  {holiday.declarationType === "ALL_CARS_MULTIPLE_DATES" || 
                   holiday.declarationType === "ONE_CAR_MULTIPLE_DATES" ? (
                    // Full-day holidays
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {duration}
                      </span>
                      <span className="text-gray-600">
                        full day{duration > 1 ? "s" : ""}
                      </span>
                      <Tag color="purple">Entire Day Blocked</Tag>
                    </div>
                  ) : (
                    // Slot-specific holidays - only show slots, not full days
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag color="orange" className="text-sm px-3 py-1">
                          Only Specific Time Slots Blocked
                        </Tag>
                        <span className="text-sm text-gray-600">
                          (Not full days)
                        </span>
                      </div>
                      {slots.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            Blocked Time Slots:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {slots.map((slot, idx) => (
                              <Tag key={idx} color="orange" className="text-sm font-medium px-3 py-1">
                                ⏰ {slot}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="text-sm text-gray-700 mt-2 bg-orange-50 px-3 py-2 rounded border border-orange-200">
                        <strong>Impact:</strong> {slots.length} time slot{slots.length > 1 ? "s" : ""} blocked on {duration} date{duration > 1 ? "s" : ""} ({formatDateShort(holiday.startDate)} to {formatDateShort(holiday.endDate)})
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        💡 Other time slots on these dates remain available for booking
                      </div>
                    </div>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <div></div>

            {/* Full Day Information */}
            {(holiday.declarationType === "ALL_CARS_MULTIPLE_DATES" || 
              holiday.declarationType === "ONE_CAR_MULTIPLE_DATES") && (
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚫</span>
                    <span>Full Day Block</span>
                    <Tag color="purple">Entire Day Unavailable</Tag>
                  </div>
                }
                className="shadow-sm"
              >
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 mb-2">
                    <strong>📌 Important:</strong> All time slots are blocked for the entire day.
                    {holiday.car ? " This car" : " All cars"} will be unavailable for booking during this period.
                  </p>
                  <p className="text-sm text-purple-700">
                    Duration: {duration} full day{duration > 1 ? "s" : ""} from {formatDateShort(holiday.startDate)} to {formatDateShort(holiday.endDate)}
                  </p>
                </div>
              </Card>
            )}

            {/* Time Slots */}
            {slots.length > 0 && (
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏰</span>
                    <span>Blocked Time Slots</span>
                    <Tag color="orange">{slots.length} slot(s) per day</Tag>
                  </div>
                }
                className="shadow-sm"
              >
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 mb-2">
                    <strong>📌 Important:</strong> Only these specific time slots are blocked.
                    Other time slots remain available for booking.
                  </p>
                  <p className="text-sm text-orange-700">
                    These {slots.length} slot{slots.length > 1 ? "s" : ""} will be blocked on each of the {duration} date{duration > 1 ? "s" : ""} in the range.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 hover:shadow-md transition-shadow"
                    >
                      <span className="text-base">⏰</span>
                      <span className="font-medium text-gray-800">{slot}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Total Blocked Slots:</strong>{" "}
                    {slots.length * duration} slot-days ({slots.length} slots ×{" "}
                    {duration} days)
                  </p>
                </div>
              </Card>
            )}

            {/* Reason */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <span>Reason for Holiday</span>
                </div>
              }
              className="shadow-sm"
            >
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 text-base leading-relaxed">
                  {holiday.reason}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-center space-y-4">
                <div className="text-5xl mb-2">📊</div>
                <h3 className="text-lg font-bold text-gray-900">
                  Impact Summary
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {duration} {duration > 1 ? "days" : "day"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Scope</p>
                    <p className="text-lg font-bold text-purple-600">
                      {holiday.car ? "1 Car" : "All Cars"}
                    </p>
                  </div>
                  {slots.length > 0 ? (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">
                        Total Slot-Days
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {slots.length * duration}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Type</p>
                      <p className="text-lg font-bold text-green-600">
                        Full Day
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            <div></div>

            {/* Timeline */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span>Timeline</span>
                </div>
              }
              className="shadow-sm"
            >
              <Timeline
                items={[
                  {
                    color: "blue",
                    children: (
                      <div>
                        <p className="font-semibold text-gray-900">Created</p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(holiday.createdAt)}
                        </p>
                      </div>
                    ),
                  },
                  {
                    color:
                      status == "upcoming"
                        ? "blue"
                        : status == "active"
                        ? "green"
                        : "gray",
                    children: (
                      <div>
                        <p className="font-semibold text-gray-900">
                          Holiday Starts
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(holiday.startDate)}
                        </p>
                      </div>
                    ),
                  },
                  {
                    color: status == "expired" ? "gray" : "orange",
                    children: (
                      <div>
                        <p className="font-semibold text-gray-900">
                          Holiday Ends
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(holiday.endDate)}
                        </p>
                      </div>
                    ),
                  },
                  ...(holiday.updatedAt !== holiday.createdAt
                    ? [
                        {
                          color: "purple" as const,
                          children: (
                            <div>
                              <p className="font-semibold text-gray-900">
                                Last Updated
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatDateTime(holiday.updatedAt)}
                              </p>
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
            <div></div>

            {/* Additional Info */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  <span>Additional Info</span>
                </div>
              }
              className="shadow-sm"
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">School ID</p>
                  <p className="font-medium text-gray-900">
                    #{holiday.schoolId}
                  </p>
                </div>
                {holiday.carId && (
                  <div>
                    <p className="text-gray-600 mb-1">Car ID</p>
                    <p className="font-medium text-gray-900">
                      #{holiday.carId}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(holiday.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(holiday.updatedAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayViewPage;
