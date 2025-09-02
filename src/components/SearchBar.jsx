import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-8">
      <div className="relative max-w-md mx-auto md:mx-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o ingrediente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
            text-white placeholder-gray-400 focus:outline-none focus:ring-2 
            focus:ring-yellow-500 focus:border-transparent transition-all duration-200
          "
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <span className="text-xl">✕</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;