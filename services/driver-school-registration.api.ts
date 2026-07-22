import { ApiCall } from "./api";

export interface DriverSchoolRegistration {
  id: number;
  name: string;
  number: string;
  schoolName: string;
  schoolAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverSchoolRegistrationResponse {
  createDriverSchoolRegistration: DriverSchoolRegistration;
}

export interface DriverSchoolRegistrationPagination {
  getPaginatedDriverSchoolRegistration: {
    data: DriverSchoolRegistration[];
    total: number;
    skip: number;
    take: number;
  };
}

const CREATE_DRIVER_SCHOOL_REGISTRATION = `
  mutation CreateDriverSchoolRegistration($inputType: CreateDriverSchoolRegistrationInput!) {
    createDriverSchoolRegistration(inputType: $inputType) {
      id
      name
      number
      schoolName
      schoolAddress
      createdAt
      updatedAt
    }
  }
`;

const GET_PAGINATED_DRIVER_SCHOOL_REGISTRATIONS = `
  query GetPaginatedDriverSchoolRegistration($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereDriverSchoolRegistrationSearchInput!) {
    getPaginatedDriverSchoolRegistration(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        name
        number
        schoolName
        schoolAddress
        createdAt
        updatedAt
      }
      total
      skip
      take
    }
  }
`;

export const createDriverSchoolRegistration = async (inputType: {
  name: string;
  number: string;
  schoolName: string;
  schoolAddress: string;
}) => {
  return ApiCall<CreateDriverSchoolRegistrationResponse>({
    query: CREATE_DRIVER_SCHOOL_REGISTRATION,
    variables: { inputType },
  });
};

export const getPaginatedDriverSchoolRegistrations = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    id?: number;
    name?: string;
    number?: string;
    schoolName?: string;
    schoolAddress?: string;
  };
}) => {
  return ApiCall<DriverSchoolRegistrationPagination>({
    query: GET_PAGINATED_DRIVER_SCHOOL_REGISTRATIONS,
    variables,
  });
};
