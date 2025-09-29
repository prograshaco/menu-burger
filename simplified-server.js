import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar sqliteDatabase de manera más segura
let sqliteDatabase;
try {
  const { default: db } = await import('./src/services/sqliteDatabase.js');
  sqliteDatabase = db;
  console.log('✅ sqliteDatabase importado correctamente');
} catch (error) {
  console.error('❌ Error al importar sqliteDatabase:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

// Middleware básico (igual que el servidor principal)
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde el directorio uploads (igual que el servidor principal)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Solo endpoint de reseñas (copiado exactamente del servidor principal)
app.post('/api/reviews', async (req, res) => {
  console.log('🔍 Endpoint /api/reviews llamado');
  console.log('🔍 Datos recibidos:', req.body);
  
  try {
    console.log('🔍 Intentando crear reseña...');
    
    // Verificar que sqliteDatabase esté disponible
    if (!sqliteDatabase) {
      console.error('❌ sqliteDatabase no está disponible');
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }
    
    console.log('🔍 sqliteDatabase disponible');
    console.log('🔍 Tipo de sqliteDatabase:', typeof sqliteDatabase);
    console.log('🔍 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(sqliteDatabase)));
    
    // Verificar que el método createReview existe
    if (typeof sqliteDatabase.createReview !== 'function') {
      console.error('❌ createReview no es una función');
      return res.status(500).json({ error: 'Método createReview no disponible' });
    }
    
    console.log('🔍 Llamando createReview...');
    const review = await sqliteDatabase.createReview(req.body);
    console.log('✅ Reseña creada exitosamente:', review);
    res.json(review);
  } catch (error) {
    console.error('❌ Error detallado al crear reseña:', error);
    console.error('❌ Mensaje del error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // Asegurar que siempre enviamos una respuesta
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al crear reseña', details: error.message });
    }
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

// Cerrar la base de datos al terminar el proceso
process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando servidor...');
  await sqliteDatabase.close();
  process.exit(0);
});