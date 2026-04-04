import { ApiCall } from "./api";

// Types
export interface Payment {
  id: number;
  bookingId: number;
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

export interface PaymentPagination {
  getPaginatedPayment: {
    data: Payment[];
    total: number;
    skip: number;
    take: number;
  };
}

// GraphQL Queries
const GET_ALL_PAYMENTS = `
  query GetAllPayment($whereSearchInput: SearchPaymentInput!) {
    getAllPayment(whereSearchInput: $whereSearchInput) {
      id
      bookingId
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

const CREATE_PAYMENT = `
  mutation CreatePayment($inputType: CreatePaymentInput!) {
    createPayment(inputType: $inputType) {
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
export const getPaymentsByBooking = async (bookingId: number) => {
  return await ApiCall<{ getAllPayment: Payment[] }>({
    query: GET_ALL_PAYMENTS,
    variables: { whereSearchInput: { bookingId } },
  });
};

export const getTotalPaidAmount = async (bookingId: number) => {
  // Calculate total from all completed payments for this booking
  const response = await ApiCall<{ getAllPayment: Payment[] }>({
    query: GET_ALL_PAYMENTS,
    variables: { whereSearchInput: { bookingId, status: "COMPLETED" } },
  });
  
  const payments = response.data?.getAllPayment || [];
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return {
    ...response,
    data: {
      getTotalPaidAmount: total
    }
  };
};

export const createPayment = async (inputType: {
  bookingId: number;
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
  return await ApiCall({
    query: CREATE_PAYMENT,
    variables: { inputType },
  });
};

export const getAllPayments = async (whereSearchInput?: {
  bookingId?: number;
  userId?: number;
  paymentMethod?: string;
  status?: string;
  paymentNumber?: string;
}) => {
  return await ApiCall<{ getAllPayment: Payment[] }>({
    query: GET_ALL_PAYMENTS,
    variables: { whereSearchInput: whereSearchInput || {} },
  });
};

const UPDATE_PAYMENT = `
  mutation UpdatePayment($id: Int!, $updateType: UpdatePaymentInput!) {
    updatePayment(id: $id, updateType: $updateType) {
      id
      amount
      paymentMethod
      transactionId
      bankName
      installmentNumber
      totalInstallments
      notes
      status
      paymentNumber
      paymentDate
      updatedAt
    }
  }
`;

export const updatePayment = async (
  id: number,
  updateType: {
    amount?: number;
    paymentMethod?: string;
    transactionId?: string;
    bankName?: string;
    notes?: string;
    status?: string;
  },
) => {
  return await ApiCall<{ updatePayment: Payment }>({
    query: UPDATE_PAYMENT,
    variables: { id, updateType },
  });
};
