// src/pages/Payment.jsx

import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "../context/AuthContext";

import { getPayments } from "../api/payment";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  // order.date is already "YYYY-MM-DD"
  return dateStr;
}

function formatDateTime(isoStr) {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleString();
}

export default function Payment() {
  const { auth } = useContext(AuthContext);
  const token = auth?.token;

  const [payments, setPayments] = useState([]);
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
  const LIMIT = pagination.limit;

  const loadPayments = useCallback(
    async (pageToLoad = currentPage) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("No authentication token found.");
          return;
        }

        const { payments, pagination: pg } = await getPayments(token, {
          page: pageToLoad,
          limit: LIMIT,
        });

        setPayments(payments);
        setPagination({
          page: pg.page,
          limit: pg.limit,
          totalPages: pg.totalPages,
          total: pg.total,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    },
    [token, LIMIT, currentPage]
  );

  useEffect(() => {
    loadPayments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      loadPayments(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadPayments(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Payments</h2>
          <p className="text-sm text-gray-500">
            View payment records with related order and customer details.
          </p>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <p className="text-sm text-gray-500">Loading payments...</p>
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
                <TableHead>Phone</TableHead>
                <TableHead>Order Description</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-sm text-gray-500"
                  >
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {(currentPage - 1) * LIMIT + (index + 1)}
                    </TableCell>
                    <TableCell>
                      {payment.order?.customer?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {payment.order?.customer?.phone || "-"}
                    </TableCell>
                    <TableCell>
                      {payment.order?.description || "-"}
                    </TableCell>
                    <TableCell>
                      {formatDate(payment.order?.date)}
                    </TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell className="capitalize">
                      {payment.status}
                    </TableCell>
                    <TableCell>{payment.reference}</TableCell>
                    <TableCell>
                      {formatDateTime(payment.createdAt)}
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
            {pagination.total} total payments)
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
