import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Importar base de datos (Turso o SQLite como fallback)
let database;
try {
  // Intentar usar Turso primero
  const { default: tursoDb } = await import('./src/services/tursoDatabase.js');
  database = tursoDb;
  console.log('✅ Turso Database importado correctamente');
} catch (tursoError) {
  console.warn('⚠️ Error al importar Turso Database:', tursoError.message);
  console.log('🔄 Intentando usar SQLite como fallback...');
  
  try {
    const { default: sqliteDb } = await import('./src/services/sqliteDatabase.js');
    database = sqliteDb;
    console.log('✅ SQLite Database importado como fallback');
  } catch (sqliteError) {
    console.error('❌ Error al importar ambas bases de datos:', sqliteError);
    console.error('❌ Stack trace:', sqliteError.stack);
    process.exit(1);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3006;

// Middleware básico
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Solo endpoint de reseñas para testing
app.post('/api/reviews', async (req, res) => {
  console.log('🔍 Endpoint /api/reviews llamado');
  console.log('🔍 Datos recibidos:', req.body);
  
  try {
    console.log('🔍 Intentando crear reseña...');
    
    // Verificar que database esté disponible
    if (!database) {
      console.error('❌ Database no está disponible');
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }
    
    console.log('🔍 Database disponible');
    console.log('🔍 Tipo de database:', typeof database);
    console.log('🔍 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(database)));
    
    // Verificar que el método createReview existe
    if (typeof database.createReview !== 'function') {
      console.error('❌ Método createReview no encontrado en database');
      return res.status(500).json({ error: 'Método createReview no disponible' });
    }
    
    const review = await database.createReview(req.body);
    console.log('✅ Reseña creada exitosamente:', review);
    res.json(review);
  } catch (error) {
    console.error('❌ Error creando reseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const includeUnapproved = req.query.includeUnapproved === 'true';
    const reviews = await database.getAllReviews(includeUnapproved);
    res.json(reviews);
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Manejadores de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  console.error('❌ Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  console.error('❌ En promesa:', promise);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await database.close();
  process.exit(0);
});

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/');
  },
  filename: function (req, file, cb) {
    // Generar nombre único con timestamp y extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: function (req, file, cb) {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await database.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('🔍 Datos de registro recibidos:', req.body);
    const newUser = await database.createUser(req.body);
    console.log('✅ Usuario creado exitosamente:', newUser);
    
    // Devolver en el formato esperado por el frontend
    res.json({ 
      success: true,
      user: newUser,
      message: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error interno del servidor' 
    });
  }
});

// Rutas de usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await database.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await database.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await database.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await database.createUser(req.body);
    res.json(newUser);
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await database.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/api/users/:id/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    const updatedUser = await database.updateUser(req.params.id, { active: active ? 1 : 0 });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error actualizando estado del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Proxy para la API externa de productos
const EXTERNAL_PRODUCTS_API = 'https://api-burger.onrender.com/api/products';

// Rutas de productos - proxy a API externa
app.get('/api/products/all', async (req, res) => {
  try {
    console.log('🔄 Proxy: Obteniendo todos los productos de API externa...');
    const response = await fetch(EXTERNAL_PRODUCTS_API);
    
    if (!response.ok) {
      throw new Error(`API externa respondió con status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // La API externa devuelve { value: [...], Count: N }
    if (data.value && Array.isArray(data.value)) {
      console.log(`✅ Proxy: ${data.value.length} productos obtenidos`);
      res.json(data.value);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('❌ Error en proxy de productos:', error);
    res.status(500).json({ error: 'Error obteniendo productos de la API externa' });
  }
});

app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = await database.getProductCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const products = await database.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    console.log('🔄 Proxy: Obteniendo productos de API externa...');
    const response = await fetch(EXTERNAL_PRODUCTS_API);
    
    if (!response.ok) {
      throw new Error(`API externa respondió con status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // La API externa devuelve { value: [...], Count: N }
    if (data.value && Array.isArray(data.value)) {
      console.log(`✅ Proxy: ${data.value.length} productos obtenidos`);
      res.json(data.value);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('❌ Error en proxy de productos:', error);
    res.status(500).json({ error: 'Error obteniendo productos de la API externa' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    console.log(`🔄 Proxy: Obteniendo producto ${req.params.id} de API externa...`);
    const response = await fetch(`${EXTERNAL_PRODUCTS_API}/${req.params.id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      throw new Error(`API externa respondió con status: ${response.status}`);
    }
    
    const product = await response.json();
    console.log(`✅ Proxy: Producto ${req.params.id} obtenido`);
    res.json(product);
  } catch (error) {
    console.error('❌ Error en proxy de producto:', error);
    res.status(500).json({ error: 'Error obteniendo producto de la API externa' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('🔄 Proxy: Creando producto en API externa...', req.body);
    const response = await fetch(EXTERNAL_PRODUCTS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      throw new Error(`API externa respondió con status: ${response.status}`);
    }
    
    const newProduct = await response.json();
    console.log('✅ Proxy: Producto creado exitosamente');
    res.json(newProduct);
  } catch (error) {
    console.error('❌ Error en proxy creando producto:', error);
    res.status(500).json({ error: 'Error creando producto en la API externa' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    console.log(`🔄 Proxy: Actualizando producto ${req.params.id} en API externa...`);
    const response = await fetch(`${EXTERNAL_PRODUCTS_API}/${req.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      throw new Error(`API externa respondió con status: ${response.status}`);
    }
    
    const updatedProduct = await response.json();
    console.log(`✅ Proxy: Producto ${req.params.id} actualizado`);
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error en proxy actualizando producto:', error);
    res.status(500).json({ error: 'Error actualizando producto en la API externa' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log(`🔄 Proxy: Eliminando producto ${req.params.id} en API externa...`);
    const response = await fetch(`${EXTERNAL_PRODUCTS_API}/${req.params.id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      throw new Error(`API externa respondió con status: ${response.status}`);
    }
    
    console.log(`✅ Proxy: Producto ${req.params.id} eliminado`);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error en proxy eliminando producto:', error);
    res.status(500).json({ error: 'Error eliminando producto en la API externa' });
  }
});

app.delete('/api/products/:id/hard', async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await database.hardDeleteProduct(productId);
    
    if (!result.success) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado permanentemente' });
  } catch (error) {
    console.error('Error eliminando producto permanentemente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.patch('/api/products/:id/toggle', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await database.toggleProductAvailability(productId);
    
    if (!updatedProduct.success) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error cambiando disponibilidad del producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de pedidos
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    console.log('🔍 Datos del pedido recibidos:', JSON.stringify(orderData, null, 2));
    
    const dbOrderData = {
      userId: orderData.userId || null,
      userName: orderData.customerName || orderData.customerInfo?.name || orderData.userName || 'Cliente Anónimo',
      userEmail: orderData.customerEmail || orderData.customerInfo?.email || orderData.userEmail || '',
      userPhone: orderData.phone || orderData.customerInfo?.phone || orderData.userPhone || orderData.deliveryInfo?.phone || '',
      userAddress: orderData.deliveryAddress || orderData.customerInfo?.address || orderData.userAddress || orderData.deliveryInfo?.address || '',
      items: orderData.items || [],
      total: orderData.total || 0,
      status: orderData.status || 'pending',
      paymentMethod: orderData.paymentMethod || '',
      notes: orderData.notes || '',
      notificationMethod: orderData.notificationMethod || 'email'
    };
    
    console.log('🔍 Datos mapeados para la base de datos:', JSON.stringify(dbOrderData, null, 2));
    console.log('🔍 Valores específicos:');
    console.log('  - userName:', dbOrderData.userName);
    console.log('  - userEmail:', dbOrderData.userEmail);
    console.log('  - userPhone:', dbOrderData.userPhone);
    console.log('  - userAddress:', dbOrderData.userAddress);
    console.log('  - notificationMethod:', dbOrderData.notificationMethod);
    
    const result = await database.createOrder(dbOrderData);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error || 'Error creando la orden' });
    }
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await database.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await database.getOrdersByUser(req.params.userId);
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await database.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, adminId } = req.body;
    const updatedOrder = await database.updateOrderStatus(req.params.id, status, adminId);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    
    // Verificar que la orden existe
    const existingOrder = await database.getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Actualizar el pedido (implementar en database si no existe)
    const updatedOrder = await database.updateOrder(orderId, updateData);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error actualizando orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Verificar que la orden existe
    const existingOrder = await database.getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // Eliminar el pedido (implementar en database si no existe)
    const result = await database.deleteOrder(orderId);
    
    if (!result.success) {
      return res.status(500).json({ error: 'Error eliminando la orden' });
    }
    
    res.json({ message: 'Orden eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de reseñas
app.post('/api/reviews', async (req, res) => {
  console.log('🔍 Endpoint /api/reviews llamado');
  console.log('🔍 Datos recibidos:', req.body);
  
  try {
    console.log('🔍 Intentando crear reseña...');
    
    // Verificar que database esté disponible
    if (!database) {
      console.error('❌ Database no está disponible');
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }
    
    console.log('🔍 Database disponible');
    console.log('🔍 Tipo de database:', typeof database);
    console.log('🔍 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(database)));
    
    // Verificar que el método createReview existe
    if (typeof database.createReview !== 'function') {
      console.error('❌ Método createReview no encontrado en database');
      return res.status(500).json({ error: 'Método createReview no disponible' });
    }
    
    const review = await database.createReview(req.body);
    console.log('✅ Reseña creada exitosamente:', review);
    res.json(review);
  } catch (error) {
    console.error('❌ Error creando reseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const includeUnapproved = req.query.includeUnapproved === 'true';
    const reviews = await database.getAllReviews(includeUnapproved);
    res.json(reviews);
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/reviews/:id/approval', async (req, res) => {
  try {
    const { isApproved, adminId } = req.body;
    const updatedReview = await database.updateReviewApproval(req.params.id, isApproved, adminId);
    res.json(updatedReview);
  } catch (error) {
    console.error('Error actualizando aprobación de reseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { adminId } = req.body;
    const deleted = await database.deleteReview(req.params.id, adminId);
    if (!deleted) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await database.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// Rutas de logs de actividad
app.post('/api/activity-logs', async (req, res) => {
  try {
    const { action, description, userId } = req.body;
    await database.logActivity(action, description, userId);
    res.json({ message: 'Log registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar log:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/activity-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await database.getActivityLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint temporal para activar todos los productos
app.post('/api/products/activate-all', async (req, res) => {
  try {
    console.log('🔧 Activando todos los productos...');
    
    // Obtener todos los productos (incluyendo desactivados)
    const allProducts = await database.getAllProducts();
    console.log(`📦 Total productos encontrados: ${allProducts.length}`);
    
    let activatedCount = 0;
    
    // Activar cada producto
    for (const product of allProducts) {
      if (!product.available) {
        const result = await database.toggleProductAvailability(product.id);
        if (result.success) {
          activatedCount++;
        }
      }
    }
    
    console.log(`✅ ${activatedCount} productos activados`);
    res.json({ 
      success: true, 
      message: `${activatedCount} productos activados correctamente`,
      totalProducts: allProducts.length,
      activatedCount 
    });
  } catch (error) {
    console.error('❌ Error activando productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Manejadores de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  console.error('❌ Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  console.error('❌ En promesa:', promise);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await database.close();
  process.exit(0);
});