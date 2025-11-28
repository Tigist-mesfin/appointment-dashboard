// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BASE_URL = `${API_BASE_URL}/packages`;

// // Get all packages with pagination (unchanged)
// export async function getPackages(token, { page = 1, limit = 10 } = {}) {
//   const params = new URLSearchParams();
//   params.set("page", page);
//   params.set("limit", limit);

//   const url = `${BASE_URL}?${params.toString()}`;

//   const response = await fetch(url, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch packages");
//   }

//   const json = await response.json();

//   if (!json.success || !Array.isArray(json.data) || !json.pagination) {
//     throw new Error("Invalid packages response format");
//   }

//   return {
//     packages: json.data,
//     pagination: json.pagination,
//   };
// }

// // Get package by ID (unchanged)
// export async function getPackageById(token, id) {
//   const response = await fetch(`${BASE_URL}/${id}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch package");
//   }

//   const json = await response.json();

//   if (!json.success || !json.data) {
//     throw new Error("Invalid package response format");
//   }

//   return json.data;
// }

// // Create new package (updated)
// export async function createPackage(token, { name, price, status, detail }) {
//   const response = await fetch(BASE_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       name,
//       price: Number(price),
//       status: status || "active",
//       detail: {
//         description: detail.description || "",
//         duration: detail.duration || "",
//         includes: detail.includes || [],
//         features: detail.features || {},
//       },
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to create package");
//   }

//   const json = await response.json();

//   if (!json.success || !json.data) {
//     throw new Error("Invalid create package response");
//   }

//   return json.data;
// }

// // Update package by ID (updated)
// export async function updatePackage(token, id, { name, price, status, detail }) {
//   const response = await fetch(`${BASE_URL}/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       name,
//       price: Number(price),
//       status,
//       detail: {
//         description: detail.description || "",
//         duration: detail.duration || "",
//         includes: detail.includes || [],
//         features: detail.features || {},
//       },
//     }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to update package");
//   }

//   const json = await response.json();

//   if (!json.success || !json.data) {
//     throw new Error("Invalid update package response");
//   }

//   return json.data;
// }

// // Delete package by ID (unchanged)
// export async function deletePackage(token, id) {
//   const response = await fetch(`${BASE_URL}/${id}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to delete package");
//   }

//   const json = await response.json();

//   if (!json.success) {
//     throw new Error(json.message || "Delete failed");
//   }

//   return json.message || "Package deleted successfully";
// }




// src/api/package.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = `${API_BASE_URL}/packages`;

// Get all packages with pagination
export async function getPackages(token, { page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page, limit });
  const url = `${BASE_URL}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch packages");

  const json = await response.json();
  if (!json.success || !Array.isArray(json.data) || !json.pagination) {
    throw new Error("Invalid packages response format");
  }

  return { packages: json.data, pagination: json.pagination };
}

// Get package by ID
export async function getPackageById(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to fetch package");

  const json = await response.json();
  if (!json.success || !json.data) throw new Error("Invalid package response format");

  return json.data;
}

// Create new package
export async function createPackage(token, { name, price, status, details }) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name,
      price: Number(price),
      status: status || "active",
      detail: { details: Array.isArray(details) ? details : [] },
    }),
  });

  if (!response.ok) throw new Error("Failed to create package");

  const json = await response.json();
  if (!json.success || !json.data) throw new Error("Invalid create package response");

  return json.data;
}

// Update package by ID
export async function updatePackage(token, id, { name, price, status, details }) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name,
      price: Number(price),
      status: status || "active",
      detail: { details: Array.isArray(details) ? details : [] },
    }),
  });

  if (!response.ok) throw new Error("Failed to update package");

  const json = await response.json();
  if (!json.success || !json.data) throw new Error("Invalid update package response");

  return json.data;
}

// Delete package by ID
export async function deletePackage(token, id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Failed to delete package");

  const json = await response.json();
  if (!json.success) throw new Error(json.message || "Delete failed");

  return json.message || "Package deleted successfully";
}
