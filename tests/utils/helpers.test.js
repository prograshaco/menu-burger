// Tests para funciones de utilidad
describe('Helper Functions', function() {

  describe('formatPrice', function() {
    // Función helper para formatear precios
    function formatPrice(price) {
      if (typeof price !== 'number' || isNaN(price)) {
        return '$0.00';
      }
      return `$${price.toFixed(2)}`;
    }

    it('debería formatear precios correctamente', function() {
      expect(formatPrice(12.99)).toBe('$12.99');
      expect(formatPrice(10)).toBe('$10.00');
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('debería manejar valores inválidos', function() {
      expect(formatPrice(null)).toBe('$0.00');
      expect(formatPrice(undefined)).toBe('$0.00');
      expect(formatPrice('invalid')).toBe('$0.00');
      expect(formatPrice(NaN)).toBe('$0.00');
    });
  });

  describe('validateEmail', function() {
    // Función helper para validar emails
    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    it('debería validar emails correctos', function() {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co')).toBe(true);
      expect(validateEmail('admin@restaurant.com')).toBe(true);
    });

    it('debería rechazar emails inválidos', function() {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('calculateTotal', function() {
    // Función helper para calcular totales
    function calculateTotal(items) {
      if (!Array.isArray(items)) return 0;
      
      return items.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
    }

    it('debería calcular el total correctamente', function() {
      const items = [
        { price: 12.99, quantity: 2 },
        { price: 5.50, quantity: 1 },
        { price: 3.25, quantity: 3 }
      ];

      const total = calculateTotal(items);
      expect(total).toBe(40.73); // (12.99*2) + (5.50*1) + (3.25*3)
    });

    it('debería manejar arrays vacíos', function() {
      expect(calculateTotal([])).toBe(0);
      expect(calculateTotal(null)).toBe(0);
      expect(calculateTotal(undefined)).toBe(0);
    });

    it('debería manejar valores inválidos en items', function() {
      const items = [
        { price: 'invalid', quantity: 2 },
        { price: 10.00, quantity: 'invalid' },
        { price: null, quantity: null }
      ];

      const total = calculateTotal(items);
      expect(total).toBe(0);
    });
  });

  describe('formatOrderTime', function() {
    // Función helper para formatear tiempo de pedidos
    function formatOrderTime(timestamp) {
      if (!timestamp) return 'Fecha no disponible';
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    it('debería formatear timestamps correctamente', function() {
      const timestamp = '2024-01-15T14:30:00Z';
      const formatted = formatOrderTime(timestamp);
      
      expect(formatted).toContain('2024');
      expect(formatted).toContain('01');
      expect(formatted).toContain('15');
    });

    it('debería manejar valores inválidos', function() {
      expect(formatOrderTime(null)).toBe('Fecha no disponible');
      expect(formatOrderTime(undefined)).toBe('Fecha no disponible');
      expect(formatOrderTime('invalid-date')).toBe('Fecha inválida');
    });
  });

});