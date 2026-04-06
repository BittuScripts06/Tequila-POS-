const BASE_URL = "https://tequilapos.net/api";

export const createFloors = async (token, payload) => {
  const res = await fetch(`${BASE_URL}/floors`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
};
