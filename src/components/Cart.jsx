import React from 'react';

const Cart = ({ cart, onClose, onRemoveItem, onUpdateQuantity, totalPrice, onCheckout }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>🛒</span>
            <span>Carrito de Compras</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-96">
          {cart.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🛒</div>
              <p className="text-gray-400">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon}</span>
                      <h3 className="font-semibold text-white">{item.name}</h3>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        −
                      </button>
                      <span className="text-white font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatPrice(item.price)} c/u
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-white">Total:</span>
              <span className="text-2xl font-bold text-yellow-400">
                {formatPrice(totalPrice)}
              </span>
            </div>
            
            <button 
              onClick={onCheckout}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-colors duration-200"
            >
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;