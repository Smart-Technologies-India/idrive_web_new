"use client";
import { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Pagination,
  Button,
  Tooltip,
  Select,
  Tabs,
  Spin,
  Modal,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  CarOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPaginatedCars } from "@/services/car.api";
import { getSchoolById } from "@/services/school.api";
import { getCookie } from "cookies-next";
import { ApiCall } from "@/services/api";
import { convertSlotTo12Hour } from "@/utils/time-format";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

interface BookingSession {
  id: number;
  bookingId: number;
  carId: number;
  dayNumber: number;
  sessionDate: string;
  slot: string;
  status: string;
  attended: boolean;
}

interface Booking {
  id: number;
  bookingId: string;
  carId: number;
  slot: string;
  bookingDate: string;
  customerName: string;
  customerMobile: string;
  courseName: string;
  status: string;
  schoolId: number;
  sessions?: BookingSession[];
}

interface Driver {
  id: number;
  driverId: string;
  name: string;
  email?: string;
  mobile?: string;
  status: string;
}

interface CarData {
  id: number;
  carName: string;
  model: string;
  registrationNumber: string;
  status: string;
  assignedDriver?: Driver;
}

interface EnrichedCar extends CarData {
  bookings: Booking[];
  holidaySlots: string[];
}

interface Holiday {
  id: number;
  declarationType: string;
  carId: number | null;
  startDate: string;
  endDate: string;
  slots: string | null;
  reason: string;
  status: string;
}

// Helper function to generate time slots
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  slotDuration: number,
  lunchStart?: string,
  lunchEnd?: string
): string[] => {
  const slots: string[] = [];

  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  const lunchStartMinutes = lunchStart ? parseTime(lunchStart) : null;
  const lunchEndMinutes = lunchEnd ? parseTime(lunchEnd) : null;
  const effectiveSlotDuration =
    slotDuration == 30 || slotDuration == 60 ? slotDuration : 60;

  let currentMinutes = startMinutes;

  while (currentMinutes < endMinutes) {
    const nextMinutes = currentMinutes + effectiveSlotDuration;

    if (nextMinutes > endMinutes) {
      break;
    }

    // Skip if slot overlaps with lunch time
    if (lunchStartMinutes !== null && lunchEndMinutes !== null) {
      const isInLunchTime =
        (currentMinutes >= lunchStartMinutes &&
          currentMinutes < lunchEndMinutes) ||
        (nextMinutes > lunchStartMinutes && nextMinutes <= lunchEndMinutes) ||
        (currentMinutes < lunchStartMinutes && nextMinutes > lunchEndMinutes);

      if (!isInLunchTime) {
        slots.push(`${formatTime(currentMinutes)}-${formatTime(nextMinutes)}`);
      }
    } else {
      slots.push(`${formatTime(currentMinutes)}-${formatTime(nextMinutes)}`);
    }

    currentMinutes = nextMinutes;
  }

  return slots;
};

// Helper function to categorize slots (3 equal parts for 60-min, 5 equal parts for 30-min)
const categorizeSlots = (slots: string[], slotDuration: number) => {
  if (slotDuration === 30) {
    const total = slots.length;
    const partSize = Math.ceil(total / 5);
    return {
      earlyMorning: slots.slice(0, partSize),
      morning: slots.slice(partSize, partSize * 2),
      afternoon: slots.slice(partSize * 2, partSize * 3),
      evening: slots.slice(partSize * 3, partSize * 4),
      lateEvening: slots.slice(partSize * 4),
    };
  }

  // 3 equal parts for 60-min slots
  const total = slots.length;
  const partSize = Math.ceil(total / 3);
  return {
    morning: slots.slice(0, partSize),
    afternoon: slots.slice(partSize, partSize * 2),
    evening: slots.slice(partSize * 2),
  };
};

