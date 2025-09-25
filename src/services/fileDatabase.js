import fs from 'fs';
import path from 'path';

class FileDatabaseService {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'database');
    this.ensureDbDirectory();
    this.initializeDatabase();
  }

  // Asegurar que el directorio de base de datos existe
  ensureDbDirectory() {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  // Leer archivo de base de datos
  readDbFile(filename) {
    const filePath = path.join(this.dbPath, `${filename}.bd`);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error(`Error reading ${filename}.bd:`, error);
      return [];
    }
  }

  // Escribir archivo de base de datos
  writeDbFile(filename, data) {
    const filePath = path.join(this.dbPath, `${filename}.bd`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}.bd:`, error);
      return false;
    }
  }

  // Inicializar base de datos con datos por defecto
  initializeDatabase() {
    // Inicializar usuarios
    const users = this.readDbFile('users');
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
      this.writeDbFile('users', defaultUsers);
    }

    // Inicializar productos
    const products = this.readDbFile('products');
    if (products.length === 0) {
      // Aquí puedes agregar productos por defecto si es necesario
      this.writeDbFile('products', []);
    }

    // Inicializar pedidos
    const orders = this.readDbFile('orders');
    if (orders.length === 0) {
      this.writeDbFile('orders', []);
    }

    // Inicializar reseñas
    const reviews = this.readDbFile('reviews');
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
      this.writeDbFile('reviews', defaultReviews);
    }

    // Inicializar logs de actividad
    const activityLogs = this.readDbFile('activity_logs');
    if (activityLogs.length === 0) {
      this.writeDbFile('activity_logs', []);
    }
  }

  // Generar ID único
  generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // === FUNCIONES DE USUARIOS ===
  
  createUser(userData) {
    const users = this.readDbFile('users');
    const newUser = {
      id: this.generateId('user'),
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    users.push(newUser);
    this.writeDbFile('users', users);
    return newUser;
  }

  getUserByEmail(email) {
    const users = this.readDbFile('users');
    return users.find(user => user.email === email);
  }

  getUserById(id) {
    const users = this.readDbFile('users');
    return users.find(user => user.id === id);
  }

  getAllUsers() {
    return this.readDbFile('users');
  }

  updateUser(userId, updates) {
    const users = this.readDbFile('users');
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      this.writeDbFile('users', users);
      return users[userIndex];
    }
    return null;
  }

  // === FUNCIONES DE RESEÑAS ===

  createReview(reviewData) {
    const reviews = this.readDbFile('reviews');
    const newReview = {
      id: this.generateId('review'),
      ...reviewData,
      approved: false,
      isApproved: false,
      createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    this.writeDbFile('reviews', newReview);
    this.logActivity('review_created', `Nueva reseña creada por ${reviewData.userName}`, reviewData.userId);
    return newReview;
  }

  addReview(reviewData) {
    return this.createReview(reviewData);
  }

  getAllReviews(includeUnapproved = false) {
    const reviews = this.readDbFile('reviews');
    if (includeUnapproved) {
      return reviews;
    }
    return reviews.filter(review => review.approved === true || review.isApproved === true);
  }

  getReviewsByUser(userId) {
    const reviews = this.readDbFile('reviews');
    return reviews.filter(review => review.userId === userId);
  }

  updateReviewApproval(reviewId, isApproved, adminId) {
    const reviews = this.readDbFile('reviews');
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    
    if (reviewIndex !== -1) {
      reviews[reviewIndex].approved = isApproved;
      reviews[reviewIndex].isApproved = isApproved;
      reviews[reviewIndex].moderatedBy = adminId;
      reviews[reviewIndex].moderatedAt = new Date().toISOString();
      
      this.writeDbFile('reviews', reviews);
      this.logActivity(
        isApproved ? 'review_approved' : 'review_rejected',
        `Reseña ${isApproved ? 'aprobada' : 'rechazada'} por administrador`,
        adminId
      );
      return reviews[reviewIndex];
    }
    return null;
  }

  deleteReview(reviewId, adminId) {
    const reviews = this.readDbFile('reviews');
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    
    if (reviewIndex !== -1) {
      const deletedReview = reviews.splice(reviewIndex, 1)[0];
      this.writeDbFile('reviews', reviews);
      this.logActivity('review_deleted', `Reseña eliminada por administrador`, adminId);
      return deletedReview;
    }
    return null;
  }

  // === FUNCIONES DE PEDIDOS ===

  createOrder(orderData) {
    const orders = this.readDbFile('orders');
    const newOrder = {
      id: this.generateId('order'),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    this.writeDbFile('orders', orders);
    this.logActivity('order_created', `Nuevo pedido creado`, orderData.userId);
    return newOrder;
  }

  getAllOrders() {
    return this.readDbFile('orders');
  }

  getOrdersByUser(userId) {
    const orders = this.readDbFile('orders');
    return orders.filter(order => order.userId === userId);
  }

  updateOrderStatus(orderId, status, adminId) {
    const orders = this.readDbFile('orders');
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date().toISOString();
      this.writeDbFile('orders', orders);
      this.logActivity('order_updated', `Estado de pedido actualizado a ${status}`, adminId);
      return orders[orderIndex];
    }
    return null;
  }

  // === FUNCIONES DE LOGS DE ACTIVIDAD ===

  logActivity(action, description, userId = null) {
    const logs = this.readDbFile('activity_logs');
    const newLog = {
      id: this.generateId('log'),
      action,
      description,
      userId,
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    this.writeDbFile('activity_logs', logs);
    return newLog;
  }

  getActivityLogs(limit = 100) {
    const logs = this.readDbFile('activity_logs');
    return logs.slice(-limit).reverse(); // Últimos logs primero
  }

  // === FUNCIONES DE ESTADÍSTICAS ===

  getStats() {
    const users = this.readDbFile('users');
    const orders = this.readDbFile('orders');
    const reviews = this.readDbFile('reviews');
    
    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalReviews: reviews.length,
      approvedReviews: reviews.filter(r => r.approved || r.isApproved).length,
      pendingReviews: reviews.filter(r => !r.approved && !r.isApproved).length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length
    };
  }
}

// Crear instancia única del servicio
const fileDatabaseService = new FileDatabaseService();
export default fileDatabaseService;