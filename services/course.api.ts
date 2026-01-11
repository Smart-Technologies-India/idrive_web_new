import { ApiCall } from "./api";

// Types
export interface Course {
  id: number;
  schoolId: number;
  courseId: string;
  courseName: string;
  courseType: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "REFRESHER";
  minsPerDay: number;
  courseDays: number;
  price: number;
  automaticPrice?: number;
  enrolledStudents: number;
  description: string;
  syllabus?: string;
  requirements?: string;
  sessionsCompleted: number;
  totalRevenue: number;
  status: "ACTIVE" | "INACTIVE" | "UPCOMING" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface CoursePagination {
  getPaginatedCourse: {
    data: Course[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface SingleCourse {
  getCourseById: Course;
}

export interface CreateCourseResponse {
  createCourse: Course;
}

export interface UpdateCourseResponse {
  updateCourse: Course;
}

export interface AllCoursesResponse {
  getAllCourse: Course[];
}

// GraphQL Queries
const GET_PAGINATED_COURSES = `
  query GetPaginatedCourse($searchPaginationInput: SearchPaginationInput!, $whereSearchInput: SearchCourseInput!) {
    getPaginatedCourse(searchPaginationInput: $searchPaginationInput, whereSearchInput: $whereSearchInput) {
      data {
        id
        schoolId
        courseId
        courseName
        courseType
        minsPerDay
        courseDays
        price
        automaticPrice
        enrolledStudents
        sessionsCompleted
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

const GET_ALL_COURSES = `
  query GetAllCourse($whereSearchInput: SearchCourseInput!) {
    getAllCourse(whereSearchInput: $whereSearchInput) {
      id
      courseId
      courseName
      courseType
      minsPerDay
      courseDays
      price
      automaticPrice
      enrolledStudents
      status
    }
  }
`;

const GET_COURSE_BY_ID = `
  query GetCourseById($id: Int!) {
    getCourseById(id: $id) {
      id
      schoolId
      courseId
      courseName
      courseType
      minsPerDay
      courseDays
      price
      automaticPrice
      enrolledStudents
      description
      syllabus
      requirements
      sessionsCompleted
      totalRevenue
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_COURSE = `
  mutation CreateCourse($inputType: CreateCourseInput!) {
    createCourse(inputType: $inputType) {
      id
      schoolId
      courseId
      courseName
      courseType
      minsPerDay
      courseDays
      price
      automaticPrice
      status
      createdAt
    }
  }
`;

const UPDATE_COURSE = `
  mutation UpdateCourse($id: Int!, $updateType: UpdateCourseInput!) {
    updateCourse(id: $id, updateType: $updateType) {
      id
      schoolId
      courseId
      courseName
      courseType
      minsPerDay
      courseDays
      price
      automaticPrice
      enrolledStudents
      description
      syllabus
      requirements
      sessionsCompleted
      totalRevenue
      status
      updatedAt
    }
  }
`;

const DELETE_COURSE = `
  mutation DeleteCourse($id: Int!) {
    deleteCourse(id: $id) {
      id
    }
  }
`;

// API Functions
export const getPaginatedCourses = async (variables: {
  searchPaginationInput: {
    skip: number;
    take: number;
    search: string;
    filters?: string[];
    orderBy?: { field: string; direction: "asc" | "desc" }[];
  };
  whereSearchInput: {
    schoolId?: number;
    courseType?: string;
    status?: string;
  };
}) => {
  return ApiCall<CoursePagination>({
    query: GET_PAGINATED_COURSES,
    variables,
  });
};

export const getAllCourses = async (whereSearchInput: {
  schoolId?: number;
  courseType?: string;
  status?: string;
}) => {
  return ApiCall<AllCoursesResponse>({
    query: GET_ALL_COURSES,
    variables: { whereSearchInput },
  });
};

export const getCourseById = async (id: number) => {
  return ApiCall<SingleCourse>({
    query: GET_COURSE_BY_ID,
    variables: { id },
  });
};

export const createCourse = async (inputType: {
  schoolId: number;
  courseId: string;
  courseName: string;
  courseType: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "REFRESHER";
  minsPerDay: number;
  courseDays: number;
  price: number;
  automaticPrice?: number;
  description: string;
  syllabus?: string;
  requirements?: string;
  status?: "ACTIVE" | "INACTIVE" | "UPCOMING" | "ARCHIVED";
}) => {
  return ApiCall<CreateCourseResponse>({
    query: CREATE_COURSE,
    variables: { inputType },
  });
};

export const updateCourse = async (updateData: {
  id: number;
  courseName?: string;
  courseType?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "REFRESHER";
  minsPerDay?: number;
  courseDays?: number;
  price?: number;
  automaticPrice?: number;
  enrolledStudents?: number;
  description?: string;
  syllabus?: string;
  requirements?: string;
  sessionsCompleted?: number;
  totalRevenue?: number;
  status?: "ACTIVE" | "INACTIVE" | "UPCOMING" | "ARCHIVED";
}) => {
  const { id, ...updateType } = updateData;
  return ApiCall<UpdateCourseResponse>({
    query: UPDATE_COURSE,
    variables: { id, updateType: { ...updateType } },
  });
};

export const deleteCourse = async (id: number) => {
  return ApiCall<{ deleteCourse: { id: number } }>({
    query: DELETE_COURSE,
    variables: { id },
  });
};
