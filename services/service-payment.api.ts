import { ApiCall } from "./api";

// Types
export interface ServicePayment {
  id: number;
  bookingServiceId: number;
  userId: number;
  amount: number;
  paymentNumber: string;
  paymentDate: string;
  paymentMethod?: string;
  transactionId?: string;
  bankName?: string;
  installmentNumber: number;
  totalInstallments: number;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ServicePaymentPagination {
  getPaginatedServicePayment: {
    data: ServicePayment[];
    total: number;
    skip: number;
    take: number;
  };
}

// GraphQL Queries
const GET_ALL_SERVICE_PAYMENTS = `
  query GetAllServicePayment($whereSearchInput: SearchServicePaymentInput!) {
    getAllServicePayment(whereSearchInput: $whereSearchInput) {
      id
      bookingServiceId
      userId
      amount
      paymentNumber
      paymentDate
      paymentMethod
      transactionId
      bankName
      installmentNumber
      totalInstallments
      notes
      status
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SERVICE_PAYMENT = `
  mutation CreateServicePayment($inputType: CreateServicePaymentInput!) {
    createServicePayment(inputType: $inputType) {
      id
      paymentNumber
      amount
      bankName
      installmentNumber
      totalInstallments
      status
    }
  }
`;

// API Functions
export const getServicePaymentsByBookingService = async (bookingServiceId: number) => {
  return await ApiCall<{ getAllServicePayment: ServicePayment[] }>({
    query: GET_ALL_SERVICE_PAYMENTS,
    variables: { whereSearchInput: { bookingServiceId } },
  });
};

export const getAllServicePayments = async (whereSearchInput?: {
  bookingServiceId?: number;
  userId?: number;
  paymentMethod?: string;
  status?: string;
  paymentNumber?: string;
}) => {
  return await ApiCall<{ getAllServicePayment: ServicePayment[] }>({
    query: GET_ALL_SERVICE_PAYMENTS,
    variables: { whereSearchInput: whereSearchInput || {} },
  });
};

export const getTotalPaidServiceAmount = async (bookingServiceId: number) => {
  // Calculate total from all completed payments for this service booking
  const response = await ApiCall<{ getAllServicePayment: ServicePayment[] }>({
    query: GET_ALL_SERVICE_PAYMENTS,
    variables: { whereSearchInput: { bookingServiceId, status: "COMPLETED" } },
  });
  
  const payments = response.data?.getAllServicePayment || [];
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return {
    ...response,
    data: {
      getTotalPaidServiceAmount: total
    }
  };
};

export const createServicePayment = async (inputType: {
  bookingServiceId: number;
  userId: number;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  bankName?: string;
  installmentNumber: number;
  totalInstallments: number;
  notes?: string;
  paymentNumber: string;
}) => {
  return await ApiCall<{ createServicePayment: ServicePayment }>({
    query: CREATE_SERVICE_PAYMENT,
    variables: { inputType },
  });
};
