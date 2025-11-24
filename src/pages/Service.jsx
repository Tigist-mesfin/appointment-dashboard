// src/pages/Service.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../api/services";

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

import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Service() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    name: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    type: "perDate",
    costPerDate: "",
    costPerService: "",
    description: "",
  });

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    type: "perDate",
    costPerDate: "",
    costPerService: "",
    description: "",
    status: "active",
  });

  // Delete dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const LIMIT = pagination.limit;

  const loadServices = useCallback(
    async (pageToLoad = currentPage) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("No authentication token found.");
          return;
        }

        const { services, pagination: pg } = await getServices(token, {
          page: pageToLoad,
          limit: LIMIT,
          type: filters.type,
          status: filters.status,
          name: filters.name.trim(),
        });

        setServices(services);
        setPagination({
          page: pg.page,
          limit: pg.limit,
          totalPages: pg.totalPages,
          total: pg.total,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    },
    [token, filters, LIMIT, currentPage]
  );

  useEffect(() => {
    loadServices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.type, filters.status, filters.name]);

  // Pagination handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      loadServices(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadServices(currentPage + 1);
    }
  };

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      name: "",
    });
  };

  // Add dialog handlers
  const openAddDialog = () => {
    setAddForm({
      name: "",
      type: "perDate",
      costPerDate: "",
      costPerService: "",
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
        type: addForm.type,
        description: addForm.description,
        costPerDate:
          addForm.type === "perDate" ? addForm.costPerDate : null,
        costPerService:
          addForm.type === "fixed" ? addForm.costPerService : null,
      };

      await createService(token, payload);
      setIsAddOpen(false);
      await loadServices(1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create service");
    }
  };

  // Edit dialog handlers
  const openEditDialog = (service) => {
    setEditForm({
      id: service.id,
      name: service.name || "",
      type: service.type || "perDate",
      costPerDate: service.costPerDate || "",
      costPerService: service.costPerService || "",
      description: service.description || "",
      status: service.status || "active",
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
        type: editForm.type,
        description: editForm.description,
        status: editForm.status,
        costPerDate:
          editForm.type === "perDate" ? editForm.costPerDate : null,
        costPerService:
          editForm.type === "fixed" ? editForm.costPerService : null,
      };

      await updateService(token, editForm.id, payload);
      setIsEditOpen(false);
      await loadServices(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update service");
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
      await deleteService(token, deleteId);
      setDeleteId(null);
      await loadServices(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete service");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Services</h2>
          <p className="text-sm text-gray-500">
            Manage services with filters, pagination, add, edit, and delete.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filters */}
      <div className="border rounded-lg bg-white p-4 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Type filter */}
          <div>
            <Label className="mb-1 block">Type</Label>
            <Select
              value={filters.type}
              onValueChange={(val) =>
                handleFilterChange("type", val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="perDate">Per Date</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div>
            <Label className="mb-1 block">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(val) =>
                handleFilterChange("status", val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name search */}
          <div>
            <Label className="mb-1 block">Service Name</Label>
            <Input
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) =>
                handleFilterChange("name", e.target.value)
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
          Loading services...
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cost Per Date</TableHead>
                <TableHead>Cost Per Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-gray-500"
                  >
                    No services found.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service, index) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      {(currentPage - 1) * LIMIT + (index + 1)}
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell className="capitalize">
                      {service.type}
                    </TableCell>
                    <TableCell>
                      {service.costPerDate ?? "-"}
                    </TableCell>
                    <TableCell>
                      {service.costPerService ?? "-"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {service.status}
                    </TableCell>
                    <TableCell>
                      {service.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(service)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDeleteClick(service.id)
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
            {pagination.total} total services)
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

      {/* Add Service Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Add Service</DialogTitle>
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
              <Label>Type</Label>
              <Select
                value={addForm.type}
                onValueChange={(val) =>
                  handleAddChange("type", val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perDate">Per Date</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {addForm.type === "perDate" && (
              <div className="space-y-2">
                <Label>Cost Per Date</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={addForm.costPerDate}
                  onChange={(e) =>
                    handleAddChange(
                      "costPerDate",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            )}

            {addForm.type === "fixed" && (
              <div className="space-y-2">
                <Label>Cost Per Service</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={addForm.costPerService}
                  onChange={(e) =>
                    handleAddChange(
                      "costPerService",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            )}

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

      {/* Edit Service Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  handleEditChange("name", e.target.value)
                }
                disabled // you can remove disabled if backend supports editing name
              />
              <p className="text-xs text-gray-500">
                Name editing can be enabled if backend supports it.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(val) =>
                  handleEditChange("type", val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="perDate">Per Date</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editForm.type === "perDate" && (
              <div className="space-y-2">
                <Label>Cost Per Date</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.costPerDate}
                  onChange={(e) =>
                    handleEditChange(
                      "costPerDate",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            )}

            {editForm.type === "fixed" && (
              <div className="space-y-2">
                <Label>Cost Per Service</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.costPerService}
                  onChange={(e) =>
                    handleEditChange(
                      "costPerService",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            )}

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
              <Select
                value={editForm.status}
                onValueChange={(val) =>
                  handleEditChange("status", val)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
              Are you sure you want to delete this service?
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
