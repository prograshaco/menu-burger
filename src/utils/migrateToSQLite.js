import hybridDatabase from '../services/hybridDatabase.js';
import sqliteDatabase from '../services/sqliteDatabase.js';

/**
 * Script para migrar datos desde localStorage/archivos JSON a SQLite
 */
class DataMigration {
  constructor() {
    this.migrationLog = [];
  }

  log(message) {
    console.log(`[MIGRATION] ${message}`);
    this.migrationLog.push(`${new Date().toISOString()}: ${message}`);
  }

  async migrateAllData() {
    try {
      this.log('Iniciando migración de datos a SQLite...');

      // Obtener todos los datos del sistema híbrido actual
      const users = await hybridDatabase.getAllUsers();
      const orders = await hybridDatabase.getAllOrders();
      const reviews = await hybridDatabase.getAllReviews(true); // Incluir no aprobadas
      const activityLogs = await hybridDatabase.getActivityLogs(1000);

      this.log(`Datos encontrados: ${users.length} usuarios, ${orders.length} pedidos, ${reviews.length} reseñas, ${activityLogs.length} logs`);

      // Migrar usuarios
      await this.migrateUsers(users);

      // Migrar pedidos
      await this.migrateOrders(orders);

      // Migrar reseñas
      await this.migrateReviews(reviews);

      // Migrar logs de actividad
      await this.migrateActivityLogs(activityLogs);

      this.log('✅ Migración completada exitosamente');
      return {
        success: true,
        migrated: {
          users: users.length,
          orders: orders.length,
          reviews: reviews.length,
          activityLogs: activityLogs.length
        },
        log: this.migrationLog
      };

    } catch (error) {
      this.log(`❌ Error durante la migración: ${error.message}`);
      throw error;
    }
  }

  async migrateUsers(users) {
    this.log('Migrando usuarios...');
    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Verificar si el usuario ya existe en SQLite
        const existingUser = await sqliteDatabase.getUserByEmail(user.email);
        if (existingUser) {
          skipped++;
          continue;
        }

        // Asegurar que el usuario tenga username
        const userData = {
          ...user,
          username: user.username || user.email.split('@')[0]
        };

        await sqliteDatabase.createUser(userData);
        migrated++;
      } catch (error) {
        this.log(`Error migrando usuario ${user.email}: ${error.message}`);
      }
    }

    this.log(`Usuarios migrados: ${migrated}, omitidos: ${skipped}`);
  }

  async migrateOrders(orders) {
    this.log('Migrando pedidos...');
    let migrated = 0;
    let skipped = 0;

    for (const order of orders) {
      try {
        // Verificar si el pedido ya existe
        const existingOrders = await sqliteDatabase.getAllOrders();
        const exists = existingOrders.some(o => o.id === order.id);
        
        if (exists) {
          skipped++;
          continue;
        }

        await sqliteDatabase.createOrder(order);
        migrated++;
      } catch (error) {
        this.log(`Error migrando pedido ${order.id}: ${error.message}`);
      }
    }

    this.log(`Pedidos migrados: ${migrated}, omitidos: ${skipped}`);
  }

  async migrateReviews(reviews) {
    this.log('Migrando reseñas...');
    let migrated = 0;
    let skipped = 0;

    for (const review of reviews) {
      try {
        // Verificar si la reseña ya existe
        const existingReviews = await sqliteDatabase.getAllReviews(true);
        const exists = existingReviews.some(r => r.id === review.id);
        
        if (exists) {
          skipped++;
          continue;
        }

        await sqliteDatabase.createReview(review);
        migrated++;
      } catch (error) {
        this.log(`Error migrando reseña ${review.id}: ${error.message}`);
      }
    }

    this.log(`Reseñas migradas: ${migrated}, omitidas: ${skipped}`);
  }

  async migrateActivityLogs(logs) {
    this.log('Migrando logs de actividad...');
    let migrated = 0;

    for (const log of logs) {
      try {
        await sqliteDatabase.logActivity(
          log.action,
          log.description,
          log.userId
        );
        migrated++;
      } catch (error) {
        this.log(`Error migrando log ${log.id}: ${error.message}`);
      }
    }

    this.log(`Logs migrados: ${migrated}`);
  }

  async verifyMigration() {
    this.log('Verificando migración...');
    
    const sqliteStats = await sqliteDatabase.getStats();
    const hybridStats = await hybridDatabase.getStats();

    this.log(`Estadísticas SQLite: ${JSON.stringify(sqliteStats)}`);
    this.log(`Estadísticas Híbrido: ${JSON.stringify(hybridStats)}`);

    return {
      sqlite: sqliteStats,
      hybrid: hybridStats
    };
  }
}

export default DataMigration;