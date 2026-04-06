const BASE_URL = "https://tequilapos.net/api";

// ✅ GET all floors (CORRECT ENDPOINT)
export const getFloors = async (token) => {
  const res = await fetch(`${BASE_URL}/floor-layouts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return res.json();
};    
    