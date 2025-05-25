"use client"

import { useState, useEffect } from "react";
import { Position } from "@/types/position";
import { getAllPositions } from "@/services/positionService";
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
import { Button } from "@/components/ui/button";
import { PositionDetailsModal } from "./position-details-modal";
import { MoveProductModal } from "./move-product-modal";

export function PositionsTable() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPositions();
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleRowClick = (positionId: number) => {
    setSelectedPositionId(positionId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPositionId(null);
  };

  const handleOpenMoveModal = () => {
    setIsMoveModalOpen(true);
  };

  const handleCloseMoveModal = () => {
    setIsMoveModalOpen(false);
  };

  const handleMoveSuccess = () => {
    // Refresh the positions list after successful move
    fetchPositions();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Positions ({positions.length})</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on any position to view details and products
              </p>
            </div>
            <Button onClick={handleOpenMoveModal} className="bg-blue-600 hover:bg-blue-700">
              Move Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Shelves</TableHead>
                <TableHead>Row & Column</TableHead>
                <TableHead>Full Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No positions found
                  </TableCell>
                </TableRow>
              ) : (
                positions.map((position) => (
                  <TableRow 
                    key={position.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(position.id)}
                  >
                    <TableCell className="font-medium">{position.id}</TableCell>
                    <TableCell>{position.shelves}</TableCell>
                    <TableCell>{position.rowAndColumn}</TableCell>
                    <TableCell>{position.fullLocation}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PositionDetailsModal
        positionId={selectedPositionId}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />

      <MoveProductModal
        isOpen={isMoveModalOpen}
        onClose={handleCloseMoveModal}
        onSuccess={handleMoveSuccess}
      />
    </>
  );
} 