// export const useAuth = () => {
//   const BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   const token = localStorage.getItem("authToken");

//   const logout = async () => {
//     try {
//       if (token) {
//         await fetch(`${BASE_URL}/sign-out`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//       }
//     } catch {
//       console.warn("Logout API failed, local logout only");
//     } finally {
//       localStorage.removeItem("authToken");
//       localStorage.removeItem("user");

//       window.dispatchEvent(new Event("auth-user-updated"));
//     }
//   };

//   return { token, logout };
// };

import { useState, useEffect } from "react";

export const useAuth = () => {
  const [userState, setUserState] = useState(() =>
    JSON.parse(localStorage.getItem("user")),
  );

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const syncUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUserState(updatedUser);
    };

    window.addEventListener("auth-user-updated", syncUser);

    return () => window.removeEventListener("auth-user-updated", syncUser);
  }, []);

  const BASE_URL = "https://tequilapos.net/api";

const logout = async () => {
  const token = localStorage.getItem("authToken");

  try {
    if (token) {
      await fetch(`${BASE_URL}/sign-out`, {
        method: "POST", // or GET (depends on backend)
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch (err) {
    // ❗ Even if API fails, we still logout locally
    console.warn("Sign-out API failed", err);
  } finally {
    // 🔥 HARD RESET (MOST IMPORTANT)
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("shiftStatus");

    // 🔁 Sync app state
    window.dispatchEvent(new Event("auth-user-updated"));
  }
};
  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  return { token, userState, setUserState, logout, getHeaders };
};
