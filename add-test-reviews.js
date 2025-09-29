import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar a la base de datos
const dbPath = path.join(__dirname, 'database', 'restaurant.db');
const db = new Database(dbPath);

// Función para generar ID único
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Reseñas de prueba (usando el ID del admin existente)
const testReviews = [
  {
    user_id: 'admin-test-001',
    user_name: 'María González',
    rating: 5,
    comment: '¡Las mejores hamburguesas de la ciudad! El sabor es increíble y la atención excelente.',
    approved: 0 // No aprobada para que aparezca en el dashboard
  },
  {
    user_id: 'admin-test-001',
    user_name: 'Carlos Rodríguez', 
    rating: 4,
    comment: 'Muy buena calidad de ingredientes. La entrega fue rápida y todo llegó caliente.',
    approved: 0 // No aprobada para que aparezca en el dashboard
  },
  {
    user_id: 'admin-test-001',
    user_name: 'Ana López',
    rating: 5,
    comment: 'Excelente servicio al cliente. Definitivamente volveré a pedir.',
    approved: 1 // Aprobada
  },
  {
    user_id: 'admin-test-001',
    user_name: 'Pedro Martín',
    rating: 3,
    comment: 'Está bien, pero podría mejorar el tiempo de entrega.',
    approved: 0 // No aprobada para que aparezca en el dashboard
  }
];

try {
  // Limpiar reseñas existentes
  db.prepare('DELETE FROM reviews').run();
  console.log('✅ Reseñas existentes eliminadas');

  // Insertar reseñas de prueba
  const insertStmt = db.prepare(`
    INSERT INTO reviews (id, user_id, user_name, rating, comment, approved, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  testReviews.forEach(review => {
    const reviewId = generateId('review');
    insertStmt.run(
      reviewId,
      review.user_id,
      review.user_name,
      review.rating,
      review.comment,
      review.approved,
      new Date().toISOString()
    );
    console.log(`✅ Reseña añadida: ${review.user_name} - ${review.approved ? 'Aprobada' : 'Pendiente'}`);
  });

  // Verificar las reseñas insertadas
  const allReviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  console.log('\n📊 Reseñas en la base de datos:');
  allReviews.forEach(review => {
    console.log(`- ${review.user_name}: ${review.rating}⭐ (${review.approved ? 'Aprobada' : 'Pendiente'})`);
  });

  console.log(`\n✅ Total de reseñas: ${allReviews.length}`);
  console.log(`✅ Reseñas pendientes: ${allReviews.filter(r => !r.approved).length}`);
  console.log(`✅ Reseñas aprobadas: ${allReviews.filter(r => r.approved).length}`);

} catch (error) {
  console.error('❌ Error al añadir reseñas de prueba:', error);
} finally {
  db.close();
}