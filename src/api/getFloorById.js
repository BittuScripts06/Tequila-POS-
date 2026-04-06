
const BASE_URL = "https://tequilapos.net/api";

export const getFloorById = async (floorId) => {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${BASE_URL}/floor-layouts/${floorId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return res.json();
};
