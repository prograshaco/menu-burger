// Configuración global para los tests

// Mock de localStorage para tests
if (typeof window !== 'undefined' && !window.localStorage) {
  window.localStorage = {
    getItem: jasmine.createSpy('getItem').and.returnValue(null),
    setItem: jasmine.createSpy('setItem'),
    removeItem: jasmine.createSpy('removeItem'),
    clear: jasmine.createSpy('clear')
  };
}

// Mock de fetch para tests de API
if (typeof window !== 'undefined' && !window.fetch) {
  window.fetch = jasmine.createSpy('fetch').and.returnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('')
    })
  );
}

// Configuración global de Jasmine se ejecutará cuando Jasmine esté disponible

// Helper functions globales para tests
window.testHelpers = {
  // Crear un producto mock
  createMockProduct: function(overrides = {}) {
    return {
      id: 1,
      name: 'Producto Test',
      description: 'Descripción del producto test',
      price: 10.99,
      category: 'burgers',
      image: '/images/test.jpg',
      available: true,
      ...overrides
    };
  },

  // Crear un pedido mock
  createMockOrder: function(overrides = {}) {
    return {
      id: 'order-test-123',
      items: [
        { id: 1, name: 'Burger Test', quantity: 2, price: 12.99 }
      ],
      total: 25.98,
      status: 'pending',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhone: '123456789',
      deliveryAddress: 'Test Address 123',
      timestamp: new Date().toISOString(),
      ...overrides
    };
  },

  // Crear un usuario mock
  createMockUser: function(overrides = {}) {
    return {
      id: 'user-test-123',
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      role: 'customer',
      phone: '123456789',
      address: 'Test Address 123',
      active: true,
      ...overrides
    };
  }
};

console.log('✅ Test setup configurado correctamente');