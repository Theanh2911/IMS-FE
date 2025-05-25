export interface Shelf {
  id: number;
  code: string;
  area: string;
  row: number;
  column: number;
  capacity: number;
  productLocations: ProductLocation[];
}

export interface ProductLocation {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  shelfId: number;
}

export interface ShelfStatus {
  totalCapacity: number;
  usedCapacity: number;
  availableSpace: number;
} 