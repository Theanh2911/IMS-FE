export interface Position {
  id: number;
  shelves: string;
  rowAndColumn: string;
  fullLocation: string;
}

export interface PositionApiResponse {
  userId: number;
  productQuantity: number;
  message: string;
  data: Position[];
  status: number;
}

export interface PositionProduct {
  productId: number;
  productName: string;
  productPrice: number;
  totalProductQuantity: number;
  category: string;
  supplier: string;
  positionId: number;
  shelves: string;
  rowAndColumn: string;
  fullLocation: string;
  quantityAtPosition: number;
}

export interface PositionDetails {
  totalQuantity: number;
  totalProducts: number;
  position: Position;
  products: PositionProduct[];
}

export interface PositionDetailsApiResponse {
  userId: number;
  productQuantity: number;
  message: string;
  data: PositionDetails;
  status: number;
}

export interface MoveProductRequest {
  productId: number;
  positionId: number;
  quantity: number;
}

export interface MoveProductData {
  productId: number;
  productName: string;
  productPrice: number;
  totalProductQuantity: number;
  category: string;
  supplier: string;
  positionId: number;
  shelves: string;
  rowAndColumn: string;
  fullLocation: string;
  quantityAtPosition: number;
}

export interface MoveProductApiResponse {
  status: number;
  message: string;
  data: MoveProductData;
} 