import { useState } from "react";

export const useOrder = () => {
  const [orderItems, setOrderItems] = useState([]);

  const addToOrderWithModifiers = (item, selectedMods, qty) => {
    const modKey = selectedMods
      .map((m) => m.id)
      .sort()
      .join("|");
    const compositeId = `${item.id}::${modKey}`;

    setOrderItems((prev) => {
      const existing = prev.find((p) => p.compositeId === compositeId);
      if (existing) {
        return prev.map((p) =>
          p.compositeId === compositeId
            ? { ...p, quantity: p.quantity + qty }
            : p
        );
      }
      return [
        ...prev,
        {
          compositeId,
          id: item.id,
          name: item.name,
          basePrice: item.price,
          quantity: qty,
          modifiers: selectedMods,
        },
      ];
    });
  };

  const updateOrderQuantity = (id, change) =>
    setOrderItems((prev) =>
      prev.map((i) =>
        i.compositeId === id
          ? { ...i, quantity: Math.max(1, i.quantity + change) }
          : i
      )
    );

  const removeOrderItem = (id) =>
    setOrderItems((prev) => prev.filter((i) => i.compositeId !== id));

  return {
    orderItems,
    addToOrderWithModifiers,
    updateOrderQuantity,
    removeOrderItem,
    setOrderItems,
  };
};
