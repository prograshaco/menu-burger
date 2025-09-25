import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sqliteDatabase from './src/services/sqliteDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

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

// Inicializar base de datos
await sqliteDatabase.init();

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await sqliteDatabase.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await sqliteDatabase.createUser(userData);
    res.json({ user: { ...newUser, password: undefined } });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Rutas de usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await sqliteDatabase.getAllUsers();
    res.json(users.map(user => ({ ...user, password: undefined })));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await sqliteDatabase.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ ...user, password: undefined });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await sqliteDatabase.updateUser(req.params.id, req.body);
    res.json({ ...updatedUser, password: undefined });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await sqliteDatabase.createUser(req.body);
    res.json({ ...newUser, password: undefined });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await sqliteDatabase.deleteUser(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar usuario' });
  }
});

app.patch('/api/users/:id/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    const updatedUser = await sqliteDatabase.updateUser(req.params.id, { active: active ? 1 : 0 });
    res.json({ ...updatedUser, password: undefined });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({ error: 'Error al cambiar estado del usuario' });
  }
});

// Rutas de productos (rutas específicas primero, luego las genéricas)
app.get('/api/products/all', async (req, res) => {
  try {
    const products = await sqliteDatabase.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = await sqliteDatabase.getProductCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const products = await sqliteDatabase.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await sqliteDatabase.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await sqliteDatabase.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // Validaciones básicas
    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: name, price, category' 
      });
    }

    const newProduct = await sqliteDatabase.createProduct(productData);
    res.json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    
    const updatedProduct = await sqliteDatabase.updateProduct(productId, updates);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await sqliteDatabase.deleteProduct(productId);
    res.json(result);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

app.delete('/api/products/:id/hard', async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await sqliteDatabase.hardDeleteProduct(productId);
    res.json(result);
  } catch (error) {
    console.error('Error al eliminar producto permanentemente:', error);
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al eliminar producto permanentemente' });
  }
});

app.patch('/api/products/:id/toggle', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await sqliteDatabase.toggleProductAvailability(productId);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al cambiar disponibilidad del producto:', error);
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al cambiar disponibilidad del producto' });
  }
});

// Endpoint para subir imágenes
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    // Construir la URL completa del archivo
    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Rutas de pedidos
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Mapear los campos del frontend a los campos de la base de datos
    const timestamp = Date.now();
    
    // Asegurar que items sea un array válido
    const items = orderData.items && Array.isArray(orderData.items) ? orderData.items : [];
    const itemsJson = JSON.stringify(items);
    
    const dbOrderData = {
      id: orderData.id || timestamp.toString(),
      number: orderData.number || `ORD-${timestamp}`,
      date: orderData.date || new Date().toISOString(),
      client_name: orderData.customerName || orderData.client_name || 'Cliente',
      client_email: orderData.customerEmail || orderData.client_email || 'cliente@ejemplo.com',
      client_phone: orderData.phone || orderData.client_phone || '',
      client_address: orderData.deliveryAddress || orderData.client_address || '',
      items_json: itemsJson,
      notes: orderData.notes || '',
      subtotal: parseFloat(orderData.subtotal || orderData.total || 0),
      tax: parseFloat(orderData.tax || 0),
      total: parseFloat(orderData.total || 0),
      status: orderData.status || 'pending'
    };
    
    // Validación adicional para campos NOT NULL
    if (!dbOrderData.items_json || dbOrderData.items_json === 'null' || dbOrderData.items_json === 'undefined') {
      dbOrderData.items_json = '[]';
    }
    
    const order = await sqliteDatabase.createOrder(dbOrderData);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ success: false, error: 'Error al crear pedido' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await sqliteDatabase.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await sqliteDatabase.getOrdersByUser(req.params.userId);
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await sqliteDatabase.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, adminId } = req.body;
    const updatedOrder = await sqliteDatabase.updateOrderStatus(req.params.id, status, adminId);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body;
    
    // Verificar que el pedido existe
    const existingOrder = await sqliteDatabase.getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Actualizar el pedido (implementar en sqliteDatabase si no existe)
    const updatedOrder = await sqliteDatabase.updateOrder(orderId, updateData);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Verificar que el pedido existe
    const existingOrder = await sqliteDatabase.getOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Eliminar el pedido (implementar en sqliteDatabase si no existe)
    const result = await sqliteDatabase.deleteOrder(orderId);
    if (result) {
      res.json({ success: true, message: 'Pedido eliminado correctamente' });
    } else {
      res.status(500).json({ error: 'Error al eliminar pedido' });
    }
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// Rutas de reseñas
app.post('/api/reviews', async (req, res) => {
  try {
    const review = await sqliteDatabase.createReview(req.body);
    res.json(review);
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const includeUnapproved = req.query.includeUnapproved === 'true';
    const reviews = await sqliteDatabase.getAllReviews(includeUnapproved);
    res.json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/reviews/:id/approval', async (req, res) => {
  try {
    const { isApproved, adminId } = req.body;
    const updatedReview = await sqliteDatabase.updateReviewApproval(req.params.id, isApproved, adminId);
    res.json(updatedReview);
  } catch (error) {
    console.error('Error al actualizar aprobación de reseña:', error);
    res.status(500).json({ error: 'Error al actualizar reseña' });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { adminId } = req.body;
    const deleted = await sqliteDatabase.deleteReview(req.params.id, adminId);
    if (deleted) {
      res.json({ success: true, message: 'Reseña eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Reseña no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
});

// Rutas de estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await sqliteDatabase.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de logs de actividad
app.post('/api/activity-logs', async (req, res) => {
  try {
    const { action, description, userId } = req.body;
    await sqliteDatabase.logActivity(action, description, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/activity-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await sqliteDatabase.getActivityLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs de actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('Cerrando servidor...');
  await sqliteDatabase.close();
  process.exit(0);
});