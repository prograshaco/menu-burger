#!/usr/bin/env node

/**
 * Script de migración de datos desde localStorage/archivos JSON a SQLite
 * Uso: node migrate.js
 */

import DataMigration from './src/utils/migrateToSQLite.js';

async function runMigration() {
  console.log('🚀 Iniciando proceso de migración de datos...');
  console.log('=====================================');

  try {
    const migration = new DataMigration();
    
    // Ejecutar migración
    const result = await migration.migrateAllData();
    
    console.log('\n📊 Resumen de migración:');
    console.log(`✅ Usuarios migrados: ${result.migrated.users}`);
    console.log(`✅ Pedidos migrados: ${result.migrated.orders}`);
    console.log(`✅ Reseñas migradas: ${result.migrated.reviews}`);
    console.log(`✅ Logs migrados: ${result.migrated.activityLogs}`);
    
    // Verificar migración
    console.log('\n🔍 Verificando migración...');
    const verification = await migration.verifyMigration();
    
    console.log('\n✅ Migración completada exitosamente!');
    console.log('La base de datos SQLite está lista para usar.');
    console.log('\nPara usar SQLite en lugar del sistema híbrido:');
    console.log('1. Actualiza tus servicios para usar sqliteDatabase');
    console.log('2. Reinicia la aplicación');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar migración si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;