// // src/pages/Package.jsx

// import React, {
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { AuthContext } from "../context/AuthContext";

// import {
//   getPackages,
//   createPackage,
//   updatePackage,
//   deletePackage,
// } from "../api/package";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Label } from "@/components/ui/label";

// import { Plus, Pencil, Trash2 } from "lucide-react";

// function getDescription(pkg) {
//   // detail.description for complex packages, fallback to description or "-"
//   if (pkg.detail && pkg.detail.description) return pkg.detail.description;
//   if (pkg.description) return pkg.description;
//   return "-";
// }

// export default function PackagePage() {
//   const { auth } = useContext(AuthContext);
//   const token = auth?.token;

//   const [packages, setPackages] = useState([]);
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     totalPages: 1,
//     total: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Add dialog
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [addForm, setAddForm] = useState({
//     name: "",
//     price: "",
//     description: "",
//   });

//   // Edit dialog
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editForm, setEditForm] = useState({
//     id: null,
//     name: "",
//     price: "",
//     description: "",
//     status: "active",
//   });

//   // Delete dialog
//   const [deleteId, setDeleteId] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const currentPage = pagination.page;
//   const totalPages = pagination.totalPages;
//   const LIMIT = pagination.limit;

//   const loadPackages = useCallback(
//     async (pageToLoad = currentPage) => {
//       try {
//         setLoading(true);
//         setError("");

//         if (!token) {
//           setError("No authentication token found.");
//           return;
//         }

//         const { packages, pagination: pg } = await getPackages(token, {
//           page: pageToLoad,
//           limit: LIMIT,
//         });

//         setPackages(packages);
//         setPagination({
//           page: pg.page,
//           limit: pg.limit,
//           totalPages: pg.totalPages,
//           total: pg.total,
//         });
//       } catch (err) {
//         console.error(err);
//         setError(err.message || "Failed to load packages");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [token, LIMIT, currentPage]
//   );

//   useEffect(() => {
//     loadPackages(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [token]);

//   // Pagination
//   const handlePrevious = () => {
//     if (currentPage > 1) {
//       loadPackages(currentPage - 1);
//     }
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) {
//       loadPackages(currentPage + 1);
//     }
//   };

//   // Add dialog handlers
//   const openAddDialog = () => {
//     setAddForm({
//       name: "",
//       price: "",
//       description: "",
//     });
//     setIsAddOpen(true);
//   };

//   const handleAddChange = (field, value) => {
//     setAddForm((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!token) {
//         setError("No authentication token found.");
//         return;
//       }

//       const payload = {
//         name: addForm.name,
//         price: addForm.price,
//         description: addForm.description,
//       };

//       await createPackage(token, payload);
//       setIsAddOpen(false);
//       await loadPackages(1);
//     } catch (err) {
//       console.error(err);
//       alert(err.message || "Failed to create package");
//     }
//   };

//   // Edit dialog handlers
//   const openEditDialog = (pkg) => {
//     setEditForm({
//       id: pkg.id,
//       name: pkg.name || "",
//       price: pkg.price || "",
//       description: getDescription(pkg),
//       status: pkg.status || "active",
//     });
//     setIsEditOpen(true);
//   };

//   const handleEditChange = (field, value) => {
//     setEditForm((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!token) {
//         setError("No authentication token found.");
//         return;
//       }

//       const payload = {
//         name: editForm.name,
//         price: editForm.price,
//         description: editForm.description,
//         status: editForm.status,
//       };

//       await updatePackage(token, editForm.id, payload);
//       setIsEditOpen(false);
//       await loadPackages(currentPage);
//     } catch (err) {
//       console.error(err);
//       alert(err.message || "Failed to update package");
//     }
//   };

//   // Delete handlers
//   const handleDeleteClick = (id) => {
//     setDeleteId(id);
//   };

//   const handleConfirmDelete = async () => {
//     if (!deleteId) return;
//     try {
//       setDeleteLoading(true);
//       await deletePackage(token, deleteId);
//       setDeleteId(null);
//       await loadPackages(currentPage);
//     } catch (err) {
//       console.error(err);
//       alert(err.message || "Failed to delete package");
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Header + Add Button */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-semibold">Packages</h2>
//           <p className="text-sm text-gray-500">
//             Manage packages with pagination, add, edit, and delete.
//           </p>
//         </div>
//         <Button onClick={openAddDialog}>
//           <Plus className="w-4 h-4 mr-2" />
//           Add Package
//         </Button>
//       </div>

//       {/* Loading / Error */}
//       {loading && (
//         <p className="text-sm text-gray-500">Loading packages...</p>
//       )}
//       {error && (
//         <p className="text-sm text-red-500">{error}</p>
//       )}

//       {/* Table */}
//       {!loading && !error && (
//         <div className="border rounded-lg bg-white shadow-sm">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-16">No.</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Price</TableHead>
//                 <TableHead>Description</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="w-32 text-right">
//                   Actions
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {packages.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={6}
//                     className="text-center text-sm text-gray-500"
//                   >
//                     No packages found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 packages.map((pkg, index) => (
//                   <TableRow key={pkg.id}>
//                     <TableCell>
//                       {(currentPage - 1) * LIMIT + (index + 1)}
//                     </TableCell>
//                     <TableCell>{pkg.name}</TableCell>
//                     <TableCell>{pkg.price}</TableCell>
//                     <TableCell>{getDescription(pkg)}</TableCell>
//                     <TableCell className="capitalize">
//                       {pkg.status}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2">
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() => openEditDialog(pkg)}
//                         >
//                           <Pencil className="w-4 h-4" />
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() =>
//                             handleDeleteClick(pkg.id)
//                           }
//                         >
//                           <Trash2 className="w-4 h-4 text-red-500" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Pagination */}
//       {!loading && !error && (
//         <div className="flex items-center justify-between mt-4">
//           <p className="text-sm text-gray-500">
//             Showing page {currentPage} of {totalPages} (
//             {pagination.total} total packages)
//           </p>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handlePrevious}
//               disabled={currentPage <= 1}
//             >
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleNext}
//               disabled={currentPage >= totalPages}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Add Package Dialog */}
//       <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
//         <DialogContent className="bg-white">
//           <DialogHeader>
//             <DialogTitle>Add Package</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleAddSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label>Name</Label>
//               <Input
//                 value={addForm.name}
//                 onChange={(e) =>
//                   handleAddChange("name", e.target.value)
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Price</Label>
//               <Input
//                 type="number"
//                 step="0.01"
//                 value={addForm.price}
//                 onChange={(e) =>
//                   handleAddChange("price", e.target.value)
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Description</Label>
//               <Input
//                 value={addForm.description}
//                 onChange={(e) =>
//                   handleAddChange("description", e.target.value)
//                 }
//                 required
//               />
//             </div>

//             <DialogFooter className="mt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsAddOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">Save</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Package Dialog */}
//       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//         <DialogContent className="bg-white">
//           <DialogHeader>
//             <DialogTitle>Edit Package</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleEditSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label>Name</Label>
//               <Input
//                 value={editForm.name}
//                 onChange={(e) =>
//                   handleEditChange("name", e.target.value)
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Price</Label>
//               <Input
//                 type="number"
//                 step="0.01"
//                 value={editForm.price}
//                 onChange={(e) =>
//                   handleEditChange("price", e.target.value)
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Description</Label>
//               <Input
//                 value={editForm.description}
//                 onChange={(e) =>
//                   handleEditChange("description", e.target.value)
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Status</Label>
//               <Input
//                 value={editForm.status}
//                 onChange={(e) =>
//                   handleEditChange("status", e.target.value)
//                 }
//               />
//               <p className="text-xs text-gray-500">
//                 Use &quot;active&quot; or other status supported by backend.
//               </p>
//             </div>

//             <DialogFooter className="mt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsEditOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">Save Changes</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation */}
//       <AlertDialog
//         open={!!deleteId}
//         onOpenChange={(open) => {
//           if (!open) setDeleteId(null);
//         }}
//       >
//         <AlertDialogContent className="bg-white">
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               Are you sure you want to delete this package?
//             </AlertDialogTitle>
//           </AlertDialogHeader>
//           <p className="text-sm text-gray-600">
//             This action cannot be undone.
//           </p>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleteLoading}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleConfirmDelete}
//               disabled={deleteLoading}
//             >
//               {deleteLoading ? "Deleting..." : "Delete"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// // src/pages/Package.jsx
// import React, { useCallback, useContext, useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";

// import { getPackages, createPackage, updatePackage, deletePackage } from "../api/package";

// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import {
//   AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Label } from "@/components/ui/label";
// import {Info, Plus, Pencil, Trash2, X } from "lucide-react";

// function getDescription(pkg) {
//   if (pkg.detail && pkg.detail.description) return pkg.detail.description;
//   if (pkg.description) return pkg.description;
//   return "-";
// }

// export default function PackagePage() {
//   const { auth } = useContext(AuthContext);
//   const token = auth?.token;

//   const [packages, setPackages] = useState([]);
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Add dialog
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [addForm, setAddForm] = useState({
//     name: "", price: "", status: "active",
//     description: "", duration: "", includes: [""],
//     features: { priority: false, followup: "", reportDelivery: "", personalAssistant: false },
//   });

//   // Edit dialog
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editForm, setEditForm] = useState({
//     id: null, name: "", price: "", status: "active",
//     description: "", duration: "", includes: [""],
//     features: { priority: false, followup: "", reportDelivery: "", personalAssistant: false },
//   });

//   const [deleteId, setDeleteId] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   // Detail dialogconst
// const [detailPkg, setDetailPkg] = useState(null);

//   const currentPage = pagination.page;
//   const totalPages = pagination.totalPages;
//   const LIMIT = pagination.limit;

//   const loadPackages = useCallback(async (pageToLoad = currentPage) => {
//     try {
//       setLoading(true); setError("");
//       if (!token) { setError("No authentication token found."); return; }
//       const { packages, pagination: pg } = await getPackages(token, { page: pageToLoad, limit: LIMIT });
//       setPackages(packages);
//       setPagination({ page: pg.page, limit: pg.limit, totalPages: pg.totalPages, total: pg.total });
//     } catch (err) { console.error(err); setError(err.message || "Failed to load packages"); }
//     finally { setLoading(false); }
//   }, [token, LIMIT, currentPage]);

//   useEffect(() => { loadPackages(1); }, [token]);

//   const handlePrevious = () => { if (currentPage > 1) loadPackages(currentPage - 1); };
//   const handleNext = () => { if (currentPage < totalPages) loadPackages(currentPage + 1); };

//   // Add dialog handlers
//   const openAddDialog = () => {
//     setAddForm({
//       name: "", price: "", status: "active",
//       description: "", duration: "", includes: [""],
//       features: { priority: false, followup: "", reportDelivery: "", personalAssistant: false },
//     });
//     setIsAddOpen(true);
//   };
//   const handleAddChange = (field, value) => { setAddForm(prev => ({ ...prev, [field]: value })); };
//   const handleAddFeatureChange = (field, value) => { setAddForm(prev => ({ ...prev, features: { ...prev.features, [field]: value } })); };
//   const handleAddIncludeChange = (index, value) => { const updated = [...addForm.includes]; updated[index] = value; setAddForm(prev => ({ ...prev, includes: updated })); };
//   const addIncludeField = () => { setAddForm(prev => ({ ...prev, includes: [...prev.includes, ""] })); };
//   const removeIncludeField = (index) => { const updated = addForm.includes.filter((_, i) => i !== index); setAddForm(prev => ({ ...prev, includes: updated })); };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!token) { setError("No authentication token found."); return; }
//       const payload = {
//         name: addForm.name, price: addForm.price, status: addForm.status,
//         detail: { description: addForm.description, duration: addForm.duration, includes: addForm.includes.filter(i => i.trim() !== ""), features: addForm.features },
//       };
//       await createPackage(token, payload);
//       setIsAddOpen(false); await loadPackages(1);
//     } catch (err) { console.error(err); alert(err.message || "Failed to create package"); }
//   };

//   // Edit dialog handlers
//   const openEditDialog = (pkg) => {
//     const detail = pkg.detail || {};
//     setEditForm({
//       id: pkg.id, name: pkg.name || "", price: pkg.price || "", status: pkg.status || "active",
//       description: detail.description || "", duration: detail.duration || "",
//       includes: detail.includes || [""],
//       features: detail.features || { priority: false, followup: "", reportDelivery: "", personalAssistant: false },
//     });
//     setIsEditOpen(true);
//   };
//   const handleEditChange = (field, value) => { setEditForm(prev => ({ ...prev, [field]: value })); };
//   const handleEditFeatureChange = (field, value) => { setEditForm(prev => ({ ...prev, features: { ...prev.features, [field]: value } })); };
//   const handleEditIncludeChange = (index, value) => { const updated = [...editForm.includes]; updated[index] = value; setEditForm(prev => ({ ...prev, includes: updated })); };
//   const addEditIncludeField = () => { setEditForm(prev => ({ ...prev, includes: [...prev.includes, ""] })); };
//   const removeEditIncludeField = (index) => { const updated = editForm.includes.filter((_, i) => i !== index); setEditForm(prev => ({ ...prev, includes: updated })); };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (!token) { setError("No authentication token found."); return; }
//       const payload = {
//         name: editForm.name, price: editForm.price, status: editForm.status,
//         detail: { description: editForm.description, duration: editForm.duration, includes: editForm.includes.filter(i => i.trim() !== ""), features: editForm.features },
//       };
//       await updatePackage(token, editForm.id, payload);
//       setIsEditOpen(false); await loadPackages(currentPage);
//     } catch (err) { console.error(err); alert(err.message || "Failed to update package"); }
//   };

//   const handleDeleteClick = (id) => setDeleteId(id);
//   const handleConfirmDelete = async () => { if (!deleteId) return; try { setDeleteLoading(true); await deletePackage(token, deleteId); setDeleteId(null); await loadPackages(currentPage); } catch (err) { console.error(err); alert(err.message || "Failed to delete package"); } finally { setDeleteLoading(false); } };

// // Detail dialog handlers
//   const openDetailDialog = (pkg) => {
//   setDetailPkg(pkg);
// };
// const closeDetailDialog = () => setDetailPkg(null);

//   return (
//     <div className="space-y-4">
//       {/* Header + Add Button */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-semibold">Packages</h2>
//           <p className="text-sm text-gray-500">Manage packages with pagination, add, edit, and delete.</p>
//         </div>
//         <Button onClick={openAddDialog}><Plus className="w-4 h-4 mr-2" />Add Package</Button>
//       </div>

//       {/* Loading / Error */}
//       {loading && <p className="text-sm text-gray-500">Loading packages...</p>}
//       {error && <p className="text-sm text-red-500">{error}</p>}

//       {/* Table */}
//       {!loading && !error && (
//         <div className="border rounded-lg bg-white shadow-sm">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-16">No.</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Price</TableHead>
//                 <TableHead>Description</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="w-32 text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {packages.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center text-sm text-gray-500">No packages found.</TableCell>
//                 </TableRow>
//               ) : (
//                 packages.map((pkg, index) => (
//                   <TableRow key={pkg.id}>
//                     <TableCell>{(currentPage - 1) * LIMIT + (index + 1)}</TableCell>
//                     <TableCell>{pkg.name}</TableCell>
//                     <TableCell>{pkg.price}</TableCell>
//                     <TableCell>{getDescription(pkg)}</TableCell>
//                     <TableCell className="capitalize">{pkg.status}</TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2">
//                           <Button variant="outline" size="icon" onClick={() => openDetailDialog(pkg)}>
//     <Info className="w-4 h-4" />
//   </Button>
//                         <Button variant="outline" size="icon" onClick={() => openEditDialog(pkg)}><Pencil className="w-4 h-4" /></Button>
//                         <Button variant="outline" size="icon" onClick={() => handleDeleteClick(pkg.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Pagination */}
//       {!loading && !error && (
//         <div className="flex items-center justify-between mt-4">
//           <p className="text-sm text-gray-500">Showing page {currentPage} of {totalPages} ({pagination.total} total packages)</p>
//           <div className="flex gap-2">
//             <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPage <= 1}>Previous</Button>
//             <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage >= totalPages}>Next</Button>
//           </div>
//         </div>
//       )}

//       {/* Add Package Dialog (Scrollable) */}
//       <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
//         <DialogContent className="bg-white max-h-[70vh] overflow-y-auto p-4">
//           <DialogHeader><DialogTitle>Add Package</DialogTitle></DialogHeader>
//           <form onSubmit={handleAddSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label>Name</Label>
//               <Input value={addForm.name} onChange={e => handleAddChange("name", e.target.value)} required />
//             </div>
//             <div className="space-y-2">
//               <Label>Price</Label>
//               <Input type="number" step="0.01" value={addForm.price} onChange={e => handleAddChange("price", e.target.value)} required />
//             </div>
//             <div className="space-y-2">
//               <Label>Description</Label>
//               <Input value={addForm.description} onChange={e => handleAddChange("description", e.target.value)} required />
//             </div>
//             <div className="space-y-2">
//               <Label>Duration</Label>
//               <Input value={addForm.duration} onChange={e => handleAddChange("duration", e.target.value)} />
//             </div>
//             <div className="space-y-2">
//               <Label>Includes</Label>
//               {addForm.includes.map((inc, idx) => (
//                 <div key={idx} className="flex gap-2 items-center">
//                   <Input value={inc} onChange={e => handleAddIncludeChange(idx, e.target.value)} />
//                   <Button type="button" variant="destructive" size="icon" onClick={() => removeIncludeField(idx)}><X className="w-4 h-4" /></Button>
//                 </div>
//               ))}
//               <Button type="button" onClick={addIncludeField}>Add Include</Button>
//             </div>
//             <div className="space-y-2">
//               <Label>Features</Label>
//               <div className="flex gap-2 items-center">
//                 <input type="checkbox" checked={addForm.features.priority} onChange={e => handleAddFeatureChange("priority", e.target.checked)} />
//                 <span>Priority</span>
//               </div>
//               <div className="space-y-1">
//                 <Label>Followup</Label>
//                 <Input value={addForm.features.followup} onChange={e => handleAddFeatureChange("followup", e.target.value)} />
//               </div>
//               <div className="space-y-1">
//                 <Label>Report Delivery</Label>
//                 <Input value={addForm.features.reportDelivery} onChange={e => handleAddFeatureChange("reportDelivery", e.target.value)} />
//               </div>
//               <div className="flex gap-2 items-center">
//                 <input type="checkbox" checked={addForm.features.personalAssistant} onChange={e => handleAddFeatureChange("personalAssistant", e.target.checked)} />
//                 <span>Personal Assistant</span>
//               </div>
//             </div>
//             <DialogFooter className="mt-4 flex justify-end gap-2">
//               <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
//               <Button type="submit">Save</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Package Dialog (Scrollable) */}
//       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//         <DialogContent className="bg-white max-h-[70vh] overflow-y-auto p-4">
//           <DialogHeader><DialogTitle>Edit Package</DialogTitle></DialogHeader>
//           <form onSubmit={handleEditSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label>Name</Label>
//               <Input value={editForm.name} onChange={e => handleEditChange("name", e.target.value)} required />
//             </div>
//             <div className="space-y-2">
//               <Label>Price</Label>
//               <Input type="number" step="0.01" value={editForm.price} onChange={e => handleEditChange("price", e.target.value)} required />
//             </div>
//             <div className="space-y-2">
//               <Label>Description</Label>
//               <Input value={editForm.description} onChange={e => handleEditChange("description", e.target.value)} required />
//             </div>
//             <div className="space-y-2">
//               <Label>Duration</Label>
//               <Input value={editForm.duration} onChange={e => handleEditChange("duration", e.target.value)} />
//             </div>
//             <div className="space-y-2">
//               <Label>Includes</Label>
//               {editForm.includes.map((inc, idx) => (
//                 <div key={idx} className="flex gap-2 items-center">
//                   <Input value={inc} onChange={e => handleEditIncludeChange(idx, e.target.value)} />
//                   <Button type="button" variant="destructive" size="icon" onClick={() => removeEditIncludeField(idx)}><X className="w-4 h-4" /></Button>
//                 </div>
//               ))}
//               <Button type="button" onClick={addEditIncludeField}>Add Include</Button>
//             </div>
//             <div className="space-y-2">
//               <Label>Features</Label>
//               <div className="flex gap-2 items-center">
//                 <input type="checkbox" checked={editForm.features.priority} onChange={e => handleEditFeatureChange("priority", e.target.checked)} />
//                 <span>Priority</span>
//               </div>
//               <div className="space-y-1">
//                 <Label>Followup</Label>
//                 <Input value={editForm.features.followup} onChange={e => handleEditFeatureChange("followup", e.target.value)} />
//               </div>
//               <div className="space-y-1">
//                 <Label>Report Delivery</Label>
//                 <Input value={editForm.features.reportDelivery} onChange={e => handleEditFeatureChange("reportDelivery", e.target.value)} />
//               </div>
//               <div className="flex gap-2 items-center">
//                 <input type="checkbox" checked={editForm.features.personalAssistant} onChange={e => handleEditFeatureChange("personalAssistant", e.target.checked)} />
//                 <span>Personal Assistant</span>
//               </div>
//             </div>
//             <DialogFooter className="mt-4 flex justify-end gap-2">
//               <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
//               <Button type="submit">Save Changes</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

// <Dialog open={!!detailPkg} onOpenChange={closeDetailDialog}>
//   <DialogContent className="bg-white max-h-[70vh] overflow-y-auto p-4">
//     <DialogHeader>
//       <DialogTitle>Package Details</DialogTitle>
//     </DialogHeader>
//     {detailPkg && (
//       <div className="space-y-2">
//         <p><strong>Name:</strong> {detailPkg.name}</p>
//         <p><strong>Price:</strong> {detailPkg.price}</p>
//         <p><strong>Status:</strong> {detailPkg.status}</p>
//         <p><strong>Description:</strong> {getDescription(detailPkg)}</p>
//         <p><strong>Duration:</strong> {detailPkg.detail?.duration || "-"}</p>
//         <div>
//           <strong>Includes:</strong>
//           <ul className="list-disc list-inside">
//             {detailPkg.detail?.includes?.map((inc, idx) => <li key={idx}>{inc}</li>) || <li>-</li>}
//           </ul>
//         </div>
//         <div>
//           <strong>Features:</strong>
//           <ul className="list-disc list-inside">
//             <li>Priority: {detailPkg.detail?.features?.priority ? "Yes" : "No"}</li>
//             <li>Followup: {detailPkg.detail?.features?.followup || "-"}</li>
//             <li>Report Delivery: {detailPkg.detail?.features?.reportDelivery || "-"}</li>
//             <li>Personal Assistant: {detailPkg.detail?.features?.personalAssistant ? "Yes" : "No"}</li>
//           </ul>
//         </div>
//       </div>
//     )}
//     <DialogFooter className="mt-4 flex justify-end">
//       <Button type="button" variant="outline" onClick={closeDetailDialog}>Close</Button>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>

//       {/* Delete Confirmation */}
//       <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
//         <AlertDialogContent className="bg-white">
//           <AlertDialogHeader><AlertDialogTitle>Are you sure you want to delete this package?</AlertDialogTitle></AlertDialogHeader>
//           <p className="text-sm text-gray-600">This action cannot be undone.</p>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Delete"}</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

import React, { useCallback, useContext, useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Info, X } from "lucide-react";

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
    status: "active",
    details: [{ label: "", value: "" }],
  });

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    price: "",
    status: "active",
    details: [{ label: "", value: "" }],
  });

  // View details modal
  const [viewDetailPkg, setViewDetailPkg] = useState(null);

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
        setPagination(pg);
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
  }, [token]);

  // Pagination
  const handlePrevious = () => currentPage > 1 && loadPackages(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && loadPackages(currentPage + 1);

  // Add/Edit handlers
  const openAddDialog = () => {
    setAddForm({
      name: "",
      price: "",
      status: "active",
      details: [{ label: "", value: "" }],
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (pkg) => {
    setEditForm({
      id: pkg.id,
      name: pkg.name || "",
      price: pkg.price || "",
      status: pkg.status || "active",
      details: pkg.detail?.details?.length
        ? pkg.detail.details
        : [{ label: "", value: "" }],
    });
    setIsEditOpen(true);
  };

  const handleAddChange = (field, value) =>
    setAddForm((prev) => ({ ...prev, [field]: value }));
  const handleEditChange = (field, value) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

  const handleAddDetailChange = (index, field, value) => {
    const updated = [...addForm.details];
    updated[index][field] = value;
    setAddForm((prev) => ({ ...prev, details: updated }));
  };
  const handleEditDetailChange = (index, field, value) => {
    const updated = [...editForm.details];
    updated[index][field] = value;
    setEditForm((prev) => ({ ...prev, details: updated }));
  };

  const addDetailField = (isEdit = false) => {
    if (isEdit)
      setEditForm((prev) => ({
        ...prev,
        details: [...prev.details, { label: "", value: "" }],
      }));
    else
      setAddForm((prev) => ({
        ...prev,
        details: [...prev.details, { label: "", value: "" }],
      }));
  };

  const removeDetailField = (index, isEdit = false) => {
    if (isEdit)
      setEditForm((prev) => ({
        ...prev,
        details: prev.details.filter((_, i) => i !== index),
      }));
    else
      setAddForm((prev) => ({
        ...prev,
        details: prev.details.filter((_, i) => i !== index),
      }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError("No authentication token found.");

    try {
      await createPackage(token, { ...addForm });
      setIsAddOpen(false);
      await loadPackages(1);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create package");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setError("No authentication token found.");

    try {
      await updatePackage(token, editForm.id, { ...editForm });
      setIsEditOpen(false);
      await loadPackages(currentPage);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update package");
    }
  };

  // Delete
  const handleDeleteClick = (id) => setDeleteId(id);
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
      {loading && <p className="text-sm text-gray-500">Loading packages...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <div className="border rounded-lg bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
                    <TableCell className="capitalize">{pkg.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setViewDetailPkg(pkg)}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
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
                          onClick={() => handleDeleteClick(pkg.id)}
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
            packages)
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
        <DialogContent className="bg-white max-h-[70vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Add Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={addForm.name}
                onChange={(e) => handleAddChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={addForm.price}
                onChange={(e) => handleAddChange("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="border rounded p-2 w-full"
                value={addForm.status}
                onChange={(e) => handleAddChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Details (Label / Value)</Label>
              {addForm.details.map((d, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label"
                    value={d.label}
                    onChange={(e) =>
                      handleAddDetailChange(idx, "label", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={d.value}
                    onChange={(e) =>
                      handleAddDetailChange(idx, "value", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeDetailField(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={() => addDetailField()}>
                Add Detail
              </Button>
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
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
        <DialogContent className="bg-white max-h-[70vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => handleEditChange("price", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="border rounded p-2 w-full"
                value={editForm.status}
                onChange={(e) => handleEditChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Details (Label / Value)</Label>
              {editForm.details.map((d, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label"
                    value={d.label}
                    onChange={(e) =>
                      handleEditDetailChange(idx, "label", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={d.value}
                    onChange={(e) =>
                      handleEditDetailChange(idx, "value", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeDetailField(idx, true)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={() => addDetailField(true)}>
                Add Detail
              </Button>
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
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

      {/* View Details Dialog */}
      <Dialog
        open={!!viewDetailPkg}
        onOpenChange={() => setViewDetailPkg(null)}
      >
        <DialogContent className="bg-white max-h-[70vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Package Details</DialogTitle>
          </DialogHeader>
          {viewDetailPkg && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <strong className="w-32">Name:</strong>
                <span>{viewDetailPkg.name}</span>
              </div>
              <div className="flex gap-2">
                <strong className="w-32">Price:</strong>
                <span>{viewDetailPkg.price}</span>
              </div>
              <div className="flex gap-2">
                <strong className="w-32">Status:</strong>
                <span className="capitalize">{viewDetailPkg.status}</span>
              </div>

              {viewDetailPkg.detail?.details?.length ? (
                viewDetailPkg.detail.details.map((d, idx) => (
                  <div key={idx} className="flex gap-2">
                    <strong className="w-32">{d.label}:</strong>
                    <span>{d.value}</span>
                  </div>
                ))
              ) : (
                <p>No additional details available.</p>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button onClick={() => setViewDetailPkg(null)}>Close</Button>
          </DialogFooter>
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
