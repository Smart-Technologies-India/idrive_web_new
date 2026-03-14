"use client";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiCall } from "@/services/api";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { TextInput } from "./inputfields/textinput";
import { TaxtAreaInput } from "./inputfields/textareainput";
import {
  Modal,
  Button,
  Tag,
  Radio,
  Checkbox,
  Card,
  Empty,
  Badge,
  DatePicker,
  Select,
} from "antd";
import { getCookie } from "cookies-next";
import { getSchoolById } from "@/services/school.api";
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
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import type { AmendmentFormData, AmendmentAction } from "@/schema/amendment";
import { convertSlotTo12Hour } from "@/utils/time-format";

dayjs.extend(utc);

// API Response Types
interface GetAllBookingResponse {
  getAllBooking: Booking[];
}

interface GetAllBookingSessionResponse {
  getAllBookingSession: BookingSession[];
}

// Types for booking data from backend
interface BookingSession {
  id: number;
  bookingId: number;
  dayNumber: number;
  sessionDate: string;
  slot: string;
  status: string;
  attended: boolean;
  carId: number;
  driverId: number;
  carName: string;
  car?: {
    id: number;
    carName: string;
    registrationNumber: string;
  };
  driver?: {
    id: number;
    name: string;
  };
}

interface Holiday {
  id: number;
  startDate: string;
  endDate: string;
  schoolId: number;
  declarationType: string;
  carId?: number;
  slots?: string;
}

interface GetAllHolidayResponse {
  getAllHoliday: Holiday[];
}

interface Booking {
  id: number;
  bookingId: string;
  carId: number;
  carName: string;
  slot: string;
  bookingDate: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  courseName: string;
  coursePrice: number;
  totalAmount: number;
  status: string;
  schoolId: number;
  sessions?: BookingSession[];
}

interface AvailableCar {
  id: number;
  carName: string;
  registrationNumber: string;
  status: string;
  assignedDriverId?: number;
  assignedDriver?: {
    id: number;
    name: string;
  };
}

interface School {
  id: number;
  weeklyHoliday?: string;
  testHoliday?: string;
}

interface GetAllCarResponse {
  getAllCar: AvailableCar[];
}

