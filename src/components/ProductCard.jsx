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
    <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:shadow-2xl hover:border-yellow-500 transition-all duration-300 transform hover:scale-105">
      <div className="p-4 sm:p-5 lg:p-6">
        
        {/* Imagen + precio en paralelo */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl">{product.icon || '🍔'}</span>
            )}
            {product.veggie && (
              <span className="text-base sm:text-lg" title="Opción vegetariana">🌱</span>
            )}
          </div>
          <span className="text-yellow-400 font-bold text-base sm:text-lg">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Nombre */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          {product.name}
        </h3>
        
        {/* Descripción */}
        <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-3">
          {product.description || 'Sin descripción'}
        </p>
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => onProductClick(product)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm"
          >
            Ver detalles
          </button>
          
          <button
            onClick={() => onAddToCart(product)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center space-x-1"
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
