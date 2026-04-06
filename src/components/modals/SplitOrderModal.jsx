import { useState } from "react";

const SplitOrderModal = ({ orderItems, onClose, onSplit }) => {
  const [mode, setMode] = useState("items");
  const [members, setMembers] = useState(2);

  //  Percentage: fixed 2 inputs only
  const [percentages, setPercentages] = useState([50, 50]);

  //  Normalize items (handle nested array case)
  const normalizedItems = Array.isArray(orderItems?.[0])
    ? orderItems[0]
    : orderItems || [];

  /* ================= SPLIT LOGIC ================= */

  // 1 Split by Items
  const splitByItems = () => {
    return normalizedItems.map((item) => [item]);
  };

  // 2 Split by Members
  const splitByMembers = () => {
    if (members > normalizedItems.length) {
      alert("Members cannot be more than items");
      return null;
    }

    const splits = Array.from({ length: members }, () => []);
    normalizedItems.forEach((item, i) => {
      splits[i % members].push(item);
    });

    return splits;
  };

  // 3 Split by Percentage (50/50 or custom)
  const splitByPercentage = () => {
    const total = percentages[0] + percentages[1];

    if (total !== 100) {
      alert("Total percentage must be exactly 100%");
      return null;
    }

    return percentages.map((p) => ({
      percentage: p,
      items: normalizedItems, // ⭐ SAME ITEMS IN BOTH SPLITS (CORRECT)
    }));
  };

  /* ================= CONFIRM ================= */

  const handleConfirm = () => {
    let result = null;

    if (mode === "items") {
      result = splitByItems();
      if (!result) return;

      onSplit({ mode: "items", splits: result });
    }

    if (mode === "members") {
      result = splitByMembers();
      if (!result) return;

      onSplit({ mode: "members", splits: result });
    }

    if (mode === "percentage") {
      result = splitByPercentage();
      if (!result) return;

      onSplit({ mode: "percentage", splits: result });
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[420px]">
        <h2 className="text-lg font-semibold mb-4">Split Order</h2>

        {/* MODE SELECTION */}
        <div className="space-y-2 mb-4">
          <label className="flex gap-2">
            <input
              type="radio"
              checked={mode === "items"}
              onChange={() => setMode("items")}
            />
            Split by Items
          </label>

          <label className="flex gap-2">
            <input
              type="radio"
              checked={mode === "members"}
              onChange={() => setMode("members")}
            />
            Split by Members
          </label>

          <label className="flex gap-2">
            <input
              type="radio"
              checked={mode === "percentage"}
              onChange={() => setMode("percentage")}
            />
            Split by Percentage (50 / 50)
          </label>
        </div>

        {/* MEMBERS INPUT */}
        {mode === "members" && (
          <input
            type="number"
            min="2"
            value={members}
            onChange={(e) => setMembers(Number(e.target.value))}
            className="border w-full px-2 py-1 mb-3"
            placeholder="No. of members"
          />
        )}

        {/* PERCENTAGE INPUTS (FIXED 2 ONLY) */}
        {mode === "percentage" && (
          <div className="space-y-2 mb-3">
            {[0, 1].map((i) => (
              <input
                key={i}
                type="number"
                min="0"
                max="100"
                value={percentages[i]}
                onChange={(e) => {
                  const copy = [...percentages];
                  copy[i] = Number(e.target.value);
                  setPercentages(copy);
                }}
                className="border w-full px-2 py-1"
                placeholder={`Person ${i + 1} %`}
              />
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <button
          onClick={handleConfirm}
          className="w-full bg-green-600 text-white py-2 rounded mb-2"
        >
          Confirm Split
        </button>

        <button onClick={onClose} className="w-full bg-gray-200 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SplitOrderModal;
