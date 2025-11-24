// src/pages/Customer.jsx

import React, { useEffect, useState, useContext } from "react";
import { getAllCustomers } from "../api/customers";
import { AuthContext } from "../context/AuthContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Customer() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  // Fetch customers for the current page
 useEffect(() => {
  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("No authentication token found.");
        return;
      }

      const LIMIT = 10;

      const { customers, pagination } = await getAllCustomers(
        token,
        currentPage,
        LIMIT
      );

      setCustomers(customers);
      setPagination({
        page: pagination.page,
        limit: LIMIT,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  loadCustomers();
}, [token, currentPage]);

  // Handlers for next/previous
  const handlePrevious = () => {
    if (currentPage > 1) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Customers</h2>
          <p className="text-sm text-gray-500">
            All customers (page {currentPage} of {totalPages}).
          </p>
        </div>
      </div>

      {/* Error / Loading */}
      {loading && <p className="text-sm text-gray-500">Loading customers...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <div className="border rounded-lg bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-gray-500"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    {/* Global numbering: 1,2,3... across pages */}
                    <TableCell>
                      {(currentPage - 1) * pagination.limit + (index + 1)}
                    </TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages} (
            {pagination.total} total customers)
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
    </div>
  );
}
