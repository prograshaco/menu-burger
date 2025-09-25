// Script de migración para transferir datos de localStorage a SQLite
import { getDatabaseService } from '../config/database.js';
import authService from '../services/authService.js';

class MigrationScript {
  constructor() {
    this.database = null;
  }

  async init() {
    try {
      this.database = await getDatabaseService();
      console.log('Base de datos inicializada para migración');
    } catch (error) {
      console.error('Error al inicializar base de datos:', error);
      throw error;
    }
  }

  // Migrar usuarios de localStorage a SQLite
  async migrateUsers() {
    try {
      console.log('Iniciando migración de usuarios...');
      
      // Obtener usuarios de localStorage
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        console.log('No hay usuarios en localStorage para migrar');
        return { success: true, migrated: 0 };
      }

      const users = JSON.parse(usersData);
      let migratedCount = 0;

      for (const user of users) {
        try {
          // Verificar si el usuario ya existe en la base de datos
          const existingUser = await this.database.getUserByEmail(user.email);
          if (existingUser) {
            console.log(`Usuario ${user.email} ya existe en la base de datos`);
            continue;
          }

          // Crear usuario en la base de datos
          const result = await this.database.createUser({
            username: user.username || user.email.split('@')[0],
            email: user.email,
            password: user.password, // Ya está hasheada
            role: user.role || 'customer',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            address: user.address || ''
          });

          if (result.success) {
            migratedCount++;
            console.log(`Usuario ${user.email} migrado exitosamente`);
          }
        } catch (error) {
          console.error(`Error al migrar usuario ${user.email}:`, error);
        }
      }

      console.log(`Migración de usuarios completada: ${migratedCount} usuarios migrados`);
      return { success: true, migrated: migratedCount };
    } catch (error) {
      console.error('Error en migración de usuarios:', error);
      return { success: false, error: error.message };
    }
  }

  // Migrar pedidos de localStorage a SQLite
  async migrateOrders() {
    try {
      console.log('Iniciando migración de pedidos...');
      
      // Obtener pedidos de localStorage
      const ordersData = localStorage.getItem('orders');
      if (!ordersData) {
        console.log('No hay pedidos en localStorage para migrar');
        return { success: true, migrated: 0 };
      }

      const orders = JSON.parse(ordersData);
      let migratedCount = 0;

      for (const order of orders) {
        try {
          // Verificar si el pedido ya existe en la base de datos
          const existingOrder = await this.database.getOrderById(order.id);
          if (existingOrder) {
            console.log(`Pedido ${order.id} ya existe en la base de datos`);
            continue;
          }

          // Preparar datos del pedido para la base de datos
          const orderData = {
            id: order.id,
            userId: order.userId || null,
            customerName: order.customerName || order.client_name || 'Cliente',
            customerEmail: order.customerEmail || order.client_email || '',
            customerPhone: order.customerPhone || order.client_phone || '',
            items: JSON.stringify(order.items || []),
            subtotal: order.subtotal || 0,
            tax: order.tax || 0,
            total: order.total || 0,
            status: order.status || 'pending',
            notes: order.notes || '',
            createdAt: order.createdAt || order.timestamp || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString()
          };

          // Crear pedido en la base de datos
          const result = await this.database.createOrder(orderData);

          if (result.success) {
            migratedCount++;
            console.log(`Pedido ${order.id} migrado exitosamente`);
          }
        } catch (error) {
          console.error(`Error al migrar pedido ${order.id}:`, error);
        }
      }

      console.log(`Migración de pedidos completada: ${migratedCount} pedidos migrados`);
      return { success: true, migrated: migratedCount };
    } catch (error) {
      console.error('Error en migración de pedidos:', error);
      return { success: false, error: error.message };
    }
  }

  // Migrar configuraciones de localStorage a SQLite
  async migrateSettings() {
    try {
      console.log('Iniciando migración de configuraciones...');
      
      const settingsKeys = [
        'appSettings',
        'userPreferences',
        'themeSettings',
        'notificationSettings'
      ];

      let migratedCount = 0;

      for (const key of settingsKeys) {
        try {
          const settingData = localStorage.getItem(key);
          if (settingData) {
            // Guardar configuración en la base de datos
            const result = await this.database.saveSetting(key, settingData);
            if (result.success) {
              migratedCount++;
              console.log(`Configuración ${key} migrada exitosamente`);
            }
          }
        } catch (error) {
          console.error(`Error al migrar configuración ${key}:`, error);
        }
      }

      console.log(`Migración de configuraciones completada: ${migratedCount} configuraciones migradas`);
      return { success: true, migrated: migratedCount };
    } catch (error) {
      console.error('Error en migración de configuraciones:', error);
      return { success: false, error: error.message };
    }
  }

  // Ejecutar migración completa
  async runFullMigration() {
    try {
      await this.init();
      
      console.log('=== INICIANDO MIGRACIÓN COMPLETA ===');
      
      const results = {
        users: await this.migrateUsers(),
        orders: await this.migrateOrders(),
        settings: await this.migrateSettings()
      };

      console.log('=== MIGRACIÓN COMPLETADA ===');
      console.log('Resultados:', results);

      // Crear backup de localStorage antes de limpiar
      this.createLocalStorageBackup();

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Error en migración completa:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crear backup de localStorage
  createLocalStorageBackup() {
    try {
      const backup = {};
      const keys = ['users', 'orders', 'appSettings', 'userPreferences', 'themeSettings', 'notificationSettings'];
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          backup[key] = data;
        }
      });

      const backupData = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `localStorage_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Backup de localStorage creado exitosamente');
    } catch (error) {
      console.error('Error al crear backup de localStorage:', error);
    }
  }

  // Limpiar localStorage después de migración exitosa
  clearLocalStorageAfterMigration() {
    try {
      const keysToRemove = ['users', 'orders', 'appSettings', 'userPreferences'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('localStorage limpiado después de migración exitosa');
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  // Verificar integridad de datos migrados
  async verifyMigration() {
    try {
      console.log('Verificando integridad de datos migrados...');
      
      const dbUsers = await this.database.getAllUsers();
      const dbOrders = await this.database.getAllOrders();
      
      console.log(`Usuarios en base de datos: ${dbUsers.length}`);
      console.log(`Pedidos en base de datos: ${dbOrders.length}`);
      
      return {
        success: true,
        users: dbUsers.length,
        orders: dbOrders.length
      };
    } catch (error) {
      console.error('Error al verificar migración:', error);
      return { success: false, error: error.message };
    }
  }
}

// Función helper para ejecutar migración desde consola del navegador
window.runMigration = async () => {
  const migration = new MigrationScript();
  return await migration.runFullMigration();
};

// Función helper para verificar migración
window.verifyMigration = async () => {
  const migration = new MigrationScript();
  await migration.init();
  return await migration.verifyMigration();
};

export default MigrationScript;