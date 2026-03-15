import { ApiCall } from "./api";

// Types
export interface TraingRules {
  id: number;
  schoolId: number;
  rule1?: string;
  rule2?: string;
  rule3?: string;
  rule4?: string;
  rule5?: string;
  rule6?: string;
  rule7?: string;
  rule8?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TraingRulesPagination {
  getPaginatedTraingRules: {
    data: TraingRules[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface AllTraingRulesResponse {
  getAllTraingRules: TraingRules[];
}

export interface SingleTraingRules {
  getTraingRulesById: TraingRules;
}

export interface CreateTraingRulesResponse {
  createTraingRules: TraingRules;
}

export interface UpdateTraingRulesResponse {
  updateTraingRules: TraingRules;
}

// GraphQL Queries
const GET_ALL_TRAING_RULES = `
  query GetAllTraingRules($whereSearchInput: SearchTraingRulesInput!) {
    getAllTraingRules(whereSearchInput: $whereSearchInput) {
      id
      schoolId
      rule1
      rule2
      rule3
      rule4
      rule5
      rule6
      rule7
      rule8
      createdAt
      updatedAt
    }
  }
`;

const GET_TRAING_RULES_BY_ID = `
  query GetTraingRulesById($id: Int!) {
    getTraingRulesById(id: $id) {
      id
      schoolId
      rule1
      rule2
      rule3
      rule4
      rule5
      rule6
      rule7
      rule8
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TRAING_RULES = `
  mutation CreateTraingRules($inputType: CreateTraingRulesInput!) {
    createTraingRules(inputType: $inputType) {
      id
      schoolId
      rule1
      rule2
      rule3
      rule4
      rule5
      rule6
      rule7
      rule8
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TRAING_RULES = `
  mutation UpdateTraingRules($id: Int!, $inputType: UpdateTraingRulesInput!) {
    updateTraingRules(id: $id, inputType: $inputType) {
      id
      schoolId
      rule1
      rule2
      rule3
      rule4
      rule5
      rule6
      rule7
      rule8
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TRAING_RULES = `
  mutation DeleteTraingRules($id: Int!) {
    deleteTraingRules(id: $id) {
      id
    }
  }
`;

// API Functions
export const getAllTraingRules = async (whereSearchInput: { schoolId: number }) => {
  return await ApiCall<AllTraingRulesResponse>({
    query: GET_ALL_TRAING_RULES,
    variables: { whereSearchInput },
  });
};

export const getTraingRulesById = async (id: number) => {
  return await ApiCall<SingleTraingRules>({
    query: GET_TRAING_RULES_BY_ID,
    variables: { id },
  });
};

export const createTraingRules = async (inputType: {
  schoolId: number;
  rule1?: string;
  rule2?: string;
  rule3?: string;
  rule4?: string;
  rule5?: string;
  rule6?: string;
  rule7?: string;
  rule8?: string;
}) => {
  return await ApiCall<CreateTraingRulesResponse>({
    query: CREATE_TRAING_RULES,
    variables: { inputType },
  });
};

export const updateTraingRules = async (
  id: number,
  inputType: {
    schoolId?: number;
    rule1?: string;
    rule2?: string;
    rule3?: string;
    rule4?: string;
    rule5?: string;
    rule6?: string;
    rule7?: string;
    rule8?: string;
  }
) => {
  return await ApiCall<UpdateTraingRulesResponse>({
    query: UPDATE_TRAING_RULES,
    variables: { id, inputType },
  });
};

export const deleteTraingRules = async (id: number) => {
  return await ApiCall({
    query: DELETE_TRAING_RULES,
    variables: { id },
  });
};
