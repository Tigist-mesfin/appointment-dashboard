// src/api/customers.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/customers`;

export async function getAllCustomers(token, page = 1, limit = 10) {
  const url = `${BASE_URL}?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Bearer token
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  const json = await response.json();

  if (
    !json.success ||
    !json.data ||
    !Array.isArray(json.data.customers) ||
    !json.data.pagination
  ) {
    throw new Error("Invalid customer response format");
  }

  return {
    customers: json.data.customers,
    pagination: json.data.pagination, // { total, page, limit, totalPages }
  };
}
