const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUserProfile = async (token) => {
  try {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await res.json();
    console.log("profile>>>>", data);
    return data;
  } catch (error) {
    console.error("Profile API error:", error);
    return null;
  }
};
