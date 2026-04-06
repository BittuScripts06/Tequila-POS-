const ModifiersModal = ({
  show,
  onClose,
  item,
  qty,
  setQty,
  modifiers,
  loading,
  selectedMods,
  toggleMod,
  addToOrder,
}) => {
  if (!show || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg animate-fadeIn">
        <div className="flex justify-between mb-4">
          <h4 className="text-lg font-semibold">
            {item.item_name || item.name}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✖
          </button>
        </div>

        {/* Quantity */}
        <label className="block mb-3">
          Quantity:
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, parseInt(e.target.value || "1")))
            }
            className="border rounded w-20 ml-2 px-2 py-1"
          />
        </label>

        {/* Modifiers */}
        <p className="font-medium mb-2">Modifiers:</p>

        {loading && (
          <p className="text-sm text-gray-500 animate-pulse mb-2">
            Loading modifiers...
          </p>
        )}

        {!loading && modifiers.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-auto">
            {Object.entries(
              modifiers.reduce((acc, m) => {
                acc[m.group] = acc[m.group] || [];
                acc[m.group].push(m);
                return acc;
              }, {})
            ).map(([groupName, mods]) => (
              <div key={groupName}>
                <p className="font-semibold text-gray-700 mb-1">{groupName}</p>
                {mods.map((mod) => (
                  <label key={mod.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedMods.includes(mod.id)}
                      onChange={() => toggleMod(mod.id)}
                    />
                    <span>
                      {mod.name} (+₹{mod.price.toFixed(2)})
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-gray-500">
              No modifiers found for this item.
            </p>
          )
        )}

        {/* Buttons */}
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => addToOrder(item, selectedMods, qty)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifiersModal;
