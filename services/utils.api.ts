import { ApiCall } from "./api";

// Types
export interface ServerDateTime {
  serverDateTime: string;
}

export interface ServerDateTimeResponse {
  getServerDateTime: ServerDateTime;
}

// GraphQL Query
const GET_SERVER_DATE_TIME = `
  query GetServerDateTime {
    getServerDateTime {
      serverDateTime
    }
  }
`;

// API Function
export const getServerDateTime = async () => {
  return await ApiCall<ServerDateTimeResponse>({
    query: GET_SERVER_DATE_TIME,
    variables: {},
  });
};
