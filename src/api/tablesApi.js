const BASE_URL = "https://tequilapos.net/api";

// GET tables (already present)
export const getTables = async (floorId, token) => {
  const res = await fetch(`${BASE_URL}/tables?floor_id=${floorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  return res.json();
};

// ✅ CREATE table
export const createTable = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/tables/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
};

// ✅ DELETE table
export const deleteTable = async (token, tableId) => {
  console.log("tableId in tableApi", tableId);
  const res = await fetch(`${BASE_URL}/tables/${tableId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  // 👇 some DELETE APIs don't return JSON
  if (!res.ok) {
    return { success: false };
  }

  try {
    return await res.json();
  } catch {
    // 👈 backend deleted but no JSON returned
    return { success: true };
  }
};