const CarScheduler = () => {
  const router = useRouter();
  const selectedDate = dayjs(); // Always use current date
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "earlyMorning" | "morning" | "afternoon" | "evening" | "lateEvening"
  >("morning");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBookedUsersModal, setShowBookedUsersModal] = useState(false);
  const [selectedCarSlot, setSelectedCarSlot] = useState<{car: EnrichedCar | null, slot: string | null}>({car: null, slot: null});

  // Get school ID from cookie
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Fetch school data for timing information
  const { data: schoolResponse, isLoading: loadingSchool } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: () => getSchoolById(schoolId),
    enabled: schoolId > 0,
  });

  const schoolData = schoolResponse?.data?.getSchoolById;

  const getConfiguredSchoolHolidayDays = (): string[] => {
    if (!schoolData) return [];

    return [schoolData.weeklyHoliday, schoolData.testHoliday]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toUpperCase().trim());
  };

  const isSchoolWeeklyOrTestHoliday = (date: Dayjs): boolean => {
    const dayMap: { [key: string]: number } = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const dayOfWeek = date.day();
    const configuredHolidays = getConfiguredSchoolHolidayDays();

    return configuredHolidays.some((holiday) => dayMap[holiday] == dayOfWeek);
  };

  // Generate all available time slots based on school timings
  const allSlots = useMemo(() => {
    if (!schoolData?.dayStartTime || !schoolData?.dayEndTime) {
      return [];
    }

    return generateTimeSlots(
      schoolData.dayStartTime,
      schoolData.dayEndTime,
      schoolData.slotDuration,
      schoolData.lunchStartTime || undefined,
      schoolData.lunchEndTime || undefined
    );
  }, [schoolData]);

  // Categorize slots by time period
  const timeSlots = useMemo(
    () => categorizeSlots(allSlots, schoolData?.slotDuration ?? 60),
    [allSlots, schoolData?.slotDuration]
  );

  // Fetch cars for the school
  const {
    data: carsResponse,
    isLoading: loadingCars,
    refetch: refetchCars,
  } = useQuery({
    queryKey: ["scheduler-cars", schoolId],
    queryFn: () =>
      getPaginatedCars({
        searchPaginationInput: {
          skip: 0,
          take: 1000,
        },
        whereSearchInput: {
          schoolId: schoolId,
        },
      }),
    enabled: schoolId > 0,
  });

  const carsData = useMemo(
    () => carsResponse?.data?.getPaginatedCar?.data || [],
    [carsResponse]
  );

  // Fetch ALL future booking sessions (from today onwards) for proper availability calculation
  const {
    data: sessionsResponse,
    isLoading: loadingBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: [
      "scheduler-sessions",
      schoolId,
      selectedDate.format("YYYY-MM-DD"),
    ],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            carId
            dayNumber
            sessionDate
            slot
            status
            attended
            booking {
              id
              bookingId
              carId
              slot
              bookingDate
              customerName
              customerMobile
              courseName
              status
              schoolId
            }
          }
        }`,
        variables: {
          whereSearchInput: {},
        },
      });
      console.log("Fetched booking sessions for scheduler:", response);
      return response;
    },
    enabled: schoolId > 0,
  });

  // Get all sessions and filter for current school
  const allSessions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = sessionsResponse?.data as any;
    const sessions = (data?.getAllBookingSession || []) as (BookingSession & {
      booking: Booking;
    })[];
    // Filter sessions by schoolId and only include current/future sessions
    const today = selectedDate.format("YYYY-MM-DD");
    return sessions.filter(
      (session) =>
        session.booking?.schoolId == schoolId && session.sessionDate >= today
    );
  }, [sessionsResponse, schoolId, selectedDate]);

  // Fetch holidays for the school
  const { data: holidaysResponse, isLoading: loadingHolidays } = useQuery({
    queryKey: ["holidays", schoolId, selectedDate.format("YYYY-MM-DD")],
    queryFn: async () => {
      const response = await ApiCall({
        query: `query GetAllHoliday($whereSearchInput: SearchHolidayInput!) {
          getAllHoliday(whereSearchInput: $whereSearchInput) {
            id
            declarationType
            carId
            startDate
            endDate
            slots
            reason
            status
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId: schoolId,
            status: "ACTIVE",
          },
        },
      });

      return response;
    },
    enabled: schoolId > 0,
  });

  const holidays = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = holidaysResponse?.data as any;
    return (data?.getAllHoliday || []) as Holiday[];
  }, [holidaysResponse]);

  // Enrich cars with bookings and holiday information
  const enrichedCars: EnrichedCar[] = useMemo(() => {
    return carsData.map((car) => {
      // Get all future sessions for this car
      const allCarSessions = allSessions.filter(
        (session) => session.carId == car.id
      );

      // Group sessions by booking
      const bookingsMap = new Map<
        number,
        Booking & { sessions: BookingSession[] }
      >();
      allCarSessions.forEach((session) => {
        if (session.booking) {
          if (!bookingsMap.has(session.booking.id)) {
            bookingsMap.set(session.booking.id, {
              ...session.booking,
              sessions: [],
            });
          }
          bookingsMap.get(session.booking.id)!.sessions.push({
            id: session.id,
            bookingId: session.bookingId,
            carId: session.carId,
            dayNumber: session.dayNumber,
            sessionDate: session.sessionDate,
            slot: session.slot,
            status: session.status,
            attended: session.attended,
          });
        }
      });

      const carBookings = Array.from(bookingsMap.values());

      // Get holiday slots for this car
      const holidaySlots: string[] = [];

      holidays.forEach((holiday) => {
        // Use UTC to avoid timezone issues - compare only dates, not times
        const holidayStart = dayjs.utc(holiday.startDate).format("YYYY-MM-DD");
        const holidayEnd = dayjs.utc(holiday.endDate).format("YYYY-MM-DD");
        const selectedDay = selectedDate.format("YYYY-MM-DD");

        // Check if selected date falls within holiday range (inclusive of start and end dates)
        const isDateInHolidayRange =
          selectedDay >= holidayStart && selectedDay <= holidayEnd;

        if (!isDateInHolidayRange) return;

        if (
          holiday.declarationType == "ALL_CARS_MULTIPLE_DATES" ||
          (holiday.declarationType == "ONE_CAR_MULTIPLE_DATES" &&
            holiday.carId == car.id)
        ) {
          // All slots are holidays
          holidaySlots.push(...allSlots);
        } else if (
          holiday.declarationType == "ALL_CARS_PARTICULAR_SLOTS" ||
          (holiday.declarationType == "ONE_CAR_PARTICULAR_SLOTS" &&
            holiday.carId == car.id)
        ) {
          // Specific slots are holidays
          if (holiday.slots) {
            try {
              const slots = JSON.parse(holiday.slots);
              if (Array.isArray(slots)) {
                holidaySlots.push(...slots);
              }
            } catch (e) {
              console.error("Error parsing holiday slots:", e);
            }
          }
        }
      });

      return {
        ...car,
        bookings: carBookings,
        holidaySlots: [...new Set(holidaySlots)], // Remove duplicates
      };
    });
  }, [carsData, allSessions, holidays, selectedDate, allSlots]);

  // Filter cars by status
  const filteredCars = useMemo(() => {
    if (statusFilter == "all") return enrichedCars;
    return enrichedCars.filter((car) => {
      if (statusFilter == "AVAILABLE") return car.status == "AVAILABLE";
      if (statusFilter == "IN_USE") return car.status == "IN_USE";
      if (statusFilter == "MAINTENANCE") return car.status == "MAINTENANCE";
      if (statusFilter == "INACTIVE") return car.status == "INACTIVE";
      return true;
    });
  }, [enrichedCars, statusFilter]);

  // Paginate cars
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredCars.slice(start, end);
  }, [filteredCars, currentPage, pageSize]);

  const handleRefresh = () => {
    refetchCars();
    refetchBookings();
  };

  // Check if a slot is booked - if there's any future booking for this car+slot, mark as unavailable
  const isSlotBooked = (car: EnrichedCar, slot: string): boolean => {
    // Check if there's any booking session for this car and slot on or after the selected date
    return car.bookings.some((booking) => {
      if (booking.sessions) {
        return booking.sessions.some(
          (session) =>
            session.slot == slot &&
            dayjs(session.sessionDate).isSameOrAfter(selectedDate, "day") &&
            !["CANCELLED", "NO_SHOW", "HOLD", "EDITED"].includes(session.status)
        );
      }
      return false;
    });
  };

  // Check if a slot is on holiday
  const isSlotOnHoliday = (car: EnrichedCar, slot: string): boolean => {
    return car.holidaySlots.includes(slot);
  };

  // Get next available date after the absolute last session for this car and slot
  const getNextFreeDate = (car: EnrichedCar, slot: string): string | null => {
    // Collect all future sessions for this car and slot from ALL bookings
    const allSlotSessions: BookingSession[] = [];

    car.bookings.forEach((booking) => {
      if (booking.sessions) {
        const sessions = booking.sessions.filter(
          (s) =>
            s.slot == slot &&
            dayjs(s.sessionDate).isSameOrAfter(selectedDate, "day") &&
            !["CANCELLED", "NO_SHOW", "HOLD", "EDITED"].includes(s.status)
        );
        allSlotSessions.push(...sessions);
      }
    });

    if (allSlotSessions.length == 0) return null;

    // Sort all sessions by date to find the absolute last one
    const sortedSessions = allSlotSessions.sort(
      (a, b) => dayjs(a.sessionDate).valueOf() - dayjs(b.sessionDate).valueOf()
    );

    const lastSession = sortedSessions[sortedSessions.length - 1];

    // Add 1 day after the last session across all bookings
    // Use UTC to ensure consistent date parsing
    let nextDate = dayjs.utc(lastSession.sessionDate).add(1, "day");

    // Skip school weekly/test holiday days if the next day falls on either.
    while (isSchoolWeeklyOrTestHoliday(nextDate)) {
      nextDate = nextDate.add(1, "day");
    }

    return nextDate.format("YYYY-MM-DD");
  };

  // Count available slots for a car
  const getAvailableSlotCount = (car: EnrichedCar): number => {
    return allSlots.filter(
      (slot) => !isSlotBooked(car, slot) && !isSlotOnHoliday(car, slot)
    ).length;
  };

  // Render slot cell
  const renderSlotCell = (car: EnrichedCar, slot: string) => {
    const isBooked = isSlotBooked(car, slot);
    const isHoliday = isSlotOnHoliday(car, slot);
    // const bookingInfo = getBookingInfo(car, slot);

    if (isHoliday) {
      return (
        <Tooltip title="Holiday - Slot Blocked">
          <div className="w-full h-16 flex flex-col items-center justify-center bg-gray-300 rounded cursor-not-allowed">
            <span className="text-2xl text-gray-600">🚫</span>
            <span className="text-xs text-gray-700 font-medium mt-1">
              Holiday
            </span>
          </div>
        </Tooltip>
      );
    }

    if (isBooked) {
      const nextFreeDate = getNextFreeDate(car, slot);
      const freeDateDisplay = nextFreeDate
        ? dayjs(nextFreeDate).format("DD MMM")
        : "TBD";

      // Get the first booking session on or after today for tooltip
      let firstBookingInfo = null;
      for (const booking of car.bookings) {
        if (booking.sessions) {
          const session = booking.sessions
            .filter(
              (s) =>
                s.slot == slot &&
                dayjs(s.sessionDate).isSameOrAfter(selectedDate, "day") &&
                !["CANCELLED", "NO_SHOW", "HOLD", "EDITED"].includes(s.status)
            )
            .sort(
              (a, b) =>
                dayjs(a.sessionDate).valueOf() - dayjs(b.sessionDate).valueOf()
            )[0];
          if (session) {
            firstBookingInfo = { booking, session };
            break;
          }
        }
      }

      return (
        <Tooltip
          title={
            firstBookingInfo ? (
              <div className="text-sm">
                <div className="font-semibold">
                  {firstBookingInfo.booking.customerName}
                </div>
                <div className="text-gray-300">
                  Mobile: {firstBookingInfo.booking.customerMobile}
                </div>
                <div className="text-gray-300">
                  Course: {firstBookingInfo.booking.courseName}
                </div>
                <div className="text-gray-300">
                  Starts:{" "}
                  {dayjs(firstBookingInfo.session.sessionDate).format(
                    "DD MMM YYYY"
                  )}
                </div>
                <div className="text-yellow-300 font-semibold mt-2">
                  Free from: {freeDateDisplay}
                </div>
              </div>
            ) : (
              <div className="text-sm">
                <div className="text-yellow-300 font-semibold">
                  Free from: {freeDateDisplay}
                </div>
              </div>
            )
          }
        >
          <div className="w-38 h-16 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg shadow-sm relative overflow-hidden group">
            {/* Main clickable area */}
            <div
              className="h-full flex flex-col items-center justify-center cursor-pointer hover:from-red-100 hover:to-red-200 transition-all pt-1"
              onClick={() => {
                if (nextFreeDate) {
                  const bookingUrl = `/mtadmin/booking?carId=${
                    car.id
                  }&slot=${encodeURIComponent(slot)}&date=${nextFreeDate}`;
                  router.push(bookingUrl);
                }
              }}
            >
              <CloseCircleOutlined className="text-red-600 text-lg mb-0.5" />
              <div className="text-center px-1">
                <div className="text-[10px] text-red-600 font-semibold leading-tight">
                  Free from
                </div>
                <div className="text-xs text-red-700 font-bold leading-tight">
                  {freeDateDisplay}
                </div>
              </div>
            </div>
            
            {/* Info button in corner */}
            <button
              className="absolute top-1 right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold transition-all shadow-md hover:scale-110 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCarSlot({car, slot});
                setShowBookedUsersModal(true);
              }}
              title="View booking details"
            >
              i
            </button>
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Available - Click to book">
        <div
          className="w-38 h-16 flex flex-col items-center justify-center bg-green-50 border-2 border-green-400 rounded cursor-pointer hover:bg-green-200 hover:scale-105 transition-all"
          onClick={() => {
            const bookingUrl = `/mtadmin/booking?carId=${
              car.id
            }&slot=${encodeURIComponent(slot)}&date=${selectedDate.format(
              "YYYY-MM-DD"
            )}`;
            router.push(bookingUrl);
          }}
        >
          <CheckCircleOutlined className="text-green-600 text-xl" />
          <span className="text-sm text-green-700 font-bold mt-1">Free</span>
        </div>
      </Tooltip>
    );
  };

  // Get current time slots based on active tab
  const currentSlots: string[] = (timeSlots as Record<string, string[]>)[activeTab] ?? [];

  const columns: ColumnsType<EnrichedCar> = [
    {
      title: "Car Details",
      key: "carInfo",
      fixed: "left",
      width: 220,
      render: (_, car) => (
        <div className="py-2">
          <div className="flex items-center gap-2">
            <CarOutlined className="text-blue-600 text-xl" />
            <span className="font-bold text-lg text-gray-900">
              {car.carName} - ({car.registrationNumber})
            </span>
          </div>
          {/* <div className="text-base text-gray-700 font-medium">{car.model}</div>
          {car.assignedDriver && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Driver:</span>{" "}
              {car.assignedDriver.name}
            </div>
          )} */}
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <Tooltip
              title={
                car.status == "AVAILABLE"
                  ? "Car is operational and available for booking"
                  : car.status == "MAINTENANCE"
                  ? "Car is under maintenance/repair"
                  : car.status == "IN_USE"
                  ? "Car is currently in use"
                  : "Car is not in service"
              }
            >
              <Tag
                color={
                  car.status == "AVAILABLE"
                    ? "green"
                    : car.status == "IN_USE"
                    ? "blue"
                    : car.status == "MAINTENANCE"
                    ? "orange"
                    : "red"
                }
                className="text-xs px-2 py-1 m-0 cursor-help font-medium"
              >
                {car.status == "AVAILABLE"
                  ? "✓ AVAILABLE"
                  : car.status == "IN_USE"
                  ? "🚗 IN USE"
                  : car.status == "MAINTENANCE"
                  ? "🔧 MAINTENANCE"
                  : "✗ INACTIVE"}
              </Tag>
            </Tooltip>
            <span className="text-sm">
              <span className="text-green-600 font-bold">
                {getAvailableSlotCount(car)}
              </span>
              <span className="text-gray-500 font-medium">
                /{allSlots.length} free
              </span>
            </span>
          </div>
        </div>
      ),
    },
    // Time slot columns - only show slots for active tab
    ...currentSlots.map((slot) => ({
      title: (
        <div className="text-center py-1 px-1">
          <div className="font-bold text-xs leading-tight whitespace-normal wrap-break-word">
            {convertSlotTo12Hour(slot)}
          </div>
        </div>
      ),
      key: slot,
      width: 140,
      render: (_: unknown, car: EnrichedCar) => renderSlotCell(car, slot),
    })),
  ];

  // Stats calculations
  const totalCars = filteredCars.length;
  const activeCars = filteredCars.filter(
    (car) => car.status == "AVAILABLE"
  ).length;
  const totalSlots = filteredCars.length * allSlots.length;
  const bookedSlots = filteredCars.reduce(
    (sum, car) =>
      sum + allSlots.filter((slot) => isSlotBooked(car, slot)).length,
    0
  );

  // Initial loading - only wait for essential data
  const isInitialLoading = loadingSchool || loadingCars;

  // Background loading for heavy queries
  const isBackgroundLoading = loadingBookings || loadingHolidays;

  // Show loading spinner while essential data is being fetched
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 text-lg mt-4">Loading scheduler...</p>
        </div>
      </div>
    );
  }

  // Only check for missing data after loading is complete
  if (!schoolData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">
            School not found. Please check your login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CarOutlined className="text-blue-600" />
                Car Booking Schedule
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage car availability across all time slots
              </p>
            </div>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={isBackgroundLoading} />}
              onClick={handleRefresh}
              size="large"
              loading={isBackgroundLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats + Filters (single row on large screens) */}
        <div className="flex flex-col xl:flex-row gap-4 mb-4">
          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Cars</p>
                  <p className="text-xl font-bold text-gray-900">
                    {totalCars}
                  </p>
                </div>
                <CarOutlined className="text-2xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Available</p>
                  <p className="text-xl font-bold text-green-600">
                    {activeCars}
                  </p>
                </div>
                <CheckCircleOutlined className="text-2xl text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Slots</p>
                  <p className="text-xl font-bold text-gray-900">
                    {totalSlots}
                  </p>
                </div>
                <CalendarOutlined className="text-2xl text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Booked</p>
                  <p className="text-xl font-bold text-red-600">
                    {bookedSlots}
                  </p>
                </div>
                <CloseCircleOutlined className="text-2xl text-red-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 xl:w-[520px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <CalendarOutlined className="mr-1" />
                  Current Date
                </label>
                <div className="h-9 px-3 py-2 bg-blue-50 border-2 border-blue-300 rounded text-sm font-bold text-blue-900 flex items-center">
                  {selectedDate.format("DD MMM YYYY")}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <CarOutlined className="mr-1" />
                  Filter by Status
                </label>
                <Select
                  value={statusFilter}
                  onChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                  size="middle"
                  className="w-full"
                  options={[
                    { value: "all", label: "All Cars" },
                    { value: "AVAILABLE", label: "Available Only" },
                    { value: "IN_USE", label: "In Use Only" },
                    { value: "MAINTENANCE", label: "Maintenance Only" },
                    { value: "INACTIVE", label: "Inactive Only" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Results
                </label>
                <div className="text-lg font-bold text-blue-600">
                  {filteredCars.length} Car{filteredCars.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div>
                <Button
                  type="default"
                  icon={<InfoCircleOutlined />}
                  onClick={() => setShowStatusModal(true)}
                  size="middle"
                  className="w-full"
                >
                  Status Info
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Legend Modal */}
        <Modal
          title="Status Information"
          open={showStatusModal}
          onCancel={() => setShowStatusModal(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setShowStatusModal(false)}
            >
              Close
            </Button>,
          ]}
          width={700}
        >
          <div className="space-y-6">
            {/* Slot Status Legend */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-3">
                Slot Status:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-green-50 border-2 border-green-400 rounded flex flex-col items-center justify-center">
                    <CheckCircleOutlined className="text-green-600 text-base" />
                    <span className="text-xs text-green-700 font-bold">
                      Free
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Available</div>
                    <div className="text-sm text-gray-600">
                      Slot is free and can be booked
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-red-50 border-2 border-red-300 rounded flex flex-col items-center justify-center p-1">
                    <CloseCircleOutlined className="text-red-600 text-base" />
                    <div className="text-center">
                      <div className="text-[9px] text-red-600 font-medium leading-tight">
                        Free from
                      </div>
                      <div className="text-[10px] text-red-700 font-bold leading-tight">
                        15 Nov
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Booked</div>
                    <div className="text-sm text-gray-600">
                      Shows the next available date when slot becomes free
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-300 rounded flex flex-col items-center justify-center">
                    <span className="text-lg">🚫</span>
                    <span className="text-xs text-gray-700 font-medium">
                      Holiday
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Blocked</div>
                    <div className="text-sm text-gray-600">
                      Slot is unavailable due to holiday
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Status Legend */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-3">
                Car Status:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tag
                    color="green"
                    className="text-xs px-2 py-1 m-0 font-medium"
                  >
                    ✓ AVAILABLE
                  </Tag>
                  <div>
                    <div className="font-medium text-gray-900">
                      Ready for booking
                    </div>
                    <div className="text-sm text-gray-600">
                      Car is operational and available
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag
                    color="blue"
                    className="text-xs px-2 py-1 m-0 font-medium"
                  >
                    🚗 IN USE
                  </Tag>
                  <div>
                    <div className="font-medium text-gray-900">
                      Currently booked
                    </div>
                    <div className="text-sm text-gray-600">
                      Car has active bookings
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag
                    color="orange"
                    className="text-xs px-2 py-1 m-0 font-medium"
                  >
                    🔧 MAINTENANCE
                  </Tag>
                  <div>
                    <div className="font-medium text-gray-900">
                      Under repair
                    </div>
                    <div className="text-sm text-gray-600">
                      Car is undergoing maintenance
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag
                    color="red"
                    className="text-xs px-2 py-1 m-0 font-medium"
                  >
                    ✗ INACTIVE
                  </Tag>
                  <div>
                    <div className="font-medium text-gray-900">
                      Not in service
                    </div>
                    <div className="text-sm text-gray-600">
                      Car is not available for booking
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* School Info Banner */}
        {/*   */}

        {/* Time Period Tabs with Schedule Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative">
          {isBackgroundLoading && (
            <div className="absolute top-0 left-0 right-0 bg-blue-50 border-b border-blue-200 px-4 py-2 z-10 flex items-center gap-2">
              <Spin size="small" />
              <span className="text-sm text-blue-700 font-medium">
                Loading booking details...
              </span>
            </div>
          )}
          <Tabs
            activeKey={activeTab}
            onChange={(key) =>
              setActiveTab(key as "earlyMorning" | "morning" | "afternoon" | "evening" | "lateEvening")
            }
            size="large"
            className="px-4 pt-3"
            items={
              schoolData?.slotDuration === 30
                ? [
                    {
                      key: "earlyMorning",
                      label: (
                        <span className="text-base font-semibold px-4">
                          🌄 Early Morning
                        </span>
                      ),
                    },
                    {
                      key: "morning",
                      label: (
                        <span className="text-base font-semibold px-4">
                          🌅 Morning
                        </span>
                      ),
                    },
                    {
                      key: "afternoon",
                      label: (
                        <span className="text-base font-semibold px-4">
                           ☀️ Afternoon
                        </span>
                      ),
                    },
                    {
                      key: "evening",
                      label: (
                        <span className="text-base font-semibold px-4">
                          🌙 Evening
                        </span>
                      ),
                    },
                    {
                      key: "lateEvening",
                      label: (
                        <span className="text-base font-semibold px-4">
                          🌙 Late Evening
                        </span>
                      ),
                    },
                  ]
                : [
                    {
                      key: "morning",
                      label: (
                        <span className="text-base font-semibold px-4">
                          🌅 Morning
                        </span>
                      ),
                    },
                    {
                      key: "afternoon",
                      label: (
                        <span className="text-base font-semibold px-4">
                          ☀️ Afternoon
                        </span>
                      ),
                    },
                    {
                      key: "evening",
                      label: (
                        <span className="text-base font-semibold px-4">
                          🌙 Evening
                        </span>
                      ),
                    },
                  ]
            }
          />

          {/* Schedule Table */}
          <Table
            columns={columns}
            dataSource={paginatedCars}
            pagination={false}
            scroll={{ x: 900 }}
            size="middle"
            rowKey="id"
            className="scheduler-table"
          />
        </div>

        {/* Pagination */}
        {filteredCars.length > pageSize && (
          <div className="mt-6 flex justify-center">
            <Pagination
              current={currentPage}
              total={filteredCars.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total) => `Total ${total} cars`}
              size="default"
            />
          </div>
        )}
      </div>

      {/* Booked Users Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-blue-600" />
            <span>
              {selectedCarSlot.car && selectedCarSlot.slot
                ? `Bookings for ${selectedCarSlot.car.carName} - ${convertSlotTo12Hour(selectedCarSlot.slot)}`
                : "Booked Users"}
            </span>
          </div>
        }
        open={showBookedUsersModal}
        onCancel={() => {
          setShowBookedUsersModal(false);
          setSelectedCarSlot({car: null, slot: null});
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setShowBookedUsersModal(false);
              setSelectedCarSlot({car: null, slot: null});
            }}
          >
            Close
          </Button>,
        ]}
        width={900}
      >
        <div className="py-4">
          <Table
            dataSource={(selectedCarSlot.car ? [selectedCarSlot.car] : enrichedCars).flatMap((car) =>
              car.bookings.flatMap((booking) => {
                if (!booking.sessions || booking.sessions.length === 0) {
                  return [];
                }
                // Filter by slot if one is selected
                const relevantSessions = selectedCarSlot.slot
                  ? booking.sessions.filter(s => s.slot === selectedCarSlot.slot)
                  : booking.sessions;
                
                if (relevantSessions.length === 0) {
                  return [];
                }
                // Get earliest and latest dates from filtered sessions
                const sessionDates = relevantSessions
                  .map((s) => s.sessionDate)
                  .sort();
                const startDate = sessionDates[0];
                const endDate = sessionDates[sessionDates.length - 1];

                return {
                  key: `${booking.id}-${car.id}`,
                  id: booking.id,
                  bookingId: booking.bookingId,
                  customerName: booking.customerName,
                  customerMobile: booking.customerMobile,
                  courseName: booking.courseName,
                  carName: car.carName,
                  startDate: startDate,
                  endDate: endDate,
                  status: booking.status,
                  slot: selectedCarSlot.slot || "All slots",
                  totalSessions: relevantSessions.length,
                };
              })
            )}
            columns={[
              {
                title: "Booking ID",
                dataIndex: "bookingId",
                key: "bookingId",
                width: 120,
                render: (text: string) => (
                  <span className="font-mono text-xs">{text}</span>
                ),
              },
              {
                title: "Customer Name",
                dataIndex: "customerName",
                key: "customerName",
                width: 150,
                render: (text: string) => (
                  <span className="font-semibold">{text}</span>
                ),
              },
              {
                title: "Contact Number",
                dataIndex: "customerMobile",
                key: "customerMobile",
                width: 130,
              },
              {
                title: "Start Date",
                dataIndex: "startDate",
                key: "startDate",
                width: 110,
                render: (date: string) => dayjs(date).format("DD MMM YYYY"),
                sorter: (a: { startDate: string }, b: { startDate: string }) =>
                  dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
              },
              {
                title: "End Date",
                dataIndex: "endDate",
                key: "endDate",
                width: 110,
                render: (date: string) => dayjs(date).format("DD MMM YYYY"),
              },
              {
                title: "Course",
                dataIndex: "courseName",
                key: "courseName",
                width: 120,
                render: (text: string) => (
                  <Tag color="blue" className="text-xs">
                    {text}
                  </Tag>
                ),
              },
              {
                title: "Car",
                dataIndex: "carName",
                key: "carName",
                width: 100,
              },
              {
                title: "Sessions",
                dataIndex: "totalSessions",
                key: "totalSessions",
                width: 80,
                align: "center" as const,
                render: (count: number) => (
                  <Tag color="purple">{count}</Tag>
                ),
              },
            ]}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} bookings`,
            }}
            scroll={{ x: 800 }}
            size="small"
          />
        </div>
      </Modal>

      <style jsx global>{`
        .scheduler-table .ant-table-cell {
          padding: 10px !important;
          font-size: 14px;
        }

        .scheduler-table .ant-table-thead > tr > th {
          background: #f0f9ff;
          font-weight: 700;
          border-bottom: 3px solid #3b82f6;
          padding: 14px 10px !important;
        }

        .scheduler-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb;
        }

        .scheduler-table .ant-table-tbody > tr:hover > td {
          background: #fefce8;
        }

        .ant-tabs-tab {
          padding: 14px 10px !important;
        }

        .ant-tabs-tab-active {
          background: #eff6ff !important;
          border-radius: 8px 8px 0 0 !important;
        }
      `}</style>
    </div>
  );
};

export default CarScheduler;
