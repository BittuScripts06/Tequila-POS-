
const BASE_URL = "https://tequilapos.net/api";
export const updateFloorStatus = async (token, floorId, status) => {
  try {
    const res = await fetch(
      `${BASE_URL}/floor-layouts/${floorId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error",
    };
  }
};
