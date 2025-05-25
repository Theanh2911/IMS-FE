export interface Transaction {
  id: number;
  transactionNumber: string;
  transactionDate: string;
  totalAmount: number;
  transactionType: 'IMPORT' | 'EXPORT' | 'SALE';
  status?: string;
  userId?: string;
  userName?: string;
  notes?: string;
  items?: TransactionItem[];
  createdAt?: string;
}

export interface TransactionItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

// New interfaces for detailed transaction response
export interface DetailedTransactionProduct {
  productId: number;
  productName: string;
  category: string;
  supplier: string;
  quantity: number;
  priceAtTransaction: number;
  totalPrice: number;
  positionShelves: string;
  positionRowAndColumn: string;
  fullLocation: string;
}

export interface DetailedTransaction {
  id: number;
  transactionNumber: string;
  transactionDate: string;
  totalAmount: number;
  transactionType: 'IMPORT' | 'EXPORT' | 'SALE';
  products: DetailedTransactionProduct[];
}

export interface DetailedTransactionResponse {
  userId: number;
  productQuantity: number;
  message: string;
  data: DetailedTransaction;
  status: number;
}

export interface ImportExportRequest {
  productId: number;
  quantity: number;
  notes: string;
}

export interface TransactionFormData {
  productId: number;
  quantity: number;
  notes: string;
  transactionType: 'IMPORT' | 'EXPORT';
}

export interface Product {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  category: string;
  supplier: string;
} 