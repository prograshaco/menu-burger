// Servicio de sincronización en tiempo real para múltiples usuarios
// Simula un sistema de sincronización que funcionaría con WebSockets en producción

class SyncService {
  constructor() {
    this.listeners = new Set();
    this.isClient = typeof window !== 'undefined';
    this.syncKey = 'admin_sync_data';
    this.lastSyncTime = 'last_sync_time';
    this.syncInterval = null;
    this.pollInterval = 2000; // Verificar cambios cada 2 segundos
    
    if (this.isClient) {
      this.initializeSync();
    }
  }

  initializeSync() {
    // Inicializar datos de sincronización
    if (!localStorage.getItem(this.syncKey)) {
      localStorage.setItem(this.syncKey, JSON.stringify({
        orders: {},
        users: {},
        reviews: {},
        lastUpdate: Date.now()
      }));
    }

    // Configurar polling para detectar cambios
    this.startPolling();

    // Escuchar cambios en localStorage de otras pestañas/ventanas
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  startPolling() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.pollInterval);
  }

  stopPolling() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  handleStorageChange(event) {
    if (event.key === this.syncKey && event.newValue) {
      try {
        const syncData = JSON.parse(event.newValue);
        this.notifyListeners('dataChanged', syncData);
      } catch (error) {
        console.error('Error parsing sync data:', error);
      }
    }
  }

  checkForUpdates() {
    try {
      const lastCheck = localStorage.getItem(this.lastSyncTime);
      const syncData = this.getSyncData();
      
      if (!lastCheck || syncData.lastUpdate > parseInt(lastCheck)) {
        localStorage.setItem(this.lastSyncTime, syncData.lastUpdate.toString());
        this.notifyListeners('dataChanged', syncData);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  getSyncData() {
    try {
      const data = localStorage.getItem(this.syncKey);
      return data ? JSON.parse(data) : {
        orders: {},
        users: {},
        reviews: {},
        lastUpdate: Date.now()
      };
    } catch (error) {
      console.error('Error getting sync data:', error);
      return {
        orders: {},
        users: {},
        reviews: {},
        lastUpdate: Date.now()
      };
    }
  }

  updateSyncData(type, id, data) {
    try {
      const syncData = this.getSyncData();
      
      if (!syncData[type]) {
        syncData[type] = {};
      }
      
      syncData[type][id] = {
        ...data,
        syncTimestamp: Date.now()
      };
      
      syncData.lastUpdate = Date.now();
      
      localStorage.setItem(this.syncKey, JSON.stringify(syncData));
      
      // Notificar inmediatamente a los listeners locales
      this.notifyListeners('dataUpdated', { type, id, data: syncData });
      
      return true;
    } catch (error) {
      console.error('Error updating sync data:', error);
      return false;
    }
  }

  // Métodos específicos para diferentes tipos de datos
  syncOrder(order) {
    return this.updateSyncData('orders', order.id, order);
  }

  syncUser(user) {
    return this.updateSyncData('users', user.id, user);
  }

  syncReview(review) {
    return this.updateSyncData('reviews', review.id, review);
  }

  // Obtener datos sincronizados
  getSyncedOrders() {
    const syncData = this.getSyncData();
    return Object.values(syncData.orders || {});
  }

  getSyncedUsers() {
    const syncData = this.getSyncData();
    return Object.values(syncData.users || {});
  }

  getSyncedReviews() {
    const syncData = this.getSyncData();
    return Object.values(syncData.reviews || {});
  }

  // Sistema de listeners
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback({ type: eventType, data });
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Forzar sincronización completa
  forcSync() {
    const syncData = this.getSyncData();
    syncData.lastUpdate = Date.now();
    localStorage.setItem(this.syncKey, JSON.stringify(syncData));
    this.notifyListeners('forceSync', syncData);
  }

  // Método para forzar sincronización completa
  async forceSyncAll() {
    try {
      console.log('Iniciando sincronización forzada...');
      
      // Actualizar timestamp para forzar sincronización
      const currentTime = Date.now();
      localStorage.setItem(this.LAST_SYNC_KEY, currentTime.toString());
      
      // Notificar a todos los listeners sobre la sincronización forzada
      this.notifyListeners('forceSyncCompleted', { timestamp: currentTime });
      
      console.log('Sincronización forzada completada');
      return { success: true, timestamp: currentTime };
    } catch (error) {
      console.error('Error en sincronización forzada:', error);
      throw error;
    }
  }

  // Limpiar datos de sincronización
  clearSyncData() {
    localStorage.removeItem(this.syncKey);
    localStorage.removeItem(this.lastSyncTime);
    this.initializeSync();
  }

  // Simular sincronización con servidor (para futuro uso con WebSockets)
  async syncWithServer() {
    // En un entorno real, esto haría una llamada al servidor
    // Por ahora, simularemos actualizando el timestamp
    try {
      const syncData = this.getSyncData();
      syncData.lastUpdate = Date.now();
      localStorage.setItem(this.syncKey, JSON.stringify(syncData));
      
      this.notifyListeners('serverSync', syncData);
      return { success: true };
    } catch (error) {
      console.error('Error syncing with server:', error);
      return { success: false, error: error.message };
    }
  }

  // Destructor
  destroy() {
    this.stopPolling();
    if (this.isClient) {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }
    this.listeners.clear();
  }
}

// Crear instancia singleton
const syncService = new SyncService();

export default syncService;