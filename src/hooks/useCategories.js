import { useState, useEffect } from "react";

export const useCategories = (BASE_URL, token) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  useEffect(() => {

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch(`${BASE_URL}/categories`, {
          headers: getHeaders(),
        });
        const data = await res.json();
        console.log("categories",data)
        if (data.success) setCategories(data.data);
        else setError(data.message || "Failed to load categories");
      } catch {
        setError("Network error fetching categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    if (token) fetchCategories();
  }, [BASE_URL, token]);

  return { categories, loadingCategories, error, setCategories };
};
