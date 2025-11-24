import { ApiCall } from "./api";

// Types
export interface Driver {
  id: number;
  userId: number;
  schoolId: number;
  driverId: string;
  name: string;
  email?: string;
  mobile: string;
  alternatePhone?: string;
  address: string;
  dateOfBirth: string;
  bloodGroup?: string;
  gender: string;
  licenseNumber: string;
  licenseType: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  experience: number;
  joiningDate: string;
  salary: number;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rating: number;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface LeaveHistory {
  id: number;
  driverId: number;
  leaveId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  leaveType?: string;
  totalDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryHistory {
  id: number;
  driverId: number;
  salaryId: string;
  month: string;
  year: number;
  monthNumber: number;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paymentMethod?: string;
  transactionId?: string;
  remarks?: string;
  paidBy?: number;
  paidOn?: string;
  status: "PENDING" | "PAID" | "PROCESSING";
  createdAt: string;
  updatedAt: string;
}

export interface DriverPagination {
  getPaginatedDriver: {
    data: Driver[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface SingleDriver {
  getDriverById: Driver & {
    leaveHistory?: LeaveHistory[];
    salaryHistory?: SalaryHistory[];
  };
}

export interface CreateDriverResponse {
  createDriver: Driver;
}

export interface UpdateDriverResponse {
  updateDriver: Driver;
}

export interface AllDriversResponse {
  getAllDriver: Driver[];
}

// GraphQL Queries
const GET_PAGINATED_DRIVERS = `
  query GetPaginatedDriver($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereDriverSearchInput!) {
    getPaginatedDriver(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        userId
        schoolId
        driverId
        name
        email
        mobile
        alternatePhone
        licenseNumber
        licenseType
        experience
        salary
        totalBookings
        completedBookings
        cancelledBookings
        rating
        status
        joiningDate
        createdAt
        updatedAt
      }
      total
      skip
      take
    }
  }
`;

const GET_ALL_DRIVERS = `
  query GetAllDriver($whereSearchInput: WhereDriverSearchInput!) {
    getAllDriver(whereSearchInput: $whereSearchInput) {
      id
      driverId
      name
      email
      mobile
      status
    }
  }
`;

const GET_DRIVER_BY_ID = `
  query GetDriverById($id: Int!) {
    getDriverById(id: $id) {
      id
      userId
      schoolId
      driverId
      name
      email
      mobile
      alternatePhone
      address
      dateOfBirth
      bloodGroup
      gender
      licenseNumber
      licenseType
      licenseIssueDate
      licenseExpiryDate
      experience
      joiningDate
      salary
      emergencyContactName
      emergencyContactNumber
      emergencyContactRelation
      totalBookings
      completedBookings
      cancelledBookings
      rating
      status
      createdAt
      updatedAt
    }
  }
`;

const GET_DRIVER_WITH_HISTORY = `
  query GetDriverById($id: Int!) {
    getDriverById(id: $id) {
      id
      userId
      schoolId
      driverId
      name
      email
      mobile
      alternatePhone
      address
      dateOfBirth
      bloodGroup
      gender
      licenseNumber
      licenseType
      licenseIssueDate
      licenseExpiryDate
      experience
      joiningDate
      salary
      emergencyContactName
      emergencyContactNumber
      emergencyContactRelation
      totalBookings
      completedBookings
      cancelledBookings
      rating
      status
      createdAt
      updatedAt
      leaveHistory {
        id
        leaveId
        fromDate
        toDate
        reason
        leaveType
        totalDays
        status
        approvedBy
        approvedAt
        rejectionReason
        createdAt
      }
      salaryHistory {
        id
        salaryId
        month
        year
        monthNumber
        basicSalary
        bonus
        deductions
        netSalary
        paymentMethod
        transactionId
        paidOn
        status
        createdAt
      }
    }
  }
`;

const CREATE_DRIVER = `
  mutation CreateDriver($inputType: CreateDriverInput!) {
    createDriver(inputType: $inputType) {
      id
      userId
      schoolId
      driverId
      name
      email
      mobile
      status
      createdAt
    }
  }
`;

const UPDATE_DRIVER = `
  mutation UpdateDriver($id: Int!, $updateType: UpdateDriverInput!) {
    updateDriver(id: $id, updateType: $updateType) {
      id
      userId
      schoolId
      driverId
      name
      email
      mobile
      alternatePhone
      address
      dateOfBirth
      bloodGroup
      gender
      licenseNumber
      licenseType
      licenseIssueDate
      licenseExpiryDate
      experience
      joiningDate
      salary
      emergencyContactName
      emergencyContactNumber
      emergencyContactRelation
      totalBookings
      completedBookings
      cancelledBookings
      rating
      status
      updatedAt
    }
  }
`;

const DELETE_DRIVER = `
  mutation DeleteDriver($id: Int!) {
    deleteDriver(id: $id) {
      id
    }
  }
`;

// API Functions
export const getAllDrivers = async (whereSearchInput: {
  schoolId?: number;
  status?: string;
}) => {
  return ApiCall<AllDriversResponse>({
    query: GET_ALL_DRIVERS,
    variables: { whereSearchInput },
  });
};

export const getPaginatedDrivers = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    schoolId?: number;
    name?: string;
    email?: string;
    mobile?: string;
    status?: string;
    driverId?: string;
  };
}) => {
  return ApiCall<DriverPagination>({
    query: GET_PAGINATED_DRIVERS,
    variables,
  });
};

export const getDriverById = async (id: number) => {
  return ApiCall<SingleDriver>({
    query: GET_DRIVER_BY_ID,
    variables: { id },
  });
};

export const getDriverWithHistory = async (id: number) => {
  return ApiCall<SingleDriver>({
    query: GET_DRIVER_WITH_HISTORY,
    variables: { id },
  });
};

export const createDriver = async (inputType: {
  userId: number;
  schoolId: number;
  driverId: string;
  name: string;
  email?: string;
  mobile: string;
  alternatePhone?: string;
  address: string;
  dateOfBirth: Date;
  bloodGroup?: string;
  gender: string;
  licenseNumber: string;
  licenseType: string;
  licenseIssueDate: Date;
  licenseExpiryDate: Date;
  experience?: number;
  joiningDate?: Date;
  salary?: number;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
}) => {
  return ApiCall<CreateDriverResponse>({
    query: CREATE_DRIVER,
    variables: { inputType },
  });
};

export const updateDriver = async (updateData: {
  id: number;
  name?: string;
  email?: string;
  mobile?: string;
  alternatePhone?: string;
  address?: string;
  dateOfBirth?: Date;
  bloodGroup?: string;
  gender?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseIssueDate?: Date;
  licenseExpiryDate?: Date;
  experience?: number;
  joiningDate?: Date;
  salary?: number;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelation?: string;
  totalBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  rating?: number;
  status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "SUSPENDED";
}) => {
  const { id, ...updateType } = updateData;
  return ApiCall<UpdateDriverResponse>({
    query: UPDATE_DRIVER,
    variables: { id, updateType: { id, ...updateType } },
  });
};

export const deleteDriver = async (id: number) => {
  return ApiCall<{ deleteDriver: { id: number } }>({
    query: DELETE_DRIVER,
    variables: { id },
  });
};
