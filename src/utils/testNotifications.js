import notificationService from '../services/notificationService.js';

// Función para generar notificaciones de prueba
export const generateTestNotifications = () => {
  // Simular nuevo pedido
  const mockOrder1 = {
    id: 'TEST001',
    customerName: 'Juan Pérez',
    total: 25.50,
    items: [
      { name: 'Hamburguesa Clásica', quantity: 2 },
      { name: 'Papas Fritas', quantity: 1 }
    ]
  };

  const mockOrder2 = {
    id: 'TEST002',
    customerName: 'María García',
    total: 18.75,
    items: [
      { name: 'Pizza Margherita', quantity: 1 }
    ]
  };

  // Generar notificaciones con delay para simular tiempo real
  setTimeout(() => {
    notificationService.notifyNewOrder(mockOrder1);
  }, 1000);

  setTimeout(() => {
    notificationService.notifyOrderStatusChange(mockOrder1, 'pending', 'preparing');
  }, 3000);

  setTimeout(() => {
    notificationService.notifyNewOrder(mockOrder2);
  }, 5000);

  setTimeout(() => {
    notificationService.notifyOrderStatusChange(mockOrder1, 'preparing', 'ready');
  }, 7000);

  setTimeout(() => {
    notificationService.notifyOrderStatusChange(mockOrder2, 'pending', 'preparing');
  }, 9000);

  setTimeout(() => {
    notificationService.notifyLowStock({ id: 'item1', name: 'Hamburguesa Clásica' });
  }, 11000);

  console.log('Notificaciones de prueba programadas');
};

// Función para limpiar notificaciones de prueba
export const clearTestNotifications = () => {
  notificationService.clearAll();
  console.log('Notificaciones de prueba eliminadas');
};

// Hacer las funciones disponibles globalmente para pruebas en consola
if (typeof window !== 'undefined') {
  window.testNotifications = {
    generate: generateTestNotifications,
    clear: clearTestNotifications
  };
}