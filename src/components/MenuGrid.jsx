import React from 'react';
import ProductCard from './ProductCard';

const MenuGrid = ({ products, onAddToCart, onProductClick }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🔍</div>
        <h3 className="text-lg sm:text-xl text-gray-400 mb-2">No se encontraron productos</h3>
        <p className="text-sm sm:text-base text-gray-500">Intenta con otro término de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
};

export default MenuGrid;