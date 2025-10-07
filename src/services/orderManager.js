// Servicio para gestionar pedidos con base de datos SQLite
// Integrado con el sistema de autenticación y base de datos

import apiService from './apiService.js';
import authService from './authService.js';
import notificationService from './notificationService.js';
import syncService from './syncService.js';
import tempUserService from './tempUserService.js';

class OrderManager {
  constructor() {
    this.storageKey = 'burger_orders';
    this.statusKey = 'order_statuses';
    this.isClient = typeof window !== 'undefined';
    this.useDatabase = true; // Flag para usar base de datos
    this.database = null;
    this.initDatabase();
    
    // Inicializar BroadcastChannel para sincronización entre pestañas
    if (this.isClient) {
      this.broadcastChannel = new BroadcastChannel('order-updates');
      this.initializeStorage();
      this.setupBroadcastListener();
      this.setupSyncListener();
    }
  }

  // Inicializar la base de datos según la configuración
  async initDatabase() {
    try {
      this.database = apiService;
    } catch (error) {
      console.error('Error al inicializar la base de datos en OrderManager:', error);
      this.database = apiService;
    }
  }

  // Asegurar que la base de datos esté inicializada
  async ensureDatabase() {
    if (!this.database) {
      await this.initDatabase();
    }
    return this.database;
  }

  initializeStorage() {
    if (!this.isClient) return;
    // Ya no necesitamos localStorage, todo se maneja a través de la API
  }

  setupBroadcastListener() {
    if (!this.isClient || !this.broadcastChannel) return;
    
    this.broadcastChannel.addEventListener('message', (event) => {
      // Reenviar el evento como CustomEvent para mantener compatibilidad
      const customEvent = new CustomEvent('orderUpdate', {
        detail: event.data
      });
      window.dispatchEvent(customEvent);
    });
  }

  setupSyncListener() {
    if (!this.isClient) return;
    
    // Escuchar cambios del servicio de sincronización
    syncService.addListener((event) => {
      if (event.type === 'dataChanged' || event.type === 'dataUpdated') {
        // Reenviar como evento de actualización de pedidos
        const customEvent = new CustomEvent('orderUpdate', {
          detail: {
            type: 'syncUpdate',
            data: event.data,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(customEvent);
      }
    });
  }

  broadcastUpdate(type, data) {
    if (!this.isClient) return;
    
    console.log('📡 Broadcasting update:', { type, data: data?.id });
    
    // Emitir evento directo para la misma pestaña
    const customEvent = new CustomEvent('orderUpdate', {
      detail: { type, data, timestamp: Date.now() }
    });
    window.dispatchEvent(customEvent);
    
    // También usar BroadcastChannel para otras pestañas
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type,
        data,
        timestamp: Date.now()
      });
    }

    // También sincronizar con el servicio de sincronización global
    if (data && data.id) {
      if (type === 'orderAdded' || type === 'orderUpdated') {
        syncService.syncOrder(data);
      }
    }
  }

