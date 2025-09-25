import React, { useState, useEffect } from 'react';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const [zoomed, setZoomed] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);

  // Cerrar zoom con ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (zoomed) setZoomed(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed, onClose]);

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{product.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                {product.veggie && (
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-lg">🌱</span>
                    <span className="text-green-400 text-sm font-semibold">Opción Vegetariana</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-96">
            {/* Imagen centrada y clickeable para expandir */}
            {product.image && (
              <div className="mb-6">
                <div className="w-full flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-64 w-auto object-contain rounded-lg cursor-zoom-in mx-auto"
                    onClick={() => setZoomed(true)}
                  />
                </div>
                <div className="text-center mt-2 text-xs text-gray-500">
                  Click para ampliar
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
            <p className="text-gray-300 mb-6">{product.description}</p>

            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Ingredientes</h3>
                <div className="grid grid-cols-1 gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
                      <span className="text-yellow-400">•</span>
                      <span className="text-gray-300 capitalize">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 p-6">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>🛒</span>
                <span>Agregar al Carrito</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom */}
      {zoomed && product.image && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
};

export default ProductModal;
