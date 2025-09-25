/**
 * Configuración de base de datos
 * Permite cambiar entre SQLite y el sistema híbrido (localStorage + archivos)
 */

// Configuración de la base de datos
export const DATABASE_CONFIG = {
  // Tipo de base de datos: 'sqlite' o 'hybrid'
  type: 'sqlite', // Cambiado a 'sqlite' para usar SQLite
  
  // Configuración específica para SQLite
  sqlite: {
    path: './database/restaurant.db',
    options: {
      verbose: console.log // Para debugging, cambiar a null en producción
    }
  },
  
  // Configuración específica para sistema híbrido
  hybrid: {
    dataDirectory: './database',
    useLocalStorage: true,
    autoBackup: true
  }
};

// Factory function para obtener el servicio de base de datos correcto
export async function getDatabaseService() {
  if (DATABASE_CONFIG.type === 'sqlite') {
    // Importar dinámicamente el servicio SQLite
    const { default: sqliteDatabase } = await import('../services/sqliteDatabase.js');
    return sqliteDatabase;
  } else {
    // Importar dinámicamente el servicio híbrido
    const { default: hybridDatabase } = await import('../services/hybridDatabase.js');
    return hybridDatabase;
  }
}

// Función para cambiar el tipo de base de datos
export function switchDatabaseType(newType) {
  if (newType !== 'sqlite' && newType !== 'hybrid') {
    throw new Error('Tipo de base de datos no válido. Use "sqlite" o "hybrid"');
  }
  
  DATABASE_CONFIG.type = newType;
  console.log(`🔄 Tipo de base de datos cambiado a: ${newType}`);
  console.log('⚠️  Reinicie la aplicación para aplicar los cambios');
}

// Función para obtener información sobre la configuración actual
export function getDatabaseInfo() {
  return {
    currentType: DATABASE_CONFIG.type,
    config: DATABASE_CONFIG[DATABASE_CONFIG.type],
    availableTypes: ['sqlite', 'hybrid']
  };
}

export default DATABASE_CONFIG;