import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Función para generar ID único
function generateId(prefix = 'id') {
  return `${prefix}-${uuidv4()}`;
}

try {
  console.log('🔍 Conectando a la base de datos...');
  const dbPath = path.join(process.cwd(), 'database', 'restaurant.db');
  const db = new Database(dbPath);
  
  console.log('🔍 Base de datos conectada');
  
  // Datos de prueba
  const reviewData = {
    userId: 'admin-test-001',
    userName: 'Usuario de Prueba Directo',
    rating: 5,
    comment: 'Esta es una prueba directa de inserción',
    approved: false
  };
  
  console.log('🔍 Datos de prueba:', reviewData);
  
  // Generar ID
  console.log('🔍 Generando ID...');
  const reviewId = generateId('review');
  console.log('🔍 ID generado:', reviewId);
  
  // Preparar statement
  console.log('🔍 Preparando statement...');
  const stmt = db.prepare(`
    INSERT INTO reviews (id, user_id, user_name, rating, comment, approved)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  console.log('🔍 Statement preparado');
  
  // Crear objeto de reseña
  const newReview = {
    id: reviewId,
    user_id: reviewData.userId || reviewData.user_id || null,
    user_name: reviewData.userName || reviewData.user_name || 'Usuario Anónimo',
    rating: reviewData.rating,
    comment: reviewData.comment || null,
    approved: reviewData.approved ? 1 : 0
  };
  
  console.log('🔍 Objeto newReview:', newReview);
  
  // Ejecutar inserción
  console.log('🔍 Ejecutando inserción...');
  const result = stmt.run(
    newReview.id, 
    newReview.user_id, 
    newReview.user_name,
    newReview.rating, 
    newReview.comment, 
    newReview.approved
  );
  
  console.log('✅ Inserción exitosa:', result);
  console.log('✅ Reseña creada:', newReview);
  
  // Verificar que se insertó
  const checkStmt = db.prepare('SELECT * FROM reviews WHERE id = ?');
  const insertedReview = checkStmt.get(reviewId);
  console.log('✅ Reseña verificada en DB:', insertedReview);
  
  db.close();
  console.log('✅ Conexión cerrada');
  
} catch (error) {
  console.error('❌ Error en la prueba directa:', error);
  console.error('❌ Stack trace:', error.stack);
}