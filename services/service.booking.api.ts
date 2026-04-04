import { ApiCall } from "./api";

// Types
export interface BookingService {
  id: number;
  bookingId?: number;
  schoolServiceId: number;
  schoolId: number;
  userId: number;
  serviceName: string;
  serviceType: "LICENSE" | "ADDON";
  price: number;
  discount?: number;
  description?: string;
  confirmationNumber?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  booking?: {
    id: number;
    bookingId?: string;
    customerName?: string;
    customerMobile: string;
    customerEmail?: string;
  };
  schoolService?: {
    id: number;
    schoolServiceId: string;
    licensePrice: number;
    addonPrice: number;
    service?: {
      id: number;
      serviceName: string;
      category: string;
      description?: string;
    };
  };
  user?: {
    id: number;
    name: string;
    surname?: string;
    contact1: string;
    contact2?: string;
    email?: string;
    fatherName?: string;
    profile?: string;
    address?: string;
  };
  school?: {
    id: number;
    name: string;
  };
  licenseApplications?: Array<{
    id: number;
    status: "PENDING" | "CLOSED" | "LL_APPLIED" | "DL_PENDING" | "DL_APPLIED" | "SUBMIT";
    llNumber?: string;
    applicationNumber?: string;
    issuedDate?: string;
    dlApplicationNumber?: string;
    testDate?: string;
    testStatus: "NONE" | "PASSED" | "FAILED" | "ABSENT";
  }>;
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
        schoolServiceId
        schoolId
        userId
        serviceName
        serviceType
        price
        discount
        description
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
        schoolService {
          id
          schoolServiceId
          licensePrice
          addonPrice
          service {
            id
            serviceName
            category
            description
          }
        }
        user {
          id
          name
          surname
          contact1
          contact2
          email
          fatherName
          profile
          address
        }
        school {
          id
          name
        }
        licenseApplications {
          id
          status
          llNumber
          applicationNumber
          dlApplicationNumber
          testStatus
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
      schoolServiceId
      schoolId
      userId
      serviceName
      serviceType
      price
      discount
      description
      createdAt
      updatedAt
      deletedAt
      confirmationNumber
      booking {
        id
        bookingId
        customerName
        customerMobile
        customerEmail
      }
      schoolService {
        id
        schoolServiceId
        licensePrice
        addonPrice
        service {
          id
          serviceName
          category
          description
        }
      }
      user {
        id
        name
        surname
        contact1
        contact2
        email
        fatherName
        profile
        address
      }
      school {
        id
        name
      }
      licenseApplications {
        id
        status
        llNumber
        issuedDate
        applicationNumber
        dlApplicationNumber
        testDate
        testStatus
      }
    }
  }
`;

const GET_BOOKING_SERVICE_BY_ID = `
  query GetBookingServiceById($id: Int!) {
    getBookingServiceById(id: $id) {
      id
      bookingId
      schoolServiceId
      schoolId
      userId
      serviceName
      serviceType
      price
      discount
      description
      createdAt
      updatedAt
      deletedAt
      confirmationNumber
      booking {
        id
        bookingId
        customerName
        customerMobile
        customerEmail
      }
      schoolService {
        id
        schoolServiceId
        licensePrice
        addonPrice
        service {
          id
          serviceName
          category
          description
        }
      }
      user {
        id
        name
        surname
        contact1
        contact2
        email
        fatherName
        profile
        address
      }
      school {
        id
        name
      }
      licenseApplications {
        id
        status
        llNumber
        issuedDate
        applicationNumber
        dlApplicationNumber
        testDate
        testStatus
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
    filters?: string[];
    orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  };
  whereSearchInput: {
    schoolId?: number;
    userId?: number;
    schoolServiceId?: number;
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
  schoolServiceId?: number;
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