// Fetch bookings with their sessions
const fetchBookingsWithSessions = async (
  mobile?: string,
  bookingId?: string,
  name?: string,
  surname?: string,
  schoolId?: number
): Promise<Booking[]> => {
  try {
    let whereSearchInput: Record<string, unknown> = {};

    if (bookingId) {
      whereSearchInput = { bookingId };
    } else if (mobile) {
      whereSearchInput = { customerMobile: mobile };
    } else if (name) {
      // For name search, we need to find users first and then get their bookings by mobile
      const userResponse = await ApiCall({
        query: `query GetAllUser($whereSearchInput: WhereUserSearchInput!) {
          getAllUser(whereSearchInput: $whereSearchInput) {
            id
            name
            surname
            contact1
          }
        }`,
        variables: {
          whereSearchInput: {
            name: name,
            schoolId: schoolId,
            role: "USER",
          },
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = (userResponse?.data as any)?.getAllUser || [];
      if (users.length === 0) {
        return [];
      }

      // Get bookings for all matching users
      const allBookings: Booking[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const user of users as any[]) {
        const userBookingsResponse = await ApiCall({
          query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
            getAllBooking(whereSearchInput: $whereSearchInput) {
              id
              bookingId
              carId
              carName
              slot
              bookingDate
              customerName
              customerMobile
              customerEmail
              courseName
              coursePrice
              totalAmount
              status
              schoolId
            }
          }`,
          variables: {
            whereSearchInput: {
              customerMobile: user.contact1,
              schoolId: schoolId,
            },
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userBookings = (userBookingsResponse?.data as any)?.getAllBooking || [];
        allBookings.push(...userBookings);
      }


      // Fetch sessions for each booking
      const bookingsWithSessions = await Promise.all(
        allBookings.map(async (booking: Booking) => {
          const sessionsResponse = await ApiCall<GetAllBookingSessionResponse>({
            query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
              getAllBookingSession(whereSearchInput: $whereSearchInput) {
                id
                bookingId
                dayNumber
                sessionDate
                slot
                status
                attended
                carId
                driverId
                car {
                  id
                  carName
                  registrationNumber
                }
                driver {
                  id
                  name
                }
              }
            }`,
            variables: {
              whereSearchInput: {
                bookingId: booking.id,
              },
            },
          });

          const sessions =
            (sessionsResponse?.data as GetAllBookingSessionResponse)
              ?.getAllBookingSession || [];
          return { ...booking, sessions };
        })
      );


      return bookingsWithSessions;
    } else if (surname) {
      // For surname search, we need to find users first and then get their bookings by mobile
      const userResponse = await ApiCall({
        query: `query GetAllUser($whereSearchInput: WhereUserSearchInput!) {
          getAllUser(whereSearchInput: $whereSearchInput) {
            id
            name
            surname
            contact1
          }
        }`,
        variables: {
          whereSearchInput: {
            surname: surname,
            schoolId: schoolId,
            role: "USER",
          },
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = (userResponse?.data as any)?.getAllUser || [];
      if (users.length === 0) {
        return [];
      }

      // Get bookings for all matching users
      const allBookings: Booking[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const user of users as any[]) {
        const userBookingsResponse = await ApiCall({
          query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
            getAllBooking(whereSearchInput: $whereSearchInput) {
              id
              bookingId
              carId
              carName
              slot
              bookingDate
              customerName
              customerMobile
              customerEmail
              courseName
              coursePrice
              totalAmount
              status
              schoolId
            }
          }`,
          variables: {
            whereSearchInput: {
              customerMobile: user.contact1,
              schoolId: schoolId,
            },
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userBookings = (userBookingsResponse?.data as any)?.getAllBooking || [];
        allBookings.push(...userBookings);
      }

      // Fetch sessions for each booking
      const bookingsWithSessions = await Promise.all(
        allBookings.map(async (booking: Booking) => {
          const sessionsResponse = await ApiCall<GetAllBookingSessionResponse>({
            query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
              getAllBookingSession(whereSearchInput: $whereSearchInput) {
                id
                bookingId
                dayNumber
                sessionDate
                slot
                status
                attended
                carId
                driverId
                car {
                  id
                  carName
                  registrationNumber
                }
                driver {
                  id
                  name
                }
              }
            }`,
            variables: {
              whereSearchInput: {
                bookingId: booking.id,
              },
            },
          });

          const sessions =
            (sessionsResponse?.data as GetAllBookingSessionResponse)
              ?.getAllBookingSession || [];
          return { ...booking, sessions };
        })
      );

      return bookingsWithSessions;
    }

    if (schoolId) {
      whereSearchInput.schoolId = schoolId;
    }

    const response = await ApiCall({
      query: `query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
        getAllBooking(whereSearchInput: $whereSearchInput) {
          id
          bookingId
          carId
          carName
          slot
          bookingDate
          customerName
          customerMobile
          customerEmail
          courseName
          coursePrice
          totalAmount
          status
          schoolId
        }
      }`,
      variables: { whereSearchInput },
    });

    const bookings =
      (response?.data as GetAllBookingResponse)?.getAllBooking || [];

    // Fetch sessions for each booking
    const bookingsWithSessions = await Promise.all(
      bookings.map(async (booking: Booking) => {
        const sessionsResponse = await ApiCall<GetAllBookingSessionResponse>({
          query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
            getAllBookingSession(whereSearchInput: $whereSearchInput) {
              id
              bookingId
              dayNumber
              sessionDate
              slot
              status
              attended
              carId
              driverId
              car {
                id
                carName
                registrationNumber
              }
              driver {
                id
                name
              }
            }
          }`,
          variables: {
            whereSearchInput: {
              bookingId: booking.id,
            },
          },
        });

        const sessions =
          (sessionsResponse?.data as GetAllBookingSessionResponse)
            ?.getAllBookingSession || [];
        return { ...booking, sessions };
      })
    );

    return bookingsWithSessions;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

const AmendmentForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchMethod, setSearchMethod] = useState<"mobile" | "bookingId" | "name" | "surname">(
    "mobile"
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  const [amendmentAction, setAmendmentAction] =
    useState<AmendmentAction | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newDates, setNewDates] = useState<Dayjs[]>([]);
  const [allCarSessions, setAllCarSessions] = useState<BookingSession[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<string>("");
  const [availableCars, setAvailableCars] = useState<AvailableCar[]>([]);
  const [selectedNewCarId, setSelectedNewCarId] = useState<number | null>(null);
  const [loadingCars, setLoadingCars] = useState(false);

  // Get school ID from cookie
  const schoolId: number = parseInt(getCookie("school")?.toString() || "0");

  // Fetch school data
  const { data: schoolResponse } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: () => getSchoolById(schoolId),
    enabled: schoolId > 0,
  });

  const schoolData = schoolResponse?.data?.getSchoolById;

  // Fetch holidays to check if selected date is a holiday
  const { data: holidaysResponse } = useQuery({
    queryKey: ["holidays", schoolId],
    queryFn: async () => {
      return await ApiCall({
        query: `query GetAllHoliday($whereSearchInput: SearchHolidayInput!) {
          getAllHoliday(whereSearchInput: $whereSearchInput) {
            id
            startDate
            endDate
            schoolId
            declarationType
            carId
            slots
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId: schoolId,
          },
        },
      });
    },
    enabled: schoolId > 0,
  });

  const methods = useForm<AmendmentFormData>({
    mode: "onChange",
    defaultValues: {
      searchMethod: "mobile",
      customerMobile: "",
      customerName: "",
      customerSurname: "",
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

  // Handle URL parameters for pre-filled search
  useEffect(() => {
    const bookingIdParam = searchParams.get("bookingId");
    const mobileParam = searchParams.get("mobile");

    if (bookingIdParam) {
      setSearchMethod("bookingId");
      setValue("searchMethod", "bookingId");
      setValue("bookingId", bookingIdParam);
      // Trigger search after a small delay to ensure form is ready
      setTimeout(() => {
        searchBookings();
      }, 500);
    } else if (mobileParam) {
      setSearchMethod("mobile");
      setValue("searchMethod", "mobile");
      setValue("customerMobile", mobileParam);
      // Trigger search after a small delay to ensure form is ready
      setTimeout(() => {
        searchBookings();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Search for bookings with mutation
  const { mutate: searchBookings, isPending: loadingSearch } = useMutation({
    mutationFn: async () => {
      if (searchMethod == "mobile" && formValues.customerMobile) {
        return await fetchBookingsWithSessions(
          formValues.customerMobile,
          undefined,
          undefined,
          undefined,
          schoolId
        );
      } else if (searchMethod == "bookingId" && formValues.bookingId) {
        return await fetchBookingsWithSessions(
          undefined,
          formValues.bookingId,
          undefined,
          undefined,
          schoolId
        );
      } else if (searchMethod == "name" && formValues.customerName) {
        return await fetchBookingsWithSessions(
          undefined,
          undefined,
          formValues.customerName,
          undefined,
          schoolId
        );
      } else if (searchMethod == "surname" && formValues.customerSurname) {
        return await fetchBookingsWithSessions(
          undefined,
          undefined,
          undefined,
          formValues.customerSurname,
          schoolId
        );
      }
      return [];
    },
    onSuccess: (results) => {
      if (results.length == 0) {
        toast.error("No bookings found");
      } else {
        toast.success(
          `Found ${results.length} booking${results.length > 1 ? "s" : ""}`
        );
      }
      setBookings(results);
      setSelectedBooking(null);
      setSelectedDates([]);
      setSelectedSessionIds([]);
      setAmendmentAction(null);
    },
    onError: () => {
      toast.error("Failed to search bookings");
    },
  });

  const handleSearch = () => {
    searchBookings();
  };

  // Select booking
  const handleSelectBooking = async (booking: Booking) => {
    setSelectedBooking(booking);
    setValue("selectedBookingId", booking.id.toString());
    setSelectedDates([]);
    setSelectedSessionIds([]);
    setAmendmentAction(null);
    setNewDates([]);

    // Fetch all sessions for this car to block already booked dates
    try {
      const carSessionsResponse = await ApiCall<GetAllBookingSessionResponse>({
        query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
          getAllBookingSession(whereSearchInput: $whereSearchInput) {
            id
            bookingId
            sessionDate
            slot
            status
          }
        }`,
        variables: {
          whereSearchInput: {
            carId: booking.carId,
            slot: booking.slot,
          },
        },
      });

      const carSessions =
        (carSessionsResponse?.data as GetAllBookingSessionResponse)
          ?.getAllBookingSession || [];
      setAllCarSessions(carSessions);
    } catch (error) {
      console.error("Error fetching car sessions:", error);
      setAllCarSessions([]);
    }
  };

  // Toggle date selection
  const handleToggleDate = (sessionId: number, date: string) => {
    const isSelected = selectedDates.includes(date);

    if (isSelected) {
      // For CANCEL_BOOKING, when unselecting, clear all and reselect from this date onwards
      if (amendmentAction == "CANCEL_BOOKING" && selectedBooking?.sessions) {
        const clickedDate = dayjs.utc(date);
        const futureSessions = selectedBooking.sessions.filter((session) => {
          const sessionDate = dayjs.utc(session.sessionDate);
          return (
            (sessionDate.isAfter(clickedDate) ||
              sessionDate.isSame(clickedDate, "day")) &&
            session.status !== "COMPLETED" &&
            session.status !== "CANCELLED"
          );
        });

        const futureDates = futureSessions.map((s) =>
          dayjs.utc(s.sessionDate).format("YYYY-MM-DD")
        );
        const futureSessionIds = futureSessions.map((s) => s.id);

        setSelectedDates(futureDates);
        setSelectedSessionIds(futureSessionIds);
        setValue("selectedDates", futureDates);
      } else {
        // For other actions, just unselect the single date
        setSelectedDates(selectedDates.filter((d) => d !== date));
        setSelectedSessionIds(
          selectedSessionIds.filter((id) => id !== sessionId)
        );
        setValue("selectedDates", selectedDates.filter((d) => d !== date));
      }
    } else {
      // For CAR_DATE_TIME_CHANGE, select clicked date and all dates after it (same car and slot)
      if (amendmentAction == "CAR_DATE_TIME_CHANGE" && selectedBooking?.sessions) {
        const clickedDate = dayjs.utc(date);
        const futureSessions = selectedBooking.sessions.filter((session) => {
          const sessionDate = dayjs.utc(session.sessionDate);
          return (
            (sessionDate.isAfter(clickedDate) ||
              sessionDate.isSame(clickedDate, "day")) &&
            (session.status === "PENDING" || session.status === "CONFIRMED")
          );
        });

        const futureDates = futureSessions.map((s) =>
          dayjs.utc(s.sessionDate).format("YYYY-MM-DD")
        );
        const futureSessionIds = futureSessions.map((s) => s.id);

        setSelectedDates(futureDates);
        setSelectedSessionIds(futureSessionIds);
        setValue("selectedDates", futureDates);
        
        // Reset car selection
        setAvailableCars([]);
        setSelectedNewCarId(null);
        setNewDates([]);
        setNewTimeSlot("");
        return;
      }

      // For CANCEL_BOOKING, select clicked date and all dates after it
      if (amendmentAction == "CANCEL_BOOKING" && selectedBooking?.sessions) {
        const clickedDate = dayjs.utc(date);
        const futureSessions = selectedBooking.sessions.filter((session) => {
          const sessionDate = dayjs.utc(session.sessionDate);
          return (
            (sessionDate.isAfter(clickedDate) ||
              sessionDate.isSame(clickedDate, "day")) &&
            session.status !== "COMPLETED" &&
            session.status !== "CANCELLED"
          );
        });

        const futureDates = futureSessions.map((s) =>
          dayjs.utc(s.sessionDate).format("YYYY-MM-DD")
        );
        const futureSessionIds = futureSessions.map((s) => s.id);

        setSelectedDates(futureDates);
        setSelectedSessionIds(futureSessionIds);
        setValue("selectedDates", futureDates);
      } else {
        // For other actions, just toggle the single date
        setSelectedDates([...selectedDates, date]);
        setSelectedSessionIds([...selectedSessionIds, sessionId]);
        setValue("selectedDates", [...selectedDates, date]);
      }
    }
  };

  // Handle action change
  const handleActionChange = (action: AmendmentAction) => {
    setAmendmentAction(action);
    setValue("amendmentAction", action);
    setSelectedDates([]);
    setSelectedSessionIds([]);
    setNewDates([]);
    setNewTimeSlot("");
    setAvailableCars([]);
    setSelectedNewCarId(null);
  };

  // Handle new date selection for date change
  const handleNewDateChange = (date: Dayjs | null, index: number) => {
    if (!date) return;

    const updatedDates = [...newDates];
    updatedDates[index] = date;
    setNewDates(updatedDates);

    // Update form value with all new dates
    const dateStrings = updatedDates
      .filter((d) => d) // Filter out null/undefined
      .map((d) => d.format("YYYY-MM-DD"))
      .join(",");
    setValue("newDate", dateStrings);
  };

  // Handle new date selection for car/date/time change
  const handleCarDateTimeNewDateChange = (date: Dayjs | null) => {
    if (!date || !selectedBooking) return;

    // Calculate subsequent dates for all selected sessions
    const numberOfSessions = selectedDates.length;
    const calculatedDates: Dayjs[] = [];
    let currentDate = date;
    
    for (let i = 0; i < numberOfSessions; i++) {
      calculatedDates.push(currentDate);
      
      // Find next available date (skip only school holidays, NOT car bookings)
      if (i < numberOfSessions - 1) {
        let nextDate = currentDate.add(1, "day");
        let attemptsLeft = 30; // Prevent infinite loop
        
        while (attemptsLeft > 0 && isDateBlockedForCalculation(nextDate)) {
          nextDate = nextDate.add(1, "day");
          attemptsLeft--;
        }
        
        currentDate = nextDate;
      }
    }
    
    setNewDates(calculatedDates);
    const dateStrings = calculatedDates.map((d) => d.format("YYYY-MM-DD")).join(",");
    setValue("newDate", dateStrings);
    
    // Reset car selection when date changes
    setAvailableCars([]);
    setSelectedNewCarId(null);
    setValue("newCarId", "");
  };

  // Handle time slot change for car/date/time change
  const handleTimeSlotChange = (timeSlot: string) => {
    setNewTimeSlot(timeSlot);
    setValue("newTimeSlot", timeSlot);
    
    // Reset car selection when time changes
    setAvailableCars([]);
    setSelectedNewCarId(null);
    setValue("newCarId", "");
  };

  // Fetch available cars for selected date and time
  const fetchAvailableCars = async () => {
    if (!selectedBooking || newDates.length === 0 || !newTimeSlot) {
      toast.error("Please select date and time first");
      return;
    }

    setLoadingCars(true);
    try {
      // Fetch all cars for the school
      const allCarsResponse = await ApiCall({
        query: `query GetAllCar($whereSearchInput: SearchCarInput!) {
          getAllCar(whereSearchInput: $whereSearchInput) {
            id
            carName
            registrationNumber
            status
            assignedDriverId
            assignedDriver {
              id
              name
            }
          }
        }`,
        variables: {
          whereSearchInput: {
            schoolId: schoolId,
            status: "AVAILABLE",
          },
        },
      });

      const allCars = (allCarsResponse?.data as GetAllCarResponse)?.getAllCar || [];

      // Fetch bookings for ALL calculated dates and the selected time slot
      const bookedSessionsPromises = newDates.map((date) =>
        ApiCall<GetAllBookingSessionResponse>({
          query: `query GetAllBookingSession($whereSearchInput: WhereBookingSessionSearchInput!) {
            getAllBookingSession(whereSearchInput: $whereSearchInput) {
              carId
              sessionDate
              slot
              status
            }
          }`,
          variables: {
            whereSearchInput: {
              sessionDate: date.format("YYYY-MM-DD"),
              slot: newTimeSlot,
            },
          },
        })
      );

      const bookedSessionsResponses = await Promise.all(bookedSessionsPromises);
      
      // Combine all booked sessions from all dates
      const allBookedSessions = bookedSessionsResponses.flatMap(
        (response) => response?.data?.getAllBookingSession || []
      );

      // Get unique car IDs that are booked on ANY of the calculated dates at the selected time
      const bookedCarIds = new Set(
        allBookedSessions
          .filter((session: BookingSession) => 
            session.status === "PENDING" || 
            session.status === "CONFIRMED"
          )
          .map((session: BookingSession) => session.carId)
      );

      // Filter out cars that are booked on ANY of the calculated dates
      const available = allCars.filter(
        (car: AvailableCar) => !bookedCarIds.has(car.id)
      );

      setAvailableCars(available);
      
      if (available.length === 0) {
        toast.warning("No cars available for all the selected dates and time slot");
      }
    } catch (error) {
      console.error("Error fetching available cars:", error);
      toast.error("Failed to fetch available cars");
      setAvailableCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  // Handle car selection
  const handleCarSelection = (carId: number) => {
    setSelectedNewCarId(carId);
    setValue("newCarId", carId.toString());
  };

  // Check if the date falls on either configured weekly holiday day.
  const isWeeklyOrTestHoliday = (date: Dayjs): boolean => {
    if (!schoolData) return false;

    const dayOfWeek = date.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayMap: { [key: string]: number } = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const configuredHolidays = [schoolData.weeklyHoliday, schoolData.testHoliday]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toUpperCase().trim());

    return configuredHolidays.some((holiday) => dayMap[holiday] == dayOfWeek);
  };

  // Check if a date is blocked (already booked, cancelled, or holiday for the car in same slot)
  const isDateBlocked = (date: Dayjs): boolean => {
    if (!selectedBooking) return false;

    const dateStr = date.format("YYYY-MM-DD");

    // Block dates matching school weekly/test holiday day configuration.
    if (isWeeklyOrTestHoliday(date)) {
      return true;
    }

    // Check if date is already in car's bookings (including ALL dates from current booking)
    const isBookedByCar = allCarSessions.some((session) => {
      const sessionDateStr = dayjs
        .utc(session.sessionDate)
        .format("YYYY-MM-DD");

      // Block ALL dates that have PENDING, CONFIRMED, or CANCELLED sessions
      // This includes dates from the current booking to prevent selecting the old dates again
      return (
        sessionDateStr == dateStr &&
        (session.status == "PENDING" ||
          session.status == "CONFIRMED" ||
          session.status == "CANCELLED")
      );
    });

    // Check school holidays
    const holidays: Holiday[] =
      (holidaysResponse?.data as GetAllHolidayResponse)?.getAllHoliday || [];

    const isHoliday = holidays.some((holiday: Holiday) => {
      const holidayStart = dayjs.utc(holiday.startDate).format("YYYY-MM-DD");
      const holidayEnd = dayjs.utc(holiday.endDate).format("YYYY-MM-DD");
      const isInDateRange = dateStr >= holidayStart && dateStr <= holidayEnd;

      // For SCHOOL type holidays, block all cars
      if (holiday.declarationType == "SCHOOL") {
        return isInDateRange;
      }

      // For CAR type holidays, only block if it's the same car
      if (
        holiday.declarationType == "CAR" &&
        holiday.carId == selectedBooking.carId
      ) {
        // If slots are specified, check if booking slot matches
        if (holiday.slots) {
          try {
            const holidaySlots = JSON.parse(holiday.slots) as string[];
            return isInDateRange && holidaySlots.includes(selectedBooking.slot);
          } catch {
            return isInDateRange;
          }
        }
        return isInDateRange;
      }

      return false;
    });

    return isBookedByCar || isHoliday;
  };

  // Check if a date is blocked for date calculation (only school holidays, not car bookings)
  const isDateBlockedForCalculation = (date: Dayjs): boolean => {
    const dateStr = date.format("YYYY-MM-DD");

    // Block dates matching school weekly/test holiday day configuration.
    if (isWeeklyOrTestHoliday(date)) {
      return true;
    }

    // Check school holidays only (NOT car bookings - allow dates to overlap with selected sessions)
    const holidays: Holiday[] =
      (holidaysResponse?.data as GetAllHolidayResponse)?.getAllHoliday || [];

    const isHoliday = holidays.some((holiday: Holiday) => {
      const holidayStart = dayjs.utc(holiday.startDate).format("YYYY-MM-DD");
      const holidayEnd = dayjs.utc(holiday.endDate).format("YYYY-MM-DD");
      const isInDateRange = dateStr >= holidayStart && dateStr <= holidayEnd;

      // Only check SCHOOL type holidays (ignore CAR holidays for calculation)
      if (holiday.declarationType == "SCHOOL") {
        return isInDateRange;
      }

      return false;
    });

    return isHoliday;
  };

  // Get the earliest date from course start
  const getMinAllowedDate = () => {
    if (!selectedBooking || !selectedBooking.sessions)
      return dayjs().add(1, "day");

    // Get the earliest date from the booking sessions
    const scheduledSessions = selectedBooking.sessions
      .filter((s) => s.status == "PENDING" || s.status == "CONFIRMED")
      .sort((a, b) => dayjs.utc(a.sessionDate).diff(dayjs.utc(b.sessionDate)));

    if (scheduledSessions.length > 0) {
      return dayjs.utc(scheduledSessions[0].sessionDate);
    }

    return dayjs().add(1, "day");
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

    if (amendmentAction == "CANCEL_BOOKING" && selectedDates.length == 0) {
      errors.push("Please select at least one date to cancel");
    }

    if (
      amendmentAction == "CHANGE_DATE" ||
      amendmentAction == "CAR_BREAKDOWN" ||
      amendmentAction == "RELEASE_HOLD"
    ) {
      if (selectedDates.length == 0) {
        errors.push("Please select dates to change");
      }
      if (newDates.length !== selectedDates.length) {
        errors.push(
          `Please select ${selectedDates.length} new date${
            selectedDates.length > 1 ? "s" : ""
          } to replace the selected dates`
        );
      }
      // Validate all new dates are filled
      if (newDates.some((d) => !d)) {
        errors.push("Please fill all new date fields");
      }
    }

    if (amendmentAction == "CAR_DATE_TIME_CHANGE") {
      if (selectedDates.length === 0) {
        errors.push("Please select at least one session to change");
      }
      if (newDates.length !== selectedDates.length) {
        errors.push("Please select a start date to generate all replacement dates");
      }
      if (!newTimeSlot) {
        errors.push("Please select a new time slot");
      }
      if (!selectedNewCarId) {
        errors.push("Please select an available car");
      }
    }

    if (!formValues.reason || formValues.reason.trim() == "") {
      errors.push("Please provide a reason for the amendment");
    }

    return {
      isValid: errors.length == 0,
      errors,
    };
  };

  // Handle submit
  const handleSubmit = () => {
    const validation = validateForm();

    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setShowConfirmModal(true);
  };

  // Mutation for amendment - Update booking sessions
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!amendmentAction || !selectedBooking) {
        throw new Error("Invalid amendment data");
      }

      const promises = [];

      // Handle different amendment actions
      if (amendmentAction == "CANCEL_BOOKING") {
        // Cancel selected sessions - set status to CANCELLED and deletedAt
        for (const sessionId of selectedSessionIds) {
          promises.push(
            ApiCall({
              query: `mutation UpdateBookingSession($updateType: UpdateBookingSessionInput!, $id: Int!) {
                updateBookingSession(updateType: $updateType, id: $id) {
                  id
                  status
                  deletedAt
                }
              }`,
              variables: {
                id: sessionId,
                updateType: {
                  status: "CANCELLED",
                  deletedAt: new Date().toISOString(),
                  internalNotes: formValues.reason,
                },
              },
            })
          );
        }
      } else if (amendmentAction == "CAR_HOLIDAY") {
        // Set selected sessions to HOLD status for car holidays
        for (const sessionId of selectedSessionIds) {
          promises.push(
            ApiCall({
              query: `mutation UpdateBookingSession($updateType: UpdateBookingSessionInput!, $id: Int!) {
                updateBookingSession(updateType: $updateType, id: $id) {
                  id
                  status
                }
              }`,
              variables: {
                id: sessionId,
                updateType: {
                  status: "HOLD",
                  internalNotes: formValues.reason,
                },
              },
            })
          );
        }
      } else if (
        amendmentAction == "CAR_BREAKDOWN" &&
        newDates.length == selectedSessionIds.length
      ) {
        // For car breakdown: Mark old sessions as CANCELLED and create new sessions with same car
        const updatePromises = [];

        for (let i = 0; i < selectedSessionIds.length; i++) {
          const sessionId = selectedSessionIds[i];

          // Update the old session to CANCELLED with deletedAt
          updatePromises.push(
            ApiCall({
              query: `mutation UpdateBookingSession($updateType: UpdateBookingSessionInput!, $id: Int!) {
                updateBookingSession(updateType: $updateType, id: $id) {
                  id
                  status
                  deletedAt
                }
              }`,
              variables: {
                id: sessionId,
                updateType: {
                  status: "CANCELLED",
                  deletedAt: new Date().toISOString(),
                  internalNotes: `Car breakdown - ${formValues.reason}`,
                },
              },
            })
          );
        }

        // Get old sessions data
        const oldSessions =
          selectedBooking.sessions?.filter((s) =>
            selectedSessionIds.includes(s.id)
          ) || [];

        const createPromises = [];

        // Create new sessions with new car and new dates
        for (let i = 0; i < newDates.length; i++) {
          const newDate = newDates[i];
          const oldSession = oldSessions[i];

          if (oldSession) {
            createPromises.push(
              ApiCall({
                query: `mutation CreateBookingSession($inputType: CreateBookingSessionInput!) {
                  createBookingSession(inputType: $inputType) {
                    id
                    sessionDate
                    status
                  }
                }`,
                variables: {
                  inputType: {
                    bookingId: selectedBooking.id,
                    dayNumber: oldSession.dayNumber,
                    sessionDate: newDate.format("YYYY-MM-DD"),
                    slot: oldSession.slot,
                    carId: oldSession.carId,
                    driverId: oldSession.driverId,
                    status: "PENDING",
                    internalNotes: `Car breakdown - Rescheduled from ${dayjs
                      .utc(oldSession.sessionDate)
                      .format("DD MMM YYYY")} - ${formValues.reason}`,
                  },
                },
              })
            );
          }
        }

        // Wait for all new sessions to be created
        await Promise.all(createPromises);

        // Return combined results
        return [...updatePromises, ...createPromises];
      } else if (
        amendmentAction == "CHANGE_DATE" &&
        newDates.length == selectedSessionIds.length
      ) {
        // For date changes: First mark old sessions as CANCELLED with deletedAt
        const updatePromises = [];

        for (let i = 0; i < selectedSessionIds.length; i++) {
          const sessionId = selectedSessionIds[i];

          // Update the old session to CANCELLED with deletedAt instead of deleting
          updatePromises.push(
            ApiCall({
              query: `mutation UpdateBookingSession($updateType: UpdateBookingSessionInput!, $id: Int!) {
                updateBookingSession(updateType: $updateType, id: $id) {
                  id
                  status
                  deletedAt
                }
              }`,
              variables: {
                id: sessionId,
                updateType: {
                  status: "CANCELLED",
                  deletedAt: new Date().toISOString(),
                  internalNotes: `Date changed - ${formValues.reason}`,
                },
              },
            })
          );
        }

        // Wait for all old sessions to be cancelled first
        // await Promise.all(updatePromises);

        // Then create new sessions for the new dates
        const oldSessions =
          selectedBooking.sessions?.filter((s) =>
            selectedSessionIds.includes(s.id)
          ) || [];

        const createPromises = [];

        for (let i = 0; i < newDates.length; i++) {
          const newDate = newDates[i];
          const oldSession = oldSessions[i];

          if (oldSession) {
            createPromises.push(
              ApiCall({
                query: `mutation CreateBookingSession($inputType: CreateBookingSessionInput!) {
                  createBookingSession(inputType: $inputType) {
                    id
                    sessionDate
                    status
                  }
                }`,
                variables: {
                  inputType: {
                    bookingId: selectedBooking.id,
                    dayNumber: oldSession.dayNumber,
                    sessionDate: newDate.format("YYYY-MM-DD"),
                    slot: oldSession.slot,
                    carId: oldSession.carId,
                    driverId: oldSession.driverId,
                    status: "PENDING",
                    internalNotes: `Rescheduled from ${dayjs
                      .utc(oldSession.sessionDate)
                      .format("DD MMM YYYY")} - ${formValues.reason}`,
                  },
                },
              })
            );
          }
        }

        // Wait for all new sessions to be created
        await Promise.all(createPromises);

        // Return combined results
        return [...updatePromises, ...createPromises];
      } else if (
        amendmentAction == "RELEASE_HOLD" &&
        newDates.length == selectedSessionIds.length
      ) {
        // For release hold: Mark old HOLD sessions as CANCELLED and create new sessions
        const updatePromises = [];

        for (let i = 0; i < selectedSessionIds.length; i++) {
          const sessionId = selectedSessionIds[i];

          // Update the old HOLD session to CANCELLED with deletedAt
          updatePromises.push(
            ApiCall({
              query: `mutation UpdateBookingSession($updateType: UpdateBookingSessionInput!, $id: Int!) {
                updateBookingSession(updateType: $updateType, id: $id) {
                  id
                  status
                  deletedAt
                }
              }`,
              variables: {
                id: sessionId,
                updateType: {
                  id: sessionId,
                  status: "CANCELLED",
                  deletedAt: new Date().toISOString(),
                  internalNotes: `Hold released - ${formValues.reason}`,
                },
              },
            })
          );
        }

        // Then create new sessions for the new dates
        const oldSessions =
          selectedBooking.sessions?.filter((s) =>
            selectedSessionIds.includes(s.id)
          ) || [];

        const createPromises = [];

        for (let i = 0; i < newDates.length; i++) {
          const newDate = newDates[i];
          const oldSession = oldSessions[i];

          if (oldSession) {
            createPromises.push(
              ApiCall({
                query: `mutation CreateBookingSession($inputType: CreateBookingSessionInput!) {
                  createBookingSession(inputType: $inputType) {
                    id
                    sessionDate
                    status
                  }
                }`,
                variables: {
                  inputType: {
                    bookingId: selectedBooking.id,
                    dayNumber: oldSession.dayNumber,
                    sessionDate: newDate.format("YYYY-MM-DD"),
                    slot: oldSession.slot,
                    carId: oldSession.carId,
                    driverId: oldSession.driverId,
                    status: "PENDING",
                    internalNotes: `Released from hold - Rescheduled from ${dayjs
                      .utc(oldSession.sessionDate)
                      .format("DD MMM YYYY")} - ${formValues.reason}`,
                  },
                },
              })
            );
          }
        }

        // Wait for all new sessions to be created
        await Promise.all(createPromises);

        // Return combined results
        return [...updatePromises, ...createPromises];
      } else if (
        amendmentAction == "CAR_DATE_TIME_CHANGE" &&
        selectedSessionIds.length > 0 &&
        newDates.length === selectedSessionIds.length &&
        newTimeSlot &&
        selectedNewCarId
      ) {
        // For car/date/time change: Mark old sessions as EDITED and create new sessions with new car, date, time
        const updatePromises = [];
        const createPromises = [];

        // Get the selected car's driver
        const selectedCar = availableCars.find((car) => car.id === selectedNewCarId);
        const newDriverId = selectedCar?.assignedDriverId;

        // Get old sessions sorted by date
        const oldSessions = selectedBooking.sessions
          ?.filter((s) => selectedSessionIds.includes(s.id))
          .sort((a, b) => dayjs.utc(a.sessionDate).diff(dayjs.utc(b.sessionDate))) || [];

        if (oldSessions.length === 0) {
          throw new Error("Old sessions not found");
        }

        // Update all old sessions to EDITED status
        for (const oldSession of oldSessions) {
          updatePromises.push(
            ApiCall({
              query: `mutation UpdateBookingSession($updateType: UpdateBookingSessionInput!, $id: Int!) {
                updateBookingSession(updateType: $updateType, id: $id) {
                  id
                  status
                }
              }`,
              variables: {
                id: oldSession.id,
                updateType: {
                  status: "EDITED",
                  internalNotes: `Car/Date/Time changed - ${formValues.reason}`,
                },
              },
            })
          );
        }

        // Create new sessions with new car, date, time, and driver
        for (let i = 0; i < newDates.length; i++) {
          const newDate = newDates[i];
          const oldSession = oldSessions[i];

          if (oldSession && newDriverId) {
            createPromises.push(
              ApiCall({
                query: `mutation CreateBookingSession($inputType: CreateBookingSessionInput!) {
                  createBookingSession(inputType: $inputType) {
                    id
                    sessionDate
                    slot
                    carId
                    driverId
                    status
                  }
                }`,
                variables: {
                  inputType: {
                    bookingId: selectedBooking.id,
                    dayNumber: oldSession.dayNumber,
                    sessionDate: newDate.format("YYYY-MM-DD"),
                    slot: newTimeSlot,
                    carId: selectedNewCarId,
                    driverId: newDriverId,
                    status: "PENDING",
                    internalNotes: `Changed from ${dayjs.utc(oldSession.sessionDate).format("DD MMM YYYY")} ${oldSession.slot} (${selectedBooking.carName}) - ${formValues.reason}`,
                  },
                },
              })
            );
          }
        }

        // Wait for all operations to complete
        await Promise.all([...updatePromises, ...createPromises]);

        // Return combined results
        return [...updatePromises, ...createPromises];
      }

      return await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Amendment processed successfully!");
      setShowConfirmModal(false);
      // Reset form
      setBookings([]);
      setSelectedBooking(null);
      setSelectedDates([]);
      setSelectedSessionIds([]);
      setAmendmentAction(null);
      setNewDates([]);
      methods.reset();
      router.push("/mtadmin/scheduler");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to process amendment. Please try again."
      );
    },
  });

  const confirmAmendment = () => {
    if (newDates.length > 0) {
      const dateStrings = newDates.map((d) => d.format("YYYY-MM-DD")).join(",");
      setValue("newDate", dateStrings);
    }
    mutate();
  };

  const actionIcons = {
    CANCEL_BOOKING: <DeleteOutlined className="text-red-600" />,
    CHANGE_DATE: <SwapOutlined className="text-blue-600" />,
    CAR_BREAKDOWN: <ToolOutlined className="text-orange-600" />,
    CAR_HOLIDAY: <StopOutlined className="text-purple-600" />,
    RELEASE_HOLD: <CalendarOutlined className="text-green-600" />,
    CAR_DATE_TIME_CHANGE: <CarOutlined className="text-teal-600" />,
  };

  const actionColors = {
    CANCEL_BOOKING: "red",
    CHANGE_DATE: "blue",
    CAR_BREAKDOWN: "orange",
    CAR_HOLIDAY: "purple",
    RELEASE_HOLD: "green",
    CAR_DATE_TIME_CHANGE: "teal",
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-6">
        <div className=" mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <ExclamationCircleOutlined className="text-orange-600" />
                  Booking Amendment
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage cancellations, date changes, and booking modifications
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
                      className="w-full grid grid-cols-2 gap-2"
                    >
                      <Radio.Button
                        value="mobile"
                        className="text-center h-10 flex items-center justify-center"
                      >
                        <PhoneOutlined className="mr-2" />
                        Mobile
                      </Radio.Button>
                      <Radio.Button
                        value="bookingId"
                        className="text-center h-10 flex items-center justify-center"
                      >
                        <BookOutlined className="mr-2" />
                        Booking ID
                      </Radio.Button>
                      <Radio.Button
                        value="name"
                        className="text-center h-10 flex items-center justify-center"
                      >
                        <SearchOutlined className="mr-2" />
                        Name
                      </Radio.Button>
                      <Radio.Button
                        value="surname"
                        className="text-center h-10 flex items-center justify-center"
                      >
                        <SearchOutlined className="mr-2" />
                        Surname
                      </Radio.Button>
                    </Radio.Group>
                  </div>

                  {searchMethod == "mobile" ? (
                    <TextInput
                      name="customerMobile"
                      title="Customer Mobile Number"
                      placeholder="Enter 10-digit mobile number"
                      required={true}
                      maxlength={10}
                    />
                  ) : searchMethod == "name" ? (
                    <TextInput
                      name="customerName"
                      title="Customer Name"
                      placeholder="Enter customer name"
                      required={true}
                    />
                  ) : searchMethod == "surname" ? (
                    <TextInput
                      name="customerSurname"
                      title="Customer Surname"
                      placeholder="Enter customer surname"
                      required={true}
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
                      (searchMethod == "mobile" &&
                        !formValues.customerMobile) ||
                      (searchMethod == "name" &&
                        !formValues.customerName) ||
                      (searchMethod == "surname" &&
                        !formValues.customerSurname) ||
                      (searchMethod == "bookingId" && !formValues.bookingId)
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
                          selectedBooking?.id == booking.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => handleSelectBooking(booking)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">
                              {booking.bookingId}
                            </span>
                            <Badge
                              status={
                                booking.status == "CONFIRMED"
                                  ? "success"
                                  : booking.status == "PENDING"
                                  ? "warning"
                                  : booking.status == "CANCELLED"
                                  ? "error"
                                  : "default"
                              }
                              text={booking.status}
                            />
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <CarOutlined className="text-blue-600" />
                              <span>{booking.carName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockCircleOutlined className="text-purple-600" />
                              <span>{convertSlotTo12Hour(booking.slot)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOutlined className="text-green-600" />
                              <span>{booking.courseName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarOutlined className="text-orange-600" />
                              <span>
                                {booking.sessions?.length || 0} sessions
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Details Card - Moved to Left Sidebar */}
              {selectedBooking && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOutlined className="text-blue-600" />
                    Booking Details
                  </h2>

                  {/* Course Date Range */}
                  {selectedBooking.sessions &&
                    selectedBooking.sessions.length > 0 &&
                    (() => {
                      const sortedSessions = [...selectedBooking.sessions]
                        .filter(
                          (s) =>
                            s.status == "PENDING" || s.status == "CONFIRMED"
                        )
                        .sort((a, b) =>
                          dayjs
                            .utc(a.sessionDate)
                            .diff(dayjs.utc(b.sessionDate))
                        );
                      const startDate =
                        sortedSessions.length > 0
                          ? dayjs
                              .utc(sortedSessions[0].sessionDate)
                              .format("DD MMM YYYY")
                          : "N/A";
                      const endDate =
                        sortedSessions.length > 0
                          ? dayjs
                              .utc(
                                sortedSessions[sortedSessions.length - 1]
                                  .sessionDate
                              )
                              .format("DD MMM YYYY")
                          : "N/A";
                      const firstSession = selectedBooking.sessions[0];

                      return (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3 border-2 border-blue-200">
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                Course Duration
                              </div>
                              <div className="font-bold text-gray-900">
                                {startDate} - {endDate}
                              </div>
                            </div>
                            {firstSession?.driver && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">
                                  Trainer
                                </div>
                                <div className="font-bold text-gray-900">
                                  {firstSession.driver.name}
                                </div>
                              </div>
                            )}
                            {firstSession?.car && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">
                                  Car Registration
                                </div>
                                <div className="font-bold text-gray-900">
                                  {firstSession.car.registrationNumber}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex gap-4">
                      <div className="bg-blue-50 flex-1 rounded-lg p-3 border-2 border-blue-200">
                        <div className="text-xs text-gray-600 mb-0.5">
                          Booking ID
                        </div>
                        <div className="font-bold text-base text-gray-900">
                          {selectedBooking.bookingId}
                        </div>
                      </div>

                      <div className="bg-green-50 flex-1 rounded-lg p-3 border-2 border-green-200">
                        <div className="text-xs text-gray-600 mb-0.5">
                          Customer
                        </div>
                        <div className="font-bold text-base text-gray-900">
                          {selectedBooking.customerName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {selectedBooking.customerMobile}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-purple-50 flex-1 rounded-lg p-3 border-2 border-purple-200">
                        <div className="text-xs text-gray-600 mb-0.5">
                          Car & Slot
                        </div>
                        <div className="font-bold text-sm text-gray-900">
                          {selectedBooking.carName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {convertSlotTo12Hour(selectedBooking.slot)}
                        </div>
                      </div>
                      <div className="bg-orange-50 flex-1 rounded-lg p-3 border-2 border-orange-200">
                        <div className="text-xs text-gray-600 mb-0.5">
                          Course
                        </div>
                        <div className="font-bold text-sm text-gray-900">
                          {selectedBooking.courseName}
                        </div>
                        <div className="text-xs text-blue-600 font-semibold">
                          ₹{selectedBooking.totalAmount}
                        </div>
                      </div>
                    </div>
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
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          No Booking Selected
                        </p>
                        <p className="text-sm text-gray-500">
                          Search and select a booking to view details and make
                          amendments
                        </p>
                      </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <>
                  {/* Booking Dates Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarOutlined className="text-green-600" />
                      Booked Sessions ({selectedBooking.sessions?.length || 0})
                    </h2>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {(selectedBooking.sessions || [])
                        .sort((a, b) =>
                          dayjs
                            .utc(a.sessionDate)
                            .diff(dayjs.utc(b.sessionDate))
                        )
                        .map((session) => {
                          const sessionDate = dayjs
                            .utc(session.sessionDate)
                            .format("YYYY-MM-DD");
                          const isFuture = dayjs
                            .utc(session.sessionDate)
                            .isAfter(dayjs(), "day");
                          const isSelected =
                            selectedDates.includes(sessionDate);
                          const isDisabled =
                            amendmentAction == "RELEASE_HOLD"
                              ? session.status !== "HOLD"
                              : (session.status !== "PENDING" &&
                                  session.status !== "CONFIRMED") ||
                                !isFuture;

                          return (
                            <div
                              key={session.id}
                              className={`relative rounded-lg p-2 border-2 transition-all ${
                                isDisabled
                                  ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                                  : isSelected
                                  ? "bg-blue-100 border-blue-500 cursor-pointer"
                                  : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
                              }`}
                              onClick={() => {
                                if (!isDisabled && amendmentAction) {
                                  handleToggleDate(session.id, sessionDate);
                                }
                              }}
                            >
                              {amendmentAction && !isDisabled && (
                                <Checkbox
                                  checked={isSelected}
                                  className="absolute top-1 right-1"
                                />
                              )}
                              <div className="text-center">
                                <div className="font-bold text-sm text-gray-900">
                                  {dayjs
                                    .utc(session.sessionDate)
                                    .format("DD MMM")}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {dayjs
                                    .utc(session.sessionDate)
                                    .format("YYYY")}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-500">
                                  Day {session.dayNumber}
                                </div>
                                <div className="mt-1">
                                  <Tag
                                    color={
                                      session.status == "COMPLETED"
                                        ? "success"
                                        : session.status == "CANCELLED"
                                        ? "error"
                                        : session.status == "HOLD"
                                        ? "warning"
                                        : isFuture
                                        ? "processing"
                                        : "default"
                                    }
                                    className="text-xs px-1 py-0"
                                  >
                                    {session.status == "COMPLETED"
                                      ? "Done"
                                      : session.status == "CANCELLED"
                                      ? "Cancelled"
                                      : session.status == "HOLD"
                                      ? "Hold"
                                      : isFuture
                                      ? "Upcoming"
                                      : "Past"}
                                  </Tag>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="mt-3 text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
                      <strong>Note:</strong> Only future scheduled dates can be
                      modified
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
                          amendmentAction == "CANCEL_BOOKING"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 hover:border-red-400"
                        }`}
                        onClick={() => handleActionChange("CANCEL_BOOKING")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <DeleteOutlined className="text-2xl text-red-600" />
                          <span className="font-bold text-gray-900">
                            Cancel Booking
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Cancel selected dates or entire booking
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction == "CHANGE_DATE"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400"
                        }`}
                        onClick={() => handleActionChange("CHANGE_DATE")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <SwapOutlined className="text-2xl text-blue-600" />
                          <span className="font-bold text-gray-900">
                            Change Date
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Reschedule booking to a new date
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction == "CAR_BREAKDOWN"
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-300 hover:border-orange-400"
                        }`}
                        onClick={() => handleActionChange("CAR_BREAKDOWN")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <ToolOutlined className="text-2xl text-orange-600" />
                          <span className="font-bold text-gray-900">
                            Car Breakdown
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Report car breakdown for refund/reschedule
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction == "CAR_HOLIDAY"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-300 hover:border-purple-400"
                        }`}
                        onClick={() => handleActionChange("CAR_HOLIDAY")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <StopOutlined className="text-2xl text-purple-600" />
                          <span className="font-bold text-gray-900">
                            HOLD Slot
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Place booking on HOLD for selected dates
                        </p>
                      </div>

                      {selectedBooking?.sessions?.some(
                        (s) => s.status == "HOLD"
                      ) && (
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            amendmentAction == "RELEASE_HOLD"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300 hover:border-green-400"
                          }`}
                          onClick={() => handleActionChange("RELEASE_HOLD")}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarOutlined className="text-2xl text-green-600" />
                            <span className="font-bold text-gray-900">
                              Release Hold
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Reschedule held sessions to new dates
                          </p>
                        </div>
                      )}

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          amendmentAction == "CAR_DATE_TIME_CHANGE"
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-300 hover:border-teal-400"
                        }`}
                        onClick={() => handleActionChange("CAR_DATE_TIME_CHANGE")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <CarOutlined className="text-2xl text-teal-600" />
                          <span className="font-bold text-gray-900">
                            Car/Date/Time Change
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Change car, date, and time for selected sessions
                        </p>
                      </div>
                    </div>

                    {amendmentAction && (
                      <div className="space-y-4 animate-fadeIn">
                        {amendmentAction == "CHANGE_DATE" &&
                          selectedDates.length > 0 &&
                          (() => {
                            // Sort selected dates chronologically
                            const sortedDatesWithIndex = selectedDates
                              .map((date, originalIndex) => ({
                                date,
                                originalIndex,
                              }))
                              .sort((a, b) =>
                                dayjs(a.date).diff(dayjs(b.date))
                              );

                            return (
                              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                  New Dates (Select {selectedDates.length}{" "}
                                  replacement date
                                  {selectedDates.length > 1 ? "s" : ""})
                                </label>
                                <div className="space-y-3">
                                  {sortedDatesWithIndex.map(
                                    ({ date: oldDate, originalIndex }) => (
                                      <div
                                        key={oldDate}
                                        className="bg-white rounded-lg p-3 border border-blue-300"
                                      >
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="flex-1">
                                            <div className="text-xs text-gray-600 mb-1">
                                              Replacing:{" "}
                                              <span className="font-semibold text-gray-900">
                                                {dayjs(oldDate).format(
                                                  "DD MMM YYYY"
                                                )}
                                              </span>
                                            </div>
                                            <DatePicker
                                              value={
                                                newDates[originalIndex] || null
                                              }
                                              onChange={(date) =>
                                                handleNewDateChange(
                                                  date,
                                                  originalIndex
                                                )
                                              }
                                              format="DD MMM YYYY"
                                              size="large"
                                              className="w-full"
                                              disabledDate={(current) => {
                                                if (!current) return false;

                                                const minDate =
                                                  getMinAllowedDate();
                                                const isPast = current.isBefore(
                                                  minDate,
                                                  "day"
                                                );
                                                const isBlocked =
                                                  isDateBlocked(current);

                                                return isPast || isBlocked;
                                              }}
                                              placeholder={`Select new date (from ${getMinAllowedDate().format(
                                                "DD MMM YYYY"
                                              )})`}
                                            />
                                          </div>
                                          <div className="text-2xl text-blue-600">
                                            <SwapOutlined />
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded p-2">
                                  <strong>Note:</strong> New dates must be from{" "}
                                  {getMinAllowedDate().format("DD MMM YYYY")}{" "}
                                  onwards. Already booked, cancelled dates for
                                  this car/slot and school holiday dates are
                                  disabled.
                                </div>
                              </div>
                            );
                          })()}

                        {amendmentAction == "CAR_BREAKDOWN" &&
                          selectedDates.length > 0 &&
                          (() => {
                            // Sort selected dates chronologically
                            const sortedDatesWithIndex = selectedDates
                              .map((date, originalIndex) => ({
                                date,
                                originalIndex,
                              }))
                              .sort((a, b) =>
                                dayjs(a.date).diff(dayjs(b.date))
                              );

                            return (
                              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                  New Dates (Select {selectedDates.length}{" "}
                                  replacement date
                                  {selectedDates.length > 1 ? "s" : ""})
                                </label>
                                <div className="space-y-3">
                                  {sortedDatesWithIndex.map(
                                    ({ date: oldDate, originalIndex }) => (
                                      <div
                                        key={oldDate}
                                        className="bg-white rounded-lg p-3 border border-orange-300"
                                      >
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="flex-1">
                                            <div className="text-xs text-gray-600 mb-1">
                                              Replacing:{" "}
                                              <span className="font-semibold text-gray-900">
                                                {dayjs(oldDate).format(
                                                  "DD MMM YYYY"
                                                )}
                                              </span>
                                            </div>
                                            <DatePicker
                                              value={
                                                newDates[originalIndex] || null
                                              }
                                              onChange={(date) =>
                                                handleNewDateChange(
                                                  date,
                                                  originalIndex
                                                )
                                              }
                                              format="DD MMM YYYY"
                                              size="large"
                                              className="w-full"
                                              disabledDate={(current) =>
                                                isDateBlocked(current)
                                              }
                                              minDate={getMinAllowedDate()}
                                              placeholder="Select new date"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="mt-3 text-xs text-gray-600 bg-white rounded p-2 border border-orange-200">
                                  📅 You can only select dates from{" "}
                                  {getMinAllowedDate().format("DD MMM YYYY")}{" "}
                                  onwards. Already booked, cancelled dates for
                                  this car/slot and school holiday dates are
                                  disabled.
                                </div>
                              </div>
                            );
                          })()}

                        {amendmentAction == "RELEASE_HOLD" &&
                          selectedDates.length > 0 &&
                          (() => {
                            // Sort selected dates chronologically
                            const sortedDatesWithIndex = selectedDates
                              .map((date, originalIndex) => ({
                                date,
                                originalIndex,
                              }))
                              .sort((a, b) =>
                                dayjs(a.date).diff(dayjs(b.date))
                              );

                            return (
                              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                  New Dates (Select {selectedDates.length}{" "}
                                  replacement date
                                  {selectedDates.length > 1 ? "s" : ""})
                                </label>
                                <div className="space-y-3">
                                  {sortedDatesWithIndex.map(
                                    ({ date: oldDate, originalIndex }) => (
                                      <div
                                        key={oldDate}
                                        className="bg-white rounded-lg p-3 border border-green-300"
                                      >
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="flex-1">
                                            <div className="text-xs text-gray-600 mb-1">
                                              Replacing:{" "}
                                              <span className="font-semibold text-gray-900">
                                                {dayjs(oldDate).format(
                                                  "DD MMM YYYY"
                                                )}
                                              </span>
                                            </div>
                                            <DatePicker
                                              value={
                                                newDates[originalIndex] || null
                                              }
                                              onChange={(date) =>
                                                handleNewDateChange(
                                                  date,
                                                  originalIndex
                                                )
                                              }
                                              format="DD MMM YYYY"
                                              size="large"
                                              className="w-full"
                                              disabledDate={(current) =>
                                                isDateBlocked(current)
                                              }
                                              minDate={getMinAllowedDate()}
                                              placeholder="Select new date"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                                <div className="mt-3 text-xs text-gray-600 bg-white rounded p-2 border border-green-200">
                                  📅 You can only select dates from{" "}
                                  {getMinAllowedDate().format("DD MMM YYYY")}{" "}
                                  onwards. Already booked, cancelled dates for
                                  this car/slot and school holiday dates are
                                  disabled.
                                </div>
                              </div>
                            );
                          })()}

                        {amendmentAction == "CAR_DATE_TIME_CHANGE" &&
                          selectedDates.length > 0 && (
                            <div className="bg-teal-50 rounded-lg p-4 border-2 border-teal-200">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Change Car, Date & Time ({selectedDates.length} session{selectedDates.length > 1 ? 's' : ''})
                              </label>
                              
                              {/* Show selected sessions info */}
                              <div className="bg-white rounded-lg p-3 border border-teal-300 mb-4">
                                <div className="text-xs text-gray-600 mb-1">
                                  Selected Sessions: {selectedDates.length}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedDates.map((date) => (
                                    <Tag key={date} color="blue" className="text-xs">
                                      {dayjs(date).format("DD MMM YYYY")}
                                    </Tag>
                                  ))}
                                </div>
                                <div className="text-xs text-gray-600 mt-2">
                                  Current: {convertSlotTo12Hour(selectedBooking?.slot || "")} - {selectedBooking?.carName}
                                </div>
                              </div>

                              {/* Date Selection */}
                              <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                  Select Start Date (subsequent dates will be auto-calculated)
                                </label>
                                <DatePicker
                                  value={newDates[0] || null}
                                  onChange={handleCarDateTimeNewDateChange}
                                  format="DD MMM YYYY"
                                  size="large"
                                  className="w-full"
                                  disabledDate={(current) => {
                                    if (!current) return false;
                                    // Only allow future dates
                                    return current.isBefore(dayjs().add(1, "day"), "day");
                                  }}
                                  placeholder="Select start date (future dates only)"
                                />
                              </div>

                              {/* Show calculated dates */}
                              {newDates.length > 0 && (
                                <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                                  <div className="text-xs font-semibold text-gray-700 mb-2">
                                    Calculated Dates (holidays skipped):
                                  </div>
                                  <div className="space-y-2">
                                    {newDates.map((newDate, index) => (
                                      <div key={index} className="flex items-center justify-between text-sm bg-white rounded p-2">
                                        <div>
                                          <span className="text-gray-600">Session {index + 1}: </span>
                                          <span className="font-semibold text-gray-900">
                                            {dayjs(selectedDates[index]).format("DD MMM YYYY")}
                                          </span>
                                        </div>
                                        <SwapOutlined className="text-blue-600" />
                                        <div>
                                          <span className="font-semibold text-green-600">
                                            {newDate.format("DD MMM YYYY")}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Time Slot Selection */}
                              <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                  Select New Time Slot (same for all sessions)
                                </label>
                                <Select
                                  value={newTimeSlot || undefined}
                                  onChange={handleTimeSlotChange}
                                  size="large"
                                  className="w-full"
                                  placeholder="Select time slot"
                                  options={[
                                    { value: "06:00-07:00", label: "06:00 - 07:00 AM" },
                                    { value: "07:00-08:00", label: "07:00 - 08:00 AM" },
                                    { value: "08:00-09:00", label: "08:00 - 09:00 AM" },
                                    { value: "09:00-10:00", label: "09:00 - 10:00 AM" },
                                    { value: "10:00-11:00", label: "10:00 - 11:00 AM" },
                                    { value: "11:00-12:00", label: "11:00 - 12:00 PM" },
                                    { value: "12:00-13:00", label: "12:00 - 01:00 PM" },
                                    { value: "13:00-14:00", label: "01:00 - 02:00 PM" },
                                    { value: "14:00-15:00", label: "02:00 - 03:00 PM" },
                                    { value: "15:00-16:00", label: "03:00 - 04:00 PM" },
                                    { value: "16:00-17:00", label: "04:00 - 05:00 PM" },
                                    { value: "17:00-18:00", label: "05:00 - 06:00 PM" },
                                    { value: "18:00-19:00", label: "06:00 - 07:00 PM" },
                                    { value: "19:00-20:00", label: "07:00 - 08:00 PM" },
                                  ]}
                                />
                              </div>

                              {/* Check Available Cars Button */}
                              {newDates.length > 0 && newTimeSlot && (
                                <div className="mb-4">
                                  <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<SearchOutlined />}
                                    onClick={fetchAvailableCars}
                                    loading={loadingCars}
                                  >
                                    Check Available Cars
                                  </Button>
                                </div>
                              )}

                              {/* Available Cars List */}
                              {availableCars.length > 0 && (
                                <div className="mt-4">
                                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                                    Available Cars ({availableCars.length})
                                  </label>
                                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                                    {availableCars.map((car) => (
                                      <div
                                        key={car.id}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                          selectedNewCarId === car.id
                                            ? "border-teal-500 bg-teal-100"
                                            : "border-gray-300 hover:border-teal-400 bg-white"
                                        }`}
                                        onClick={() => handleCarSelection(car.id)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="font-semibold text-gray-900">
                                              {car.carName}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              {car.registrationNumber}
                                            </div>
                                            {car.assignedDriver && (
                                              <div className="text-xs text-blue-600 mt-1">
                                                Driver: {car.assignedDriver.name}
                                              </div>
                                            )}
                                          </div>
                                          {selectedNewCarId === car.id && (
                                            <CheckCircleOutlined className="text-teal-600 text-xl" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 text-xs text-teal-700 bg-teal-100 rounded p-2">
                                <strong>Note:</strong> Select sessions to change. The system will automatically calculate subsequent dates, skipping holidays. All sessions will use the same new car and time slot.
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
                              <p className="font-semibold text-yellow-800 mb-1">
                                Selected Dates: {selectedDates.length}
                              </p>
                              <p className="text-yellow-700">
                                {selectedDates.length == 0
                                  ? "Please select dates from the calendar above to proceed"
                                  : `${selectedDates
                                      .map((d) => dayjs(d).format("DD MMM"))
                                      .join(", ")}`}
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
                            selectedDates.length == 0 ||
                            !formValues.reason ||
                            ((amendmentAction == "CHANGE_DATE" ||
                              amendmentAction == "CAR_BREAKDOWN" ||
                              amendmentAction == "RELEASE_HOLD") &&
                              newDates.length !== selectedDates.length) ||
                            (amendmentAction == "CAR_DATE_TIME_CHANGE" &&
                              (!newDates[0] || !newTimeSlot || !selectedNewCarId))
                          }
                          danger={amendmentAction == "CANCEL_BOOKING"}
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
            onClick={confirmAmendment}
            danger={amendmentAction == "CANCEL_BOOKING"}
            icon={amendmentAction ? actionIcons[amendmentAction] : undefined}
          >
            Confirm Amendment
          </Button>,
        ]}
        width={700}
      >
        {selectedBooking && amendmentAction && (
          <div className="space-y-4">
            <div
              className={`bg-${actionColors[amendmentAction]}-50 rounded-lg p-4 border border-${actionColors[amendmentAction]}-200`}
            >
              <h3 className="font-bold text-gray-900 mb-3">
                Amendment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Action:</span>
                  <Tag
                    color={actionColors[amendmentAction]}
                    className="font-semibold"
                  >
                    {amendmentAction.replace("_", " ")}
                  </Tag>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedBooking.bookingId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedBooking.customerName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Selected Dates:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDates.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">
                Dates to be Modified
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date) => (
                  <Tag key={date} color="blue" className="text-sm">
                    {dayjs(date).format("DD MMM YYYY")}
                  </Tag>
                ))}
              </div>
            </div>

            {amendmentAction == "CHANGE_DATE" && newDates.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">Date Changes</h3>
                <div className="space-y-2">
                  {selectedDates.map((oldDate, index) => (
                    <div
                      key={oldDate}
                      className="flex items-center justify-between text-sm bg-white rounded p-2 border border-green-300"
                    >
                      <div>
                        <span className="text-gray-600">Old: </span>
                        <span className="font-semibold text-red-600">
                          {dayjs(oldDate).format("DD MMM YYYY")}
                        </span>
                      </div>
                      <SwapOutlined className="text-blue-600" />
                      <div>
                        <span className="text-gray-600">New: </span>
                        <span className="font-semibold text-green-600">
                          {newDates[index]
                            ? newDates[index].format("DD MMM YYYY")
                            : "Not selected"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {amendmentAction == "CAR_BREAKDOWN" && newDates.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  Car Breakdown - Date Changes
                </h3>
                <div className="space-y-2">
                  {selectedDates.map((oldDate, index) => (
                    <div
                      key={oldDate}
                      className="flex items-center justify-between text-sm bg-white rounded p-2 border border-orange-300"
                    >
                      <div>
                        <span className="text-gray-600">Old: </span>
                        <span className="font-semibold text-red-600">
                          {dayjs(oldDate).format("DD MMM YYYY")}
                        </span>
                      </div>
                      <SwapOutlined className="text-orange-600" />
                      <div>
                        <span className="text-gray-600">New: </span>
                        <span className="font-semibold text-green-600">
                          {newDates[index]
                            ? newDates[index].format("DD MMM YYYY")
                            : "Not selected"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {amendmentAction == "RELEASE_HOLD" && newDates.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  Release Hold - Date Changes
                </h3>
                <div className="space-y-2">
                  {selectedDates.map((oldDate, index) => (
                    <div
                      key={oldDate}
                      className="flex items-center justify-between text-sm bg-white rounded p-2 border border-green-300"
                    >
                      <div>
                        <span className="text-gray-600">Old: </span>
                        <span className="font-semibold text-red-600">
                          {dayjs(oldDate).format("DD MMM YYYY")}
                        </span>
                      </div>
                      <SwapOutlined className="text-green-600" />
                      <div>
                        <span className="text-gray-600">New: </span>
                        <span className="font-semibold text-green-600">
                          {newDates[index]
                            ? newDates[index].format("DD MMM YYYY")
                            : "Not selected"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {amendmentAction == "CAR_DATE_TIME_CHANGE" && newDates.length > 0 && newTimeSlot && selectedNewCarId && (
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <h3 className="font-bold text-gray-900 mb-3">
                  Car/Date/Time Change Details ({newDates.length} session{newDates.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-3">
                  {newDates.map((newDate, index) => (
                    <div key={index} className="bg-white rounded p-3 border border-teal-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Old Session {index + 1}</div>
                          <div className="font-semibold text-red-600">
                            {dayjs(selectedDates[index]).format("DD MMM YYYY")}
                          </div>
                          <div className="text-sm text-gray-600">{convertSlotTo12Hour(selectedBooking?.slot || "")}</div>
                          <div className="text-sm text-gray-600">{selectedBooking?.carName}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">New Session {index + 1}</div>
                          <div className="font-semibold text-green-600">
                            {newDate.format("DD MMM YYYY")}
                          </div>
                          <div className="text-sm text-gray-600">{convertSlotTo12Hour(newTimeSlot)}</div>
                          <div className="text-sm text-gray-600">
                            {availableCars.find((car) => car.id === selectedNewCarId)?.carName || "Selected Car"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(() => {
                    const selectedCar = availableCars.find((car) => car.id === selectedNewCarId);
                    return selectedCar?.assignedDriver && (
                      <div className="text-sm text-blue-600 bg-blue-50 rounded p-2 border border-blue-200">
                        <strong>New Driver (all sessions):</strong> {selectedCar.assignedDriver.name}
                      </div>
                    );
                  })()}
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
                    This action cannot be undone. Please confirm that all
                    details are correct before proceeding.
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
