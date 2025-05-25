import { Shelf, ProductLocation } from "@/types/warehouse";

const API_BASE_URL = "/api";

export const warehouseService = {
  // Shelf Management
  getAllShelves: async (): Promise<Shelf[]> => {
    const response = await fetch(`${API_BASE_URL}/shelves`);
    return response.json();
  },

  getShelfById: async (id: number): Promise<Shelf> => {
    const response = await fetch(`${API_BASE_URL}/shelves/${id}`);
    return response.json();
  },

  getShelfByCode: async (code: string): Promise<Shelf> => {
    const response = await fetch(`${API_BASE_URL}/shelves/code/${code}`);
    return response.json();
  },

  getAvailableShelves: async (): Promise<Shelf[]> => {
    const response = await fetch(`${API_BASE_URL}/shelves/available`);
    return response.json();
  },

  // Product Location Management
  getShelfContents: async (shelfId: number): Promise<ProductLocation[]> => {
    const response = await fetch(`${API_BASE_URL}/product-locations/shelf/${shelfId}`);
    return response.json();
  },

  addProductToShelf: async (data: {
    productId: number;
    shelfId: number;
    quantity: number;
  }): Promise<void> => {
    await fetch(`${API_BASE_URL}/product-locations/add-to-shelf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  updateProductQuantity: async (data: {
    productId: number;
    shelfId: number;
    quantity: number;
  }): Promise<void> => {
    await fetch(`${API_BASE_URL}/product-locations/update-quantity`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  removeProductFromShelf: async (productId: number, shelfId: number): Promise<void> => {
    await fetch(`${API_BASE_URL}/product-locations/product/${productId}/shelf/${shelfId}`, {
      method: "DELETE",
    });
  },
}; 