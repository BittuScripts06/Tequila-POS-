import { useState } from "react";

export const useModifiers = (BASE_URL, token) => {
  const [modalModifiers, setModalModifiers] = useState([]);
  const [modalModifiersLoading, setModalModifiersLoading] = useState(false);

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const fetchModifiers = async (itemId) => {
    try {
      setModalModifiersLoading(true);
      const res = await fetch(`${BASE_URL}/items_mods/${itemId}`, { headers: getHeaders() });
      const data = await res.json();
      if (!data.success) return [];

      const mods = data.data.flatMap((grp) =>
        grp.modifiers.map((m) => ({
          id: m.id,
          name: m.name,
          price: parseFloat(m.price) || 0,
          group: grp.name,
        }))
      );

      setModalModifiers(mods);
      return mods;
    } catch {
      return [];
    } finally {
      setModalModifiersLoading(false);
    }
  };

  return { modalModifiers, modalModifiersLoading, fetchModifiers };
};
