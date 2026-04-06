import { useState } from "react";

export const useItems = (BASE_URL, token) => {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const fetchItems = async (categoryId) => {
    try {
      setLoadingItems(true);
      setSelectedCategory(categoryId);

      const res = await fetch(`${BASE_URL}/items?category_id=${categoryId}`, {
        headers: getHeaders(),
      });
      const data = await res.json();

      console.log("items",data)
      if (data.success) {
        const normalized = data.data.map((i) => ({
          ...i,
          price: parseFloat(i.price) || 0,
        }));
        setItems(normalized);
      } else {
        setItems([]);
        setError(data.message || "No items found");
      }
    } catch {
      setError("Network error fetching items");
    } finally {
      setLoadingItems(false);
    }
  };

  return { items, loadingItems, selectedCategory, fetchItems, error, setItems };
};
