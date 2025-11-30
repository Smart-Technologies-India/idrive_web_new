"use client";
import { useState, useMemo } from "react";
import {
  DatePicker,
  Table,
  Tag,
  Pagination,
  Button,
  Tooltip,
  Select,
  Tabs,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  CarOutlined,
  ReloadOutlined,
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

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

interface BookingSession {
  id: number;
  bookingId: number;
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

interface CarData {
  id: number;
  carName: string;
  model: string;
  registrationNumber: string;
  status: string;
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

  let currentMinutes = startMinutes;

  while (currentMinutes < endMinutes) {
    const nextMinutes = currentMinutes + 60;

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

// Helper function to categorize slots
const categorizeSlots = (slots: string[]) => {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];

  slots.forEach((slot) => {
    const hour = parseInt(slot.split(":")[0]);
    if (hour < 12) {
      morning.push(slot);
    } else if (hour < 17) {
      afternoon.push(slot);
    } else {
      evening.push(slot);
    }
  });

  return { morning, afternoon, evening };
};

const CarScheduler = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");

  // Get school ID from cookie
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");
  
  // Fetch school data for timing information
  const { data: schoolResponse, isLoading: loadingSchool } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: () => getSchoolById(schoolId),
    enabled: schoolId > 0,
  });
  
  const schoolData = schoolResponse?.data?.getSchoolById;

  // Generate all available time slots based on school timings
  const allSlots = useMemo(() => {
    if (!schoolData?.dayStartTime || !schoolData?.dayEndTime) {
      return [];
    }
    return generateTimeSlots(
      schoolData.dayStartTime,
      schoolData.dayEndTime,
      schoolData.lunchStartTime || undefined,
      schoolData.lunchEndTime || undefined
    );
  }, [schoolData]);

  // Categorize slots by time period
  const timeSlots = useMemo(() => categorizeSlots(allSlots), [allSlots]);

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

  // Fetch booking sessions for the selected date
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
          whereSearchInput: {
            sessionDate: selectedDate.format("YYYY-MM-DD"),
          },
        },
      });
      return response;
    },
    enabled: schoolId > 0,
  });

  // Get all booking IDs from current sessions to fetch complete session data
  const bookingIds = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = sessionsResponse?.data as any;
    const sessions = (data?.getAllBookingSession || []) as (BookingSession & {
      booking: Booking;
    })[];
    const ids = new Set<number>();
    sessions.forEach((session) => {
      if (session.booking?.id && session.booking?.schoolId === schoolId) {
        ids.add(session.booking.id);
      }
    });
    return Array.from(ids);
  }, [sessionsResponse, schoolId]);

  // Fetch all sessions for each booking to get accurate free dates
  const { data: futureSessionsResponse, isLoading: loadingFutureSessions } =
    useQuery({
      queryKey: [
        "scheduler-all-booking-sessions",
        schoolId,
        bookingIds.join(","),
      ],
      queryFn: async () => {
        if (bookingIds.length === 0)
          return { data: { getAllBookingSession: [] } };

        // Fetch sessions for all bookings in parallel
        const promises = bookingIds.map((bookingId) =>
          ApiCall({
            query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
            getAllBookingSession(whereSearchInput: $whereSearchInput) {
              id
              bookingId
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
              whereSearchInput: {
                bookingId: bookingId,
              },
            },
          })
        );

        const results = await Promise.all(promises);

        // Combine all sessions from all bookings
        const allSessions: (BookingSession & { booking: Booking })[] = [];
        results.forEach((result) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = result?.data as any;
          const sessions = data?.getAllBookingSession || [];
          allSessions.push(...sessions);
        });
        return { data: { getAllBookingSession: allSessions } };
      },
      enabled: schoolId > 0 && bookingIds.length > 0,
    });

  const allSessions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = sessionsResponse?.data as any;
    const sessions = (data?.getAllBookingSession || []) as (BookingSession & {
      booking: Booking;
    })[];
    // Filter sessions by schoolId since the query doesn't support it directly
    return sessions.filter((session) => session.booking?.schoolId === schoolId);
  }, [sessionsResponse, schoolId]);

  // Get all sessions from bookings and filter for future dates
  const allFutureSessions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = futureSessionsResponse?.data as any;
    const sessions = (data?.getAllBookingSession || []) as (BookingSession & {
      booking: Booking;
    })[];
    // Filter by school and only include current/future sessions
    const today = selectedDate.format("YYYY-MM-DD");
    return sessions.filter(
      (session) =>
        session.booking?.schoolId === schoolId && session.sessionDate >= today
    );
  }, [futureSessionsResponse, schoolId, selectedDate]);

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
      // Get all sessions for this car (including future sessions for accurate free date)
      const carSessions = allSessions.filter(
        (session) => session.booking?.carId === car.id
      );

      const carFutureSessions = allFutureSessions.filter(
        (session) => session.booking?.carId === car.id
      );

      // Combine current and future sessions, removing duplicates
      const allCarSessions = [...carSessions];
      carFutureSessions.forEach((futureSession) => {
        if (!allCarSessions.some((s) => s.id === futureSession.id)) {
          allCarSessions.push(futureSession);
        }
      });

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
          holiday.declarationType === "ALL_CARS_MULTIPLE_DATES" ||
          (holiday.declarationType === "ONE_CAR_MULTIPLE_DATES" &&
            holiday.carId === car.id)
        ) {
          // All slots are holidays
          holidaySlots.push(...allSlots);
        } else if (
          holiday.declarationType === "ALL_CARS_PARTICULAR_SLOTS" ||
          (holiday.declarationType === "ONE_CAR_PARTICULAR_SLOTS" &&
            holiday.carId === car.id)
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
  }, [
    carsData,
    allSessions,
    allFutureSessions,
    holidays,
    selectedDate,
    allSlots,
  ]);

  // Filter cars by status
  const filteredCars = useMemo(() => {
    if (statusFilter === "all") return enrichedCars;
    return enrichedCars.filter((car) => {
      if (statusFilter === "AVAILABLE") return car.status === "AVAILABLE";
      if (statusFilter === "IN_USE") return car.status === "IN_USE";
      if (statusFilter === "MAINTENANCE") return car.status === "MAINTENANCE";
      if (statusFilter === "INACTIVE") return car.status === "INACTIVE";
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

  // Check if a slot is booked for a specific car on the selected date
  const isSlotBooked = (car: EnrichedCar, slot: string): boolean => {
    return car.bookings.some((booking) => {
      if (booking.slot !== slot) return false;

      // Check if selected date falls within booking sessions
      if (booking.sessions) {
        return booking.sessions.some(
          (session) =>
            dayjs(session.sessionDate).isSame(selectedDate, "day") &&
            session.slot === slot &&
            session.status !== "CANCELLED"
        );
      }

      return false;
    });
  };

  // Check if a slot is on holiday
  const isSlotOnHoliday = (car: EnrichedCar, slot: string): boolean => {
    return car.holidaySlots.includes(slot);
  };

  // Get booking information for a slot
  const getBookingInfo = (
    car: EnrichedCar,
    slot: string
  ): { booking: Booking; session: BookingSession } | null => {
    for (const booking of car.bookings) {
      if (booking.sessions) {
        const session = booking.sessions.find(
          (s) =>
            dayjs(s.sessionDate).isSame(selectedDate, "day") &&
            s.slot === slot &&
            s.status !== "CANCELLED"
        );
        if (session) {
          return { booking, session };
        }
      }
    }
    return null;
  };

  // Get next available date for a booked slot by checking ALL sessions for this car and slot
  const getNextFreeDate = (car: EnrichedCar, slot: string): string | null => {
    // Collect all sessions for this car and slot from ALL bookings
    const allSlotSessions: BookingSession[] = [];

    car.bookings.forEach((booking) => {
      if (booking.sessions) {
        const sessions = booking.sessions.filter(
          (s) => s.slot === slot && s.status !== "CANCELLED"
        );
        allSlotSessions.push(...sessions);
      }
    });

    if (allSlotSessions.length === 0) return null;


    // Sort all sessions by date to find the absolute last one
    const sortedSessions = allSlotSessions.sort(
      (a, b) => dayjs(a.sessionDate).valueOf() - dayjs(b.sessionDate).valueOf()
    );

    const lastSession = sortedSessions[sortedSessions.length - 1];

    // Add 1 day after the last session across all bookings
    // Use UTC to ensure consistent date parsing
    let nextDate = dayjs.utc(lastSession.sessionDate).add(1, "day");

    // Skip weekly holiday if the next day falls on it
    if (schoolData?.weeklyHoliday) {
      const weeklyHoliday = schoolData.weeklyHoliday.toUpperCase();
      const dayMap: { [key: string]: number } = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
      };

      const holidayDay = dayMap[weeklyHoliday];
      if (holidayDay !== undefined && nextDate.day() === holidayDay) {
        nextDate = nextDate.add(1, "day");
      }
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
    const bookingInfo = getBookingInfo(car, slot);

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

    if (isBooked && bookingInfo) {
      const nextFreeDate = getNextFreeDate(car, slot);
      const freeDateDisplay = nextFreeDate
        ? dayjs(nextFreeDate).format("DD MMM")
        : "TBD";

      return (
        <Tooltip
          title={
            <div className="text-sm">
              <div className="font-semibold">
                {bookingInfo.booking.customerName}
              </div>
              <div className="text-gray-300">
                Mobile: {bookingInfo.booking.customerMobile}
              </div>
              <div className="text-gray-300">
                Course: {bookingInfo.booking.courseName}
              </div>
              <div className="text-gray-300">
                Day: {bookingInfo.session.dayNumber}
              </div>
              <div className="text-yellow-300 font-semibold mt-2">
                Free from: {freeDateDisplay}
              </div>
              <div className="text-yellow-300 text-xs mt-1">
                Click to rebook from {freeDateDisplay}
              </div>
            </div>
          }
        >
          <div
            className="w-full h-16 flex flex-col items-center justify-center bg-red-50 border-2 border-red-300 rounded cursor-pointer hover:bg-red-100 transition-all"
            onClick={() => {
              if (nextFreeDate) {
                const bookingUrl = `/mtadmin/booking?carId=${
                  car.id
                }&slot=${encodeURIComponent(slot)}&date=${nextFreeDate}`;
                router.push(bookingUrl);
              }
            }}
          >
            <CloseCircleOutlined className="text-red-600 text-xl" />
            <div className="text-center">
              <div className="text-xs text-red-600 font-medium">Free from</div>
              <div className="text-sm text-red-700 font-bold">
                {freeDateDisplay}
              </div>
            </div>
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Available - Click to book">
        <div
          className="w-full h-16 flex flex-col items-center justify-center bg-green-50 border-2 border-green-400 rounded cursor-pointer hover:bg-green-200 hover:scale-105 transition-all"
          onClick={() => {
            const bookingUrl = `/mtadmin/booking?carId=${
              car.id
            }&slot=${encodeURIComponent(slot)}&date=${selectedDate.format('YYYY-MM-DD')}`;
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
  const currentSlots = timeSlots[activeTab];

  const columns: ColumnsType<EnrichedCar> = [
    {
      title: "Car Details",
      key: "carInfo",
      fixed: "left",
      width: 220,
      render: (_, car) => (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2">
            <CarOutlined className="text-blue-600 text-xl" />
            <span className="font-bold text-lg text-gray-900">
              {car.carName}
            </span>
          </div>
          <div className="text-base text-gray-700 font-medium">{car.model}</div>
          <div className="text-sm text-gray-500">{car.registrationNumber}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Tooltip
              title={
                car.status === "AVAILABLE"
                  ? "Car is operational and available for booking"
                  : car.status === "MAINTENANCE"
                  ? "Car is under maintenance/repair"
                  : car.status === "IN_USE"
                  ? "Car is currently in use"
                  : "Car is not in service"
              }
            >
              <Tag
                color={
                  car.status === "AVAILABLE"
                    ? "green"
                    : car.status === "IN_USE"
                    ? "blue"
                    : car.status === "MAINTENANCE"
                    ? "orange"
                    : "red"
                }
                className="text-xs px-2 py-1 m-0 cursor-help font-medium"
              >
                {car.status === "AVAILABLE"
                  ? "✓ AVAILABLE"
                  : car.status === "IN_USE"
                  ? "🚗 IN USE"
                  : car.status === "MAINTENANCE"
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
        <div className="text-center py-1">
          <div className="font-bold text-base">{slot.split("-")[0]}</div>
          <div className="text-xs text-gray-500 font-normal">
            {parseInt(slot) < 12 ? "AM" : "PM"}
          </div>
        </div>
      ),
      key: slot,
      width: 110,
      render: (_: unknown, car: EnrichedCar) => renderSlotCell(car, slot),
    })),
  ];

  // Stats calculations
  const totalCars = filteredCars.length;
  const activeCars = filteredCars.filter(
    (car) => car.status === "AVAILABLE"
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
  const isBackgroundLoading = loadingBookings || loadingHolidays || (bookingIds.length > 0 && loadingFutureSessions);


  // Show loading spinner while essential data is being fetched
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-gray-600 text-lg mt-4">
            Loading scheduler...
          </p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Cars</p>
                <p className="text-2xl font-bold text-gray-900">{totalCars}</p>
              </div>
              <CarOutlined className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Cars</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeCars}
                </p>
              </div>
              <CheckCircleOutlined className="text-4xl text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
              </div>
              <CalendarOutlined className="text-4xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Booked Slots</p>
                <p className="text-2xl font-bold text-red-600">{bookedSlots}</p>
              </div>
              <CloseCircleOutlined className="text-4xl text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarOutlined className="mr-2" />
                Select Date
              </label>
              <DatePicker
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCurrentPage(1);
                  }
                }}
                format="DD MMM YYYY"
                size="large"
                className="w-full"
                disabledDate={(current) => {
                  if (!current) return false;

                  // Disable dates before today
                  if (current.isBefore(dayjs(), "day")) {
                    return true;
                  }

                  // Check weekend restriction if school has a weekly holiday
                  if (schoolData?.weeklyHoliday) {
                    const dayOfWeek = current.day();
                    const weeklyHoliday =
                      schoolData.weeklyHoliday.toUpperCase();

                    const dayMap: { [key: string]: number } = {
                      SUNDAY: 0,
                      MONDAY: 1,
                      TUESDAY: 2,
                      WEDNESDAY: 3,
                      THURSDAY: 4,
                      FRIDAY: 5,
                      SATURDAY: 6,
                    };

                    const holidayDay = dayMap[weeklyHoliday];
                    if (holidayDay !== undefined && dayOfWeek === holidayDay) {
                      return true;
                    }
                  }

                  return false;
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CarOutlined className="mr-2" />
                Filter by Status
              </label>
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                size="large"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Results
              </label>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {filteredCars.length} Car{filteredCars.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* School Info Banner */}
        {/*   */}

        {/* Legend & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-bold text-gray-800">
                Slot Status:
              </span>
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-green-50 border-2 border-green-400 rounded flex flex-col items-center justify-center">
                  <CheckCircleOutlined className="text-green-600 text-base" />
                  <span className="text-xs text-green-700 font-bold">Free</span>
                </div>
                <span className="text-sm text-gray-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
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
                <span className="text-sm text-gray-700">
                  Booked (shows when free)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-gray-300 rounded flex flex-col items-center justify-center">
                  <span className="text-lg">🚫</span>
                  <span className="text-xs text-gray-700 font-medium">
                    Holiday
                  </span>
                </div>
                <span className="text-sm text-gray-700">Blocked</span>
              </div>
            </div>
          </div>

          {/* Car Status Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-bold text-gray-800">
                Car Status:
              </span>
              <div className="flex items-center gap-2">
                <Tag
                  color="green"
                  className="text-xs px-2 py-1 m-0 font-medium"
                >
                  ✓ AVAILABLE
                </Tag>
                <span className="text-sm text-gray-700">Ready for booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="blue" className="text-xs px-2 py-1 m-0 font-medium">
                  🚗 IN USE
                </Tag>
                <span className="text-sm text-gray-700">Currently booked</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag
                  color="orange"
                  className="text-xs px-2 py-1 m-0 font-medium"
                >
                  🔧 MAINTENANCE
                </Tag>
                <span className="text-sm text-gray-700">Under repair</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag color="red" className="text-xs px-2 py-1 m-0 font-medium">
                  ✗ INACTIVE
                </Tag>
                <span className="text-sm text-gray-700">Not in service</span>
              </div>
            </div>
          </div>
        </div>

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
              setActiveTab(key as "morning" | "afternoon" | "evening")
            }
            size="large"
            className="px-4 pt-3"
            items={[
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
            ]}
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
