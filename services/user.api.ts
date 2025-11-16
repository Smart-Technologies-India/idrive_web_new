import { ApiCall } from "./api";

// Types
export interface User {
  id: number;
  name: string;
  contact1: string;
  contact2?: string;
  address?: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT" | "DRIVER" | "MTADMIN";
  email?: string;
  password?: string;
  otp?: string;
  dob?: string;
  profile?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  createdById: number;
  updatedAt: string;
  updatedById?: number;
  deletedAt?: string;
  deletedById?: number;
  schoolId?: number;
}

export interface UserPagination {
  getPaginatedUser: {
    data: User[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface SingleUser {
  getUserById: User;
}

export interface SearchUser {
  searchUser: User | null;
}

export interface AllUsersResponse {
  getAllUser: User[];
}

export interface CreateUserResponse {
  createUser: User;
}

export interface UpdateUserResponse {
  updateUser: User;
}

// GraphQL Queries
const GET_PAGINATED_USERS = `
  query GetPaginatedUser($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereUserSearchInput!) {
    getPaginatedUser(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        name
        contact1
        contact2
        address
        role
        email
        dob
        profile
        status
        schoolId
        createdAt
        updatedAt
      }
      total
      skip
      take
    }
  }
`;

const GET_ALL_USERS = `
  query GetAllUser($whereSearchInput: WhereUserSearchInput!) {
    getAllUser(whereSearchInput: $whereSearchInput) {
      id
      name
      contact1
      contact2
      email
      role
      status
      schoolId
    }
  }
`;

const GET_USER_BY_ID = `
  query GetUserById($id: Int!) {
    getUserById(id: $id) {
      id
      name
      contact1
      contact2
      address
      role
      email
      dob
      profile
      status
      schoolId
      createdAt
      updatedAt
    }
  }
`;

const SEARCH_USER = `
  query SearchUser($whereSearchInput: WhereUserSearchInput!) {
    searchUser(whereSearchInput: $whereSearchInput) {
      id
      name
      contact1
      contact2
      address
      role
      email
      dob
      profile
      status
      schoolId
    }
  }
`;

const CREATE_USER = `
  mutation CreateUser($inputType: CreateUserInput!) {
    createUser(inputType: $inputType) {
      id
      name
      contact1
      contact2
      email
      role
      status
      createdAt
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($id: Int!, $updateType: UpdateUserInput!) {
    updateUser(id: $id, updateType: $updateType) {
      id
      name
      contact1
      contact2
      address
      role
      email
      dob
      profile
      status
      schoolId
      updatedAt
    }
  }
`;

const DELETE_USER = `
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

// API Functions
export const getAllUsers = async (whereSearchInput: {
  schoolId?: number;
  role?: string;
  status?: string;
}) => {
  return ApiCall<AllUsersResponse>({
    query: GET_ALL_USERS,
    variables: { whereSearchInput },
  });
};

export const getPaginatedUsers = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    schoolId?: number;
    name?: string;
    contact1?: string;
    contact2?: string;
    email?: string;
    role?: string;
    status?: string;
  };
}) => {
  return ApiCall<UserPagination>({
    query: GET_PAGINATED_USERS,
    variables,
  });
};

export const getUserById = async (id: number) => {
  return ApiCall<SingleUser>({
    query: GET_USER_BY_ID,
    variables: { id },
  });
};

export const searchUser = async (whereSearchInput: {
  contact1?: string;
  contact2?: string;
  email?: string;
  name?: string;
  schoolId?: number;
}) => {
  return ApiCall<SearchUser>({
    query: SEARCH_USER,
    variables: { whereSearchInput },
  });
};

export const searchUserByContact = async (contact: string, schoolId?: number) => {
  return searchUser({
    contact1: contact,
    schoolId,
  });
};

export const createUser = async (inputType: {
  name: string;
  contact1: string;
  contact2?: string;
  address?: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT" | "DRIVER" | "MTADMIN";
  email?: string;
  password?: string;
  dob?: Date;
  profile?: string;
  schoolId?: number;
  createdById: number;
}) => {
  return ApiCall<CreateUserResponse>({
    query: CREATE_USER,
    variables: { inputType },
  });
};

export const updateUser = async (updateData: {
  id: number;
  name?: string;
  contact1?: string;
  contact2?: string;
  address?: string;
  role?: "ADMIN" | "INSTRUCTOR" | "STUDENT" | "DRIVER" | "MTADMIN";
  email?: string;
  password?: string;
  dob?: Date;
  profile?: string;
  status?: "ACTIVE" | "INACTIVE";
  schoolId?: number;
  updatedById?: number;
}) => {
  const { id, ...updateType } = updateData;
  return ApiCall<UpdateUserResponse>({
    query: UPDATE_USER,
    variables: { id, updateType: { id, ...updateType } },
  });
};

export const deleteUser = async (id: number) => {
  return ApiCall<{ deleteUser: { id: number } }>({
    query: DELETE_USER,
    variables: { id },
  });
};