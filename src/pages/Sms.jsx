// src/pages/Sms.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getSmsList,
  createSms,
  updateSms,
  deleteSms,
} from "../api/sms";

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

import { Plus, Pencil, Trash2 } from "lucide-react";

function formatDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

export default function Sms() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [smsList, setSmsList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    customerId: "",
    title: "",
    description: "",
  });

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    customerId: "",
    customerName: "",
    customerPhone: "",
    title: "",
    description: "",
    status: "pending",
  });

  // Delete dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const LIMIT = pagination.limit;

  const loadSms = useCallback(
    async (pageToLoad = currentPage) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("No authentication token found.");
          return;
        }

        const { smsList, pagination: pg } = await getSmsList(token, {
          page: pageToLoad,
          limit: LIMIT,
        });

        setSmsList(smsList);
        setPagination({
          page: pg.page,
          limit: pg.limit,
          totalPages: pg.totalPages,
          total: pg.total,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load SMS records");
      } finally {
        setLoading(false);
      }
    },
    [token, LIMIT, currentPage]
  );

  useEffect(() => {
    loadSms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      loadSms(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadSms(currentPage + 1);
    }
  };

  // Add dialog handlers
  const openAddDialog = () => {
    setAddForm({
      customerId: "",
      title: "",
      description: "",
    });
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
        customerId: addForm.customerId,
        title: addForm.title,
        description: addForm.description,
      };

      await createSms(token, payload);
      setIsAddOpen(false);
      await loadSms(1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create SMS");
    }
  };

  // Edit dialog handlers
  const openEditDialog = (sms) => {
    setEditForm({
      id: sms.id,
      customerId: sms.customerId,
      customerName: sms.customer?.name || "",
      customerPhone: sms.customer?.phone || "",
      title: sms.title || "",
      description: sms.description || "",
      status: sms.status || "pending",
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
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
      };

      await updateSms(token, editForm.id, payload);
      setIsEditOpen(false);
      await loadSms(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update SMS");
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
      await deleteSms(token, deleteId);
      setDeleteId(null);
      await loadSms(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete SMS");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">SMS</h2>
          <p className="text-sm text-gray-500">
            Manage SMS notifications with pagination, add, edit, and delete.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add SMS
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <p className="text-sm text-gray-500">Loading SMS records...</p>
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
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-32 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smsList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-sm text-gray-500"
                  >
                    No SMS records found.
                  </TableCell>
                </TableRow>
              ) : (
                smsList.map((sms, index) => (
                  <TableRow key={sms.id}>
                    <TableCell>
                      {(currentPage - 1) * LIMIT + (index + 1)}
                    </TableCell>
                    <TableCell>{sms.customer?.name || "-"}</TableCell>
                    <TableCell>{sms.customer?.email || "-"}</TableCell>
                    <TableCell>{sms.customer?.phone || "-"}</TableCell>
                    <TableCell>{sms.title}</TableCell>
                    <TableCell>{sms.description}</TableCell>
                    <TableCell className="capitalize">
                      {sms.status}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(sms.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(sms)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDeleteClick(sms.id)
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
            {pagination.total} total SMS)
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

      {/* Add SMS Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add SMS</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer ID</Label>
              <Input
                type="number"
                value={addForm.customerId}
                onChange={(e) =>
                  handleAddChange("customerId", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={addForm.title}
                onChange={(e) =>
                  handleAddChange("title", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={addForm.description}
                onChange={(e) =>
                  handleAddChange("description", e.target.value)
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

      {/* Edit SMS Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white" >
          <DialogHeader>
            <DialogTitle>Edit SMS</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Input
                value={
                  editForm.customerName
                    ? `${editForm.customerName} (${editForm.customerPhone})`
                    : "-"
                }
                disabled
              />
              <p className="text-xs text-gray-500">
                Customer is not editable from here.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  handleEditChange("title", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) =>
                  handleEditChange("description", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={editForm.status}
                onChange={(e) =>
                  handleEditChange("status", e.target.value)
                }
              />
              <p className="text-xs text-gray-500">
                Example: pending, delivered, failed.
              </p>
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
              Are you sure you want to delete this SMS?
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
