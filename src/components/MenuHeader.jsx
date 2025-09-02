import React from 'react';

const MenuHeader = ({ cartItemsCount, onCartClick, onAdminClick }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🍔</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Burger Menu</h1>
              <p className="text-gray-400 text-sm">Hamburguesas Gourmet</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onAdminClick}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              title="Panel de Administración"
            >
              <span className="text-lg">⚙️</span>
              <span className="hidden sm:inline">Admin</span>
            </button>
            
            <button
              onClick={onCartClick}
              className="relative bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
            >
              <span className="text-xl">🛒</span>
              <span>Carrito</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MenuHeader;