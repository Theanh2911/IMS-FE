"use client"

import { useState } from "react";
import { MoveProductRequest } from "@/types/position";
import { moveProduct } from "@/services/positionService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MoveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MoveProductModal({ isOpen, onClose, onSuccess }: MoveProductModalProps) {
  const [formData, setFormData] = useState<MoveProductRequest>({
    productId: 0,
    positionId: 0,
    quantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleInputChange = (field: keyof MoveProductRequest, value: string) => {
    const numericValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.productId <= 0) {
      setError('Please enter a valid Product ID');
      return;
    }
    if (formData.positionId <= 0) {
      setError('Please enter a valid Position ID');
      return;
    }
    if (formData.quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await moveProduct(formData);
      
      // Additional validation: Check if quantity at position exceeds total product quantity
      if (response.data.quantityAtPosition > response.data.totalProductQuantity) {
        setError(`Cannot move ${formData.quantity} units. This would result in ${response.data.quantityAtPosition} units at position, which exceeds the total product quantity of ${response.data.totalProductQuantity}.`);
        return;
      }
      
      setSuccess(response.data);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        // Check if the error message contains information about quantity limits
        if (err.message.includes('quantity') || err.message.includes('exceed')) {
          setError(`${err.message}. Please check that the quantity doesn't exceed the total available product quantity.`);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to move product. Please check that the quantity doesn\'t exceed the total available product quantity.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ productId: 0, positionId: 0, quantity: 0 });
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Move Product to Position</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 text-lg">Product Moved Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Product:</span> {success.productName}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {success.category}
                </div>
                <div>
                  <span className="font-medium">Supplier:</span> {success.supplier}
                </div>
                <div>
                  <span className="font-medium">Price:</span> ${success.productPrice}
                </div>
                <div>
                  <span className="font-medium">New Location:</span> {success.fullLocation}
                </div>
                <div>
                  <span className="font-medium">Quantity Moved:</span> 
                  <Badge variant="outline" className="ml-2">{success.quantityAtPosition}</Badge>
                </div>
                <div>
                  <span className="font-medium">Total Product Quantity:</span> 
                  <Badge variant="secondary" className="ml-2">{success.totalProductQuantity}</Badge>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Validation:</span>
                    {success.quantityAtPosition <= success.totalProductQuantity ? (
                      <Badge variant="default" className="bg-green-600">✓ Quantity Valid</Badge>
                    ) : (
                      <Badge variant="destructive">⚠ Quantity Exceeds Total</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  type="number"
                  min="1"
                  value={formData.productId || ''}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  placeholder="Enter product ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="positionId">Position ID</Label>
                <Input
                  id="positionId"
                  type="number"
                  min="1"
                  value={formData.positionId || ''}
                  onChange={(e) => handleInputChange('positionId', e.target.value)}
                  placeholder="Enter position ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ''}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Enter quantity"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Note: Quantity cannot exceed total product availability
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Moving Product...' : 'Move Product'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {success && (
          <DialogFooter>
            <Button onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 