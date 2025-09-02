// Servicio para gestionar pedidos sin base de datos
// Utiliza localStorage para persistencia local

class OrderManager {
  constructor() {
    this.storageKey = 'burger_orders';
    this.statusKey = 'order_statuses';
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.initializeStorage();
    }
  }

  initializeStorage() {
    if (!this.isClient) return;
    
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.statusKey)) {
      localStorage.setItem(this.statusKey, JSON.stringify({}));
    }
  }

  // Agregar nuevo pedido
  addOrder(order) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      const orders = this.getAllOrders();
      const statuses = this.getOrderStatuses();
      
      // Agregar estado inicial
      const orderWithStatus = {
        ...order,
        status: 'pendiente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      orders.push(orderWithStatus);
      statuses[order.id] = 'pendiente';
      
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
      localStorage.setItem(this.statusKey, JSON.stringify(statuses));
      
      // Disparar evento personalizado para notificar cambios
      this.dispatchOrderEvent('orderAdded', orderWithStatus);
      
      return { success: true, order: orderWithStatus };
    } catch (error) {
      console.error('Error al agregar pedido:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todos los pedidos
  getAllOrders() {
    if (!this.isClient) return [];
    
    try {
      const orders = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return orders;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return [];
    }
  }

  // Obtener pedidos por estado
  getOrdersByStatus(status) {
    const orders = this.getAllOrders();
    return orders.filter(order => order.status === status);
  }

  // Obtener pedidos activos (no entregados)
  getActiveOrders() {
    const orders = this.getAllOrders();
    return orders.filter(order => order.status !== 'entregado' && order.status !== 'cancelado');
  }

  // Actualizar estado de pedido
  updateOrderStatus(orderId, newStatus) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      const orders = this.getAllOrders();
      const statuses = this.getOrderStatuses();
      
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        return { success: false, error: 'Pedido no encontrado' };
      }
      
      // Actualizar en ambos lugares
      orders[orderIndex].status = newStatus;
      orders[orderIndex].updatedAt = new Date().toISOString();
      statuses[orderId] = newStatus;
      
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
      localStorage.setItem(this.statusKey, JSON.stringify(statuses));
      
      // Disparar evento
      this.dispatchOrderEvent('orderUpdated', orders[orderIndex]);
      
      return { success: true, order: orders[orderIndex] };
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estados de pedidos
  getOrderStatuses() {
    if (!this.isClient) return {};
    
    try {
      return JSON.parse(localStorage.getItem(this.statusKey) || '{}');
    } catch (error) {
      console.error('Error al obtener estados:', error);
      return {};
    }
  }

  // Obtener pedido por ID
  getOrderById(orderId) {
    const orders = this.getAllOrders();
    return orders.find(order => order.id === orderId);
  }

  // Eliminar pedido
  deleteOrder(orderId) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      const orders = this.getAllOrders();
      const statuses = this.getOrderStatuses();
      
      const filteredOrders = orders.filter(order => order.id !== orderId);
      delete statuses[orderId];
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredOrders));
      localStorage.setItem(this.statusKey, JSON.stringify(statuses));
      
      this.dispatchOrderEvent('orderDeleted', { id: orderId });
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      return { success: false, error: error.message };
    }
  }

  // Limpiar pedidos antiguos (más de 24 horas)
  cleanOldOrders() {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      const orders = this.getAllOrders();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp);
        return orderDate > oneDayAgo || order.status !== 'entregado';
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(recentOrders));
      
      return { success: true, cleaned: orders.length - recentOrders.length };
    } catch (error) {
      console.error('Error al limpiar pedidos:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas
  getOrderStats() {
    const orders = this.getAllOrders();
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.timestamp).toDateString();
      return orderDate === today;
    });
    
    return {
      total: orders.length,
      today: todayOrders.length,
      pending: orders.filter(o => o.status === 'pendiente').length,
      preparing: orders.filter(o => o.status === 'preparando').length,
      ready: orders.filter(o => o.status === 'listo').length,
      delivered: orders.filter(o => o.status === 'entregado').length
    };
  }

  // Disparar eventos personalizados para actualizaciones en tiempo real
  dispatchOrderEvent(eventType, data) {
    if (!this.isClient) return;
    
    const event = new CustomEvent('orderUpdate', {
      detail: { type: eventType, data }
    });
    window.dispatchEvent(event);
  }

  // Suscribirse a cambios de pedidos
  onOrderUpdate(callback) {
    if (!this.isClient) {
      return () => {}; // Función vacía para desuscribirse
    }
    
    const handler = (event) => callback(event.detail);
    window.addEventListener('orderUpdate', handler);
    
    // Retornar función para desuscribirse
    return () => window.removeEventListener('orderUpdate', handler);
  }

  // Exportar datos para respaldo
  exportOrders() {
    const orders = this.getAllOrders();
    const statuses = this.getOrderStatuses();
    
    return {
      orders,
      statuses,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Importar datos desde respaldo
  importOrders(data) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      if (data.orders && Array.isArray(data.orders)) {
        localStorage.setItem(this.storageKey, JSON.stringify(data.orders));
      }
      if (data.statuses && typeof data.statuses === 'object') {
        localStorage.setItem(this.statusKey, JSON.stringify(data.statuses));
      }
      return { success: true };
    } catch (error) {
      console.error('Error al importar pedidos:', error);
      return { success: false, error: error.message };
    }
  }
}

// Estados disponibles para pedidos
export const ORDER_STATUSES = {
  PENDING: 'pendiente',
  PREPARING: 'preparando', 
  READY: 'listo',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado'
};

// Colores para cada estado
export const STATUS_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  preparando: 'bg-blue-100 text-blue-800 border-blue-200',
  listo: 'bg-green-100 text-green-800 border-green-200',
  entregado: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200'
};

// Instancia singleton
const orderManager = new OrderManager();
export default orderManager;

// Funciones de utilidad
export const formatOrderTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusLabel = (status) => {
  const labels = {
    pendiente: 'Pendiente',
    preparando: 'En Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };
  return labels[status] || status;
};