import { Position, PositionApiResponse, PositionDetails, PositionDetailsApiResponse, MoveProductRequest, MoveProductApiResponse } from "@/types/position";

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export async function getAllPositions(): Promise<Position[]> {
  const response = await fetch('http://localhost:8080/api/v1/positions', {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch positions');
  }
  
  const data: PositionApiResponse = await response.json();
  return data.data || [];
}

export async function getPositionDetails(id: number): Promise<PositionDetails> {
  const response = await fetch(`http://localhost:8080/api/v1/positions/${id}/details`, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch position details');
  }
  
  const data: PositionDetailsApiResponse = await response.json();
  return data.data;
}

export async function moveProduct(moveRequest: MoveProductRequest): Promise<MoveProductApiResponse> {
  const response = await fetch('http://localhost:8080/api/v1/positions/move-product', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(moveRequest),
  });
  
  if (!response.ok) {
    throw new Error('Failed to move product');
  }
  
  const data: MoveProductApiResponse = await response.json();
  return data;
}

export async function removeProductFromPosition(productId: number, positionId: number): Promise<void> {
  const response = await fetch(`http://localhost:8080/api/v1/positions/remove-product/${productId}/${positionId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove product from position');
  }
} 