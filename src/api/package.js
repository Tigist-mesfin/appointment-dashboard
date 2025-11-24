// src/api/package.js

const BASE_URL = "https://appointment.shebabingo.com/api/packages";

// Get all packages with pagination (no filters)
export async function getPackages(token, { page = 1, limit = 10 } = {}) {
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
    throw new Error("Failed to fetch packages");
  }

  const json = await response.json();

  // For this API, data is an *array* and pagination is separate
  if (!json.success || !Array.isArray(json.data) || !json.pagination) {
    throw new Error("Invalid packages response format");
  }

  return {
    packages: json.data,
    pagination: json.pagination, // { total, page, limit, totalPages }
  };
}

// Get package by ID
export async function getPackageById(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch package");
  }

  const json = await response.json();

  if (!json.success || !json.data) {
    throw new Error("Invalid package response format");
  }

  return json.data;
}

// Create new package
export async function createPackage(token, { name, price, description }) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      price: Number(price),
      description,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create package");
  }

  const json = await response.json();

  if (!json.success || !json.data) {
    throw new Error("Invalid create package response");
  }

  return json.data;
}

// Update package by ID
export async function updatePackage(
  token,
  id,
  { name, price, description, status }
) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      price: Number(price),
      description,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update package");
  }

  const json = await response.json();

  if (!json.success || !json.data) {
    throw new Error("Invalid update package response");
  }

  return json.data;
}

// Delete package by ID
export async function deletePackage(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete package");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Delete failed");
  }

  return json.message || "Package deleted successfully";
}
