import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ShoppingBag, LogOut, Edit2, Save, X, Shield, Eye } from 'lucide-react';
import authService from '../services/authService.js';
import orderManager from '../services/orderManager.js';
import OrderTracking from './OrderTracking.jsx';

const UserProfile = ({ user, onLogout, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserOrders();
  }, []);

  const loadUserOrders = async () => {
    try {
      let orders;
      if (user?.role === 'admin') {
        // Los administradores pueden ver todos los pedidos
        orders = await orderManager.getAllOrders();
      } else {
        // Los usuarios regulares solo ven sus propios pedidos
        orders = await orderManager.getUserOrders();
      }
      setUserOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setUserOrders([]);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await authService.updateProfile(editData);
      
      if (result.success) {
        setMessage('Perfil actualizado correctamente');
        setIsEditing(false);
        // Actualizar los datos del usuario en el estado local
        Object.assign(user, editData);
      } else {
        setMessage(result.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      setMessage('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout && onLogout();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-red-400 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                {user?.role === 'admin' ? (
                  <Shield className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-orange-100">
                  {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors flex-shrink-0"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-center ${
              message.includes('correctamente') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Información del perfil */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Información Personal</h3>
              <div className="flex space-x-3">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Página Completa</span>
                </Link>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </button>
                ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
                )}
              </div>
            </div>
            
            {isEditing && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Modo de edición activado:</strong> Modifica los campos que desees y haz clic en "Guardar" para confirmar los cambios.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${isEditing ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'}`}>
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                      placeholder="Ingresa tu nombre"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user?.name || 'No especificado'}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{user?.email}</p>
                </div>
              </div>

              {/* Teléfono */}
              <div className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${isEditing ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'}`}>
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                      placeholder="Ingresa tu teléfono"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user?.phone || 'No especificado'}</p>
                  )}
                </div>
              </div>

              {/* Dirección */}
              <div className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${isEditing ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'} md:col-span-2`}>
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                      placeholder="Ingresa tu dirección completa"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user?.address || 'No especificado'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historial de pedidos */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-800">
                {user?.role === 'admin' ? 'Todos los Pedidos' : 'Mis Pedidos'}
              </h3>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay pedidos registrados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {userOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">Pedido #{order.id}</p>
                        {user?.role === 'admin' && (
                          <p className="text-sm text-gray-600">Cliente: {order.customerName}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {new Date(order.timestamp).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Total:</strong> ${order.total}</p>
                      <p><strong>Dirección:</strong> {order.address}</p>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {order.items.map((item, index) => (
                        <span key={index}>
                          {item.quantity}x {item.name}
                          {index < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setTrackingOrderId(order.id)}
                        className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-md hover:bg-orange-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Seguir Pedido
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón de cerrar sesión */}
          <div className="border-t pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de seguimiento de pedido */}
      {trackingOrderId && (
        <OrderTracking
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
        />
      )}
    </div>
  );
};

export default UserProfile;