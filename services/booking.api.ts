import { ApiCall } from "./api";

// Types
export interface BookingSession {
  id: number;
  bookingId: number;
  dayNumber: number;
  sessionDate: string;
  slot: string;
  carId: number;
  driverId: number;
  driver?: {
    id: number;
    userId: number;
    name: string;
  };
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  attended: boolean;
  completedAt?: string;
  instructorNotes?: string;
  customerFeedback?: string;
  internalNotes?: string;
  performanceRating?: number;
  skillsAssessed?: string;
  progressNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  schoolId: number;
  bookingId: string;
  carId: number;
  carName: string;
  slot: string;
  bookingDate: string;
  customerMobile: string;
  customerName?: string;
  customerEmail?: string;
  customerId?: number;
  courseId: number;
  courseName: string;
  coursePrice: number;
  totalAmount: number;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  confirmationNumber?: string;
  createdAt: string;
  updatedAt: string;
  sessions?: BookingSession[];
  customer?: {
    id: number;
    name: string;
    email?: string;
    contact1: string;
    address?: string;
  };
  car?: {
    id: number;
    carId: string;
    carName: string;
    model: string;
    registrationNumber: string;
  };
  course?: {
    id: number;
    courseName: string;
    price: number;
  };
}

export interface BookingPagination {
  getPaginatedBooking: {
    data: Booking[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface AllBookingsResponse {
  getAllBooking: Booking[];
}

export interface SingleBooking {
  getBookingById: Booking;
}

export interface UpdateBookingSessionResponse {
  updateBookingSession: BookingSession;
}

// GraphQL Queries
const GET_PAGINATED_BOOKINGS = `
  query GetPaginatedBooking($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereBookingSearchInput!) {
    getPaginatedBooking(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        schoolId
        bookingId
        carId
        carName
        slot
        bookingDate
        customerMobile
        customerName
        customerEmail
        customerId
        courseId
        courseName
        coursePrice
        totalAmount
        notes
        status
        confirmationNumber
        createdAt
        updatedAt
        sessions {
          id
          bookingId
          dayNumber
          sessionDate
          slot
          carId
          driverId
          status
          attended
          completedAt
          instructorNotes
          driver {
            id
            userId
            name
          }
          customerFeedback
          internalNotes
          performanceRating
          skillsAssessed
          progressNotes
          createdAt
          updatedAt
        }
        customer {
          id
          name
          email
          contact1
          address
        }
        car {
          id
          carId
          carName
          model
          registrationNumber
        }
        course {
          id
          courseName
          price
        }
      }
      total
      skip
      take
    }
  }
`;

const GET_ALL_BOOKINGS = `
  query GetAllBooking($whereSearchInput: WhereBookingSearchInput!) {
    getAllBooking(whereSearchInput: $whereSearchInput) {
      id
      schoolId
      bookingId
      carId
      carName
      slot
      bookingDate
      customerMobile
      customerName
      customerEmail
      customerId
      courseId
      courseName
      coursePrice
      totalAmount
      notes
      status
      confirmationNumber
      createdAt
      updatedAt
      sessions {
        id
        bookingId
        dayNumber
        sessionDate
        slot
        carId
        driverId
        driver {
          id
          userId
          name
        }
        status
        attended
        completedAt
        instructorNotes
        customerFeedback
        internalNotes
        performanceRating
        skillsAssessed
        progressNotes
        createdAt
        updatedAt
      }
      customer {
        id
        name
        email
        contact1
        address
      }
      car {
        id
        carId
        carName
        model
        registrationNumber
      }
      course {
        id
        courseName
        price
      }
    }
  }
`;

const GET_BOOKING_BY_ID = `
  query GetBookingById($id: Int!) {
    getBookingById(id: $id) {
      id
      schoolId
      bookingId
      carId
      carName
      slot
      bookingDate
      customerMobile
      customerName
      customerEmail
      customerId
      courseId
      courseName
      coursePrice
      totalAmount
      notes
      status
      confirmationNumber
      createdAt
      updatedAt
      sessions {
        id
        bookingId
        dayNumber
        sessionDate
        slot
        carId
        driverId
        status
        attended
        completedAt
        instructorNotes
        driver {
          id
          userId
          name
        }
        customerFeedback
        internalNotes
        performanceRating
        skillsAssessed
        progressNotes
        createdAt
        updatedAt
      }
      customer {
        id
        name
        email
        contact1
        address
      }
      car {
        id
        carId
        carName
        model
        registrationNumber
      }
      course {
        id
        courseName
        price
      }
    }
  }
`;

const UPDATE_BOOKING_SESSION = `
  mutation UpdateBookingSession($id: Int!, $updateType: UpdateBookingSessionInput!) {
    updateBookingSession(id: $id, updateType: $updateType) {
      id
      bookingId
      dayNumber
      sessionDate
      slot
      carId
      driverId
      status
      attended
      completedAt
      instructorNotes
      customerFeedback
      internalNotes
      performanceRating
      skillsAssessed
      progressNotes
      createdAt
      updatedAt
    }
  }
`;

// API Functions
export const getPaginatedBookings = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    schoolId?: number;
    carId?: number;
    courseId?: number;
    customerId?: number;
    customerMobile?: string;
    status?: string;
    bookingDate?: Date;
  };
}) => {
  return ApiCall<BookingPagination>({
    query: GET_PAGINATED_BOOKINGS,
    variables,
  });
};

export const getAllBookings = async (whereSearchInput: {
  schoolId?: number;
  carId?: number;
  courseId?: number;
  customerId?: number;
  customerMobile?: string;
  status?: string;
  bookingDate?: Date;
}) => {
  return ApiCall<AllBookingsResponse>({
    query: GET_ALL_BOOKINGS,
    variables: { whereSearchInput },
  });
};

export const getBookingById = async (id: number) => {
  return ApiCall<SingleBooking>({
    query: GET_BOOKING_BY_ID,
    variables: { id },
  });
};

export const updateBookingSession = async (updateData: {
  id: number;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  attended?: boolean;
  completedAt?: Date;
  instructorNotes?: string;
  customerFeedback?: string;
  internalNotes?: string;
  performanceRating?: number;
  skillsAssessed?: string;
  progressNotes?: string;
}) => {
  const { id, ...updateType } = updateData;
  return ApiCall<UpdateBookingSessionResponse>({
    query: UPDATE_BOOKING_SESSION,
    variables: { id, updateType: { id, ...updateType } },
  });
};
