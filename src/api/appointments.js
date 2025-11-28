// src/api/appointments.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/appointments`;

// Get all appointments with pagination + optional filters
export async function getAppointments(
  token,
  { page = 1, limit = 10, status, hospitalName, customerName } = {}
) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (status && status !== "all") params.set("status", status);
  if (hospitalName) params.set("hospitalName", hospitalName);
  if (customerName) params.set("customerName", customerName);

  const url = `${BASE_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointments");
  }

  const json = await response.json();

  if (
    !json.success ||
    !json.data ||
    !Array.isArray(json.data.appointments) ||
    !json.data.pagination
  ) {
    throw new Error("Invalid appointments response format");
  }

  return {
    appointments: json.data.appointments,
    pagination: json.data.pagination, // { total, page, limit, totalPages }
  };
}

// Get appointment by ID
export async function getAppointmentById(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointment");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.appointment) {
    throw new Error("Invalid appointment response format");
  }

  return json.data.appointment;
}

// Create new appointment
export async function createAppointment(token, { customerId, dateTime, hospitalName }) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customerId,
      dateTime,
      hospitalName,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create appointment");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.appointment) {
    throw new Error("Invalid create appointment response");
  }

  return json.data.appointment;
}

// Update appointment by ID
export async function updateAppointment(token, id, { dateTime, hospitalName, status }) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      dateTime,
      hospitalName,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update appointment");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.appointment) {
    throw new Error("Invalid update appointment response");
  }

  return json.data.appointment;
}

// Delete appointment by ID
export async function deleteAppointment(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete appointment");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Delete failed");
  }

  return json.message || "Appointment deleted successfully";
}
