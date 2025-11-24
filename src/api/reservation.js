// src/api/reservation.js

const BASE_URL = "https://appointment.shebabingo.com/api/reservations";

// Get reservations with pagination + optional filters (date, startDate, endDate)
export async function getReservations(
  token,
  { page = 1, limit = 10, date, startDate, endDate } = {}
) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);

  if (date) params.set("date", date);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const url = `${BASE_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reservations");
  }

  const json = await response.json();

  if (
    !json.success ||
    !json.data ||
    !Array.isArray(json.data.reservations) ||
    !json.data.pagination
  ) {
    throw new Error("Invalid reservations response format");
  }

  return {
    reservations: json.data.reservations,
    pagination: json.data.pagination, // { total, page, limit, totalPages }
  };
}

// (Optional) Get a single reservation by ID
export async function getReservationById(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reservation");
  }

  const json = await response.json();

  if (!json.success || !json.data || !json.data.reservation) {
    throw new Error("Invalid reservation response format");
  }

  return json.data.reservation;
}

// Delete reservation by ID
export async function deleteReservation(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete reservation");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Delete failed");
  }

  return json.message || "Reservation deleted successfully";
}
