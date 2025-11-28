// src/api/services.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/services`;

// Get all services with pagination + optional filters
export async function getServices(
  token,
  { page = 1, limit = 10, type, status, name } = {}
) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (type && type !== "all") params.set("type", type);
  if (status && status !== "all") params.set("status", status);
  if (name) params.set("name", name);

  const url = `${BASE_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }

  const json = await response.json();

  if (
    !json.success ||
    !json.data ||
    !Array.isArray(json.data.services) ||
    !json.data.pagination
  ) {
    throw new Error("Invalid services response format");
  }

  return {
    services: json.data.services,
    pagination: json.data.pagination, // { total, page, limit, totalPages }
  };
}

// Get service by ID
export async function getServiceById(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch service");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.service) {
    throw new Error("Invalid service response format");
  }

  return json.data.service;
}

// Create new service
export async function createService(
  token,
  { name, type, costPerDate, costPerService, description }
) {
  const body = {
    name,
    type,
    description,
  };

  if (type === "perDate") {
    body.costPerDate = costPerDate != null ? Number(costPerDate) : null;
  } else if (type === "fixed") {
    body.costPerService =
      costPerService != null ? Number(costPerService) : null;
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to create service");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.service) {
    throw new Error("Invalid create service response");
  }

  return json.data.service;
}

// Update service by ID
export async function updateService(
  token,
  id,
  { type, costPerDate, costPerService, description, status }
) {
  const body = {
    type,
    description,
    status,
  };

  if (type === "perDate") {
    body.costPerDate = costPerDate != null ? Number(costPerDate) : null;
    body.costPerService = null;
  } else if (type === "fixed") {
    body.costPerService =
      costPerService != null ? Number(costPerService) : null;
    body.costPerDate = null;
  }

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to update service");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.service) {
    throw new Error("Invalid update service response");
  }

  return json.data.service;
}

// Delete service by ID
export async function deleteService(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete service");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Delete failed");
  }

  return json.message || "Service deleted successfully";
}
