import { ApiCall } from "./api";

// TypeScript interfaces
export interface Holiday {
  id: number;
  schoolId: number;
  declarationType: string;
  carId?: number | null;
  car?: {
    id: number;
    carId: string;
    carName: string;
    model: string;
    registrationNumber: string;
  } | null;
  startDate: string;
  endDate: string;
  slots?: string[] | null; // Array of time slots
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface HolidayPagination {
  total: number;
  data: Holiday[];
}

export interface GetPaginatedHolidaysResponse {
  data: {
    getPaginatedHoliday: HolidayPagination;
  };
  status: boolean;
  message: string;
}

export interface GetHolidayByIdResponse {
  data: {
    getHolidayById: Holiday;
  };
  status: boolean;
  message: string;
}

export interface CreateHolidayResponse {
  data: {
    createHoliday: Holiday;
  };
  status: boolean;
  message: string;
}

export interface UpdateHolidayResponse {
  data: {
    updateHoliday: Holiday;
  };
  status: boolean;
  message: string;
}

export interface DeleteHolidayResponse {
  data: {
    deleteHoliday: Holiday;
  };
  status: boolean;
  message: string;
}

// GraphQL Queries
const GET_PAGINATED_HOLIDAYS = `
  query GetPaginatedHoliday(
    $searchPaginationInput: SearchPaginationInput!
    $whereSearchInput: SearchHolidayInput!
  ) {
    getPaginatedHoliday(
      searchPaginationInput: $searchPaginationInput
      whereSearchInput: $whereSearchInput
    ) {
      total
      data {
        id
        declarationType
        carId
        car {
          id
          carId
          carName
          model
          registrationNumber
        }
        startDate
        endDate
        slots
        reason
        createdAt
        updatedAt
        deletedAt
      }
    }
  }
`;

const GET_HOLIDAY_BY_ID = `
  query GetHolidayById($id: Int!) {
    getHolidayById(id: $id) {
      id
      declarationType
      carId
      car {
        id
        carId
        carName
        model
        registrationNumber
      }
      startDate
      endDate
      slots
      reason
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

// GraphQL Mutations
const CREATE_HOLIDAY = `
  mutation CreateHoliday($inputType: CreateHolidayInput!) {
    createHoliday(inputType: $inputType) {
      id
      schoolId
      declarationType
      carId
      car {
        id
        carId
        carName
        model
        registrationNumber
      }
      startDate
      endDate
      slots
      reason
      status
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

const UPDATE_HOLIDAY = `
  mutation UpdateHoliday($id: Int!, $updateType: UpdateHolidayInput!) {
    updateHoliday(id: $id, updateType: $updateType) {
      id
      schoolId
      declarationType
      carId
      car {
        id
        carId
        carName
        model
        registrationNumber
      }
      startDate
      endDate
      slots
      reason
      status
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

const DELETE_HOLIDAY = `
  mutation DeleteHoliday($id: Int!, $userid: Int!) {
    deleteHoliday(id: $id, userid: $userid) {
      id
      schoolId
      declarationType
      carId
      startDate
      endDate
      slots
      reason
      status
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

// API Functions
export const getPaginatedHolidays = async (variables: {
  searchPaginationInput: { skip: number; take: number; search?: string };
  whereSearchInput?: {
    schoolId?: number;
    declarationType?: string;
    carId?: number;
    startDate?: string;
    endDate?: string;
  };
}): Promise<GetPaginatedHolidaysResponse> => {
  return await ApiCall({
    query: GET_PAGINATED_HOLIDAYS,
    variables,
  });
};

export const getHolidayById = async (
  id: number
): Promise<GetHolidayByIdResponse> => {
  return await ApiCall({
    query: GET_HOLIDAY_BY_ID,
    variables: { id },
  });
};

export const createHoliday = async (variables: {
  schoolId: number;
  declarationType: string;
  carId?: number;
  startDate: string;
  endDate: string;
  slots?: string;
  reason: string;
}): Promise<CreateHolidayResponse> => {
  return await ApiCall({
    query: CREATE_HOLIDAY,
    variables: { inputType: variables },
  });
};

export const updateHoliday = async (
  id: number,
  updateType: {
    schoolId?: number;
    declarationType?: string;
    carId?: number;
    startDate?: string;
    endDate?: string;
    slots?: string;
    reason?: string;
    status?: string;
  }
): Promise<UpdateHolidayResponse> => {
  return await ApiCall({
    query: UPDATE_HOLIDAY,
    variables: { id, updateType },
  });
};

export const deleteHoliday = async (
  id: number,
  userid: number
): Promise<DeleteHolidayResponse> => {
  return await ApiCall({
    query: DELETE_HOLIDAY,
    variables: { id, userid },
  });
};
