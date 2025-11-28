// src/api/payment.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/payments`;

// Get payments with pagination
export async function getPayments(token, { page = 1, limit = 10 } = {}) {
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
    throw new Error("Failed to fetch payments");
  }

  const json = await response.json();

  // Backend shape:
  // {
  //   success: true,
  //   data: [ ...payments ],
  //   pagination: { total, page, pages }
  // }

  if (!json.success || !Array.isArray(json.data) || !json.pagination) {
    throw new Error("Invalid payments response format");
  }

  const pg = json.pagination;

  return {
    payments: json.data,
    pagination: {
      page: pg.page,
      totalPages: pg.pages, // note: backend uses 'pages'
      total: pg.total ?? json.data.length,
      limit, // we know what we sent
    },
  };
}
