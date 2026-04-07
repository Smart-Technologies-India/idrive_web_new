import { ApiCall } from "./api";

// TypeScript interfaces
export interface Location {
  id: number;
  location: string;
  schoolId: number;
  school?: {
    id: number;
    name: string;
  } | null;
}

export interface LocationPagination {
  total: number;
  data: Location[];
}

export interface GetAllLocationsResponse {
  data: {
    getAllLocation: Location[];
  };
  status: boolean;
  message: string;
}

export interface GetLocationByIdResponse {
  data: {
    getLocationById: Location;
  };
  status: boolean;
  message: string;
}

export interface CreateLocationResponse {
  data: {
    createLocation: Location;
  };
  status: boolean;
  message: string;
}

export interface UpdateLocationResponse {
  data: {
    updateLocation: Location;
  };
  status: boolean;
  message: string;
}

export interface DeleteLocationResponse {
  data: {
    deleteLocation: Location;
  };
  status: boolean;
  message: string;
}

// GraphQL Queries
const GET_ALL_LOCATIONS = `
  query GetAllLocation($whereSearchInput: SearchLocationInput!) {
    getAllLocation(whereSearchInput: $whereSearchInput) {
      id
      location
      schoolId
    }
  }
`;

const GET_LOCATION_BY_ID = `
  query GetLocationById($id: Int!) {
    getLocationById(id: $id) {
      id
      location
      schoolId
    }
  }
`;

// GraphQL Mutations
const CREATE_LOCATION = `
  mutation CreateLocation($inputType: CreateLocationInput!) {
    createLocation(inputType: $inputType) {
      id
      location
      schoolId
    }
  }
`;

const UPDATE_LOCATION = `
  mutation UpdateLocation($id: Int!, $updateType: UpdateLocationInput!) {
    updateLocation(id: $id, updateType: $updateType) {
      id
      location
      schoolId
    }
  }
`;

const DELETE_LOCATION = `
  mutation DeleteLocation($id: Int!, $userid: Int!) {
    deleteLocation(id: $id, userid: $userid) {
      id
      location
      schoolId
    }
  }
`;

// API Functions
export const getAllLocations = async (variables: {
  schoolId?: number;
  location?: string;
}): Promise<GetAllLocationsResponse> => {
  return await ApiCall({
    query: GET_ALL_LOCATIONS,
    variables: { whereSearchInput: variables },
  });
};

export const getLocationById = async (
  id: number
): Promise<GetLocationByIdResponse> => {
  return await ApiCall({
    query: GET_LOCATION_BY_ID,
    variables: { id },
  });
};

export const createLocation = async (variables: {
  location: string;
  schoolId: number;
}): Promise<CreateLocationResponse> => {
  return await ApiCall({
    query: CREATE_LOCATION,
    variables: { inputType: variables },
  });
};

export const updateLocation = async (
  id: number,
  updateType: {
    location?: string;
    schoolId?: number;
  }
): Promise<UpdateLocationResponse> => {
  return await ApiCall({
    query: UPDATE_LOCATION,
    variables: { id, updateType },
  });
};

export const deleteLocation = async (
  id: number,
  userid: number
): Promise<DeleteLocationResponse> => {
  return await ApiCall({
    query: DELETE_LOCATION,
    variables: { id, userid },
  });
};
