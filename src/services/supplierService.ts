import { Suppliers } from "@/types/suppliers";

interface ApiResponse<T> {
  status: number;
  message: string;
  suppliers?: T[];
  timestamp: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export async function getAllSuppliers(): Promise<Suppliers[]> {
  const response = await fetch('http://localhost:8080/api/suppliers/all-suppliers', {
    headers: getAuthHeader()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch suppliers');
  }
  const data: ApiResponse<Suppliers> = await response.json();
  return data.suppliers || [];
}

export async function addSupplier(supplier: Omit<Suppliers, 'supplierId'>): Promise<Suppliers> {
  const response = await fetch('http://localhost:8080/api/suppliers/add', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(supplier),
  });
  if (!response.ok) {
    throw new Error('Failed to add supplier');
  }
  const data: ApiResponse<Suppliers> = await response.json();
  return data.suppliers?.[0] || {} as Suppliers;
}

export async function updateSupplier(id: number, supplier: Suppliers): Promise<Suppliers> {
  const response = await fetch(`http://localhost:8080/api/suppliers/update/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(supplier),
  });
  if (!response.ok) {
    throw new Error('Failed to update supplier');
  }
  const data: ApiResponse<Suppliers> = await response.json();
  return data.suppliers?.[0] || {} as Suppliers;
} 