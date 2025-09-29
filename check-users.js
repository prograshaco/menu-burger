import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conectar a la base de datos
const dbPath = path.join(__dirname, 'database', 'restaurant.db');
const db = new Database(dbPath);

try {
  // Verificar usuarios existentes
  const users = db.prepare('SELECT id, username, name, role FROM users').all();
  console.log('👥 Usuarios en la base de datos:');
  users.forEach(user => {
    console.log(`- ID: ${user.id}, Username: ${user.username}, Nombre: ${user.name}, Rol: ${user.role}`);
  });

  console.log(`\n✅ Total de usuarios: ${users.length}`);

} catch (error) {
  console.error('❌ Error al verificar usuarios:', error);
} finally {
  db.close();
}