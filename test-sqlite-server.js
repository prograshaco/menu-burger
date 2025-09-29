import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Importar sqliteDatabase
let sqliteDatabase;
try {
  console.log('🔍 Intentando importar sqliteDatabase...');
  const { default: db } = await import('./src/services/sqliteDatabase.js');
  sqliteDatabase = db;
  console.log('✅ sqliteDatabase importado correctamente');
  console.log('🔍 Tipo de sqliteDatabase:', typeof sqliteDatabase);
  console.log('🔍 Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(sqliteDatabase)));
} catch (error) {
  console.error('❌ Error al importar sqliteDatabase:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}

// Endpoint de prueba para crear reseñas
app.post('/api/reviews', async (req, res) => {
  console.log('🔍 Endpoint /api/reviews llamado');
  console.log('🔍 Datos recibidos:', req.body);
  
  try {
    console.log('🔍 Verificando sqliteDatabase...');
    
    if (!sqliteDatabase) {
      console.error('❌ sqliteDatabase no está disponible');
      return res.status(500).json({ error: 'Base de datos no disponible' });
    }
    
    console.log('🔍 sqliteDatabase disponible');
    
    // Verificar que el método createReview existe
    if (typeof sqliteDatabase.createReview !== 'function') {
      console.error('❌ createReview no es una función');
      console.error('🔍 Tipo de createReview:', typeof sqliteDatabase.createReview);
      return res.status(500).json({ error: 'Método createReview no disponible' });
    }
    
    console.log('🔍 Método createReview disponible, llamando...');
    
    // Llamar al método createReview
    const review = await sqliteDatabase.createReview(req.body);
    
    console.log('✅ Reseña creada exitosamente:', review);
    res.json({ success: true, review });
    
  } catch (error) {
    console.error('❌ Error detallado al crear reseña:', error);
    console.error('❌ Mensaje del error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // Asegurar que siempre enviamos una respuesta
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error al crear reseña', 
        details: error.message,
        stack: error.stack 
      });
    }
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
  console.log(`🚀 Servidor de prueba SQLite ejecutándose en http://localhost:${PORT}`);
});