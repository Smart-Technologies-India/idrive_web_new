import { ApiCall } from "./api";

// Types
export interface BookingService {
  id: number;
  bookingId?: number;
  serviceId: number;
  schoolId: number;
  userId: number;
  serviceName: string;
  serviceType: string;
  price: number;
  description?: string;
  confirmationNumber?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  booking?: {
    id: number;
    bookingId: string;
    customerName?: string;
    customerMobile: string;
    customerEmail?: string;
  };
  service?: {
    id: number;
    serviceName: string;
    serviceType: string;
    category: string;
  };
  user?: {
    id: number;
    name: string;
    contact1: string;
    email?: string;
  };
  school?: {
    id: number;
    name: string;
  };
}

export interface BookingServicePagination {
  getPaginatedBookingService: {
    data: BookingService[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface AllBookingServicesResponse {
  getAllBookingService: BookingService[];
}

export interface SingleBookingService {
  getBookingServiceById: BookingService;
}

// GraphQL Queries
const GET_PAGINATED_BOOKING_SERVICES = `
  query GetPaginatedBookingService($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereBookingServiceSearchInput!) {
    getPaginatedBookingService(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        bookingId
        serviceId
        schoolId
        userId
        serviceName
        serviceType
        price
        description
        confirmationNumber
        createdAt
        updatedAt
        deletedAt
        booking {
          id
          bookingId
          customerName
          customerMobile
          customerEmail
        }
        service {
          id
          serviceName
          serviceType
          category
        }
        user {
          id
          name
          contact1
          email
        }
        school {
          id
          name
        }
      }
      total
      skip
      take
    }
  }
`;

const GET_ALL_BOOKING_SERVICES = `
  query GetAllBookingService($whereSearchInput: WhereBookingServiceSearchInput!) {
    getAllBookingService(whereSearchInput: $whereSearchInput) {
      id
      bookingId
      serviceId
      schoolId
      userId
      serviceName
      serviceType
      price
      description
      confirmationNumber
      createdAt
      updatedAt
      deletedAt
      booking {
        id
        bookingId
        customerName
        customerMobile
        customerEmail
      }
      service {
        id
        serviceName
        serviceType
        category
      }
      user {
        id
        name
        contact1
        email
      }
      school {
        id
        name
      }
    }
  }
`;

const GET_BOOKING_SERVICE_BY_ID = `
  query GetBookingServiceById($id: Int!) {
    getBookingServiceById(id: $id) {
      id
      bookingId
      serviceId
      schoolId
      userId
      serviceName
      serviceType
      price
      description
      confirmationNumber
      createdAt
      updatedAt
      deletedAt
      booking {
        id
        bookingId
        customerName
        customerMobile
        customerEmail
      }
      service {
        id
        serviceName
        serviceType
        category
      }
      user {
        id
        name
        contact1
        email
      }
      school {
        id
        name
      }
    }
  }
`;

// API Functions
export const getPaginatedBookingServices = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    schoolId?: number;
    userId?: number;
    serviceId?: number;
    bookingId?: number;
    serviceType?: string;
    confirmationNumber?: string;
  };
}) => {
  return ApiCall<BookingServicePagination>({
    query: GET_PAGINATED_BOOKING_SERVICES,
    variables,
  });
};

export const getAllBookingServices = async (whereSearchInput: {
  schoolId?: number;
  userId?: number;
  serviceId?: number;
  bookingId?: number;
  serviceType?: string;
  confirmationNumber?: string;
}) => {
  return ApiCall<AllBookingServicesResponse>({
    query: GET_ALL_BOOKING_SERVICES,
    variables: { whereSearchInput },
  });
};

export const getBookingServiceById = async (id: number) => {
  return ApiCall<SingleBookingService>({
    query: GET_BOOKING_SERVICE_BY_ID,
    variables: { id },
  });
};
