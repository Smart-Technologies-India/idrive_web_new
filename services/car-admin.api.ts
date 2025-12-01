import { ApiCall } from './api';

// Types
export interface CarAdmin {
  id: number;
  name: string;
  manufacturer: string;
  category: 'SEDAN' | 'MUV' | 'SUV' | 'HATCHBACK';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
}

export interface CarAdminPagination {
  getPaginatedCarAdmin: {
    data: CarAdmin[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface SingleCarAdmin {
  getCarAdminById: CarAdmin;
}

export interface CreateCarAdminResponse {
  createCarAdmin: CarAdmin;
}

export interface UpdateCarAdminResponse {
  updateCarAdmin: CarAdmin;
}

export interface AllCarAdminsResponse {
  getAllCarAdmin: CarAdmin[];
}

// GraphQL Queries
const GET_PAGINATED_CAR_ADMINS = `
  query GetPaginatedCarAdmin($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereCarAdminSearchInput!) {
    getPaginatedCarAdmin(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        name
        manufacturer
        category
        status
        createdAt
        updatedAt
      }
      total
      skip
      take
    }
  }
`;

const GET_ALL_CAR_ADMINS = `
  query GetAllCarAdmin($whereSearchInput: WhereCarAdminSearchInput!) {
    getAllCarAdmin(whereSearchInput: $whereSearchInput) {
      id
      name
      manufacturer
      category
      status
    }
  }
`;

const GET_CAR_ADMIN_BY_ID = `
  query GetCarAdminById($id: Int!) {
    getCarAdminById(id: $id) {
      id
      name
      manufacturer
      category
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CAR_ADMIN = `
  mutation CreateCarAdmin($inputType: CreateCarAdminInput!) {
    createCarAdmin(inputType: $inputType) {
      id
      name
      manufacturer
      category
      status
      createdAt
    }
  }
`;

const UPDATE_CAR_ADMIN = `
  mutation UpdateCarAdmin($id: Int!, $updateType: UpdateCarAdminInput!) {
    updateCarAdmin(id: $id, updateType: $updateType) {
      id
      name
      manufacturer
      category
      status
      updatedAt
    }
  }
`;

const DELETE_CAR_ADMIN = `
  mutation DeleteCarAdmin($id: Int!) {
    deleteCarAdmin(id: $id) {
      id
    }
  }
`;

// API Functions
export const getAllCarAdmins = async (whereSearchInput: {
  name?: string;
  manufacturer?: string;
  category?: string;
  status?: string;
}) => {
  return ApiCall<AllCarAdminsResponse>({
    query: GET_ALL_CAR_ADMINS,
    variables: { whereSearchInput },
  });
};

export const getPaginatedCarAdmins = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    name?: string;
    manufacturer?: string;
    category?: string;
    status?: string;
  };
}) => {
  return ApiCall<CarAdminPagination>({
    query: GET_PAGINATED_CAR_ADMINS,
    variables,
  });
};

export const getCarAdminById = async (id: number) => {
  return ApiCall<SingleCarAdmin>({
    query: GET_CAR_ADMIN_BY_ID,
    variables: { id },
  });
};

export const createCarAdmin = async (inputType: {
  name: string;
  manufacturer: string;
  category: 'SEDAN' | 'MUV' | 'SUV' | 'HATCHBACK';
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}) => {
  return ApiCall<CreateCarAdminResponse>({
    query: CREATE_CAR_ADMIN,
    variables: { inputType },
  });
};

export const updateCarAdmin = async (updateData: {
  id: number;
  name?: string;
  manufacturer?: string;
  category?: 'SEDAN' | 'MUV' | 'SUV' | 'HATCHBACK';
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}) => {
  const { id, ...updateType } = updateData;
  return ApiCall<UpdateCarAdminResponse>({
    query: UPDATE_CAR_ADMIN,
    variables: { id, updateType },
  });
};

export const deleteCarAdmin = async (id: number) => {
  return ApiCall<{ deleteCarAdmin: { id: number } }>({
    query: DELETE_CAR_ADMIN,
    variables: { id },
  });
};
