import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar a la base de datos
const dbPath = path.join(__dirname, 'database', 'restaurant.db');
const db = new Database(dbPath);

try {
  // Verificar qué tablas existen
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📊 Tablas en la base de datos:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });

  // Si existe la tabla reviews, mostrar su estructura
  if (tables.some(t => t.name === 'reviews')) {
    console.log('\n📋 Estructura de la tabla reviews:');
    const schema = db.prepare("PRAGMA table_info(reviews)").all();
    schema.forEach(col => {
      console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Mostrar contenido de la tabla reviews
    const reviews = db.prepare('SELECT * FROM reviews').all();
    console.log(`\n📝 Contenido de la tabla reviews (${reviews.length} registros):`);
    reviews.forEach(review => {
      console.log(`- ID: ${review.id}, Usuario: ${review.user_name}, Rating: ${review.rating}, Aprobada: ${review.approved}`);
    });
  } else {
    console.log('\n❌ La tabla reviews no existe');
  }

} catch (error) {
  console.error('❌ Error al verificar la base de datos:', error);
} finally {
  db.close();
}