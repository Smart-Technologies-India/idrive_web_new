import { ApiCall } from "./api";

// Types
export interface LicenseApplication {
  id: number;
  bookingServiceId: number;
  llNumber?: string;
  issuedDate?: string;
  dlApplicationNumber?: string;
  testDate?: string;
  testStatus: "NONE" | "PASSED" | "FAILED" | "ABSENT";
  status: "PENDING" | "CLOSED" | "LL_APPLIED" | "DL_PENDING" | "DL_APPLIED";
  bookingService?: {
    id: number;
    serviceName: string;
    confirmationNumber?: string;
  };
}

export interface LicenseApplicationResponse {
  createLicenseApplication: LicenseApplication;
}

export interface GetLicenseApplicationResponse {
  getLicenseApplicationById: LicenseApplication;
}

export interface GetAllLicenseApplicationsResponse {
  getAllLicenseApplication: LicenseApplication[];
}

// GraphQL Mutations & Queries
const CREATE_LICENSE_APPLICATION = `
  mutation CreateLicenseApplication($inputType: CreateLicenseApplicationInput!) {
    createLicenseApplication(inputType: $inputType) {
      id
      bookingServiceId
      llNumber
      issuedDate
      dlApplicationNumber
      testDate
      testStatus
      status
    }
  }
`;

const GET_LICENSE_APPLICATION_BY_ID = `
  query GetLicenseApplicationById($id: Int!) {
    getLicenseApplicationById(id: $id) {
      id
      bookingServiceId
      llNumber
      issuedDate
      dlApplicationNumber
      testDate
      testStatus
      status
      bookingService {
        id
        serviceName
        confirmationNumber
      }
    }
  }
`;

const GET_ALL_LICENSE_APPLICATIONS = `
  query GetAllLicenseApplication($whereSearchInput: WhereLicenseApplicationSearchInput!) {
    getAllLicenseApplication(whereSearchInput: $whereSearchInput) {
      id
      bookingServiceId
      llNumber
      issuedDate
      dlApplicationNumber
      testDate
      testStatus
      status
      bookingService {
        id
        serviceName
        confirmationNumber
      }
    }
  }
`;

const UPDATE_LICENSE_APPLICATION = `
  mutation UpdateLicenseApplication($id: Int!, $updateType: UpdateLicenseApplicationInput!) {
    updateLicenseApplication(id: $id, updateType: $updateType) {
      id
      bookingServiceId
      llNumber
      issuedDate
      dlApplicationNumber
      testDate
      testStatus
      status
    }
  }
`;

// API Functions
export const createLicenseApplication = async (data: {
  bookingServiceId: number;
  status?: "PENDING" | "CLOSED" | "LL_APPLIED" | "DL_PENDING" | "DL_APPLIED";
  llNumber?: string;
  issuedDate?: string;
  dlApplicationNumber?: string;
  testDate?: string;
  testStatus?: "NONE" | "PASSED" | "FAILED" | "ABSENT";
}) => {
  console.log("Creating License Application with data:", data);
  return await ApiCall({
    query: CREATE_LICENSE_APPLICATION,
    variables: {
      inputType: {
        bookingServiceId: data.bookingServiceId,
        status: data.status || "PENDING",
        testStatus: data.testStatus || "NONE",
        llNumber: data.llNumber,
        issuedDate: data.issuedDate,
        dlApplicationNumber: data.dlApplicationNumber,
        testDate: data.testDate,
      },
    },
  });
};

export const getLicenseApplicationById = async (id: number) => {
  return await ApiCall({
    query: GET_LICENSE_APPLICATION_BY_ID,
    variables: { id },
  });
};

export const getAllLicenseApplications = async (whereSearchInput: {
  bookingServiceId?: number;
  status?: "PENDING" | "CLOSED" | "LL_APPLIED" | "DL_PENDING" | "DL_APPLIED";
  testStatus?: "NONE" | "PASSED" | "FAILED" | "ABSENT";
}) => {
  return await ApiCall({
    query: GET_ALL_LICENSE_APPLICATIONS,
    variables: { whereSearchInput },
  });
};

export const updateLicenseApplication = async (data: {
  id: number;
  llNumber?: string;
  issuedDate?: string;
  dlApplicationNumber?: string;
  testDate?: string;
  testStatus?: "NONE" | "PASSED" | "FAILED" | "ABSENT";
  status?: "PENDING" | "CLOSED" | "LL_APPLIED" | "DL_PENDING" | "DL_APPLIED";
}) => {
  const { id, ...updateType } = data;
  return await ApiCall({
    query: UPDATE_LICENSE_APPLICATION,
    variables: {
      id,
      updateType,
    },
  });
};
