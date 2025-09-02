import React, { useState, useEffect } from 'react';
import orderManager, { ORDER_STATUSES, STATUS_COLORS, formatOrderTime, getStatusLabel } from '../services/orderManager';

// Función para generar hash SHA-256
const generateHash = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Función para verificar contraseña
const verifyPassword = async (inputPassword, hashedPassword) => {
  const inputHash = await generateHash(inputPassword);
  return inputHash === hashedPassword;
};

// Componente de Login para proteger el acceso
const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hash de la contraseña "burger_menu@154263"
  const ADMIN_PASSWORD_HASH = '68a8dcec10bf2cb10a4d8b2fa518938e55abd0992a2e69856b3fa400fa5f2478';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Verificar contraseña usando hash
      const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
      
      // Simular un pequeño delay para mejor UX
      setTimeout(() => {
        if (isValid) {
          onLogin();
        } else {
          setError('Contraseña incorrecta');
          setPassword('');
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      setError('Error de verificación');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Panel de Administración</h2>
          <p className="text-gray-400">Ingresa la contraseña para acceder</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burger-yellow focus:border-transparent"
              placeholder="Ingresa tu contraseña"
              required
              disabled={isLoading}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-burger-dark bg-burger-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burger-yellow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-burger-dark mr-2"></div>
                Verificando...
              </div>
            ) : (
              'Acceder'
            )}
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Contraseña: burger_menu@154263
          </p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onBackToMenu }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [stats, setStats] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
  const isDarkMode = true; // Modo oscuro permanente

  // Cargar datos iniciales - solo cuando está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadStats();
      setIsLoading(false);

      // Suscribirse a cambios en tiempo real
      const unsubscribe = orderManager.onOrderUpdate((event) => {
        console.log('Order update received:', event);
        loadOrders();
        loadStats();
      });

      return unsubscribe;
    }
  }, [isAuthenticated]);

  // Manejar autenticación
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const loadOrders = () => {
    const allOrders = orderManager.getAllOrders();
    setOrders(allOrders.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)));
  };

  const loadStats = () => {
    const orderStats = orderManager.getOrderStats();
    setStats(orderStats);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const result = orderManager.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      loadOrders();
      loadStats();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(result.order);
      }
    } else {
      alert('Error al actualizar estado: ' + result.error);
    }
  };

  const handleDeleteOrder = (orderId) => {
    // Verificar que el pedido existe
    const orderExists = orders.find(order => order.id === orderId);
    if (!orderExists) {
      setNotification({
        type: 'error',
        message: 'El pedido no existe o ya fue eliminado.'
      });
      return;
    }

    // Mostrar modal de confirmación personalizado
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el pedido #${orderId}?\n\nEsta acción no se puede deshacer.`,
      onConfirm: () => {
        try {
          const result = orderManager.deleteOrder(orderId);
          
          if (result.success) {
            setNotification({
              type: 'success',
              message: 'Pedido eliminado exitosamente.'
            });
            
            // Recargar datos
            loadOrders();
            loadStats();
            
            // Cerrar modal si el pedido eliminado estaba siendo visualizado
            if (selectedOrder && selectedOrder.id === orderId) {
              setSelectedOrder(null);
            }
          } else {
            setNotification({
              type: 'error',
              message: 'Error al eliminar pedido: ' + (result.error || 'Error desconocido')
            });
          }
        } catch (error) {
          console.error('Error inesperado al eliminar pedido:', error);
          setNotification({
            type: 'error',
            message: 'Error inesperado al eliminar el pedido. Por favor, intenta nuevamente.'
          });
        }
        setConfirmDialog({ isOpen: false });
      },
      onCancel: () => {
        setConfirmDialog({ isOpen: false });
      }
    });
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'active':
        return orders.filter(order => order.status !== 'entregado' && order.status !== 'cancelado');
      case 'completed':
        return orders.filter(order => order.status === 'entregado');
      case 'all':
        return orders;
      default:
        return orders;
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pendiente': 'preparando',
      'preparando': 'listo',
      'listo': 'entregado'
    };
    return statusFlow[currentStatus];
  };

  const getStatusButtonText = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return null;
    
    const texts = {
      'preparando': 'Iniciar Preparación',
      'listo': 'Marcar como Listo',
      'entregado': 'Marcar como Entregado'
    };
    return texts[nextStatus];
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burger-yellow mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={onBackToMenu}
                className={`mr-4 p-2 ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-md transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Modo oscuro permanente - sin botón de alternancia */}
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">{stats.today}</span> pedidos hoy
              </div>
              <button
                onClick={() => orderManager.cleanOldOrders()}
                className={`px-3 py-1 text-sm ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-md transition-colors`}
              >
                Limpiar Antiguos
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors flex items-center space-x-1"
                title="Cerrar sesión"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-md`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pendientes</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-md`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Preparando</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.preparing || 0}</p>
              </div>
            </div>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-md`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Listos</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.ready || 0}</p>
              </div>
            </div>
          </div>
          
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
            <div className="flex items-center">
              <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Entregados</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.delivered || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-burger-yellow text-burger-dark'
                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                Pedidos Activos ({orders.filter(o => o.status !== 'entregado' && o.status !== 'cancelado').length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-burger-yellow text-burger-dark'
                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                Completados ({orders.filter(o => o.status === 'entregado').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-burger-yellow text-burger-dark'
                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                Todos ({orders.length})
              </button>
            </nav>
          </div>

          {/* Orders List */}
          <div className="p-4">
            {getFilteredOrders().length === 0 ? (
              <div className="text-center py-8">
                <svg className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay pedidos en esta categoría</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredOrders().map((order) => (
                  <div key={order.id} className={`border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-white'} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pedido #{order.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatOrderTime(order.createdAt || order.timestamp)}</p>
                        <p className="font-semibold text-burger-yellow">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Cliente:</span> {order.customer.name}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Teléfono:</span> {order.customer.phone}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Dirección:</span> {order.customer.address}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium mb-1`}>Productos:</p>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex justify-between items-center pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex space-x-2">
                        {getNextStatus(order.status) && (
                          <button
                            onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                            className="px-3 py-1 bg-burger-yellow text-burger-dark text-sm font-medium rounded-md hover:bg-yellow-400 transition-colors"
                          >
                            {getStatusButtonText(order.status)}
                          </button>
                        )}
                        
                        {order.status !== 'entregado' && order.status !== 'cancelado' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'cancelado')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${isDarkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${isDarkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pedido #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[selectedOrder.status]}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Información del Cliente</h3>
                  <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p><span className="font-medium">Nombre:</span> {selectedOrder.customer.name}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedOrder.customer.phone}</p>
                    {selectedOrder.customer.email && (
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                    )}
                    <p><span className="font-medium">Dirección:</span> {selectedOrder.customer.address}</p>
                    {selectedOrder.customer.notes && (
                      <p><span className="font-medium">Notas:</span> {selectedOrder.customer.notes}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Productos</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className={`flex justify-between items-center py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{item.icon}</span>
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cantidad: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.price * item.quantity)}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatCurrency(item.price)} c/u</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} pt-3 mt-3`}>
                    <div className={`flex justify-between items-center font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span>Total:</span>
                      <span className="text-burger-yellow">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, getNextStatus(selectedOrder.status));
                      }}
                      className="flex-1 px-4 py-2 bg-burger-yellow text-burger-dark font-semibold rounded-md hover:bg-yellow-400 transition-colors"
                    >
                      {getStatusButtonText(selectedOrder.status)}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className={`px-4 py-2 border rounded-md transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-sm w-full p-6`}>
            <div className="flex items-center mb-4">
              {notification.type === 'success' ? (
                <div className="p-2 bg-green-100 rounded-full mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {notification.type === 'success' ? 'Éxito' : 'Error'}
              </h3>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              {notification.message}
            </p>
            <button
              onClick={() => setNotification({ type: '', message: '' })}
              className="w-full px-4 py-2 bg-burger-yellow text-burger-dark font-semibold rounded-md hover:bg-yellow-400 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-sm w-full p-6`}>
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-full mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {confirmDialog.title}
              </h3>
            </div>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 whitespace-pre-line`}>
              {confirmDialog.message}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDialog.onCancel}
                className={`flex-1 px-4 py-2 border rounded-md transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;