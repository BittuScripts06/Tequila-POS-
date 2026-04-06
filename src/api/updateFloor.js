const BASE_URL = "https://tequilapos.net/api";
export const updateFloor = async (token, floorId, payload) => {
  try {
    const res = await fetch(`${BASE_URL}/floors/${floorId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: "Failed to update floor",
    };
  }
};
