const CategoriesList = ({
  categories,
  visibleCategories,
  selectedCategory,
  fetchItemsByCategory,
  showAllCategories,
  setShowAllCategories,
}) => {
  return (
    <>
      <h3 className="text-xl font-semibold mb-4 text-indigo-600">Categories</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 cursor-pointer">
        {visibleCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => fetchItemsByCategory(cat.id)}
            className={`p-4 rounded-lg text-center shadow ${
              selectedCategory === cat.id
                ? "bg-indigo-600 text-white"
                : "bg-white hover:bg-indigo-50"
            }`}
          >
            {cat.category_name || cat.name}
          </div>
        ))}
      </div>

      {categories.length > 8 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            {showAllCategories ? "See Less" : "See More"}
          </button>
        </div>
      )}
    </>
  );
};

export default CategoriesList;
