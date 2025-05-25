"use client"

import { useState, useEffect } from "react";
import { PositionDetails } from "@/types/position";
import { getPositionDetails } from "@/services/positionService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface PositionDetailsModalProps {
  positionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PositionDetailsModal({ positionId, isOpen, onClose }: PositionDetailsModalProps) {
  const [details, setDetails] = useState<PositionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (positionId && isOpen) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getPositionDetails(positionId);
          setDetails(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch position details');
        } finally {
          setLoading(false);
        }
      };

      fetchDetails();
    }
  }, [positionId, isOpen]);

  const handleClose = () => {
    setDetails(null);
    setError(null);
    onClose();
  };

  // Helper function to safely get the title
  const getDialogTitle = () => {
    if (details && details.position && details.position.fullLocation) {
      return `Position Details - ${details.position.fullLocation}`;
    }
    return "Position Details";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {details && details.position && !loading && (
          <div className="space-y-6">
            {/* Position Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{details.position.fullLocation || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">
                    Shelf: {details.position.shelves || 'N/A'} | Position: {details.position.rowAndColumn || 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{details.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Different product types
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{details.totalQuantity || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total items in position
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Products in this Position
                  <Badge variant="secondary">
                    {details.products?.length || 0} {(details.products?.length || 0) === 1 ? 'product' : 'products'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!details.products || details.products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found in this position
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Product ID</TableHead>
                          <TableHead className="min-w-[200px]">Product Name</TableHead>
                          <TableHead className="min-w-[120px]">Category</TableHead>
                          <TableHead className="min-w-[120px]">Supplier</TableHead>
                          <TableHead className="text-right min-w-[100px]">Price</TableHead>
                          <TableHead className="text-right min-w-[140px]">Quantity at Position</TableHead>
                          <TableHead className="text-right min-w-[160px]">Total Product Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.products.map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="font-medium">{product.productId || 'N/A'}</TableCell>
                            <TableCell className="font-medium">{product.productName || 'Unknown Product'}</TableCell>
                            <TableCell>{product.category || 'N/A'}</TableCell>
                            <TableCell>{product.supplier || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              ${(product.productPrice || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{product.quantityAtPosition || 0}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{product.totalProductQuantity || 0}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 