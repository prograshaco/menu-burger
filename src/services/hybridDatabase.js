// Servicio híbrido que funciona tanto en el navegador como en el servidor
// En el navegador usa localStorage como almacenamiento centralizado simulado
// En el servidor usa el sistema de archivos directamente

import { v4 as uuidv4 } from 'uuid';

// Detectar si estamos en el navegador o en el servidor
const isClient = typeof window !== 'undefined';
const isServer = !isClient;

class HybridDatabaseService {
  constructor() {
    this.isClient = isClient;
    this.isServer = isServer;
    this.storagePrefix = 'centralDB_'; // Prefijo para simular base de datos centralizada
    
    if (isServer) {
      // Solo importar módulos de Node.js en el servidor
      this.initializeServerDatabase();
    } else {
      // En el cliente, usar localStorage con prefijo especial para simular centralización
      this.initializeClientDatabase();
    }
  }

  // Inicialización para el servidor (Node.js)
  async initializeServerDatabase() {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      this.fs = fs.default;
      this.path = path.default;
      this.dbPath = this.path.join(process.cwd(), 'database');
      
      this.ensureDbDirectory();
      this.initializeDatabase();
    } catch (error) {
      console.error('Error initializing server database:', error);
    }
  }

  // Inicialización para el cliente (navegador)
  initializeClientDatabase() {
    console.log('HybridDatabaseService initialized for client');
    
    // Limpiar datos antiguos del sistema anterior
    this.cleanOldData();
    
    // Inicializar base de datos con datos por defecto
    this.initializeDatabase();
    
    // Escuchar cambios de otras pestañas/instancias
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith(this.storagePrefix)) {
        console.log('Datos actualizados desde otra instancia:', e.key);
        // Disparar evento para que los componentes se actualicen
        window.dispatchEvent(new CustomEvent('databaseSync', {
          detail: { key: e.key, newValue: e.newValue }
        }));
      }
    });
    
    // Escuchar eventos de actualización de la misma pestaña
    window.addEventListener('centralDBUpdate', (e) => {
      console.log('Datos actualizados en esta instancia:', e.detail.filename);
    });
  }

  // Limpiar datos del sistema anterior para evitar conflictos
  cleanOldData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key === 'users' || key === 'orders' || key === 'reviews' || key === 'products' || key === 'activity_logs')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed old data key: ${key}`);
    });
  }

  // Asegurar que el directorio de base de datos existe (solo servidor)
  ensureDbDirectory() {
    if (this.isServer && this.fs && this.dbPath) {
      if (!this.fs.existsSync(this.dbPath)) {
        this.fs.mkdirSync(this.dbPath, { recursive: true });
      }
    }
  }

  // Leer archivo de base de datos
  async readDbFile(filename) {
    if (this.isServer) {
      // En el servidor, leer directamente del archivo
      const filePath = this.path.join(this.dbPath, `${filename}.bd`);
      try {
        if (this.fs.existsSync(filePath)) {
          const data = this.fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        }
        return [];
      } catch (error) {
        console.error(`Error reading ${filename}.bd:`, error);
        return [];
      }
    } else {
      // En el cliente, usar localStorage con prefijo centralizado
      try {
        const key = `${this.storagePrefix}${filename}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error(`Error reading ${filename} from localStorage:`, error);
        return [];
      }
    }
  }

  // Escribir archivo de base de datos
  async writeDbFile(filename, data) {
    if (this.isServer) {
      // En el servidor, escribir directamente al archivo
      const filePath = this.path.join(this.dbPath, `${filename}.bd`);
      try {
        this.fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
      } catch (error) {
        console.error(`Error writing ${filename}.bd:`, error);
        return false;
      }
    } else {
      // En el cliente, usar localStorage con prefijo centralizado
      try {
        const key = `${this.storagePrefix}${filename}`;
        localStorage.setItem(key, JSON.stringify(data));
        
        // Disparar evento personalizado para notificar a otras pestañas/instancias
        window.dispatchEvent(new CustomEvent('centralDBUpdate', {
          detail: { filename, data }
        }));
        
        return true;
      } catch (error) {
        console.error(`Error writing ${filename} to localStorage:`, error);
        return false;
      }
    }
  }

  // Inicializar base de datos con datos por defecto
  async initializeDatabase() {
    // Inicializar usuarios
    const users = await this.readDbFile('users');
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: 'admin-001',
          username: 'admin',
          email: 'admin@restaurant.com',
          password: 'admin123',
          name: 'Administrador',
          role: 'admin',
          phone: '+1234567890',
          address: 'Dirección del restaurante',
          createdAt: new Date().toISOString(),
          active: true
        },
        {
          id: 'user-001',
          username: 'cliente',
          email: 'cliente@example.com',
          password: 'cliente123',
          name: 'Cliente Ejemplo',
          role: 'customer',
          phone: '+0987654321',
          address: 'Dirección del cliente',
          createdAt: new Date().toISOString(),
          active: true
        }
      ];
      await this.writeDbFile('users', defaultUsers);
    }

    // Inicializar productos
    const products = await this.readDbFile('products');
    if (products.length === 0) {
      await this.writeDbFile('products', []);
    }

    // Inicializar pedidos
    const orders = await this.readDbFile('orders');
    if (orders.length === 0) {
      await this.writeDbFile('orders', []);
    }

    // Inicializar reseñas
    const reviews = await this.readDbFile('reviews');
    if (reviews.length === 0) {
      const defaultReviews = [
        {
          id: 'review-001',
          userId: 'user-001',
          userName: 'María García',
          rating: 5,
          comment: 'Excelente comida y servicio. Las hamburguesas están deliciosas y el ambiente es muy acogedor.',
          approved: true,
          isApproved: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          moderatedBy: 'admin-001',
          moderatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'review-002',
          userId: 'user-002',
          userName: 'Carlos López',
          rating: 4,
          comment: 'Muy buena experiencia. La comida llegó rápido y caliente. Definitivamente volveré.',
          approved: true,
          isApproved: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          moderatedBy: 'admin-001',
          moderatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'review-003',
          userId: 'user-003',
          userName: 'Ana Martínez',
          rating: 5,
          comment: 'Las mejores hamburguesas de la ciudad. El personal es muy amable y el lugar está siempre limpio.',
          approved: true,
          isApproved: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          moderatedBy: 'admin-001',
          moderatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      await this.writeDbFile('reviews', defaultReviews);
    }

    // Inicializar logs de actividad
    const activityLogs = await this.readDbFile('activity_logs');
    if (activityLogs.length === 0) {
      await this.writeDbFile('activity_logs', []);
    }

    console.log('Base de datos híbrida inicializada correctamente');
  }

  // Generar ID único
  generateId(prefix = 'id') {
    return `${prefix}-${uuidv4()}`;
  }

  // Métodos de usuarios
  async createUser(userData) {
    const users = await this.readDbFile('users');
    
    // Verificar si el email ya existe
    const existingUserByEmail = users.find(user => user.email === userData.email);
    if (existingUserByEmail) {
      throw new Error('Ya existe un usuario con este email');
    }
    
    // Generar username si no se proporciona
    const username = userData.username || userData.email.split('@')[0];
    
    // Verificar si el username ya existe
    const existingUserByUsername = users.find(user => user.username === username);
    if (existingUserByUsername) {
      throw new Error('Ya existe un usuario con este nombre de usuario');
    }
    
    const newUser = {
      id: this.generateId('user'),
      username,
      ...userData,
      createdAt: new Date().toISOString(),
      active: true
    };
    users.push(newUser);
    await this.writeDbFile('users', users);
    return newUser;
  }

  async getUserByEmail(email) {
    const users = await this.readDbFile('users');
    return users.find(user => user.email === email);
  }

  async getUserByUsername(username) {
    const users = await this.readDbFile('users');
    return users.find(user => user.username === username);
  }

  async getUserById(id) {
    const users = await this.readDbFile('users');
    return users.find(user => user.id === id);
  }

  async getAllUsers() {
    return await this.readDbFile('users');
  }

  async updateUser(userId, updates) {
    const users = await this.readDbFile('users');
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      await this.writeDbFile('users', users);
      return users[userIndex];
    }
    return null;
  }

  // Métodos de reseñas
  async createReview(reviewData) {
    const reviews = await this.readDbFile('reviews');
    const newReview = {
      id: this.generateId('review'),
      ...reviewData,
      createdAt: new Date().toISOString(),
      approved: false,
      isApproved: false
    };
    reviews.push(newReview);
    await this.writeDbFile('reviews', reviews);
    return newReview;
  }

  async addReview(reviewData) {
    return await this.createReview(reviewData);
  }

  async getAllReviews(includeUnapproved = false) {
    const reviews = await this.readDbFile('reviews');
    if (includeUnapproved) {
      return reviews;
    }
    return reviews.filter(review => review.approved || review.isApproved);
  }

  async getReviewsByUser(userId) {
    const reviews = await this.readDbFile('reviews');
    return reviews.filter(review => review.userId === userId);
  }

  async updateReviewApproval(reviewId, isApproved, adminId) {
    const reviews = await this.readDbFile('reviews');
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    if (reviewIndex !== -1) {
      reviews[reviewIndex].approved = isApproved;
      reviews[reviewIndex].isApproved = isApproved;
      reviews[reviewIndex].moderatedBy = adminId;
      reviews[reviewIndex].moderatedAt = new Date().toISOString();
      await this.writeDbFile('reviews', reviews);
      
      // Registrar actividad
      await this.logActivity(
        isApproved ? 'review_approved' : 'review_rejected',
        `Reseña ${isApproved ? 'aprobada' : 'rechazada'}: ${reviews[reviewIndex].comment.substring(0, 50)}...`,
        adminId
      );
      
      return reviews[reviewIndex];
    }
    return null;
  }

  async deleteReview(reviewId, adminId) {
    const reviews = await this.readDbFile('reviews');
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    if (reviewIndex !== -1) {
      const deletedReview = reviews[reviewIndex];
      reviews.splice(reviewIndex, 1);
      await this.writeDbFile('reviews', reviews);
      
      // Registrar actividad
      await this.logActivity('review_deleted', `Reseña eliminada: ${deletedReview.comment.substring(0, 50)}...`, adminId);
      
      return true;
    }
    return false;
  }

  // Métodos de pedidos
  async createOrder(orderData) {
    const orders = await this.readDbFile('orders');
    const users = await this.readDbFile('users');
    
    // Obtener información del usuario (permanente o temporal)
    let user = users.find(u => u.id === orderData.userId);
    
    // Si es un usuario temporal y no existe en la base de datos, usar la información del pedido
    if (!user && orderData.isTemporary && orderData.userId.startsWith('temp_')) {
      // Para usuarios temporales, usar la información que viene en orderData
      user = {
        id: orderData.userId,
        name: orderData.customerName || 'Usuario Temporal',
        email: orderData.customerEmail || '',
        phone: orderData.phone || '',
        address: orderData.deliveryAddress || '',
        type: 'temporary',
        isTemporary: true,
        createdAt: new Date().toISOString(),
      };
    }
    
    const newOrder = {
      id: this.generateId('order'),
      user_id: orderData.userId, // Mapear userId a user_id
      items: orderData.items,
      total: orderData.total,
      delivery_address: orderData.deliveryAddress,
      phone: orderData.phone,
      notes: orderData.notes,
      created_at: new Date().toISOString(),
      status: 'pending',
      is_temporary: orderData.isTemporary || false,
      // Agregar información del cliente directamente
      customer: {
        name: orderData.customerName || user?.name || 'Usuario desconocido',
        email: orderData.customerEmail || user?.email || 'Email no disponible',
        phone: orderData.phone || user?.phone || 'No especificado',
        address: orderData.deliveryAddress || user?.address || 'No especificado',
        notes: orderData.notes || '',
        isTemporary: orderData.isTemporary || false
      },
      customerName: orderData.customerName || user?.name || 'Usuario desconocido'
    };
    
    orders.push(newOrder);
    await this.writeDbFile('orders', orders);
    
    // Registrar actividad
    const activityDescription = orderData.isTemporary 
      ? `Nuevo pedido temporal creado: #${newOrder.id}`
      : `Nuevo pedido creado: #${newOrder.id}`;
    await this.logActivity('order_created', activityDescription, orderData.userId);
    
    return newOrder;
  }

  async getAllOrders() {
    const orders = await this.readDbFile('orders');
    const users = await this.readDbFile('users');

    // Combinar datos de pedidos con información del usuario
    const ordersWithUserInfo = orders.map(order => {
      const user = users.find(u => u.id === order.user_id);
      return {
        ...order,
        user_name: user?.name || 'Usuario desconocido',
        user_email: user?.email || 'Email no disponible',
        customer: {
          name: user?.name || 'Usuario desconocido',
          email: user?.email || 'Email no disponible',
          phone: order.phone || user?.phone || 'No especificado',
          address: order.delivery_address || user?.address || 'No especificado',
          notes: order.notes || ''
        },
        customerName: user?.name || 'Usuario desconocido'
      };
    });

    // Ordenar por fecha de creación (más recientes primero)
    ordersWithUserInfo.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return ordersWithUserInfo;
  }

  async getOrdersByUser(userId) {
    const orders = await this.readDbFile('orders');
    const users = await this.readDbFile('users');
    
    // Filtrar pedidos del usuario específico
    const userOrders = orders.filter(order => order.user_id === userId);
    
    // Combinar datos de pedidos con información del usuario
    const ordersWithUserInfo = userOrders.map(order => {
      const user = users.find(u => u.id === order.user_id);
      return {
        ...order,
        user_name: user?.name || 'Usuario desconocido',
        user_email: user?.email || 'Email no disponible',
        customer: {
          name: user?.name || 'Usuario desconocido',
          email: user?.email || 'Email no disponible',
          phone: order.phone || user?.phone || 'No especificado',
          address: order.delivery_address || user?.address || 'No especificado',
          notes: order.notes || ''
        },
        customerName: user?.name || 'Usuario desconocido'
      };
    });

    // Ordenar por fecha de creación (más recientes primero)
    ordersWithUserInfo.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return ordersWithUserInfo;
  }

  // Alias para compatibilidad con OrderManager
  async getUserOrders(userId) {
    return await this.getOrdersByUser(userId);
  }

  async getOrderById(orderId) {
    const orders = await this.readDbFile('orders');
    return orders.find(order => order.id === orderId) || null;
  }

  async updateOrderStatus(orderId, status, adminId) {
    const orders = await this.readDbFile('orders');
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      orders[orderIndex].updated_at = new Date().toISOString();
      await this.writeDbFile('orders', orders);
      
      // Registrar actividad
      await this.logActivity('order_status_updated', `Estado de pedido actualizado a: ${status}`, adminId);
      
      return orders[orderIndex];
    }
    return null;
  }

  async deleteOrder(orderId) {
    const orders = await this.readDbFile('orders');
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      const deletedOrder = orders[orderIndex];
      orders.splice(orderIndex, 1);
      await this.writeDbFile('orders', orders);
      
      // Registrar actividad
      await this.logActivity('order_deleted', `Pedido eliminado: ${deletedOrder.id}`, null);
      
      return true;
    }
    return false;
  }

  // Métodos de logs de actividad
  async logActivity(action, description, userId = null) {
    const logs = await this.readDbFile('activity_logs');
    const newLog = {
      id: this.generateId('log'),
      action,
      description,
      userId,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    await this.writeDbFile('activity_logs', logs);
    return newLog;
  }

  async getActivityLogs(limit = 100) {
    const logs = await this.readDbFile('activity_logs');
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  }

  // Métodos de estadísticas
  async getStats() {
    const users = await this.readDbFile('users');
    const orders = await this.readDbFile('orders');
    const reviews = await this.readDbFile('reviews');

    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalReviews: reviews.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length
    };
  }

  // Métodos de compatibilidad
  async init() {
    if (this.isClient) {
      // En el cliente, no necesitamos inicializar nada especial
      return this;
    } else {
      // En el servidor, asegurar que la base de datos esté inicializada
      await this.initializeDatabase();
      return this;
    }
  }

  async close() {
    console.log('HybridDatabaseService cerrado');
  }
}

const hybridDatabaseService = new HybridDatabaseService();
export default hybridDatabaseService;