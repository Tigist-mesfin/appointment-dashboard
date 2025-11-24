// src/pages/Order.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "../context/AuthContext";

import {
  getOrders,
  getFilteredOrders,
} from "../api/order";

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
import { Label } from "@/components/ui/label";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return dateStr; // backend already sends "YYYY-MM-DD"
}

function formatDateTime(isoStr) {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleString();
}

export default function Order() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const [filters, setFilters] = useState({
    customerId: "",
    serviceId: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const LIMIT = pagination.limit;

  const hasFilters =
    filters.customerId ||
    filters.serviceId ||
    filters.startDate ||
    filters.endDate;

  const loadOrders = useCallback(
    async (pageToLoad = currentPage) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("No authentication token found.");
          return;
        }

        let result;

        if (hasFilters) {
          result = await getFilteredOrders(token, {
            page: pageToLoad,
            limit: LIMIT,
            customerId: filters.customerId || undefined,
            serviceId: filters.serviceId || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
          });
        } else {
          result = await getOrders(token, {
            page: pageToLoad,
            limit: LIMIT,
          });
        }

        setOrders(result.orders);
        setPagination({
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages,
          total: result.pagination.total,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [token, LIMIT, currentPage, filters, hasFilters]
  );

  useEffect(() => {
    loadOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    filters.customerId,
    filters.serviceId,
    filters.startDate,
    filters.endDate,
  ]);

  // Pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      loadOrders(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadOrders(currentPage + 1);
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
      customerId: "",
      serviceId: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Orders</h2>
          <p className="text-sm text-gray-500">
            View and filter orders with pagination.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border rounded-lg bg-white p-4 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Customer ID */}
          <div>
            <Label className="mb-1 block">Customer ID</Label>
            <Input
              type="number"
              value={filters.customerId}
              onChange={(e) =>
                handleFilterChange("customerId", e.target.value)
              }
              placeholder="Customer ID"
            />
          </div>

          {/* Service ID */}
          <div>
            <Label className="mb-1 block">Service ID</Label>
            <Input
              type="number"
              value={filters.serviceId}
              onChange={(e) =>
                handleFilterChange("serviceId", e.target.value)
              }
              placeholder="Service ID"
            />
          </div>

          {/* Start Date */}
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

          {/* End Date */}
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
          Loading orders...
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
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Date Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-sm text-gray-500"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {(currentPage - 1) * LIMIT + (index + 1)}
                    </TableCell>
                    <TableCell>
                      {order.customer?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {order.customer?.email || "-"}
                    </TableCell>
                    <TableCell>
                      {order.customer?.phone || "-"}
                    </TableCell>
                    <TableCell>{order.description || "-"}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>
                      {order.dateCount != null
                        ? order.dateCount
                        : "-"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {order.status || "-"}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(order.createdAt)}
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
            {pagination.total} total orders)
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
