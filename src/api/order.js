// src/api/order.js

const BASE_URL = "https://appointment.shebabingo.com/api/orders";

// Get all orders with pagination (no filters)
export async function getOrders(token, { page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);

  const url = `${BASE_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const json = await response.json();

  // For this API: data is an array, pagination is separate
  if (!json.success || !Array.isArray(json.data) || !json.pagination) {
    throw new Error("Invalid orders response format");
  }

  return {
    orders: json.data,
    pagination: json.pagination, // { total, page, limit, totalPages }
  };
}

// Get filtered orders: /orders/filter?page=1&limit=10&customerId=1&serviceId=1&startDate=...&endDate=...
export async function getFilteredOrders(
  token,
  { page = 1, limit = 10, customerId, serviceId, startDate, endDate } = {}
) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);

  if (customerId) params.set("customerId", customerId);
  if (serviceId) params.set("serviceId", serviceId);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const url = `${BASE_URL}/filter?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch filtered orders");
  }

  const json = await response.json();

  if (!json.success || !Array.isArray(json.data) || !json.pagination) {
    throw new Error("Invalid filtered orders response format");
  }

  return {
    orders: json.data,
    pagination: json.pagination,
  };
}
