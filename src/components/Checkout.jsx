import React, { useState, useEffect } from 'react';
import orderManager from '../services/orderManager';
import TempUserNotification from './TempUserNotification';
import tempUserService from '../services/tempUserService';
import notificationService from '../services/notificationService';

const Checkout = ({ cartItems, total, onClose, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    notificationMethod: 'email'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTempNotification, setShowTempNotification] = useState(false);

  // Cargar datos del perfil temporal si existe
  useEffect(() => {
    const tempProfile = tempUserService.getTempProfile();
    if (tempProfile) {
      setFormData(prev => ({
        ...prev,
        name: tempProfile.name || prev.name,
        phone: tempProfile.phone || prev.phone,
        email: tempProfile.email || prev.email,
        address: tempProfile.address || prev.address,
        notes: tempProfile.notes || prev.notes
      }));
      setShowTempNotification(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[+]?[0-9\s-()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }
    
    if (formData.notificationMethod === 'email' && !formData.email.trim()) {
      newErrors.email = 'El email es requerido para notificaciones por correo';
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        id: Date.now().toString(),
        items: cartItems,
        total: total,
        customerInfo: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        },
        deliveryInfo: {
          address: formData.address,
          phone: formData.phone
        },
        notes: formData.notes,
        notificationMethod: formData.notificationMethod,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      // Guardar usando orderManager
      const result = await orderManager.addOrder(orderData);
      
      if (result.success) {
        // Mostrar mensaje específico para usuarios temporales
        if (result.isTemporary) {
          notificationService.notifyTempOrderCreated({
            message: `${result.message} Puedes seguir tu pedido durante las próximas 2 horas. Te recomendamos crear una cuenta para no perder el acceso.`,
            orderId: result.order.id,
            duration: 8000 // Mostrar por 8 segundos
          });
        }
        
        // Llamar función de completar pedido con el pedido correcto de la base de datos
        onOrderComplete(result.order, result.isTemporary, result.tempProfile);
      } else {
        throw new Error(result.error || 'Error al crear el pedido');
      }
      
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      notificationService.addNotification({
        type: 'error',
        title: 'Error al procesar pedido',
        message: 'Error al procesar el pedido. Por favor intenta nuevamente.',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCartSummary = () => {
    return cartItems.map(item => 
      `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Finalizar Pedido</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Resumen del pedido */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Resumen del Pedido</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-semibold text-gray-800">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burger-yellow text-gray-900 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre completo"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burger-yellow text-gray-900 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+56 9 1234 5678"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de notificación
              </label>
              <select
                name="notificationMethod"
                value={formData.notificationMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burger-yellow text-gray-900"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Llamada telefónica</option>
              </select>
            </div>

            {formData.notificationMethod === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burger-yellow text-gray-900 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección de entrega *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burger-yellow text-gray-900 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Calle, número, comuna, referencias..."
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burger-yellow text-gray-900"
                placeholder="Instrucciones especiales, alergias, etc."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-burger-yellow text-burger-dark font-semibold rounded-md hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Notificación de perfil temporal */}
      {showTempNotification && (
        <TempUserNotification
          onCreateAccount={(tempProfile) => {
            // Aquí podrías abrir un modal de registro o redirigir
            console.log('Crear cuenta para perfil temporal:', tempProfile);
            setShowTempNotification(false);
          }}
          onViewProfile={(tempProfile) => {
            // Mostrar información del perfil temporal
            alert(`Perfil Temporal:\n\nNombre: ${tempProfile.name}\nTeléfono: ${tempProfile.phone}\nEmail: ${tempProfile.email}\nDirección: ${tempProfile.address}\nID: ${tempProfile.id}\n\nTus pedidos se guardan automáticamente con este perfil.`);
          }}
          onDismiss={() => setShowTempNotification(false)}
        />
      )}
    </div>
  );
};

export default Checkout;