  // Agregar nuevo pedido
  async addOrder(order) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      if (this.useDatabase) {
        let currentUser = null;
        let isTemporary = false;

        if (authService.isAuthenticated()) {
          // Usuario autenticado
          currentUser = authService.getCurrentUser();
        } else {
          // Usuario anónimo - crear o usar perfil temporal con sesión persistente
          let tempProfile = tempUserService.getTempProfile();
          
          if (!tempProfile) {
            // Crear nuevo perfil temporal con datos del pedido
            tempProfile = tempUserService.createTempProfile({
              name: order.customerInfo?.name || 'Usuario Temporal',
              phone: order.customerInfo?.phone || order.deliveryInfo?.phone || '',
              address: order.deliveryInfo?.address || '',
              email: order.customerInfo?.email || '',
              notes: order.notes || ''
            });
            
            // Crear sesión temporal persistente para este usuario
            tempUserService.createTempSession(tempProfile.id, {
              profileData: tempProfile,
              lastAccess: Date.now()
            });
          } else {
            // Actualizar perfil temporal con nueva información si está disponible
            const updates = {};
            if (order.customerInfo?.name) updates.name = order.customerInfo.name;
            if (order.customerInfo?.phone || order.deliveryInfo?.phone) {
              updates.phone = order.customerInfo?.phone || order.deliveryInfo?.phone;
            }
            if (order.deliveryInfo?.address) updates.address = order.deliveryInfo.address;
            if (order.customerInfo?.email) updates.email = order.customerInfo.email;
            if (order.notes) updates.notes = order.notes;
            
            if (Object.keys(updates).length > 0) {
              tempProfile = tempUserService.updateTempProfile(updates);
              // Actualizar también la sesión temporal
              tempUserService.updateSessionAccess(tempProfile.id);
            }
          }
          
          currentUser = tempProfile;
          isTemporary = true;
        }
        
        const orderData = {
          userId: currentUser.id,
          items: order.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations || {}
          })),
          total: order.total,
          // Información del cliente
          customerName: order.customerInfo?.name || currentUser.name,
          customerEmail: order.customerInfo?.email || currentUser.email,
          phone: order.customerInfo?.phone || order.deliveryInfo?.phone || currentUser.phone,
          deliveryAddress: order.deliveryInfo?.address || currentUser.address,
          notes: order.notes || currentUser.notes || '',
          notificationMethod: order.notificationMethod || 'email',
          // Mantener también la estructura original para compatibilidad
          customerInfo: {
            name: order.customerInfo?.name || currentUser.name,
            email: order.customerInfo?.email || currentUser.email,
            phone: order.customerInfo?.phone || currentUser.phone
          },
          deliveryInfo: {
            address: order.deliveryInfo?.address || currentUser.address,
            phone: order.deliveryInfo?.phone || order.customerInfo?.phone || currentUser.phone
          },
          isTemporary: isTemporary,
          tempSessionId: isTemporary ? currentUser.id : null
        };

        const response = await apiService.createOrder(orderData);
        
        if (!response.success) {
          throw new Error(response.error || 'Error al crear el pedido');
        }
        
        const dbOrder = response.order;
        
        // Agregar información sobre el perfil temporal al pedido
        if (isTemporary) {
          dbOrder.isTemporary = true;
          dbOrder.tempProfileExpires = currentUser.expiresAt;
          dbOrder.timeRemaining = tempUserService.getFormattedTimeRemaining();
          dbOrder.tempSessionId = currentUser.id;
        }
        
        // Generar notificación para nuevo pedido
        notificationService.notifyNewOrder(dbOrder);
        
        // Enviar actualización a través de BroadcastChannel
        this.broadcastUpdate('orderAdded', dbOrder);
        
        return { 
          success: true, 
          order: dbOrder,
          message: isTemporary 
            ? `Pedido creado con perfil temporal. ${tempUserService.getFormattedTimeRemaining()} para seguimiento.`
            : 'Pedido creado exitosamente',
          isTemporary: isTemporary,
          tempProfile: isTemporary ? currentUser : null
        };
      }
    } catch (error) {
      console.error('Error al agregar pedido:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todos los pedidos
  async getAllOrders() {
    if (!this.isClient) {
      return [];
    }
    
    try {
      if (this.useDatabase && authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        
        if (currentUser.role === 'admin') {
          // Los administradores pueden ver todos los pedidos
          const dbOrders = await apiService.getAllOrdersFromDB();
          const syncedOrders = syncService.getSyncedOrders();
          
          // Combinar datos de la base de datos con datos sincronizados
          const combinedOrders = this.mergeOrderData(dbOrders, syncedOrders);
          
          return combinedOrders;
        } else {
          // Los clientes solo ven sus propios pedidos
          return await apiService.getUserOrders(currentUser.id);
        }
      }
      return [];
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return [];
    }
  }

  // Método para combinar datos de la base de datos con datos sincronizados
  mergeOrderData(dbOrders, syncedOrders) {
    const orderMap = new Map();
    
    // Agregar pedidos de la base de datos
    dbOrders.forEach(order => {
      orderMap.set(order.id, order);
    });
    
    // Sobrescribir con datos sincronizados más recientes
    syncedOrders.forEach(syncedOrder => {
      const existingOrder = orderMap.get(syncedOrder.id);
      
      if (
        !existingOrder || 
        (syncedOrder.syncTimestamp &&
         new Date(syncedOrder.updatedAt || syncedOrder.createdAt) >
         new Date(existingOrder.updatedAt || existingOrder.createdAt))
      ) {
        orderMap.set(syncedOrder.id, syncedOrder);
      }
    });
    
    return Array.from(orderMap.values()).sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }

  // Obtener pedidos por usuario específico
  async getUserOrders(userId = null) {
    if (!this.isClient) {
      return [];
    }
    
    try {
      if (this.useDatabase) {
        if (userId) {
          return await apiService.getUserOrders(userId);
        } else if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          return await apiService.getUserOrders(currentUser.id);
        } else {
          // Verificar si hay una sesión temporal activa
          const tempSession = tempUserService.getTempSession();
          if (tempSession && tempSession.profileData) {
            return await apiService.getUserOrders(tempSession.profileData.id);
          }
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener pedidos del usuario:', error);
      return [];
    }
  }

  // Obtener pedidos por estado
  async getOrdersByStatus(status) {
    const orders = await this.getAllOrders();
    return orders.filter(order => order.status === status);
  }

  // Obtener pedidos activos (no entregados)
  async getActiveOrders() {
    const orders = await this.getAllOrders();
    return orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  }

  // Actualizar estado de pedido
  // Actualizar estado de pedido (REEMPLAZAR COMPLETO)
  async updateOrderStatus(orderId, newStatus, additionalData = {}) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }

    try {
      // Definir currentUser en el scope superior para evitar ReferenceError
      let currentUser = null;

      if (!this.useDatabase) {
        return { success: false, error: 'Base de datos no disponible' };
      }

      if (!authService.isAuthenticated()) {
        return { success: false, error: 'No autenticado' };
      }

      currentUser = authService.getCurrentUser();

      // Solo administradores pueden actualizar estados
      if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, error: 'Permisos insuficientes' };
      }

      // Obtener el pedido actual para registrar cambio
      const currentOrder = await apiService.getOrderById(orderId);
      const oldStatus = currentOrder?.status;

      // Hacer la llamada a la API (nota: apiService espera adminId como 3er arg)
      const updatedOrder = await apiService.updateOrderStatus(
        orderId,
        newStatus,
        currentUser.id // adminId
      );

      if (!updatedOrder) {
        return { success: false, error: 'Pedido no encontrado' };
      }

      // Notificación de cambio de estado
      if (oldStatus && oldStatus !== newStatus) {
        notificationService.notifyOrderStatusChange(updatedOrder, oldStatus, newStatus);
      }

      // Broadcast para refrescar otras pestañas
      console.log('🔄 Emitiendo evento orderUpdated para pedido:', orderId);
      this.broadcastUpdate('orderUpdated', updatedOrder);

      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      return { success: false, error: error.message || 'Error al actualizar estado' };
    }
  }


  // Obtener estados de pedidos
  async getOrderStatuses() {
    if (!this.isClient) return {};
    
    try {
      // Los estados ahora se obtienen directamente de los pedidos en la base de datos
      const orders = await this.getAllOrders();
      const statuses = {};
      orders.forEach(order => {
        statuses[order.id] = order.status;
      });
      return statuses;
    } catch (error) {
      console.error('Error al obtener estados:', error);
      return {};
    }
  }

  // Obtener pedido por ID
  async getOrderById(orderId) {
    if (!this.isClient) {
      return null;
    }
    
    try {
      if (this.useDatabase) {
        // Buscar en la base de datos tanto para usuarios autenticados como temporales
        const order = await apiService.getOrderById(orderId);
        
        // Si es un pedido temporal, verificar que el usuario temporal aún sea válido
        if (order && order.is_temporary) {
          const tempProfile = tempUserService.getTempProfile();
          if (!tempProfile || tempProfile.id !== order.user_id) {
            // El perfil temporal ha expirado o no coincide
            return null;
          }
        }
        
        return order;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener pedido por ID:', error);
      return null;
    }
  }

  // Eliminar pedido
  async deleteOrder(orderId) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      if (this.useDatabase && authService.isAuthenticated()) {
        // Eliminar de la base de datos
        const result = await apiService.deleteOrder(orderId);
        
        if (result) {
          this.broadcastUpdate('orderDeleted', { id: orderId });
          return { success: true, message: 'Pedido eliminado exitosamente' };
        } else {
          return { success: false, error: 'Error al eliminar el pedido de la base de datos' };
        }
      }
      return { success: false, error: 'Base de datos no disponible' };
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      return { success: false, error: error.message };
    }
  }

  // Limpiar pedidos antiguos (más de 24 horas)
  async cleanOldOrders() {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      const orders = await this.getAllOrders();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp);
        return orderDate > oneDayAgo || order.status !== 'delivered';
      });
      
      return { success: true, cleaned: orders.length - recentOrders.length };
    } catch (error) {
      console.error('Error al limpiar pedidos:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas
  async getOrderStats() {
    try {
      const orders = await this.getAllOrders();
      const ordersArray = Array.isArray(orders) ? orders : [];
      const today = new Date().toDateString();
      
      const todayOrders = ordersArray.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp).toDateString();
        return orderDate === today;
      });
      
      return {
        total: ordersArray.length,
        today: todayOrders.length,
        pending:    ordersArray.filter(o => o.status === 'pending').length,
        preparing:  ordersArray.filter(o => o.status === 'preparing').length,
        on_the_way: ordersArray.filter(o => o.status === 'on_the_way').length,
        delivered:  ordersArray.filter(o => o.status === 'delivered').length
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de pedidos:', error);
      return {
        total: 0,
        today: 0,
        pending: 0,
        preparing: 0,
        on_the_way: 0,
        delivered: 0
      };
    }
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
  async exportOrders() {
    const orders = await this.getAllOrders();
    const statuses = await this.getOrderStatuses();
    
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
      // La importación ahora se maneja a través de la API
      return { success: false, error: 'La importación debe realizarse a través del servidor' };
    } catch (error) {
      console.error('Error al importar pedidos:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos específicos para sesiones temporales
  
  // Obtener pedidos de la sesión temporal actual
  async getTempSessionOrders() {
    if (!this.isClient) {
      return [];
    }
    
    try {
      const tempSession = tempUserService.getTempSession();
      if (!tempSession || !tempSession.profileData) {
        return [];
      }
      
      return await this.getUserOrders(tempSession.profileData.id);
    } catch (error) {
      console.error('Error al obtener pedidos de sesión temporal:', error);
      return [];
    }
  }

  // Verificar si el usuario puede acceder a pedidos temporales
  canAccessTempOrders() {
    return tempUserService.canAccessTempOrders();
  }

  // Reactivar sesión temporal y obtener pedidos
  async reactivateTempSession(tempUserId) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      const reactivated = tempUserService.reactivateTempSession(tempUserId);
      if (reactivated) {
        const orders = await this.getTempSessionOrders();
        return { 
          success: true, 
          orders,
          sessionInfo: tempUserService.getSessionInfo()
        };
      }
      return { success: false, error: 'No se pudo reactivar la sesión temporal' };
    } catch (error) {
      console.error('Error al reactivar sesión temporal:', error);
      return { success: false, error: error.message };
    }
  }

  // Migrar pedidos temporales a cuenta permanente
  async migrateTempOrdersToAccount(permanentUserId) {
    if (!this.isClient) {
      return { success: false, error: 'No disponible en el servidor' };
    }
    
    try {
      const tempOrders = await this.getTempSessionOrders();
      if (tempOrders.length === 0) {
        return { success: true, migratedCount: 0 };
      }

      let migratedCount = 0;

      for (const order of tempOrders) {
        try {
          await apiService.updateOrder(order.id, { 
            userId: permanentUserId,
            isTemporary: false,
            tempSessionId: null
          });
          migratedCount++;
        } catch (error) {
          console.error(`Error al migrar pedido ${order.id}:`, error);
        }
      }

      // Limpiar sesión temporal después de la migración
      tempUserService.clearTempSession();

      return { success: true, migratedCount };
    } catch (error) {
      console.error('Error al migrar pedidos temporales:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener información de sesión temporal
  getTempSessionInfo() {
    return tempUserService.getSessionInfo();
  }
}

// Constantes para estados de pedidos (sincronizadas con la base de datos)
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Colores para cada estado
export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  on_the_way: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
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
    pending: 'Pendiente',
    preparing: 'Preparando',
    on_the_way: 'En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
};

export const getElapsedTime = (timestamp) => {
  if (!timestamp) return 'Tiempo no disponible';
  
  const now = new Date();
  const orderTime = new Date(timestamp);
  const diffMs = now - orderTime;
  
  if (diffMs < 0) return 'Tiempo no válido';
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return 'Menos de 1 minuto';
  }
};
