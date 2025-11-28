// src/pages/Appointment.jsx

import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../api/appointments";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { getAllCustomers } from "../api/customers";

import { Pencil, Trash2, Plus } from "lucide-react";

/* Helpers to convert date formats */
function toInputDateTimeValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function toApiDateTime(value) {
  // value from <input type="datetime-local" />
  if (!value) return null;
  const date = new Date(value);
  return date.toISOString(); // backend format like 2024-12-01T10:00:00.000Z
}

function formatDisplayDate(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleString();
}

export default function Appointment() {
  const [customers, setCustomers] = useState([]);
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    hospitalName: "",
    customerName: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Appointment dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    customerId: "",
    dateTime: "",
    hospitalName: "",
  });

  // Edit Appointment dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    customerId: "",
    dateTime: "",
    hospitalName: "",
    status: "pending",
    customerName: "",
  });

  // Delete confirmation dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const LIMIT = pagination.limit;

  const loadAppointments = useCallback(
    async (pageToLoad = currentPage) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("No authentication token found.");
          return;
        }

        const { appointments, pagination: pg } = await getAppointments(token, {
          page: pageToLoad,
          limit: LIMIT,
          status: filters.status,
          hospitalName: filters.hospitalName.trim(),
          customerName: filters.customerName.trim(),
        });

        setAppointments(appointments);
        setPagination({
          page: pg.page,
          limit: pg.limit,
          totalPages: pg.totalPages,
          total: pg.total,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    },
    [token, filters, LIMIT, currentPage]
  );

  useEffect(() => {
    loadAppointments(1); // load first page when filters/token change first time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.status, filters.hospitalName, filters.customerName]);

  // Pagination handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      loadAppointments(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadAppointments(currentPage + 1);
    }
  };

  // Filter change handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      hospitalName: "",
      customerName: "",
    });
  };

  // Add appointment handlers
  const openAddDialog = async () => {
    setAddForm({
      customerId: "",
      dateTime: "",
      hospitalName: "",
    });
    if (token) {
      try {
        const { customers } = await getAllCustomers(token, 1, 100); // fetch 100 customers
        setCustomers(customers);
      } catch (err) {
        console.error(err);
        alert("Failed to load customers");
      }
    }

    setIsAddOpen(true);
  };

  const handleAddChange = (field, value) => {
    setAddForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      const payload = {
        customerId: Number(addForm.customerId),
        dateTime: toApiDateTime(addForm.dateTime),
        hospitalName: addForm.hospitalName,
      };

      await createAppointment(token, payload);
      setIsAddOpen(false);
      await loadAppointments(1); // refresh from first page
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create appointment");
    }
  };

  // Edit appointment handlers
  const openEditDialog = (appt) => {
    setEditForm({
      id: appt.id,
      customerId: appt.customer?.id || "",
      dateTime: toInputDateTimeValue(appt.dateTime),
      hospitalName: appt.hospitalName || "",
      status: appt.status || "pending",
      customerName: appt.customer?.name || "",
    });
    setIsEditOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        setError("No authentication token found.");
        return;
      }

      const payload = {
        dateTime: toApiDateTime(editForm.dateTime),
        hospitalName: editForm.hospitalName,
        status: editForm.status,
      };

      await updateAppointment(token, editForm.id, payload);
      setIsEditOpen(false);
      await loadAppointments(currentPage); // stay on same page
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update appointment");
    }
  };

  // Delete handlers
  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleteLoading(true);
      await deleteAppointment(token, deleteId);
      setDeleteId(null);
      await loadAppointments(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete appointment");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Appointments</h2>
          <p className="text-sm text-gray-500">
            Manage appointments with filters, pagination, add, edit, and delete.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="border rounded-lg bg-white p-4 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Status filter */}
          <div>
            <Label className="mb-1 block">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(val) => handleFilterChange("status", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hospital name */}
          <div>
            <Label className="mb-1 block">Hospital Name</Label>
            <Input
              placeholder="Search hospital..."
              value={filters.hospitalName}
              onChange={(e) =>
                handleFilterChange("hospitalName", e.target.value)
              }
            />
          </div>

          {/* Customer name */}
          {/* <div>
            <Label className="mb-1 block">Customer Name</Label>
            <Input
              placeholder="Search customer..."
              value={filters.customerName}
              onChange={(e) =>
                handleFilterChange("customerName", e.target.value)
              }
            />
          </div> */}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear
          </Button>
          {/* Optional: explicit Apply button, but we already auto-load on change */}
          {/* <Button size="sm" onClick={() => loadAppointments(1)}>Apply</Button> */}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <p className="text-sm text-gray-500">Loading appointments...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

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
                <TableHead>Date & Time</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-gray-500"
                  >
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appt, index) => (
                  <TableRow key={appt.id}>
                    <TableCell>
                      {(currentPage - 1) * LIMIT + (index + 1)}
                    </TableCell>
                    <TableCell>{appt.customer?.name || "-"}</TableCell>
                    <TableCell>{appt.customer?.email || "-"}</TableCell>
                    <TableCell>{appt.customer?.phone || "-"}</TableCell>
                    <TableCell>{formatDisplayDate(appt.dateTime)}</TableCell>
                    <TableCell>{appt.hospitalName}</TableCell>
                    <TableCell className="capitalize">{appt.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(appt)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(appt.id)}
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
            Showing page {currentPage} of {totalPages} ({pagination.total} total
            appointments)
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

      {/* Add Appointment Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <Select
                onValueChange={(value) => handleAddChange("customerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose customer" />
                </SelectTrigger>

                <SelectContent className="bg-white">
                  {customers.length === 0 ? (
                    <SelectItem value="" disabled>
                      No customers found
                    </SelectItem>
                  ) : (
                    customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={addForm.dateTime}
                onChange={(e) => handleAddChange("dateTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input
                value={addForm.hospitalName}
                onChange={(e) =>
                  handleAddChange("hospitalName", e.target.value)
                }
                required
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2 bg-white">
              <Label>Customer</Label>
              <Input value={editForm.customerName} disabled />
              <p className="text-xs text-gray-500">
                Customer is not editable from here.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={editForm.dateTime}
                onChange={(e) => handleEditChange("dateTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input
                value={editForm.hospitalName}
                onChange={(e) =>
                  handleEditChange("hospitalName", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2 bg-white">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(val) => handleEditChange("status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this appointment?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
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
