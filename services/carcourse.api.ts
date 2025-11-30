import { ApiCall } from "./api";

// Types
export interface CarCourse {
  id: number;
  carId: number;
  courseId: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  car?: {
    id: number;
    carId: string;
    carName: string;
    model: string;
    registrationNumber: string;
    status: string;
  };
  course?: {
    id: number;
    courseId: string;
    courseName: string;
    courseType: string;
  };
}

// GraphQL Mutations
const CREATE_CAR_COURSE = `
  mutation CreateCarCourse($inputType: CreateCarCourseInput!) {
    createCarCourse(inputType: $inputType) {
      id
      carId
      courseId
      createdAt
      updatedAt
    }
  }
`;

const DELETE_CAR_COURSE = `
  mutation DeleteCarCourse($id: Int!, $userid: Int!) {
    deleteCarCourse(id: $id, userid: $userid) {
      id
    }
  }
`;

// GraphQL Queries
const GET_CARS_BY_COURSE = `
  query GetCarsByCourse($whereSearchInput: SearchCarCourseInput!) {
    getAllCarCourse(whereSearchInput: $whereSearchInput) {
      id
      carId
      courseId
      deletedAt
      car {
        id
        carId
        carName
        model
        registrationNumber
        status
      }
    }
  }
`;

const GET_ALL_CAR_COURSES = `
  query GetAllCarCourse($whereSearchInput: SearchCarCourseInput!) {
    getAllCarCourse(whereSearchInput: $whereSearchInput) {
      id
      carId
      courseId
      createdAt
      updatedAt
      deletedAt
      car {
        id
        carId
        carName
        model
        registrationNumber
        status
      }
      course {
        id
        courseId
        courseName
        courseType
      }
    }
  }
`;

// API Functions
export const createCarCourse = async (data: {
  carId: number;
  courseId: number;
}) => {
  return await ApiCall({
    query: CREATE_CAR_COURSE,
    variables: {
      inputType: data,
    },
  });
};

export const deleteCarCourse = async (id: number, userid: number) => {
  return await ApiCall({
    query: DELETE_CAR_COURSE,
    variables: { id, userid },
  });
};

export const getCarsByCourse = async (courseId: number) => {
  return await ApiCall({
    query: GET_CARS_BY_COURSE,
    variables: {
      whereSearchInput: { courseId },
    },
  });
};

export const getAllCarCourses = async (whereSearchInput?: {
  carId?: number;
  courseId?: number;
}) => {
  return await ApiCall({
    query: GET_ALL_CAR_COURSES,
    variables: {
      whereSearchInput: whereSearchInput || {},
    },
  });
};
