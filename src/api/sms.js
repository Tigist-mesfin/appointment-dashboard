// src/api/sms.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/sms`;

// Get all SMS records with pagination
export async function getSmsList(
  token,
  { page = 1, limit = 10 } = {}
) {
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
    throw new Error("Failed to fetch SMS list");
  }

  const json = await response.json();

  if (
    !json.success ||
    !json.data ||
    !Array.isArray(json.data.sms) ||
    !json.data.pagination
  ) {
    throw new Error("Invalid SMS list response format");
  }

  return {
    smsList: json.data.sms,
    pagination: json.data.pagination, // { total, page, limit, totalPages }
  };
}

// Get a single SMS by ID (optional, but included for completeness)
export async function getSmsById(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch SMS");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.sms) {
    throw new Error("Invalid SMS response format");
  }

  return json.data.sms;
}

// Create new SMS
export async function createSms(token, { customerId, title, description }) {
  const response = await fetch(`${BASE_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customerId: Number(customerId),
      title,
      description,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create SMS");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.sms) {
    throw new Error("Invalid create SMS response");
  }

  return json.data.sms;
}

// Update SMS by ID
export async function updateSms(
  token,
  id,
  { title, description, status }
) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update SMS");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.sms) {
    throw new Error("Invalid update SMS response");
  }

  return json.data.sms;
}

// Delete SMS by ID
export async function deleteSms(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete SMS");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Delete failed");
  }

  return json.message || "SMS deleted successfully";
}
