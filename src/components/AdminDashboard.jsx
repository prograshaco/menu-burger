import React, { useState, useEffect } from 'react';
import orderManager, { ORDER_STATUSES, STATUS_COLORS, formatOrderTime, getStatusLabel, getElapsedTime } from '../services/orderManager';
import apiService from '../services/apiService.js';
import authService from '../services/authService.js'; // (aún importado por si lo usas en otros handlers)
import syncService from '../services/syncService.js';
import ProductManagement from './ProductManagement';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  UserX,
  Clock,
  Edit,
  Save,
  X,
  Trash2,
  Star,
  Package
} from 'lucide-react';

// Normaliza estados: español/inglés y el viejo "ready" -> "on_the_way"
const STATUS_ALIASES = {
  pendiente: 'pending',
  pending: 'pending',
  preparando: 'preparing',
  preparing: 'preparing',
  listo: 'on_the_way',
  ready: 'on_the_way',
  'en camino': 'on_the_way',
  en_camino: 'on_the_way',
  on_the_way: 'on_the_way',
  entregado: 'delivered',
  delivered: 'delivered',
  cancelado: 'cancelled',
  cancelled: 'cancelled',
};
const normalizeStatus = (s) => {
  if (!s) return s;
  const key = String(s).toLowerCase().trim();
  return STATUS_ALIASES[key] || s;
};


