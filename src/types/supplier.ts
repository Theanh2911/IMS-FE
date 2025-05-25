export interface Supplier {
  supplierId: number;
  name: string;
  address: string;
}

export interface AddSupplierDto {
  supplierId: number;
  name: string;
  address: string;
}

export interface UpdateSupplierDto {
  supplierId: number;
  name: string;
  address: string;
} 