import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

class SQLiteDatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), 'database', 'restaurant.db');
    this.init();
  }

  init() {
    try {
      // Asegurar que el directorio database existe
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Conectar a la base de datos
      this.db = new Database(this.dbPath);
      
      // Configurar WAL mode para mejor concurrencia
      this.db.pragma('journal_mode = WAL');
      
      // Crear tablas
      this.createTables();
      
      // Inicializar datos por defecto
      this.initializeDefaultData();
      
      console.log('✅ Base de datos SQLite inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando base de datos SQLite:', error);
      throw error;
    }
  }

  createTables() {
    // Tabla de usuarios con username
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        phone TEXT,
        address TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de productos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image TEXT,
        available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de pedidos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        number TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT,
        client_address TEXT,
        items_json TEXT NOT NULL,
        notes TEXT,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Agregar columna client_address si no existe (para migración)
    try {
      this.db.exec(`ALTER TABLE orders ADD COLUMN client_address TEXT`);
    } catch (error) {
      // La columna ya existe, ignorar el error
    }

    // Tabla de reseñas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        approved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla de logs de actividad
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('✅ Tablas SQLite creadas correctamente');
  }

  initializeDefaultData() {
    // Verificar si ya hay usuarios
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (userCount.count === 0) {
      // Insertar usuarios por defecto
      const insertUser = this.db.prepare(`
        INSERT INTO users (id, username, email, password, name, role, phone, address, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

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
          active: 1
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
          active: 1
        }
      ];

      defaultUsers.forEach(user => {
        insertUser.run(
          user.id, user.username, user.email, user.password, 
          user.name, user.role, user.phone, user.address, user.active
        );
      });

      console.log('✅ Usuarios por defecto creados');
    }

    // Verificar si ya hay productos
    const productCount = this.db.prepare('SELECT COUNT(*) as count FROM products').get();
    
    if (productCount.count === 0) {
      this.populateMenuProducts();
    }
  }

  populateMenuProducts() {
    try {
      // Cargar el archivo menu.json
      const menuPath = path.join(process.cwd(), 'src', 'data', 'menu.json');
      const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
      
      const insertProduct = this.db.prepare(`
        INSERT INTO products (id, name, description, price, category, image, available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      let totalProducts = 0;

      // Procesar cada categoría del menú
      Object.keys(menuData).forEach(category => {
        const products = menuData[category];
        
        products.forEach(product => {
          // Convertir el precio de centavos a pesos (dividir por 100)
          const priceInPesos = product.price / 100;
          
          // Crear descripción a partir de ingredientes si no existe desc
          const description = product.desc || product.ingredients?.join(', ') || '';
          
          // Usar el ID original del menú
          const productId = product.id.toString();
          
          insertProduct.run(
            productId,
            product.name,
            description,
            priceInPesos,
            category,
            product.image || null,
            1 // available = true
          );
          
          totalProducts++;
        });
      });

      console.log(`✅ ${totalProducts} productos del menú cargados en la base de datos`);
      
      // Verificar el total final
      const finalCount = this.db.prepare('SELECT COUNT(*) as count FROM products').get();
      console.log(`📊 Total de productos en la base de datos: ${finalCount.count}`);
    } catch (error) {
      console.error('❌ Error al cargar productos del menú:', error);
    }
  }

  // Generar ID único
  generateId(prefix = 'id') {
    return `${prefix}-${uuidv4()}`;
  }

  // ==================== MÉTODOS DE USUARIOS ====================

  async createUser(userData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, email, password, name, role, phone, address, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const newUser = {
      id: this.generateId('user'),
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role || 'customer',
      phone: userData.phone || null,
      address: userData.address || null,
      active: 1
    };

    try {
      stmt.run(
        newUser.id, newUser.username, newUser.email, newUser.password,
        newUser.name, newUser.role, newUser.phone, newUser.address, newUser.active
      );
      
      // Obtener el usuario creado con la fecha de registro automática
      const createdUser = this.db.prepare('SELECT * FROM users WHERE id = ?').get(newUser.id);
      return createdUser;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        if (error.message.includes('username')) {
          throw new Error('El nombre de usuario ya existe');
        }
        if (error.message.includes('email')) {
          throw new Error('El email ya está registrado');
        }
      }
      throw error;
    }
  }

  async getUserByUsername(username) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  async getUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  async getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  async getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all();
  }

  async updateUser(userId, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(userId);
    const stmt = this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  async deleteUser(userId) {
    // Verificar que el usuario existe
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que no sea el último administrador
    if (user.role === 'admin') {
      const adminCount = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ? AND active = 1').get('admin');
      if (adminCount.count <= 1) {
        throw new Error('No se puede eliminar el último administrador del sistema');
      }
    }

    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(userId);
    
    if (result.changes > 0) {
      await this.logActivity('user_deleted', `Usuario ${user.email} eliminado`, userId);
    }
    
    return result.changes > 0;
  }

  // ==================== MÉTODOS DE PRODUCTOS ====================

  async getProducts() {
    const stmt = this.db.prepare('SELECT * FROM products WHERE available = 1 ORDER BY category, name');
    return stmt.all();
  }

  async getProductById(productId) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ? AND available = 1');
    return stmt.get(productId);
  }

  async getAllProducts() {
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY category, name');
    return stmt.all();
  }

  async createProduct(productData) {
    const stmt = this.db.prepare(`
      INSERT INTO products (id, name, description, price, category, image, available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const newProduct = {
      id: this.generateId('prod'),
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      category: productData.category,
      image: productData.image || null,
      available: productData.available !== undefined ? productData.available : 1
    };

    try {
      stmt.run(
        newProduct.id, newProduct.name, newProduct.description,
        newProduct.price, newProduct.category, newProduct.image, newProduct.available
      );
      
      // Registrar actividad
      await this.logActivity('PRODUCT_CREATE', `Producto creado: ${newProduct.name}`);
      
      return this.db.prepare('SELECT * FROM products WHERE id = ?').get(newProduct.id);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }

  async updateProduct(productId, updates) {
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        
        // Convertir valores a tipos compatibles con SQLite
        let value = updates[key];
        if (typeof value === 'boolean') {
          value = value ? 1 : 0;
        } else if (value === null || value === undefined) {
          value = null;
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(productId);
    const stmt = this.db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
    
    try {
      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        throw new Error('Producto no encontrado');
      }

      // Registrar actividad
      await this.logActivity('PRODUCT_UPDATE', `Producto actualizado: ${productId}`);
      
      return this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    // Soft delete - marcar como no disponible
    const stmt = this.db.prepare('UPDATE products SET available = 0 WHERE id = ?');
    
    try {
      const result = stmt.run(productId);
      
      if (result.changes === 0) {
        throw new Error('Producto no encontrado');
      }

      // Registrar actividad
      await this.logActivity('PRODUCT_DELETE', `Producto eliminado: ${productId}`);
      
      return { success: true, message: 'Producto eliminado correctamente' };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  async hardDeleteProduct(productId) {
    // Hard delete - eliminar completamente de la base de datos
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    
    try {
      const result = stmt.run(productId);
      
      if (result.changes === 0) {
        throw new Error('Producto no encontrado');
      }

      // Registrar actividad
      await this.logActivity('PRODUCT_HARD_DELETE', `Producto eliminado permanentemente: ${productId}`);
      
      return { success: true, message: 'Producto eliminado permanentemente' };
    } catch (error) {
      console.error('Error al eliminar producto permanentemente:', error);
      throw error;
    }
  }

  async getProductsByCategory(category) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE category = ? AND available = 1 ORDER BY name');
    return stmt.all(category);
  }

  async getProductCategories() {
    const stmt = this.db.prepare('SELECT DISTINCT category FROM products WHERE available = 1 ORDER BY category');
    return stmt.all().map(row => row.category);
  }

  async toggleProductAvailability(productId) {
    const product = this.db.prepare('SELECT available FROM products WHERE id = ?').get(productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const newAvailability = product.available ? 0 : 1;
    const stmt = this.db.prepare('UPDATE products SET available = ? WHERE id = ?');
    
    try {
      stmt.run(newAvailability, productId);
      
      // Registrar actividad
      const action = newAvailability ? 'habilitado' : 'deshabilitado';
      await this.logActivity('PRODUCT_TOGGLE', `Producto ${action}: ${productId}`);
      
      return this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    } catch (error) {
      console.error('Error al cambiar disponibilidad del producto:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS DE PEDIDOS ====================

  async createOrder(orderData) {
    const stmt = this.db.prepare(`
      INSERT INTO orders (id, number, date, client_name, client_email, client_phone, 
                         client_address, items_json, notes, subtotal, tax, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const newOrder = {
      id: this.generateId('order'),
      number: orderData.number,
      date: orderData.date,
      client_name: orderData.client_name,
      client_email: orderData.client_email,
      client_phone: orderData.client_phone || null,
      client_address: orderData.client_address || null,
      items_json: orderData.items_json || JSON.stringify(orderData.items || []),
      notes: orderData.notes || null,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      total: orderData.total,
      status: orderData.status || 'pending'
    };

    stmt.run(
      newOrder.id, newOrder.number, newOrder.date, newOrder.client_name,
      newOrder.client_email, newOrder.client_phone, newOrder.client_address, newOrder.items_json,
      newOrder.notes, newOrder.subtotal, newOrder.tax, newOrder.total, newOrder.status
    );

    // Parsear items_json para devolver los items como array
    const items = newOrder.items_json ? JSON.parse(newOrder.items_json) : [];
    return { ...newOrder, items };
  }

  async getAllOrders() {
    const stmt = this.db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = stmt.all();
    
    return orders.map(order => ({
      ...order,
      items: JSON.parse(order.items_json)
    }));
  }

  async getOrdersByUser(userId) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE client_email = (SELECT email FROM users WHERE id = ?) ORDER BY created_at DESC');
    const orders = stmt.all(userId);
    
    return orders.map(order => ({
      ...order,
      items: JSON.parse(order.items_json)
    }));
  }

  async updateOrderStatus(orderId, status, adminId) {
    const stmt = this.db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    const result = stmt.run(status, orderId);
    
    if (result.changes > 0) {
      if (adminId) {
        await this.logActivity('order_status_update', `Pedido ${orderId} actualizado a ${status}`, adminId);
      }
      
      // Devolver el pedido actualizado
      return await this.getOrderById(orderId);
    }
    
    return null;
  }

  async getOrderById(orderId) {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
    const order = stmt.get(orderId);
    
    if (!order) {
      return null;
    }
    
    return {
      ...order,
      items: JSON.parse(order.items_json),
      // Mapear campos del cliente para compatibilidad con el frontend
      customerName: order.client_name,
      customerEmail: order.client_email,
      phone: order.client_phone,
      deliveryAddress: order.client_address || 'Dirección no especificada',
      customer: {
        name: order.client_name,
        email: order.client_email,
        phone: order.client_phone,
        address: order.client_address || 'Dirección no especificada'
      }
    };
  }

  async updateOrder(orderId, updateData) {
    try {
      // Verificar que el pedido existe
      const existingOrder = await this.getOrderById(orderId);
      if (!existingOrder) {
        return null;
      }

      // Preparar los campos a actualizar
      const updateFields = [];
      const updateValues = [];

      if (updateData.client_name !== undefined) {
        updateFields.push('client_name = ?');
        updateValues.push(updateData.client_name);
      }
      if (updateData.client_email !== undefined) {
        updateFields.push('client_email = ?');
        updateValues.push(updateData.client_email);
      }
      if (updateData.client_phone !== undefined) {
        updateFields.push('client_phone = ?');
        updateValues.push(updateData.client_phone);
      }
      if (updateData.client_address !== undefined) {
        updateFields.push('client_address = ?');
        updateValues.push(updateData.client_address);
      }
      if (updateData.items !== undefined) {
        updateFields.push('items_json = ?');
        updateValues.push(JSON.stringify(updateData.items));
      }
      if (updateData.notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(updateData.notes);
      }
      if (updateData.subtotal !== undefined) {
        updateFields.push('subtotal = ?');
        updateValues.push(parseFloat(updateData.subtotal));
      }
      if (updateData.tax !== undefined) {
        updateFields.push('tax = ?');
        updateValues.push(parseFloat(updateData.tax));
      }
      if (updateData.total !== undefined) {
        updateFields.push('total = ?');
        updateValues.push(parseFloat(updateData.total));
      }
      if (updateData.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(updateData.status);
      }

      if (updateFields.length === 0) {
        return existingOrder; // No hay nada que actualizar
      }

      // Agregar el ID al final para la cláusula WHERE
      updateValues.push(orderId);

      const sql = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...updateValues);

      if (result.changes > 0) {
        // Registrar la actividad
        await this.logActivity('order_updated', `Pedido ${orderId} actualizado`, updateData.adminId || null);
        
        // Devolver el pedido actualizado
        return await this.getOrderById(orderId);
      }

      return null;
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  async deleteOrder(orderId) {
    try {
      // Verificar que el pedido existe
      const existingOrder = await this.getOrderById(orderId);
      if (!existingOrder) {
        return false;
      }

      const stmt = this.db.prepare('DELETE FROM orders WHERE id = ?');
      const result = stmt.run(orderId);

      if (result.changes > 0) {
        // Registrar la actividad
        await this.logActivity('order_deleted', `Pedido ${orderId} eliminado`, null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  // ==================== MÉTODOS DE RESEÑAS ====================

  async createReview(reviewData) {
    const stmt = this.db.prepare(`
      INSERT INTO reviews (id, user_id, user_name, rating, comment, approved)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const newReview = {
      id: this.generateId('review'),
      user_id: reviewData.user_id || null,
      user_name: reviewData.userName || reviewData.user_name || 'Usuario Anónimo',
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      approved: reviewData.approved ? 1 : 0
    };

    stmt.run(
      newReview.id, newReview.user_id, newReview.user_name,
      newReview.rating, newReview.comment, newReview.approved
    );

    return newReview;
  }

  async getAllReviews(includeUnapproved = false) {
    const condition = includeUnapproved ? '' : 'WHERE approved = 1';
    const stmt = this.db.prepare(`SELECT * FROM reviews ${condition} ORDER BY created_at DESC`);
    return stmt.all();
  }

  async updateReviewApproval(reviewId, isApproved, adminId) {
    const stmt = this.db.prepare('UPDATE reviews SET approved = ? WHERE id = ?');
    const result = stmt.run(isApproved ? 1 : 0, reviewId);
    
    if (result.changes > 0 && adminId) {
      const action = isApproved ? 'aprobada' : 'rechazada';
      await this.logActivity('review_approval', `Reseña ${reviewId} ${action}`, adminId);
    }
    
    return result.changes > 0;
  }

  async deleteReview(reviewId, adminId) {
    const stmt = this.db.prepare('DELETE FROM reviews WHERE id = ?');
    const result = stmt.run(reviewId);
    
    if (result.changes > 0 && adminId) {
      await this.logActivity('review_deleted', `Reseña ${reviewId} eliminada`, adminId);
    }
    
    return result.changes > 0;
  }

  // ==================== MÉTODOS DE LOGS ====================

  async logActivity(action, description, userId = null) {
    try {
      if (!this.db) {
        console.error('Database not initialized');
        return null;
      }

      // Validar que el usuario existe si se proporciona un userId
      if (userId) {
        const userExists = this.db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
        if (!userExists) {
          console.warn(`Usuario ${userId} no existe, registrando actividad sin usuario`);
          userId = null;
        }
      }

      const stmt = this.db.prepare(`
        INSERT INTO activity_logs (id, action, description, user_id)
        VALUES (?, ?, ?, ?)
      `);

      const logEntry = {
        id: this.generateId('log'),
        action,
        description,
        user_id: userId
      };

      stmt.run(logEntry.id, logEntry.action, logEntry.description, logEntry.user_id);
      return logEntry;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  async getActivityLogs(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT al.*, u.name as user_name 
      FROM activity_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  // ==================== MÉTODOS DE ESTADÍSTICAS ====================

  async getStats() {
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalOrders = this.db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalReviews = this.db.prepare('SELECT COUNT(*) as count FROM reviews WHERE approved = 1').get().count;
    const totalRevenue = this.db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM orders').get().total;

    return {
      totalUsers,
      totalOrders,
      totalReviews,
      totalRevenue
    };
  }

  // ==================== MÉTODOS DE GESTIÓN ====================

  close() {
    if (this.db) {
      this.db.close();
      console.log('✅ Conexión a base de datos SQLite cerrada');
    }
  }

  // Método para migrar datos desde localStorage (si es necesario)
  async migrateFromLocalStorage(localStorageData) {
    try {
      // Migrar usuarios
      if (localStorageData.users && localStorageData.users.length > 0) {
        const insertUser = this.db.prepare(`
          INSERT OR IGNORE INTO users (id, username, email, password, name, role, phone, address, active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        localStorageData.users.forEach(user => {
          // Generar username si no existe
          const username = user.username || user.email.split('@')[0];
          insertUser.run(
            user.id, username, user.email, user.password,
            user.name, user.role, user.phone, user.address, user.active ? 1 : 0
          );
        });
      }

      // Migrar pedidos
      if (localStorageData.orders && localStorageData.orders.length > 0) {
        const insertOrder = this.db.prepare(`
          INSERT OR IGNORE INTO orders (id, number, date, client_name, client_email, client_phone,
                                       items_json, notes, subtotal, tax, total, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        localStorageData.orders.forEach(order => {
          insertOrder.run(
            order.id, order.number, order.date, order.client_name,
            order.client_email, order.client_phone, JSON.stringify(order.items),
            order.notes, order.subtotal, order.tax, order.total, order.status
          );
        });
      }

      console.log('✅ Migración desde localStorage completada');
    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw error;
    }
  }
}

// Crear instancia única
const sqliteDatabase = new SQLiteDatabaseService();

export default sqliteDatabase;