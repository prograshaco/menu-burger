import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Package, Truck, MapPin, Phone, User } from 'lucide-react';
import orderManager, { getStatusLabel, formatOrderTime } from '../services/orderManager.js';
import authService from '../services/authService.js';

const OrderTracking = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
    
    // Suscribirse a actualizaciones en tiempo real
    const handleOrderUpdate = (event) => {
      const { type, data } = event.detail;
      if (type === 'orderUpdated' && data?.id === orderId) {
        setOrder(data);
      }
    };

    window.addEventListener('orderUpdate', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('orderUpdate', handleOrderUpdate);
    };
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await orderManager.getOrderById(orderId);
      
      if (orderData) {
        setOrder(orderData);
      } else {
        setError('Pedido no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el pedido');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepStatus, currentStatus) => {
    const order = ['pending', 'preparing', 'on_the_way', 'delivered'];
    const stepIdx = order.indexOf(stepStatus);
    const currentIdx = order.indexOf(currentStatus);

    // Si se canceló, estiliza distinto (opcional)
    if (currentStatus === 'cancelled') {
      return stepStatus === 'pending' ? 'cancelled' : 'pending';
    }

    // ✅ Si ya está ENTREGADO, todos los pasos hasta "delivered" quedan COMPLETED (verde)
    if (currentStatus === 'delivered') {
      return stepIdx <= currentIdx ? 'completed' : 'pending';
    }

    // Flujo normal
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };



  const getStepIcon = (status, stepStatus) => {
    const iconClass = "w-6 h-6";
    
      switch (stepStatus) {
        case 'pending':     return <Clock className={iconClass} />;
        case 'preparing':   return <Package className={iconClass} />;
        case 'on_the_way':  return <Truck className={iconClass} />;
        case 'delivered':   return <CheckCircle className={iconClass} />;
        default:            return <Clock className={iconClass} />;
      }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-orange-500 text-white animate-pulse';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-gray-600';
    }
  };

  const trackingSteps = [
    { status: 'pending', label: 'Pedido Recibido', description: 'Tu pedido ha sido recibido y está siendo procesado' },
    { status: 'preparing', label: 'Preparando', description: 'Estamos preparando tu deliciosa comida' },
    { status: 'on_the_way', label: 'En camino', description: 'Tu pedido va en camino hacia tu dirección' },
    { status: 'delivered', label: 'Entregado', description: '¡Disfruta tu comida!' }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-red-400 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Seguimiento de Pedido</h2>
              <p className="text-orange-100">Pedido #{order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Información del Pedido</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Realizado: {formatOrderTime(order.createdAt || order.timestamp)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Cliente: {order.customer?.name || order.customerName || 'Cliente'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Teléfono: {order.customer?.phone || order.phone || 'No especificado'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Entrega</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{order.customer?.address || order.deliveryAddress || 'Dirección no especificada'}</span>
                  </div>
                  <div className="font-semibold text-orange-600">
                    Total: ${order.total?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Steps */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Estado del Pedido</h3>
            <div className="space-y-4">
              {trackingSteps.map((step, index) => {
                const stepStatus = getStepStatus(step.status, order.status);
                const isLast = index === trackingSteps.length - 1;
                
                return (
                  <div key={step.status} className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`rounded-full p-3 ${getStepColor(stepStatus)}`}>
                        {getStepIcon(stepStatus, step.status)}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 mt-2 ${
                          stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className={`font-semibold ${
                        stepStatus === 'completed' ? 'text-green-600' :
                        stepStatus === 'current' ? 'text-orange-600' :
                        stepStatus === 'cancelled' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {stepStatus === 'current' && (
                        <p className="text-xs text-orange-600 mt-1 font-medium">Estado actual</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Productos del Pedido</h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div>
                    <span className="font-medium">{item.quantity}x {item.name}</span>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <span key={key} className="mr-2">{key}: {value}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-orange-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-orange-600">${order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Notas del Pedido</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;