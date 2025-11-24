// src/api/customers.js

const BASE_URL = "https://appointment.shebabingo.com/api/customers";

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
