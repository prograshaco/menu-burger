import React from 'react';

const ProductCard = ({ product, onAddToCart, onProductClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:shadow-2xl hover:border-yellow-500 transition-all duration-300 transform hover:scale-105">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{product.icon}</span>
            {product.veggie && (
              <span className="text-lg" title="Opción vegetariana">🌱</span>
            )}
          </div>
          <span className="text-yellow-400 font-bold text-lg">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {product.desc}
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onProductClick(product)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm"
          >
            Ver detalles
          </button>
          
          <button
            onClick={() => onAddToCart(product)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm flex items-center space-x-1"
          >
            <span>🛒</span>
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;