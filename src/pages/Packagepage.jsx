// src/pages/Package.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../api/package";

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

function getDescription(pkg) {
  // detail.description for complex packages, fallback to description or "-"
  if (pkg.detail && pkg.detail.description) return pkg.detail.description;
  if (pkg.description) return pkg.description;
  return "-";
}

export default function PackagePage() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [packages, setPackages] = useState([]);
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
    name: "",
    price: "",
    description: "",
  });

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    price: "",
    description: "",
    status: "active",
  });

  // Delete dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const LIMIT = pagination.limit;

  const loadPackages = useCallback(
    async (pageToLoad = currentPage) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("No authentication token found.");
          return;
        }

        const { packages, pagination: pg } = await getPackages(token, {
          page: pageToLoad,
          limit: LIMIT,
        });

        setPackages(packages);
        setPagination({
          page: pg.page,
          limit: pg.limit,
          totalPages: pg.totalPages,
          total: pg.total,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load packages");
      } finally {
        setLoading(false);
      }
    },
    [token, LIMIT, currentPage]
  );

  useEffect(() => {
    loadPackages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      loadPackages(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadPackages(currentPage + 1);
    }
  };

  // Add dialog handlers
  const openAddDialog = () => {
    setAddForm({
      name: "",
      price: "",
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
        name: addForm.name,
        price: addForm.price,
        description: addForm.description,
      };

      await createPackage(token, payload);
      setIsAddOpen(false);
      await loadPackages(1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create package");
    }
  };

  // Edit dialog handlers
  const openEditDialog = (pkg) => {
    setEditForm({
      id: pkg.id,
      name: pkg.name || "",
      price: pkg.price || "",
      description: getDescription(pkg),
      status: pkg.status || "active",
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
        name: editForm.name,
        price: editForm.price,
        description: editForm.description,
        status: editForm.status,
      };

      await updatePackage(token, editForm.id, payload);
      setIsEditOpen(false);
      await loadPackages(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update package");
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
      await deletePackage(token, deleteId);
      setDeleteId(null);
      await loadPackages(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete package");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Packages</h2>
          <p className="text-sm text-gray-500">
            Manage packages with pagination, add, edit, and delete.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <p className="text-sm text-gray-500">Loading packages...</p>
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
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-gray-500"
                  >
                    No packages found.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg, index) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      {(currentPage - 1) * LIMIT + (index + 1)}
                    </TableCell>
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell>{pkg.price}</TableCell>
                    <TableCell>{getDescription(pkg)}</TableCell>
                    <TableCell className="capitalize">
                      {pkg.status}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDeleteClick(pkg.id)
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
            {pagination.total} total packages)
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

      {/* Add Package Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white"> 
          <DialogHeader>
            <DialogTitle>Add Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={addForm.name}
                onChange={(e) =>
                  handleAddChange("name", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={addForm.price}
                onChange={(e) =>
                  handleAddChange("price", e.target.value)
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

      {/* Edit Package Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  handleEditChange("name", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) =>
                  handleEditChange("price", e.target.value)
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
                Use &quot;active&quot; or other status supported by backend.
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
              Are you sure you want to delete this package?
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
