import { ApiCall } from './api';

// Types
export interface Service {
  id: number;
  schoolId: number;
  serviceId: string;
  serviceName: string;
  serviceType: 'LICENSE' | 'ADDON';
  category: string;
  price: number;
  duration: number; // in days
  description: string;
  features?: string;
  includedServices?: string;
  requirements?: string;
  termsAndConditions?: string;
  activeUsers: number;
  totalRevenue: number;
  status: 'ACTIVE' | 'INACTIVE' | 'UPCOMING' | 'DISCONTINUED';
  createdAt: string;
  updatedAt: string;
}

export interface ServicePagination {
  getPaginatedService: {
    data: Service[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface SingleService {
  getServiceById: Service;
}

export interface CreateServiceResponse {
  createService: Service;
}

export interface UpdateServiceResponse {
  updateService: Service;
}

export interface AllServicesResponse {
  getAllService: Service[];
}

// GraphQL Queries
const GET_PAGINATED_SERVICES = `
  query GetPaginatedService($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: WhereServiceSearchInput!) {
    getPaginatedService(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        schoolId
        serviceId
        serviceName
        serviceType
        category
        price
        duration
        description
        features
        includedServices
        requirements
        termsAndConditions
        activeUsers
        totalRevenue
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

const GET_ALL_SERVICES = `
  query GetAllService($whereSearchInput: WhereServiceSearchInput!) {
    getAllService(whereSearchInput: $whereSearchInput) {
      id
      serviceId
      serviceName
      serviceType
      category
      price
      duration
      description
      status
    }
  }
`;

const GET_SERVICE_BY_ID = `
  query GetServiceById($id: Int!) {
    getServiceById(id: $id) {
      id
      schoolId
      serviceId
      serviceName
      serviceType
      category
      price
      duration
      description
      features
      includedServices
      requirements
      termsAndConditions
      activeUsers
      totalRevenue
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SERVICE = `
  mutation CreateService($inputType: CreateServiceInput!) {
    createService(inputType: $inputType) {
      id
      schoolId
      serviceId
      serviceName
      serviceType
      category
      price
      duration
      description
      status
      createdAt
    }
  }
`;

const UPDATE_SERVICE = `
  mutation UpdateService($id: Int!, $updateType: UpdateServiceInput!) {
    updateService(id: $id, updateType: $updateType) {
      id
      schoolId
      serviceId
      serviceName
      serviceType
      category
      price
      duration
      description
      features
      includedServices
      requirements
      termsAndConditions
      activeUsers
      totalRevenue
      status
      updatedAt
    }
  }
`;

const DELETE_SERVICE = `
  mutation DeleteService($id: Int!) {
    deleteService(id: $id) {
      id
    }
  }
`;

// API Functions
export const getAllServices = async (whereSearchInput: {
  schoolId?: number;
  serviceType?: string;
  status?: string;
}) => {
  return ApiCall<AllServicesResponse>({
    query: GET_ALL_SERVICES,
    variables: { whereSearchInput },
  });
};

export const getPaginatedServices = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    schoolId?: number;
    serviceType?: string;
    status?: string;
  };
}) => {
  return ApiCall<ServicePagination>({
    query: GET_PAGINATED_SERVICES,
    variables,
  });
};

export const getServiceById = async (id: number) => {
  return ApiCall<SingleService>({
    query: GET_SERVICE_BY_ID,
    variables: { id },
  });
};

export const createService = async (inputType: {
  schoolId: number;
  serviceId: string;
  serviceName: string;
  serviceType: 'LICENSE' | 'ADDON';
  category: string;
  price: number;
  duration: number;
  description: string;
  features?: string;
  includedServices?: string;
  requirements?: string;
  termsAndConditions?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'UPCOMING' | 'DISCONTINUED';
}) => {
  return ApiCall<CreateServiceResponse>({
    query: CREATE_SERVICE,
    variables: { inputType },
  });
};

export const updateService = async (updateData: {
  id: number;
  serviceName?: string;
  serviceType?: 'LICENSE' | 'ADDON';
  category?: string;
  price?: number;
  duration?: number;
  description?: string;
  features?: string;
  includedServices?: string;
  requirements?: string;
  termsAndConditions?: string;
  activeUsers?: number;
  totalRevenue?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'UPCOMING' | 'DISCONTINUED';
}) => {
  const { id, ...updateType } = updateData;
  return ApiCall<UpdateServiceResponse>({
    query: UPDATE_SERVICE,
    variables: { id, updateType: { id, ...updateType } },
  });
};

export const deleteService = async (id: number) => {
  return ApiCall<{ deleteService: { id: number } }>({
    query: DELETE_SERVICE,
    variables: { id },
  });
};
