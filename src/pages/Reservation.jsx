// src/pages/Reservation.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getReservations,
  deleteReservation,
} from "../api/reservation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

import { Trash2 } from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  // If string contains 'T', treat as ISO datetime
  if (typeof value === "string" && value.includes("T")) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  }
  return value; // already date-only string like "2025-11-23"
}

export default function Reservation() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [reservations, setReservations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    date: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const LIMIT = pagination.limit;

  const loadReservations = useCallback(
    async (pageToLoad = currentPage) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("No authentication token found.");
          return;
        }

        const { reservations, pagination: pg } = await getReservations(
          token,
          {
            page: pageToLoad,
            limit: LIMIT,
            date: filters.date || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
          }
        );

        setReservations(reservations);
        setPagination({
          page: pg.page,
          limit: pg.limit,
          totalPages: pg.totalPages,
          total: pg.total,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load reservations");
      } finally {
        setLoading(false);
      }
    },
    [token, LIMIT, currentPage, filters]
  );

  useEffect(() => {
    loadReservations(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.date, filters.startDate, filters.endDate]);

  // Pagination handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      loadReservations(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadReservations(currentPage + 1);
    }
  };

  // Filters
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      date: "",
      startDate: "",
      endDate: "",
    });
  };

  // Delete
  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await deleteReservation(token, deleteId);
      setDeleteId(null);
      await loadReservations(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete reservation");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reservations</h2>
          <p className="text-sm text-gray-500">
            View and manage reservations with filters and pagination.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border rounded-lg bg-white p-4 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Date filter */}
          <div>
            <Label className="mb-1 block">Reservation Date</Label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) =>
                handleFilterChange("date", e.target.value)
              }
            />
          </div>

          {/* Start Date filter */}
          <div>
            <Label className="mb-1 block">Start Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value)
              }
            />
          </div>

          {/* End Date filter */}
          <div>
            <Label className="mb-1 block">End Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <p className="text-sm text-gray-500">
          Loading reservations...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="border rounded-lg bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Reservation Date</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Order Description</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead className="w-32 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-sm text-gray-500"
                  >
                    No reservations found.
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res, index) => (
                  <TableRow key={res.id}>
                    <TableCell>
                      {(currentPage - 1) * LIMIT + (index + 1)}
                    </TableCell>
                    <TableCell>
                      {res.order?.customer?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {res.order?.customer?.email || "-"}
                    </TableCell>
                    <TableCell>
                      {res.order?.customer?.phone || "-"}
                    </TableCell>
                    <TableCell>{formatDate(res.date)}</TableCell>
                    <TableCell>
                      {formatDate(res.startDate)}
                    </TableCell>
                    <TableCell>
                      {formatDate(res.endDate)}
                    </TableCell>
                    <TableCell>
                      {res.order?.description || "-"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {res.order?.status || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDeleteClick(res.id)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages} (
            {pagination.total} total reservations)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this reservation?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">
            This action cannot be undone.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
