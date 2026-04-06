const ItemsList = ({
  loadingItems,
  items,
  visibleItems,
  showAllItems,
  setShowAllItems,
  openAddModal,
}) => {
  return (
    <>
      <h3 className="text-xl font-semibold mb-4 mt-10 text-green-600">Items</h3>

      {loadingItems ? (
        <p>Loading items...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openAddModal(item)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <p className="font-medium">{item.item_name || item.name}</p>
              <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {items.length > 8 && (
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            {showAllItems ? "See Less" : "See More"}
          </button>
        </div>
      )}
    </>
  );
};

export default ItemsList;
