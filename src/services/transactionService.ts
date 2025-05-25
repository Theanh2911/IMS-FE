const API_BASE_URL = 'http://localhost:8080';

// Import the new detailed transaction types
import { DetailedTransactionResponse } from '@/types/transaction';

export interface ImportProductRequest {
  productId: number;
  quantity: number;
  notes: string;
}

export interface ExportProductRequest {
  productId: number;
  quantity: number;
  notes: string;
}

export interface TransactionResponse {
  status: number;
  message: string;
}

export interface TransactionData {
  id: number;
  transactionNumber: string;
  transactionDate: string;
  totalAmount: number;
  transactionType: 'IMPORT' | 'EXPORT';
}

export interface GetTransactionsResponse {
  status: number;
  message: string;
  transactions: TransactionData[];
}

export interface GetTransactionByIdResponse {
  status: number;
  message: string;
  data: TransactionData;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const transactionService = {
  importProduct: async (data: ImportProductRequest): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transaction/import`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error importing product:', error);
      throw error;
    }
  },

  exportProduct: async (data: ExportProductRequest): Promise<TransactionResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transaction/export`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error exporting product:', error);
      throw error;
    }
  },

  getAllTransactions: async (): Promise<GetTransactionsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transaction/all`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get Transaction by ID
  getTransactionById: async (id: number): Promise<GetTransactionByIdResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transaction/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      throw error;
    }
  },

  // Get Detailed Transaction by ID (with products information)
  getDetailedTransactionById: async (id: number): Promise<DetailedTransactionResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/transaction/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching detailed transaction by ID:', error);
      throw error;
    }
  },
}; 