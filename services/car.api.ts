import { ApiCall } from "./api";

// Types
export interface Driver {
  id: number;
  driverId: string;
  name: string;
  email: string;
  mobile: string;
  licenseNumber?: string;
  licenseType?: string;
  experience?: number;
  status: string;
}

export interface Car {
  id: number;
  schoolId: number;
  carId: string;
  carName: string;
  model: string;
  registrationNumber: string;
  year: number;
  color: string;
  fuelType: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID" | "CNG";
  transmission: "MANUAL" | "AUTOMATIC" | "AMT" | "CVT";
  seatingCapacity: number;
  engineNumber?: string;
  chassisNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  currentMileage: number;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
  fitnessExpiry?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  assignedDriverId?: number;
  assignedDriver?: Driver;
  totalBookings: number;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface CarPagination {
  getPaginatedCar: {
    data: Car[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface SingleCar {
  getCarById: Car;
}

export interface CreateCarResponse {
  createCar: Car;
}

export interface UpdateCarResponse {
  updateCar: Car;
}

// GraphQL Queries
const GET_PAGINATED_CARS = `
  query GetPaginatedCar($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: SearchCarInput!) {
    getPaginatedCar(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        schoolId
        carId
        carName
        model
        registrationNumber
        year
        color
        fuelType
        transmission
        seatingCapacity
        currentMileage
        assignedDriverId
        assignedDriver {
          id
          driverId
          name
          email
          mobile
          status
        }
        totalBookings
        status
        lastServiceDate
        nextServiceDate
        createdAt
        updatedAt
      }
      total
      skip
      take
    }
  }
`;

const GET_CAR_BY_ID = `
  query GetCarById($id: Int!) {
    getCarById(id: $id) {
      id
      schoolId
      carId
      carName
      model
      registrationNumber
      year
      color
      fuelType
      transmission
      seatingCapacity
      engineNumber
      chassisNumber
      purchaseDate
      purchaseCost
      currentMileage
      insuranceNumber
      insuranceExpiry
      pucExpiry
      fitnessExpiry
      lastServiceDate
      nextServiceDate
      assignedDriverId
      assignedDriver {
        id
        driverId
        name
        email
        mobile
        licenseNumber
        licenseType
        experience
        status
      }
      totalBookings
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CAR = `
  mutation CreateCar($inputType: CreateCarInput!) {
    createCar(inputType: $inputType) {
      id
      schoolId
      carId
      carName
      model
      registrationNumber
      year
      color
      fuelType
      transmission
      seatingCapacity
      status
      createdAt
    }
  }
`;

const UPDATE_CAR = `
  mutation UpdateCar($id: Int!, $updateType: UpdateCarInput!) {
    updateCar(id: $id, updateType: $updateType) {
      id
      schoolId
      carId
      carName
      model
      registrationNumber
      year
      color
      fuelType
      transmission
      seatingCapacity
      engineNumber
      chassisNumber
      purchaseDate
      purchaseCost
      currentMileage
      insuranceNumber
      insuranceExpiry
      pucExpiry
      fitnessExpiry
      lastServiceDate
      nextServiceDate
      assignedDriverId
      totalBookings
      status
      updatedAt
    }
  }
`;

const DELETE_CAR = `
  mutation DeleteCar($id: Int!) {
    deleteCar(id: $id) {
      id
    }
  }
`;

// API Functions
export const getPaginatedCars = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search?: string;
  };
  whereSearchInput: {
    schoolId?: number;
    status?: string;
    fuelType?: string;
    assignedDriverId?: number;
    search?: string;
  };
}) => {
  return ApiCall<CarPagination>({
    query: GET_PAGINATED_CARS,
    variables,
  });
};

export const getCarById = async (id: number) => {
  return ApiCall<SingleCar>({
    query: GET_CAR_BY_ID,
    variables: { id },
  });
};

export const createCar = async (inputType: {
  schoolId: number;
  carId: string;
  carName: string;
  model: string;
  registrationNumber: string;
  year: number;
  color: string;
  fuelType: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID" | "CNG";
  transmission: "MANUAL" | "AUTOMATIC" | "AMT" | "CVT";
  seatingCapacity?: number;
  engineNumber?: string;
  chassisNumber?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  currentMileage?: number;
  insuranceNumber?: string;
  insuranceExpiry?: Date;
  pucExpiry?: Date;
  fitnessExpiry?: Date;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  assignedDriverId?: number;
  status?: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "INACTIVE";
}) => {
  return ApiCall<CreateCarResponse>({
    query: CREATE_CAR,
    variables: { inputType },
  });
};

export const updateCar = async (updateData: {
  id: number;
  carName?: string;
  model?: string;
  registrationNumber?: string;
  year?: number;
  color?: string;
  fuelType?: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID" | "CNG";
  transmission?: "MANUAL" | "AUTOMATIC" | "AMT" | "CVT";
  seatingCapacity?: number;
  engineNumber?: string;
  chassisNumber?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  currentMileage?: number;
  insuranceNumber?: string;
  insuranceExpiry?: Date;
  pucExpiry?: Date;
  fitnessExpiry?: Date;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  assignedDriverId?: number;
  totalBookings?: number;
  status?: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "INACTIVE";
}) => {
  const { id, ...updateType } = updateData;
  return ApiCall<UpdateCarResponse>({
    query: UPDATE_CAR,
    variables: { id, updateType: { id, ...updateType } },
  });
};

export const deleteCar = async (id: number) => {
  return ApiCall<{ deleteCar: { id: number } }>({
    query: DELETE_CAR,
    variables: { id },
  });
};
