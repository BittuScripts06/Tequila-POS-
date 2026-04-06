const BASE_URL = "https://tequilapos.net/api";
export const deleteFloor = async (token, floorId) => {
  try {
    const res = await fetch(`${BASE_URL}/floors/${floorId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong while deleting floor",
    };
  }
};
