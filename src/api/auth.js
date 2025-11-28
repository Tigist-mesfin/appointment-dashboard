// src/api/auth.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}`;

export async function loginAdmin(userName, password) {
  const response = await fetch(`${BASE_URL}/admins/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();
  return data; // { success: true, message: "...", data: { admin: { id }, token } }
}