const AdminDashboard = ({ onBackToMenu, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pending: 0,
    preparing: 0,
    ready: 0,          // ← agrega esta línea
    on_the_way: 0,
    delivered: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
  const [userModal, setUserModal] = useState({ isOpen: false, user: null, isEditing: false });
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', address: '', role: 'customer', active: true });
  const [timeFilter, setTimeFilter] = useState('all'); // 'today', 'week', 'month', 'all'
  const isDarkMode = true; // Modo oscuro permanente

  useEffect(() => {
    loadDashboardData();

    // Suscripción a cambios en tiempo real de pedidos
    const unsubscribeOrderManager = orderManager.onOrderUpdate((event) => {
      console.log('Order update received:', event);
      loadDashboardData();
    });

    // Suscripción a cambios del servicio de sincronización
    const unsubscribeSync = syncService.addListener((event) => {
      console.log('Sync update received:', event);
      if (event.type === 'dataChanged' || event.type === 'dataUpdated' || event.type === 'forceSync') {
        loadDashboardData();
      }
    });

    // Suscripción a cambios de la base de datos centralizada
    const handleDatabaseSync = (event) => {
      console.log('Database sync received:', event.detail);
      loadDashboardData();
    };

    window.addEventListener('databaseSync', handleDatabaseSync);
    window.addEventListener('centralDBUpdate', handleDatabaseSync);

    return () => {
      unsubscribeOrderManager();
      unsubscribeSync();
      window.removeEventListener('databaseSync', handleDatabaseSync);
      window.removeEventListener('centralDBUpdate', handleDatabaseSync);
    };
  }, []);

  const sortByDateDesc = (arr) => {
    if (!Array.isArray(arr)) {
      console.warn('sortByDateDesc received non-array:', arr);
      return [];
    }
    return [...arr].sort(
      (a, b) => new Date(b?.createdAt || b?.timestamp || 0) - new Date(a?.createdAt || a?.timestamp || 0)
    );
  };

  const safeCurrency = (amount) => {
    const n = Number(amount || 0);
    // Muestra separador de miles local y sin especificar divisa fija (ya anteponemos $)
    return `$${n.toLocaleString()}`;
  };

  // === Helper para mostrar fechas seguras ===
  const getReviewDate = (r) => {
    const raw =
      r?.createdAt ||
      r?.created_at ||
      r?.date ||
      r?.moderatedAt ||
      r?.timestamp;

    if (!raw) return 'N/A';
    const d = new Date(raw);
    return isNaN(d) ? 'N/A' : d.toLocaleDateString();
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Usuarios - manejar error si el backend no está disponible
      let usersData = [];
      try {
        usersData = await apiService.getAllUsers();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.warn('Backend local no disponible para usuarios:', err);
        setUsers([]);
      }

      // Pedidos (desde orderManager) - manejar error
      let allOrders = [];
      try {
        allOrders = sortByDateDesc(await orderManager.getAllOrders() || []);
        setOrders(allOrders);
      } catch (err) {
        console.warn('Backend local no disponible para pedidos:', err);
        setOrders([]);
      }

      // Reseñas - manejar error
      try {
        const reviewsData = await apiService.getAllReviews(true);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.warn('Backend local no disponible para reseñas:', err);
        setReviews([]);
      }

      // Estadísticas
      const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o?.total || 0), 0);

      const counts = allOrders.reduce((acc, o) => {
        const st = o?.status;
        if (st) acc[st] = (acc[st] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalUsers: usersData?.length || 0,
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrders: counts[ORDER_STATUSES.PENDING] || 0,
        // cards de la cabecera
        pending: counts[ORDER_STATUSES.PENDING] || 0,
        preparing: counts[ORDER_STATUSES.PREPARING] || 0,
        on_the_way: counts[ORDER_STATUSES.ON_THE_WAY] || 0,
        delivered: counts[ORDER_STATUSES.DELIVERED] || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // No mostrar error si es solo que el backend no está disponible
      // El dashboard puede funcionar solo con productos
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    const allOrders = sortByDateDesc(await orderManager.getAllOrders() || []);
    setOrders(allOrders);
  };

  // Opcional: mantener para compatibilidad, pero recalcula igual que loadDashboardData
  const loadStats = () => {
    const allOrders = orderManager.getAllOrders() || [];
    const usersData = apiService.getAllUsers();
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + Number(o?.total || 0),
      0
    );

    // Normalización rápida de estados (es/en + legacy)
    const ALIAS = {
      pendiente: 'pending',
      preparando: 'preparing',
      'en camino': 'on_the_way',
      en_camino: 'on_the_way',
      ready: 'on_the_way',
      listo: 'on_the_way',
      entregado: 'delivered',
      cancelado: 'cancelled',
    };
    const norm = (s) => {
      if (!s) return s;
      const k = String(s).toLowerCase().trim();
      return ALIAS[k] || s;
    };

    // Conteo por estado normalizado
    const counts = allOrders.reduce((acc, o) => {
      const st = norm(o?.status);
      if (st) acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalUsers: usersData?.length || 0,
      totalOrders: allOrders.length,
      totalRevenue,
      pendingOrders: counts[ORDER_STATUSES.PENDING] || 0,
      // cards de la cabecera
      pending: counts[ORDER_STATUSES.PENDING] || 0,
      preparing: counts[ORDER_STATUSES.PREPARING] || 0,
      on_the_way: counts[ORDER_STATUSES.ON_THE_WAY] || 0,
      ready: counts[ORDER_STATUSES.ON_THE_WAY] || 0,   // <- Listos = on_the_way
      delivered: counts[ORDER_STATUSES.DELIVERED] || 0,
    });
  };


  const handleStatusChange = async (orderId, newStatus) => {
    // Si se está marcando como entregado, solicitar quién lo recibió
    if (newStatus === ORDER_STATUSES.DELIVERED) {
      const receivedBy = prompt('¿Quién recibió el pedido?');
      if (!receivedBy) {
        setNotification({
          type: 'warning',
          message: 'Debe especificar quién recibió el pedido',
        });
        return;
      }
      
      // Actualizar el pedido con la información de quién lo recibió
      try {
        const result = await orderManager.updateOrderStatus(orderId, newStatus, {
          receivedBy,
          deliveredAt: new Date().toISOString()
        });
        
        if (result?.success) {
          loadDashboardData();
          if (selectedOrder?.id === orderId) {
            setSelectedOrder(result.order);
          }
          setNotification({
            type: 'success',
            message: `Pedido marcado como entregado. Recibido por: ${receivedBy}`,
          });
        } else {
          setNotification({
            type: 'error',
            message: result?.error || 'Error al actualizar el estado del pedido',
          });
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        setNotification({
          type: 'error',
          message: 'Error al actualizar el estado del pedido',
        });
      }
    } else {
      // Para otros estados, usar la función normal
      try {
        const result = await orderManager.updateOrderStatus(orderId, newStatus);
        if (result?.success) {
          loadDashboardData();
          if (selectedOrder?.id === orderId) {
            setSelectedOrder(result.order);
          }
          setNotification({
            type: 'success',
            message: `Estado del pedido actualizado a: ${getStatusLabel(newStatus)}`,
          });
        } else {
          setNotification({
            type: 'error',
            message: result?.error || 'Error al actualizar el estado del pedido',
          });
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        setNotification({
          type: 'error',
          message: 'Error al actualizar el estado del pedido',
        });
      }
    }
  };

  // currentActive: boolean actual; toggle a !currentActive
  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      const newActive = !currentActive;
      await apiService.toggleUserStatus(userId, newActive);
      await loadDashboardData();
      setNotification({
        type: 'success',
        message: `Usuario ${newActive ? 'activado' : 'desactivado'} correctamente`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      setNotification({
        type: 'error',
        message: 'Error al actualizar el estado del usuario',
      });
    }
  };

  const showNotification = (type, message) => setNotification({ type, message });

  const handleDeleteOrder = (orderId) => {
    const orderExists = orders.find((order) => order?.id === orderId);
    if (!orderExists) {
      setNotification({
        type: 'error',
        message: 'El pedido no existe o ya fue eliminado.',
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el pedido #${orderId}?\n\nEsta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          const result = await orderManager.deleteOrder(orderId);
          if (result?.success) {
            setNotification({ type: 'success', message: 'Pedido eliminado exitosamente.' });
            loadDashboardData();
            if (selectedOrder?.id === orderId) setSelectedOrder(null);
          } else {
            setNotification({
              type: 'error',
              message: 'Error al eliminar pedido: ' + (result?.error || 'Error desconocido'),
            });
          }
        } catch (error) {
          console.error('Error inesperado al eliminar pedido:', error);
          setNotification({
            type: 'error',
            message: 'Error inesperado al eliminar el pedido. Por favor, intenta nuevamente.',
          });
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
      },
      onCancel: () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null }),
    });
  };

  // Funciones para el modal de usuarios
  const openUserModal = (user = null) => {
    if (user) {
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role || 'customer',
        active: user.active !== undefined ? user.active : true,
        password: '' // No mostrar contraseña existente por seguridad
      });
      setUserModal({ isOpen: true, user, isEditing: true });
    } else {
      setUserForm({ name: '', email: '', phone: '', address: '', role: 'customer', active: true, password: '' });
      setUserModal({ isOpen: true, user: null, isEditing: false });
    }
  };

  const closeUserModal = () => {
    setUserModal({ isOpen: false, user: null, isEditing: false });
    setUserForm({ name: '', email: '', phone: '', address: '', role: 'customer', active: true, password: '' });
  };

  const handleUserFormChange = (field, value) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async () => {
    try {
      if (!userForm.name.trim() || !userForm.email.trim()) {
        setNotification({
          type: 'error',
          message: 'El nombre y email son obligatorios'
        });
        return;
      }

      // Validar contraseña para nuevos usuarios
      if (!userModal.isEditing && !userForm.password.trim()) {
        setNotification({
          type: 'error',
          message: 'La contraseña es obligatoria para nuevos usuarios'
        });
        return;
      }

      // Validar longitud de contraseña si se proporciona
      if (userForm.password.trim() && userForm.password.length < 6) {
        setNotification({
          type: 'error',
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      if (userModal.isEditing) {
        // Actualizar usuario existente
        const updateData = { ...userForm };
        // Solo incluir contraseña si se proporcionó una nueva
        if (!userForm.password.trim()) {
          delete updateData.password;
        }
        await apiService.updateUser(userModal.user.id, updateData);
        setNotification({
          type: 'success',
          message: 'Usuario actualizado correctamente'
        });
      } else {
        // Crear nuevo usuario
        await apiService.createUser(userForm);
        setNotification({
          type: 'success',
          message: 'Usuario creado correctamente'
        });
      }

      closeUserModal();
      await loadDashboardData();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Error al guardar el usuario'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await apiService.deleteUser(userId);
          setNotification({
            type: 'success',
            message: 'Usuario eliminado correctamente'
          });
          await loadDashboardData();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          setNotification({
            type: 'error',
            message: 'Error al eliminar el usuario'
          });
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
      },
      onCancel: () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null }),
    });
  };

  // Funciones para manejar reseñas
  const handleApproveReview = async (reviewId) => {
    try {
      const currentUser = authService.getCurrentUser();
      const adminId = currentUser?.id || 1; // Usar ID del admin actual o 1 por defecto
      
      await apiService.updateReviewApproval(reviewId, true, adminId);
      setNotification({
        type: 'success',
        message: 'Reseña aprobada correctamente'
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Error al aprobar reseña:', error);
      setNotification({
        type: 'error',
        message: 'Error al aprobar la reseña'
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Reseña',
      message: '¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          const currentUser = authService.getCurrentUser();
          const adminId = currentUser?.id || 1; // Usar ID del admin actual o 1 por defecto
          
          await apiService.deleteReview(reviewId, adminId);
          setNotification({
            type: 'success',
            message: 'Reseña eliminada correctamente'
          });
          await loadDashboardData();
        } catch (error) {
          console.error('Error al eliminar reseña:', error);
          setNotification({
            type: 'error',
            message: 'Error al eliminar la reseña'
          });
        }
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null });
      },
      onCancel: () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, onCancel: null }),
    });
  };

  const getFilteredOrders = () => {
    const ordersArray = Array.isArray(orders) ? orders : [];
    
    // Primero filtrar por estado según la pestaña activa
    let filteredByStatus = [];
    switch (activeTab) {
      case 'active':
        filteredByStatus = ordersArray.filter(
          (o) => o?.status !== ORDER_STATUSES.DELIVERED && o?.status !== ORDER_STATUSES.CANCELLED
        );
        break;
      case 'completed':
        filteredByStatus = ordersArray.filter((o) => o?.status === ORDER_STATUSES.DELIVERED);
        break;
      case 'all':
      default:
        filteredByStatus = ordersArray;
        break;
    }
    
    // Luego filtrar por tiempo
    if (timeFilter === 'all') {
      return filteredByStatus;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return filteredByStatus.filter(order => {
      const orderDate = new Date(order?.created_at || order?.createdAt || order?.timestamp);
      
      switch (timeFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const getNextStatus = (currentRaw) => {
    const current = normalizeStatus(currentRaw);
    const flow = { pending: 'preparing', preparing: 'on_the_way', on_the_way: 'delivered' };
    return flow[current] || null;
  };


  const getStatusButtonText = (currentRaw) => {
    const next = getNextStatus(currentRaw);
    if (!next) return null;
    // Usa los mismos textos que ya tenías en tu UI
    const labels = {
      preparing:  'Iniciar preparación',
      on_the_way: 'Marcar en camino',     // (antes podía decir “Listo”)
      delivered:  'Marcar como entregado'
    };
    return labels[next] || null;
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
    <>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header simplificado */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    try {
                      await syncService.forceSyncAll();
                      loadDashboardData();
                      setNotification({ type: 'success', message: 'Sincronización forzada completada' });
                    } catch (error) {
                      console.error('Error en sincronización forzada:', error);
                      setNotification({ type: 'error', message: 'Error en la sincronización' });
                    }
                  }}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar
                </button>
                <button
                  onClick={() => {
                    const syncedOrders = syncService.getSyncedOrders();
                    console.log('Pedidos sincronizados:', syncedOrders);
                    setNotification({ 
                      type: 'success', 
                      message: `${syncedOrders.length} pedidos en caché de sincronización` 
                    });
                  }}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estado Sync
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
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'overview'
                      ? 'border-orange-500 text-orange-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Resumen</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'orders'
                      ? 'border-orange-500 text-orange-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pedidos ({orders.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'users'
                      ? 'border-orange-500 text-orange-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Usuarios ({users.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'reviews'
                      ? 'border-orange-500 text-orange-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>Reseñas ({reviews.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'products'
                      ? 'border-orange-500 text-orange-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:border-gray-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Productos</span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Recent Orders */}
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow`}>
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pedidos Recientes</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>ID Pedido</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Cliente</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Total</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Estado</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Fecha</th>
                          </tr>
                        </thead>
                        <tbody className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order?.id}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>#{order?.id}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {order?.customer?.name || order?.customerName || 'Cliente Anónimo'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {safeCurrency(order?.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order?.status] || 'bg-gray-100 text-gray-800'}`}>
                                  {getStatusLabel(order?.status)}
                                </span>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {order?.createdAt || order?.timestamp
                                  ? new Date(order?.createdAt || order?.timestamp).toLocaleDateString()
                                  : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  {/* Filtros de tiempo */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTimeFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          timeFilter === 'all'
                            ? 'bg-burger-yellow text-burger-dark'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Todos los pedidos
                      </button>
                      <button
                        onClick={() => setTimeFilter('today')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          timeFilter === 'today'
                            ? 'bg-burger-yellow text-burger-dark'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Hoy
                      </button>
                      <button
                        onClick={() => setTimeFilter('week')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          timeFilter === 'week'
                            ? 'bg-burger-yellow text-burger-dark'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Esta semana
                      </button>
                      <button
                        onClick={() => setTimeFilter('month')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          timeFilter === 'month'
                            ? 'bg-burger-yellow text-burger-dark'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Este mes
                      </button>
                    </div>
                    <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Mostrando {getFilteredOrders().length} pedido(s)
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay pedidos</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredOrders().map((order) => (
                        <div key={order?.id} className={`border ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-white'} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pedido #{order?.id}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order?.status] || 'bg-gray-100 text-gray-800'}`}>
                                {getStatusLabel(order?.status)}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatOrderTime(order?.createdAt || order?.timestamp)}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Clock className="inline w-3 h-3 mr-1" />
                                Hace {getElapsedTime(order?.createdAt || order?.timestamp)}
                              </p>
                              <p className="font-semibold text-burger-yellow">{safeCurrency(order?.total)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Cliente:</span> {order?.customer?.name || order?.customerName || 'Cliente Anónimo'}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Teléfono:</span> {order?.customer?.phone || 'No especificado'}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Dirección:</span> {order?.customer?.address || 'No especificado'}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-medium">Notificación:</span> {
                                order?.notificationMethod === 'email' ? 'Email' :
                                order?.notificationMethod === 'whatsapp' ? 'WhatsApp' :
                                order?.notificationMethod === 'phone' ? 'Llamada' :
                                order?.customer?.notificationMethod === 'email' ? 'Email' :
                                order?.customer?.notificationMethod === 'whatsapp' ? 'WhatsApp' :
                                order?.customer?.notificationMethod === 'phone' ? 'Llamada' :
                                'Email'
                              }</p>
                              {order?.receivedBy && (
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  <span className="font-medium">Recibido por:</span> {order.receivedBy}
                                </p>
                              )}
                              {order?.status === ORDER_STATUSES.DELIVERED && order?.deliveredAt && (
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  <span className="font-medium">Entregado:</span> {new Date(order.deliveredAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium mb-1`}>Productos:</p>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {(order?.items || []).map((item, index) => (
                                  <div key={index} className="flex justify-between">
                                    <span>{(item?.quantity || 0)}x {item?.name || 'Ítem'}</span>
                                    <span>{safeCurrency((item?.price || 0) * (item?.quantity || 0))}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className={`flex justify-between items-center pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <div className="flex space-x-2">
                              {getNextStatus(order?.status) && (
                                <button
                                  onClick={() => handleStatusChange(order?.id, getNextStatus(order?.status))}
                                  className="px-3 py-1 bg-burger-yellow text-burger-dark text-sm font-medium rounded-md hover:bg-yellow-400 transition-colors"
                                >
                                  {getStatusButtonText(order?.status)}
                                </button>
                              )}

                              {order?.status !== ORDER_STATUSES.DELIVERED && order?.status !== ORDER_STATUSES.CANCELLED && (
                                <button
                                  onClick={() => handleStatusChange(order?.id, ORDER_STATUSES.CANCELLED)}
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
                                onClick={() => handleDeleteOrder(order?.id)}
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
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Gestión de Usuarios
                    </h3>
                    <button
                      onClick={() => openUserModal()}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Crear Usuario
                    </button>
                  </div>
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay usuarios registrados</p>
                    </div>
                  ) : (
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                            <tr>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Usuario</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Teléfono</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Rol</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Estado</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Fecha Registro</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                            {users.map((user) => (
                              <tr key={user?.id}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || '—'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email || '—'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{user?.phone || 'No especificado'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user?.active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => openUserModal(user)}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                      title="Editar usuario"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserStatus(user?.id, !!user?.active)}
                                      className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                                        user?.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      }`}
                                      title={user?.active ? 'Desactivar usuario' : 'Activar usuario'}
                                    >
                                      {user?.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user?.id)}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                      title="Eliminar usuario"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <div className="mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Gestión de Reseñas
                    </h3>
                  </div>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay reseñas disponibles</p>
                    </div>
                  ) : (
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                            <tr>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Usuario</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Calificación</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Comentario</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Estado</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Fecha</th>
                              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                            {reviews.map((review) => (
                              <tr key={review?.id}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                  {review?.user_name || 'Usuario Anónimo'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < (review?.rating || 0)
                                            ? 'text-yellow-400 fill-current'
                                            : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                      ({review?.rating || 0}/5)
                                    </span>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} max-w-xs truncate`}>
                                  {review?.comment || 'Sin comentario'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    review?.approved
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {review?.approved ? 'Aprobada' : 'Pendiente'}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {getReviewDate(review)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                  {!review?.approved && (
                                    <button
                                      onClick={() => handleApproveReview(review.id)}
                                      className="text-green-600 hover:text-green-900 transition-colors"
                                      title="Aprobar reseña"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                    title="Eliminar reseña"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <ProductManagement />
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
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pedido #{selectedOrder?.id}</h2>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[selectedOrder?.status] || 'bg-gray-100 text-gray-800'}`}>
                      {getStatusLabel(selectedOrder?.status)}
                    </span>
                  </div>

                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Información del Cliente</h3>
                    <div className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p><span className="font-medium">Nombre:</span> {selectedOrder?.customer?.name || selectedOrder?.customerName || 'Cliente Anónimo'}</p>
                      <p><span className="font-medium">Teléfono:</span> {selectedOrder?.customer?.phone || 'No especificado'}</p>
                      {selectedOrder?.customer?.email && (
                        <p><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                      )}
                      <p><span className="font-medium">Dirección:</span> {selectedOrder?.customer?.address || 'No especificado'}</p>
                      <p><span className="font-medium">Método de notificación:</span> {
                        selectedOrder?.notificationMethod === 'email' ? 'Email' :
                        selectedOrder?.notificationMethod === 'whatsapp' ? 'WhatsApp' :
                        selectedOrder?.notificationMethod === 'phone' ? 'Llamada telefónica' :
                        selectedOrder?.customer?.notificationMethod === 'email' ? 'Email' :
                        selectedOrder?.customer?.notificationMethod === 'whatsapp' ? 'WhatsApp' :
                        selectedOrder?.customer?.notificationMethod === 'phone' ? 'Llamada telefónica' :
                        'Email'
                      }</p>
                      {selectedOrder?.receivedBy && (
                        <p><span className="font-medium">Recibido por:</span> {selectedOrder.receivedBy}</p>
                      )}
                      {selectedOrder?.deliveredAt && (
                        <p><span className="font-medium">Entregado el:</span> {new Date(selectedOrder.deliveredAt).toLocaleString()}</p>
                      )}
                      {selectedOrder?.notes && (
                        <p><span className="font-medium">Notas:</span> {selectedOrder.notes}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Productos</h3>
                    <div className="space-y-2">
                      {(selectedOrder?.items || []).map((item, index) => (
                        <div key={index} className={`flex justify-between items-center py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}>
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{item?.icon || '🍔'}</span>
                            <div>
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item?.name || 'Ítem'}</div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cantidad: {item?.quantity || 0}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{safeCurrency((item?.price || 0) * (item?.quantity || 0))}</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{safeCurrency(item?.price || 0)} c/u</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} pt-3 mt-3`}>
                      <div className={`flex justify-between items-center font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <span>Total:</span>
                        <span className="text-burger-yellow">{safeCurrency(selectedOrder?.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    {getNextStatus(selectedOrder?.status) && (
                      <button
                        onClick={() => handleStatusChange(selectedOrder?.id, getNextStatus(selectedOrder?.status))}
                        className="flex-1 px-4 py-2 bg-burger-yellow text-burger-dark font-semibold rounded-md hover:bg-yellow-400 transition-colors"
                      >
                        {getStatusButtonText(selectedOrder?.status)}
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

        {/* User Modal */}
        {userModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userModal.isEditing ? 'Editar Usuario' : 'Crear Usuario'}
                </h3>
                <button
                  onClick={closeUserModal}
                  className={`p-1 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => handleUserFormChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="Nombre del usuario"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => handleUserFormChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Contraseña {!userModal.isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => handleUserFormChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder={userModal.isEditing ? "Dejar vacío para mantener la actual" : "Mínimo 6 caracteres"}
                  />
                  {!userModal.isEditing && (
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      La contraseña es obligatoria para nuevos usuarios
                    </p>
                  )}
                  {userModal.isEditing && (
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Dejar vacío para mantener la contraseña actual
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => handleUserFormChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="Número de teléfono"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dirección
                  </label>
                  <textarea
                    value={userForm.address}
                    onChange={(e) => handleUserFormChange('address', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    placeholder="Dirección del usuario"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rol
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => handleUserFormChange('role', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="customer">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="userActive"
                    checked={userForm.active}
                    onChange={(e) => handleUserFormChange('active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="userActive" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Usuario activo
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={closeUserModal}
                  className={`flex-1 px-4 py-2 border rounded-md transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {userModal.isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
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
    </>
  );
};

export default AdminDashboard;
