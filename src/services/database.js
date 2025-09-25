// import sqlite3 from 'sqlite3';
// import { open } from 'sqlite';
// import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

class DatabaseService {
  constructor() {
    this.dbName = 'RestaurantDB';
    this.dbVersion = 1;
    this.db = null;
    this.initializeDatabase();
  }

  // Inicializar IndexedDB
  async initializeDatabase() {
    try {
      this.db = await this.openDatabase();
      await this.loadDefaultData();
    } catch (error) {
      console.error('Error initializing database:', error);
      // Fallback a localStorage si IndexedDB falla
      this.initializeLocalStorageDatabase();
    }
  }

  // Abrir conexión a IndexedDB
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Crear object stores (equivalente a tablas)
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('reviews')) {
          db.createObjectStore('reviews', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('activity_logs')) {
          db.createObjectStore('activity_logs', { keyPath: 'id' });
        }
      };
    });
  }

  // Leer datos de un "archivo" .bd (object store)
  async readDbFile(storeName) {
    if (!this.db) {
      // Fallback a localStorage
      const data = localStorage.getItem(storeName);
      return data ? JSON.parse(data) : [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Escribir datos a un "archivo" .bd (object store)
  async writeDbFile(storeName, data) {
    if (!this.db) {
      // Fallback a localStorage
      localStorage.setItem(storeName, JSON.stringify(data));
      return true;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Limpiar store y agregar todos los datos
      store.clear();
      data.forEach(item => store.add(item));
      
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Cargar datos por defecto
  async loadDefaultData() {
    // Inicializar usuarios por defecto
    const users = await this.readDbFile('users');
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: 'admin-001',
          email: 'admin@restaurant.com',
          password: 'admin123',
          name: 'Administrador',
          role: 'admin',
          phone: '+1234567890',
          address: 'Dirección del restaurante',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'user-001',
          email: 'cliente@example.com',
          password: 'cliente123',
          name: 'Cliente Ejemplo',
          role: 'customer',
          phone: '+0987654321',
          address: 'Dirección del cliente',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ];
      await this.writeDbFile('users', defaultUsers);
    }

    // Inicializar otras colecciones vacías si no existen
     const orders = await this.readDbFile('orders');
     if (orders.length === 0) {
       await this.writeDbFile('orders', []);
     }

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

    const products = await this.readDbFile('products');
    if (products.length === 0) {
      await this.writeDbFile('products', []);
    }

    const activityLogs = await this.readDbFile('activity_logs');
    if (activityLogs.length === 0) {
      await this.writeDbFile('activity_logs', []);
    }

    console.log('Base de datos (IndexedDB) inicializada correctamente');
   }

   // === FUNCIONES DE ESTADÍSTICAS ===

   async getStats() {
     try {
       const users = await this.readDbFile('users');
       const orders = await this.readDbFile('orders');
       const reviews = await this.readDbFile('reviews');
       
       return {
         totalUsers: users.length,
         totalOrders: orders.length,
         totalReviews: reviews.length,
         approvedReviews: reviews.filter(r => r.approved || r.isApproved).length,
         pendingReviews: reviews.filter(r => !r.approved && !r.isApproved).length,
         pendingOrders: orders.filter(o => o.status === 'pending').length,
         completedOrders: orders.filter(o => o.status === 'completed').length
       };
     } catch (error) {
       console.error('Error getting stats:', error);
       return {
         totalUsers: 0,
         totalOrders: 0,
         totalReviews: 0,
         approvedReviews: 0,
         pendingReviews: 0,
         pendingOrders: 0,
         completedOrders: 0
       };
     }
   }

   // Fallback para localStorage
   initializeLocalStorageDatabase() {
    console.log('Usando localStorage como fallback');
    this.storage = typeof window !== 'undefined' ? localStorage : null;
    
    if (this.storage && !this.storage.getItem('users')) {
      this.storage.setItem('users', JSON.stringify([]));
      this.storage.setItem('orders', JSON.stringify([]));
      this.storage.setItem('products', JSON.stringify([]));
      this.storage.setItem('activity_logs', JSON.stringify([]));
      this.storage.setItem('reviews', JSON.stringify([]));
    }
    this.createDefaultAdmin();
  }

  // Método createTables no necesario para localStorage
  // Los datos se almacenan directamente como JSON en localStorage
  async createTables() {
    // No es necesario crear tablas para localStorage
    console.log('Usando localStorage - no se requieren tablas');
  }

  async createDefaultAdmin() {
    const users = await this.getAllUsers();
    const adminExists = users.some(user => user.email === 'admin@restaurant.com');
    
    if (!adminExists) {
      const adminUser = {
        id: uuidv4(),
        name: 'Administrador',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        created_at: new Date().toISOString()
      };
      
      users.push(adminUser);
      this.storage.setItem('users', JSON.stringify(users));
    }
  }

  // Métodos para usuarios
  async createUser(userData) {
    const { email, password, name, phone, address, role = 'customer', active = true } = userData;
    const userId = uuidv4();

    try {
      // Verificar si el email ya existe
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Crear nuevo usuario
      const newUser = {
        id: userId,
        email,
        password, // En producción, esto debería estar hasheado
        name,
        phone,
        address,
        role,
        active,
        created_at: new Date().toISOString()
      };

      // Obtener usuarios existentes y agregar el nuevo
      const users = await this.readDbFile('users');
      users.push(newUser);
      await this.writeDbFile('users', users);

      // Registrar actividad
      await this.logActivity('USER_REGISTERED', `Usuario registrado: ${email}`, userId);
      
      // Retornar usuario sin contraseña
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    const users = await this.readDbFile('users');
    return users.find(user => user.email === email) || null;
  }

  async getUserById(id) {
    const users = await this.readDbFile('users');
    return users.find(user => user.id === id) || null;
  }

  async updateUser(id, userData) {
    try {
      const users = await this.readDbFile('users');
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex !== -1) {
        // Actualizar solo los campos proporcionados
        users[userIndex] = {
          ...users[userIndex],
          ...userData,
          updated_at: new Date().toISOString()
        };
        
        await this.writeDbFile('users', users);
        
        // Log específico según el tipo de actualización
        const logMessage = userData.active !== undefined 
          ? `Usuario ${userData.active ? 'activado' : 'desactivado'}` 
          : 'Perfil actualizado';
        await this.logActivity('USER_UPDATED', logMessage, id);
        return await this.getUserById(id);
      }
      
      throw new Error('Usuario no encontrado');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.readDbFile('users');
      return users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  async deleteUser(userId) {
    try {
      const users = await this.readDbFile('users');
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }

      const deletedUser = users[userIndex];
      
      // Verificar que no sea el último administrador
      if (deletedUser.role === 'admin') {
        const adminCount = users.filter(user => user.role === 'admin').length;
        if (adminCount <= 1) {
          throw new Error('No se puede eliminar el último administrador del sistema');
        }
      }

      // Eliminar usuario
      users.splice(userIndex, 1);
      await this.writeDbFile('users', users);

      // Registrar actividad
      await this.logActivity('USER_DELETED', `Usuario eliminado: ${deletedUser.email}`, userId);
      
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Métodos para pedidos
  async createOrder(orderData) {
    const { userId, items, total, deliveryAddress, phone, notes } = orderData;
    const orderId = uuidv4();

    try {
      // Obtener pedidos existentes
      const orders = await this.readDbFile('orders');
      
      // Crear el nuevo pedido
      const newOrder = {
        id: orderId,
        user_id: userId,
        total: total,
        delivery_address: deliveryAddress,
        phone: phone,
        notes: notes,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: items.map(item => ({
          id: uuidv4(),
          order_id: orderId,
          product_id: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations || {},
          product_name: item.name
        }))
      };

      // Agregar el pedido a la lista
      orders.push(newOrder);
      await this.writeDbFile('orders', orders);

      // Registrar actividad
      await this.logActivity('ORDER_CREATED', `Pedido creado: ${orderId}`, userId);

      return newOrder;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const orders = await this.readDbFile('orders');
      const users = await this.readDbFile('users');
      
      const order = orders.find(o => o.id === orderId);
      
      if (order) {
        // Enriquecer con información del usuario
        const user = users.find(u => u.id === order.user_id);
        return {
          ...order,
          user_name: user?.name || 'Usuario desconocido',
          user_email: user?.email || 'Email desconocido'
        };
      }

      return null;
    } catch (error) {
      console.error('Error al obtener pedido por ID:', error);
      return null;
    }
  }

  async getUserOrders(userId) {
    try {
      // Obtener pedidos usando readDbFile
      const allOrders = await this.readDbFile('orders');
      
      // Filtrar pedidos por userId
      const userOrders = allOrders.filter(order => order.userId === userId || order.user_id === userId);
      
      // Ordenar por fecha de creación (más recientes primero)
      userOrders.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      
      return userOrders;
    } catch (error) {
      console.error('Error al obtener pedidos del usuario:', error);
      return [];
    }
  }

  async getAllOrders() {
    try {
      const orders = await this.readDbFile('orders');
      const users = await this.readDbFile('users');

      // Combinar datos de pedidos con información del usuario
      const ordersWithUserInfo = orders.map(order => {
        const user = users.find(u => u.id === order.user_id);
        return {
          ...order,
          user_name: user?.name || 'Usuario desconocido',
          user_email: user?.email || 'Email no disponible',
          // Agregar objeto customer para compatibilidad con AdminDashboard
          customer: {
            name: user?.name || 'Usuario desconocido',
            email: user?.email || 'Email no disponible',
            phone: order.phone || user?.phone || 'No especificado',
            address: order.delivery_address || user?.address || 'No especificado',
            notes: order.notes || ''
          },
          // También agregar campos directos para compatibilidad
          customerName: user?.name || 'Usuario desconocido'
        };
      });

      // Ordenar por fecha de creación (más recientes primero)
      ordersWithUserInfo.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return ordersWithUserInfo;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId, status, adminId, additionalData = {}) {
    try {
      const orders = await this.readDbFile('orders');
      const orderIndex = orders.findIndex(o => o.id === orderId);
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updated_at = new Date().toISOString();
        
        // Agregar información adicional si se proporciona
        if (additionalData.receivedBy) {
          orders[orderIndex].receivedBy = additionalData.receivedBy;
        }
        if (additionalData.deliveredAt) {
          orders[orderIndex].deliveredAt = additionalData.deliveredAt;
        }
        
        await this.writeDbFile('orders', orders);
        
        const logMessage = additionalData.receivedBy 
          ? `Pedido ${orderId} actualizado a ${status}. Recibido por: ${additionalData.receivedBy}`
          : `Pedido ${orderId} actualizado a ${status}`;
        
        await this.logActivity('ORDER_STATUS_UPDATED', logMessage, adminId);
        return await this.getOrderById(orderId);
      }
      
      throw new Error('Pedido no encontrado');
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }

  async deleteOrder(orderId) {
    try {
      const orders = await this.readDbFile('orders');
      const orderIndex = orders.findIndex(o => o.id === orderId);
      
      if (orderIndex !== -1) {
        const deletedOrder = orders[orderIndex];
        orders.splice(orderIndex, 1);
        await this.writeDbFile('orders', orders);
        
        // Registrar la actividad de eliminación
        await this.logActivity('ORDER_DELETED', `Pedido ${orderId} eliminado`, 'admin');
        
        return { 
          success: true, 
          message: 'Pedido eliminado exitosamente',
          deletedOrder 
        };
      }
      
      return { 
        success: false, 
        error: 'Pedido no encontrado' 
      };
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Métodos para productos
  async syncProducts(products) {
    try {
      // Guardar productos usando writeDbFile
      await this.writeDbFile('products', products);
      console.log(`${products.length} productos sincronizados`);
    } catch (error) {
      console.error('Error al sincronizar productos:', error);
      throw error;
    }
  }

  async getProducts() {
    try {
      const products = await this.readDbFile('products');
      return products.filter(p => p.available !== false).sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  // === FUNCIONES DE LOGS DE ACTIVIDAD ===

  async logActivity(action, description, userId = null) {
    try {
      const logs = await this.readDbFile('activity_logs');
      const newLog = {
        id: uuidv4(),
        action,
        description,
        userId,
        timestamp: new Date().toISOString()
      };
      logs.push(newLog);
      await this.writeDbFile('activity_logs', logs);
      return newLog;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getActivityLogs(limit = 100) {
    try {
      const logs = await this.readDbFile('activity_logs');
      return logs.slice(-limit).reverse(); // Últimos logs primero
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  // Métodos para reseñas
  async createReview(reviewData) {
    try {
      const reviews = await this.readDbFile('reviews');
      
      const review = {
        id: uuidv4(),
        userId: reviewData.userId,
        userName: reviewData.userName,
        rating: reviewData.rating,
        comment: reviewData.comment,
        date: reviewData.date || new Date().toISOString(),
        isApproved: true // Por defecto aprobadas, se puede cambiar para moderación
      };

      reviews.push(review);
      await this.writeDbFile('reviews', reviews);

      // Registrar actividad
      await this.logActivity('review_created', `Reseña creada con rating ${review.rating}`, reviewData.userId);

      return review;
    } catch (error) {
      console.error('Error al crear reseña:', error);
      throw error;
    }
  }

  async getAllReviews(includeUnapproved = false) {
    try {
      const reviews = await this.readDbFile('reviews');
      
      if (includeUnapproved) {
        // Para el panel de administración - devolver todas las reseñas
        return reviews.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      } else {
        // Para la página principal - solo reseñas aprobadas
        return reviews
          .filter(review => review.approved || review.isApproved)
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      }
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      return [];
    }
  }

  // Alias para addReview que usa createReview internamente
  async addReview(reviewData) {
    try {
      const reviews = await this.readDbFile('reviews');
      
      const review = {
        id: uuidv4(),
        userId: reviewData.userId || null,
        userName: reviewData.userName,
        rating: reviewData.rating,
        comment: reviewData.comment,
        approved: reviewData.approved || false, // Por defecto no aprobadas para moderación
        createdAt: reviewData.createdAt || new Date().toISOString(),
        // Mantener compatibilidad con el formato anterior
        isApproved: reviewData.approved || false,
        date: reviewData.createdAt || new Date().toISOString()
      };

      reviews.push(review);
      await this.writeDbFile('reviews', reviews);

      // Registrar actividad si hay userId
      if (reviewData.userId) {
        await this.logActivity('review_created', `Reseña creada con rating ${review.rating}`, reviewData.userId);
      }

      return review;
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      throw error;
    }
  }

  async getReviewsByUser(userId) {
    try {
      const reviews = await this.readDbFile('reviews');
      return reviews
        .filter(review => review.userId === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error al obtener reseñas del usuario:', error);
      return [];
    }
  }

  async updateReviewApproval(reviewId, isApproved, adminId) {
    try {
      const reviews = await this.readDbFile('reviews');
      const reviewIndex = reviews.findIndex(review => review.id === reviewId);
      
      if (reviewIndex === -1) {
        throw new Error('Reseña no encontrada');
      }

      reviews[reviewIndex].isApproved = isApproved;
      reviews[reviewIndex].approved = isApproved; // Mantener compatibilidad con ambos campos
      reviews[reviewIndex].moderatedBy = adminId;
      reviews[reviewIndex].moderatedAt = new Date().toISOString();

      await this.writeDbFile('reviews', reviews);

      // Registrar actividad
      await this.logActivity('review_moderated', `Reseña ${isApproved ? 'aprobada' : 'rechazada'}`, adminId);

      return reviews[reviewIndex];
    } catch (error) {
      console.error('Error al moderar reseña:', error);
      throw error;
    }
  }

  async deleteReview(reviewId, adminId) {
    try {
      const reviews = await this.readDbFile('reviews');
      const reviewIndex = reviews.findIndex(review => review.id === reviewId);
      
      if (reviewIndex === -1) {
        throw new Error('Reseña no encontrada');
      }

      const deletedReview = reviews.splice(reviewIndex, 1)[0];
      await this.writeDbFile('reviews', reviews);

      // Registrar actividad
      await this.logActivity('review_deleted', `Reseña eliminada (rating: ${deletedReview.rating})`, adminId);

      return { success: true, message: 'Reseña eliminada exitosamente' };
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      throw error;
    }
  }

  // Método público para inicializar (compatibilidad)
  async init() {
    // La inicialización ya se hace en el constructor, pero mantenemos este método para compatibilidad
    if (!this.db) {
      await this.initializeDatabase();
    }
    return this;
  }

  // Método para cerrar la conexión
  async close() {
    // No es necesario cerrar localStorage
    console.log('DatabaseService cerrado');
  }
}

export default new DatabaseService();