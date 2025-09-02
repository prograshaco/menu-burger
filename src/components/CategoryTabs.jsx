import React from 'react';

const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2
              ${
                activeCategory === category.id
                  ? 'bg-yellow-500 text-black shadow-lg transform scale-105'
                  : 'bg-gray-800 text-white hover:bg-gray-700 hover:scale-105'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;