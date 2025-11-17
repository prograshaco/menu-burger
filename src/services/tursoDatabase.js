import { createClient } from "@libsql/client";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

class TursoDatabaseService {
  constructor() {
    this.client = null;
    this.init();
  }

  async init() {
    try {
      // Crear cliente de Turso
      this.client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });

      console.log("🔗 Conectando a Turso...");

      // Probar la conexión
      await this.client.execute("SELECT 1");

      // Crear tablas
      await this.createTables();

      // Inicializar datos por defecto
      await this.initializeDefaultData();

      console.log("✅ Base de datos Turso inicializada correctamente");
    } catch (error) {
      console.error("❌ Error inicializando base de datos Turso:", error);
      throw error;
    }
  }

  async createTables() {
    try {
      // Tabla de usuarios
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'customer',
          phone TEXT,
          address TEXT,
          active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Agregar columna 'active' si no existe (para bases de datos existentes)
      try {
        await this.client.execute(
          `ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT 1`
        );
      } catch (error) {
        // La columna ya existe, ignorar el error
        if (!error.message.includes("duplicate column name")) {
          console.warn("Error al agregar columna active:", error.message);
        }
      }

      // Tabla de productos
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          category TEXT NOT NULL,
          image_url TEXT,
          available BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Agregar columna 'active' si no existe (para bases de datos existentes)
      try {
        await this.client.execute(
          `ALTER TABLE products ADD COLUMN is_specialty BOOLEAN DEFAULT 1`
        );
      } catch (error) {
        // La columna ya existe, ignorar el error
        if (!error.message.includes("duplicate column name")) {
          console.warn("Error al agregar columna is_specialty:", error.message);
        }
      }

      // Tabla de órdenes
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_name TEXT,
          user_email TEXT,
          user_phone TEXT,
          user_address TEXT,
          items TEXT NOT NULL,
          total REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          notes TEXT,
          notification_method TEXT DEFAULT 'email',
          received_by TEXT,
          delivered_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Agregar columnas nuevas si no existen (para bases de datos existentes)
      try {
        await this.client.execute(`ALTER TABLE orders ADD COLUMN notification_method TEXT DEFAULT 'email'`);
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          console.warn('Error al agregar columna notification_method:', error.message);
        }
      }

      try {
        await this.client.execute(`ALTER TABLE orders ADD COLUMN received_by TEXT`);
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          console.warn('Error al agregar columna received_by:', error.message);
        }
      }

      try {
        await this.client.execute(`ALTER TABLE orders ADD COLUMN delivered_at DATETIME`);
      } catch (error) {
        if (!error.message.includes('duplicate column name')) {
          console.warn('Error al agregar columna delivered_at:', error.message);
        }
      }

      // Tabla de reseñas
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_name TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          approved BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Tabla de logs de actividad
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          description TEXT NOT NULL,
          user_id TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      console.log("✅ Tablas creadas en Turso");
    } catch (error) {
      console.error("❌ Error creando tablas en Turso:", error);
      throw error;
    }
  }

  async initializeDefaultData() {
    try {
      // Verificar si ya existe un admin
      const adminExists = await this.client.execute({
        sql: "SELECT COUNT(*) as count FROM users WHERE role = ?",
        args: ["admin"],
      });

      if (adminExists.rows[0].count === 0) {
        // Crear usuario admin por defecto
        await this.createUser({
          username: "admin",
          email: "admin@restaurant.com",
          password: "admin123", // En producción, usar hash
          name: "Administrador",
          role: "admin",
          phone: "123-456-7890",
        });

        console.log("✅ Usuario admin creado en Turso");
      }

      // Verificar si existen productos
      const productsCount = await this.client.execute(
        "SELECT COUNT(*) as count FROM products"
      );

      if (productsCount.rows[0].count === 0) {
        await this.populateMenuProducts();
        console.log("✅ Productos iniciales creados en Turso");
      }
    } catch (error) {
      console.error(
        "❌ Error inicializando datos por defecto en Turso:",
        error
      );
    }
  }

  async populateMenuProducts() {
    try {
      // Cargar productos desde el archivo menu.json
      const fs = await import("fs");
      const path = await import("path");

      const menuPath = path.join(process.cwd(), "src", "data", "menu.json");

      if (!fs.existsSync(menuPath)) {
        console.log(
          "⚠️ Archivo menu.json no encontrado, creando productos por defecto..."
        );

        const defaultProducts = [
          {
            name: "Hamburguesa Clásica",
            description:
              "Carne de res, lechuga, tomate, cebolla y salsa especial",
            price: 12.99,
            category: "burgers",
            image_url: "/images/burger-classic.jpg",
          },
          {
            name: "Papas Fritas",
            description: "Papas doradas y crujientes",
            price: 4.99,
            category: "papas",
            image_url: "/images/fries.jpg",
          },
          {
            name: "Coca Cola",
            description: "Bebida refrescante 500ml",
            price: 2.99,
            category: "bebidas",
            image_url: "/images/coca-cola.jpg",
          },
        ];

        for (const product of defaultProducts) {
          await this.createProduct(product);
        }
        return;
      }

      const menuData = JSON.parse(fs.readFileSync(menuPath, "utf8"));
      let totalProducts = 0;

      // Procesar cada categoría del menú
      for (const [category, products] of Object.entries(menuData)) {
        for (const product of products) {
          // Convertir el precio de centavos a pesos (dividir por 100)
          const priceInPesos = product.price / 100;

          // Crear descripción a partir de ingredientes si no existe desc
          const description =
            product.desc || product.ingredients?.join(", ") || "";

          const productData = {
            name: product.name,
            description: description,
            price: priceInPesos,
            category: category,
            image_url: product.image || null,
            available: true,
          };

          await this.createProduct(productData);
          totalProducts++;
        }
      }

      console.log(`✅ ${totalProducts} productos del menú cargados en Turso`);
    } catch (error) {
      console.error("❌ Error al cargar productos del menú en Turso:", error);
    }
  }

  generateId(prefix = "id") {
    return `${prefix}_${uuidv4()}`;
  }

  // Métodos de usuarios
  async createUser(userData) {
    try {
      const userId = this.generateId("user");

      await this.client.execute({
        sql: `INSERT INTO users (id, username, email, password, name, role, phone, address) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          userData.username,
          userData.email,
          userData.password,
          userData.name,
          userData.role || "customer",
          userData.phone || null,
          userData.address || null,
        ],
      });

      return { success: true, userId };
    } catch (error) {
      console.error("Error creando usuario en Turso:", error);
      return { success: false, error: error.message };
    }
  }

  async getUserByUsername(username) {
    const result = await this.client.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username],
    });
    return result.rows[0] || null;
  }

  async getUserByEmail(email) {
    const result = await this.client.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email],
    });
    return result.rows[0] || null;
  }

  async getUserById(id) {
    const result = await this.client.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [id],
    });
    return result.rows[0] || null;
  }

  async getAllUsers() {
    const result = await this.client.execute(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    return result.rows;
  }

  async updateUser(userId, updates) {
    try {
      console.log("🔍 Actualizando usuario en Turso:", { userId, updates });

      // Construir la consulta SQL dinámicamente
      const updateFields = [];
      const args = [];

      // Campos permitidos para actualizar
      const allowedFields = [
        "username",
        "email",
        "password",
        "name",
        "role",
        "phone",
        "address",
        "active",
      ];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          args.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error("No hay campos válidos para actualizar");
      }

      // Agregar updated_at
      updateFields.push("updated_at = CURRENT_TIMESTAMP");

      // Agregar el ID del usuario al final
      args.push(userId);

      const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

      console.log("🔍 SQL de actualización:", sql);
      console.log("🔍 Argumentos:", args);

      const result = await this.client.execute({
        sql,
        args,
      });

      if (result.rowsAffected === 0) {
        throw new Error("Usuario no encontrado");
      }

      // Obtener el usuario actualizado
      const updatedUser = await this.getUserById(userId);
      console.log("✅ Usuario actualizado exitosamente:", updatedUser);

      return updatedUser;
    } catch (error) {
      console.error("❌ Error actualizando usuario en Turso:", error);
      throw error;
    }
  }

  // Métodos de productos
  async createProduct(productData) {
    try {
      const productId = this.generateId("prod");

      await this.client.execute({
        sql: `INSERT INTO products (id, name, description, price, category, image_url, available) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          productId,
          productData.name,
          productData.description || "",
          productData.price,
          productData.category,
          productData.image_url || productData.image || "",
          productData.available !== false ? 1 : 0,
        ],
      });

      // Obtener el producto creado
      const createdProduct = await this.getProductById(productId);
      return createdProduct;
    } catch (error) {
      console.error("Error creando producto en Turso:", error);
      throw error;
    }
  }

  async updateProduct(productId, updates) {
    try {
      const updateFields = [];
      const args = [];

      const allowedFields = [
        "name",
        "description",
        "price",
        "category",
        "image_url",
        "available",
      ];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          args.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error("No hay campos válidos para actualizar");
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      args.push(productId);

      const sql = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`;

      const result = await this.client.execute({
        sql,
        args,
      });

      if (result.rowsAffected === 0) {
        throw new Error("Producto no encontrado");
      }

      return await this.getProductById(productId);
    } catch (error) {
      console.error("Error actualizando producto en Turso:", error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      // Soft delete - marcar como no disponible
      const result = await this.client.execute({
        sql: "UPDATE products SET available = 0 WHERE id = ?",
        args: [productId],
      });

      if (result.rowsAffected === 0) {
        return { success: false, error: "Producto no encontrado" };
      }

      return { success: true, message: "Producto eliminado correctamente" };
    } catch (error) {
      console.error("Error eliminando producto en Turso:", error);
      return { success: false, error: error.message };
    }
  }

  async hardDeleteProduct(productId) {
    try {
      // Hard delete - eliminar completamente
      const result = await this.client.execute({
        sql: "DELETE FROM products WHERE id = ?",
        args: [productId],
      });

      if (result.rowsAffected === 0) {
        return { success: false, error: "Producto no encontrado" };
      }

      return { success: true, message: "Producto eliminado permanentemente" };
    } catch (error) {
      console.error(
        "Error eliminando producto permanentemente en Turso:",
        error
      );
      return { success: false, error: error.message };
    }
  }

  async toggleProductAvailability(productId) {
    try {
      // Obtener el estado actual
      const product = await this.getProductById(productId);
      if (!product) {
        return { success: false, error: "Producto no encontrado" };
      }

      const newAvailability = product.available ? 0 : 1;

      await this.client.execute({
        sql: "UPDATE products SET available = ? WHERE id = ?",
        args: [newAvailability, productId],
      });

      const updatedProduct = await this.getProductById(productId);
      return { success: true, product: updatedProduct };
    } catch (error) {
      console.error(
        "Error cambiando disponibilidad del producto en Turso:",
        error
      );
      return { success: false, error: error.message };
    }
  }

  async getProducts() {
    try {
      console.log("🔍 Obteniendo productos desde Turso...");
      const result = await this.client.execute(
        "SELECT * FROM products WHERE available = 1 ORDER BY category, name"
      );
      console.log("✅ Productos obtenidos desde Turso:", result.rows.length);
      return result.rows;
    } catch (error) {
      console.error("❌ Error obteniendo productos desde Turso:", error);
      throw error;
    }
  }

  async getSpecialties() {
    try {
      console.log("🔍 Obteniendo especialidades desde Turso...");
      
      const result = await this.client.execute(
        `SELECT * FROM products 
         WHERE available = 1 AND is_specialty = 1 
         ORDER BY name`
      );
      
      console.log(`✅ ${result.rows.length} especialidades obtenidas desde Turso`);
      return result.rows;
    } catch (error) {
      console.error("❌ Error obteniendo especialidades desde Turso:", error);
      throw error;
    }
  }


  async getAllProducts() {
    try {
      console.log("🔍 Obteniendo todos los productos desde Turso...");
      const result = await this.client.execute(
        "SELECT * FROM products ORDER BY category, name"
      );
      console.log(
        "✅ Todos los productos obtenidos desde Turso:",
        result.rows.length
      );
      return result.rows;
    } catch (error) {
      console.error(
        "❌ Error obteniendo todos los productos desde Turso:",
        error
      );
      throw error;
    }
  }

  async getProductById(productId) {
    const result = await this.client.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [productId],
    });
    return result.rows[0] || null;
  }

  async getProductsByCategory(category) {
    try {
      const result = await this.client.execute({
        sql: "SELECT * FROM products WHERE category = ? AND available = 1 ORDER BY name",
        args: [category],
      });
      return result.rows;
    } catch (error) {
      console.error(
        "Error obteniendo productos por categoría desde Turso:",
        error
      );
      throw error;
    }
  }

  async getProductCategories() {
    try {
      const result = await this.client.execute(
        "SELECT DISTINCT category FROM products WHERE available = 1 ORDER BY category"
      );
      return result.rows.map((row) => row.category);
    } catch (error) {
      console.error("Error obteniendo categorías desde Turso:", error);
      throw error;
    }
  }

  // Métodos de órdenes
  async createOrder(orderData) {
    try {
      console.log('🔍 Creando orden en Turso:', orderData);
      
      const orderId = this.generateId("order");
      let finalUserId = null;

      // Si hay userId, verificar que el usuario existe
      if (orderData.userId) {
        const userExists = await this.getUserById(orderData.userId);
        if (userExists) {
          finalUserId = orderData.userId;
          console.log('✅ Usuario existe, usando userId:', finalUserId);
        } else {
          console.log('⚠️ Usuario no existe, creando orden sin userId');
          finalUserId = null;
        }
      }

      await this.client.execute({
        sql: `INSERT INTO orders (id, user_id, user_name, user_email, user_phone, user_address, items, total, status, payment_method, notes, notification_method) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          orderId,
          finalUserId,
          orderData.userName,
          orderData.userEmail,
          orderData.userPhone || "",
          orderData.userAddress || "",
          JSON.stringify(orderData.items),
          orderData.total,
          orderData.status || "pending",
          orderData.paymentMethod || "",
          orderData.notes || "",
          orderData.notificationMethod || "email",
        ],
      });

      // Obtener la orden creada
      const createdOrder = await this.getOrderById(orderId);
      console.log('✅ Orden creada exitosamente en Turso:', orderId);
      
      return { success: true, order: createdOrder };
    } catch (error) {
      console.error("❌ Error creando orden en Turso:", error);
      console.error("❌ Stack trace:", error.stack);
      return { success: false, error: error.message };
    }
  }

  async getAllOrders() {
    try {
      const result = await this.client.execute(
        "SELECT * FROM orders ORDER BY created_at DESC"
      );
      return result.rows.map((order) => ({
        ...order,
        items: JSON.parse(order.items || "[]"),
        // Mapear datos del cliente para compatibilidad con el frontend
        customerName: order.user_name,
        customerEmail: order.user_email,
        phone: order.user_phone,
        deliveryAddress: order.user_address || 'Dirección no especificada',
        customer: {
          name: order.user_name,
          email: order.user_email,
          phone: order.user_phone,
          address: order.user_address || 'Dirección no especificada'
        }
      }));
    } catch (error) {
      console.error("Error obteniendo órdenes desde Turso:", error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const result = await this.client.execute({
        sql: "SELECT * FROM orders WHERE id = ?",
        args: [orderId],
      });

      if (result.rows.length === 0) {
        return null;
      }

      const order = result.rows[0];
      return {
        ...order,
        items: JSON.parse(order.items || "[]"),
        // Mapear datos del cliente para compatibilidad con el frontend
        customerName: order.user_name,
        customerEmail: order.user_email,
        phone: order.user_phone,
        deliveryAddress: order.user_address || 'Dirección no especificada',
        customer: {
          name: order.user_name,
          email: order.user_email,
          phone: order.user_phone,
          address: order.user_address || 'Dirección no especificada'
        }
      };
    } catch (error) {
      console.error("Error obteniendo orden por ID desde Turso:", error);
      throw error;
    }
  }

  async getOrdersByUser(userId) {
    try {
      const result = await this.client.execute({
        sql: "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        args: [userId],
      });

      return result.rows.map((order) => ({
        ...order,
        items: JSON.parse(order.items || "[]"),
        // Mapear datos del cliente para compatibilidad con el frontend
        customerName: order.user_name,
        customerEmail: order.user_email,
        phone: order.user_phone,
        deliveryAddress: order.user_address || 'Dirección no especificada',
        customer: {
          name: order.user_name,
          email: order.user_email,
          phone: order.user_phone,
          address: order.user_address || 'Dirección no especificada'
        }
      }));
    } catch (error) {
      console.error("Error obteniendo órdenes del usuario desde Turso:", error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, adminId) {
    try {
      const result = await this.client.execute({
        sql: "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [status, orderId],
      });

      if (result.rowsAffected === 0) {
        return { success: false, error: "Orden no encontrada" };
      }

      if (adminId) {
        await this.logActivity(
          "order_status_update",
          `Orden ${orderId} actualizada a ${status}`,
          adminId
        );
      }

      const updatedOrder = await this.getOrderById(orderId);
      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error("Error actualizando estado de orden en Turso:", error);
      return { success: false, error: error.message };
    }
  }

  async updateOrder(orderId, updateData) {
    try {
      const updateFields = [];
      const args = [];

      const allowedFields = [
        "user_name",
        "user_email",
        "user_phone",
        "user_address",
        "items",
        "total",
        "status",
        "payment_method",
        "notes",
      ];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === "items") {
            updateFields.push(`${key} = ?`);
            args.push(JSON.stringify(value));
          } else {
            updateFields.push(`${key} = ?`);
            args.push(value);
          }
        }
      }

      if (updateFields.length === 0) {
        return await this.getOrderById(orderId);
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      args.push(orderId);

      const sql = `UPDATE orders SET ${updateFields.join(", ")} WHERE id = ?`;

      const result = await this.client.execute({
        sql,
        args,
      });

      if (result.rowsAffected === 0) {
        return null;
      }

      return await this.getOrderById(orderId);
    } catch (error) {
      console.error("Error actualizando orden en Turso:", error);
      return null;
    }
  }

  async deleteOrder(orderId) {
    try {
      const result = await this.client.execute({
        sql: "DELETE FROM orders WHERE id = ?",
        args: [orderId],
      });

      if (result.rowsAffected === 0) {
        return { success: false, error: "Orden no encontrada" };
      }

      return { success: true };
    } catch (error) {
      console.error("Error eliminando orden en Turso:", error);
      return { success: false, error: error.message };
    }
  }

  // Métodos de reseñas
  async createReview(reviewData) {
    try {
      console.log("🔍 Creando reseña en Turso:", reviewData);

      const reviewId = this.generateId("review");
      let finalUserId = reviewData.userId || null;
      const customerName =
        reviewData.customerName || reviewData.userName || "Usuario Anónimo";

      // Si hay userId, verificar que el usuario existe
      if (reviewData.userId) {
        const userExists = await this.getUserById(reviewData.userId);
        if (!userExists) {
          console.log(
            "⚠️ Usuario no existe, creando usuario automáticamente..."
          );

          // Crear usuario automáticamente
          const newUserResult = await this.createUser({
            username: customerName || `user_${Date.now()}`,
            email: `temp_${Date.now()}@temp.com`,
            password: "temp_password",
            name: customerName || "Usuario Temporal",
            role: "customer",
          });

          if (newUserResult.success) {
            finalUserId = newUserResult.userId;
            console.log("✅ Usuario creado automáticamente:", finalUserId);
          } else {
            console.log("❌ Error creando usuario, usando null como user_id");
            finalUserId = null;
          }
        }
      }

      // Asegurar que los valores sean del tipo correcto
      const rating = parseInt(reviewData.rating) || 5;
      const comment = reviewData.comment || "";
      const approved = reviewData.approved ? 1 : 0;

      await this.client.execute({
        sql: `INSERT INTO reviews (id, user_id, user_name, rating, comment, approved) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [reviewId, finalUserId, customerName, rating, comment, approved],
      });

      console.log("✅ Reseña creada exitosamente en Turso:", reviewId);
      return { success: true, reviewId };
    } catch (error) {
      console.error("❌ Error creando reseña en Turso:", error);
      return { success: false, error: error.message };
    }
  }

  async getAllReviews(includeUnapproved = false) {
    const sql = includeUnapproved
      ? "SELECT * FROM reviews ORDER BY created_at DESC"
      : "SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC";

    const result = await this.client.execute(sql);
    return result.rows;
  }

  async updateReviewApproval(reviewId, isApproved, adminId) {
    try {
      const result = await this.client.execute({
        sql: "UPDATE reviews SET approved = ? WHERE id = ?",
        args: [isApproved ? 1 : 0, reviewId],
      });

      if (result.rowsAffected > 0 && adminId) {
        await this.logActivity(
          "review_approval",
          `Reseña ${isApproved ? "aprobada" : "rechazada"}: ${reviewId}`,
          adminId
        );
      }

      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Error actualizando aprobación de reseña en Turso:", error);
      throw error;
    }
  }

  async deleteReview(reviewId, adminId) {
    try {
      const result = await this.client.execute({
        sql: "DELETE FROM reviews WHERE id = ?",
        args: [reviewId],
      });

      if (result.rowsAffected > 0 && adminId) {
        await this.logActivity(
          "review_deleted",
          `Reseña ${reviewId} eliminada`,
          adminId
        );
      }

      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Error eliminando reseña en Turso:", error);
      throw error;
    }
  }

  // Métodos de logs
  async logActivity(action, description, userId = null) {
    try {
      const logId = this.generateId("log");

      await this.client.execute({
        sql: "INSERT INTO activity_logs (id, action, description, user_id) VALUES (?, ?, ?, ?)",
        args: [logId, action, description, userId],
      });
    } catch (error) {
      console.error("Error registrando actividad en Turso:", error);
    }
  }

  async getActivityLogs(limit = 100) {
    const result = await this.client.execute({
      sql: "SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?",
      args: [limit],
    });
    return result.rows;
  }

  // Estadísticas
  async getStats() {
    try {
      const [usersCount, productsCount, ordersCount, reviewsCount] =
        await Promise.all([
          this.client.execute("SELECT COUNT(*) as count FROM users"),
          this.client.execute("SELECT COUNT(*) as count FROM products"),
          this.client.execute("SELECT COUNT(*) as count FROM orders"),
          this.client.execute(
            "SELECT COUNT(*) as count FROM reviews WHERE approved = 1"
          ),
        ]);

      return {
        users: usersCount.rows[0].count,
        products: productsCount.rows[0].count,
        orders: ordersCount.rows[0].count,
        reviews: reviewsCount.rows[0].count,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas de Turso:", error);
      return { users: 0, products: 0, orders: 0, reviews: 0 };
    }
  }

  // Cerrar conexión
  async close() {
    if (this.client) {
      await this.client.close();
      console.log("🔒 Conexión a Turso cerrada");
    }
  }
}

// Crear instancia del servicio
const tursoDatabase = new TursoDatabaseService();

export default tursoDatabase;
