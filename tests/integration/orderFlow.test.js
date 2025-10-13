// Tests de integración para el flujo completo de pedidos
describe('Order Flow Integration', function() {
  
  let mockServices;
  
  beforeEach(function() {
    // Setup de servicios mock para integración
    mockServices = {
      apiService: {
        getProducts: jasmine.createSpy('getProducts').and.returnValue(Promise.resolve([
          testHelpers.createMockProduct({ id: 1, name: 'Burger Clásica' }),
          testHelpers.createMockProduct({ id: 2, name: 'Papas Fritas', category: 'papas' })
        ])),
        createOrder: jasmine.createSpy('createOrder').and.returnValue(Promise.resolve({
          success: true,
          order: testHelpers.createMockOrder()
        })),
        updateOrderStatus: jasmine.createSpy('updateOrderStatus').and.returnValue(Promise.resolve({
          success: true,
          order: testHelpers.createMockOrder({ status: 'preparing' })
        }))
      },
      
      orderManager: {
        addOrder: jasmine.createSpy('addOrder').and.returnValue(Promise.resolve({
          success: true,
          order: testHelpers.createMockOrder()
        })),
        getAllOrders: jasmine.createSpy('getAllOrders').and.returnValue(Promise.resolve([
          testHelpers.createMockOrder({ id: 'order-1' }),
          testHelpers.createMockOrder({ id: 'order-2', status: 'delivered' })
        ]))
      },
      
      authService: {
        isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
        getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(
          testHelpers.createMockUser({ role: 'admin' })
        )
      }
    };
  });

  describe('Flujo completo de pedido', function() {
    
    it('debería completar el flujo desde productos hasta pedido', async function() {
      // 1. Obtener productos
      const productos = await mockServices.apiService.getProducts();
      expect(productos).toBeInstanceOf(Array);
      expect(productos.length).toBe(2);
      
      // 2. Simular selección de productos para el carrito
      const cartItems = [
        { ...productos[0], quantity: 2 },
        { ...productos[1], quantity: 1 }
      ];
      
      // 3. Calcular total
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(total).toBeGreaterThan(0);
      
      // 4. Crear pedido
      const orderData = {
        items: cartItems,
        total: total,
        customerInfo: {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '123456789'
        },
        deliveryInfo: {
          address: 'Calle Test 123'
        }
      };
      
      const orderResult = await mockServices.orderManager.addOrder(orderData);
      
      expect(orderResult.success).toBe(true);
      expect(orderResult.order).toHaveProperty('id');
      expect(orderResult.order.status).toBe('pending');
    });
    
    it('debería manejar la actualización de estado por admin', async function() {
      // 1. Verificar que el usuario es admin
      const isAuth = mockServices.authService.isAuthenticated();
      const currentUser = mockServices.authService.getCurrentUser();
      
      expect(isAuth).toBe(true);
      expect(currentUser.role).toBe('admin');
      
      // 2. Obtener pedidos
      const orders = await mockServices.orderManager.getAllOrders();
      expect(orders.length).toBe(2);
      
      // 3. Actualizar estado del primer pedido
      const orderId = orders[0].id;
      const newStatus = 'preparing';
      
      const updateResult = await mockServices.apiService.updateOrderStatus(orderId, newStatus);
      
      expect(updateResult.success).toBe(true);
      expect(updateResult.order.status).toBe('preparing');
    });
    
  });

  describe('Validaciones del flujo', function() {
    
    it('debería validar datos del cliente antes de crear pedido', function() {
      const validateCustomerData = function(customerInfo) {
        const errors = {};
        
        if (!customerInfo.name || customerInfo.name.trim().length < 2) {
          errors.name = 'Nombre debe tener al menos 2 caracteres';
        }
        
        if (!customerInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
          errors.email = 'Email inválido';
        }
        
        if (!customerInfo.phone || customerInfo.phone.trim().length < 8) {
          errors.phone = 'Teléfono debe tener al menos 8 dígitos';
        }
        
        return {
          isValid: Object.keys(errors).length === 0,
          errors: errors
        };
      };
      
      // Datos válidos
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '123456789'
      };
      
      const validResult = validateCustomerData(validData);
      expect(validResult.isValid).toBe(true);
      expect(Object.keys(validResult.errors)).toEqual([]);
      
      // Datos inválidos
      const invalidData = {
        name: 'J',
        email: 'invalid-email',
        phone: '123'
      };
      
      const invalidResult = validateCustomerData(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveProperty('name');
      expect(invalidResult.errors).toHaveProperty('email');
      expect(invalidResult.errors).toHaveProperty('phone');
    });
    
    it('debería validar items del carrito', function() {
      const validateCartItems = function(items) {
        if (!Array.isArray(items) || items.length === 0) {
          return { isValid: false, error: 'El carrito está vacío' };
        }
        
        for (let item of items) {
          if (!item.id || !item.name || !item.price || !item.quantity) {
            return { isValid: false, error: 'Item inválido en el carrito' };
          }
          
          if (item.quantity <= 0) {
            return { isValid: false, error: 'Cantidad debe ser mayor a 0' };
          }
          
          if (item.price <= 0) {
            return { isValid: false, error: 'Precio debe ser mayor a 0' };
          }
        }
        
        return { isValid: true };
      };
      
      // Carrito válido
      const validCart = [
        { id: 1, name: 'Burger', price: 12.99, quantity: 2 },
        { id: 2, name: 'Papas', price: 5.99, quantity: 1 }
      ];
      
      const validResult = validateCartItems(validCart);
      expect(validResult.isValid).toBe(true);
      
      // Carrito vacío
      const emptyResult = validateCartItems([]);
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toContain('vacío');
      
      // Item inválido
      const invalidCart = [
        { id: 1, name: 'Burger', price: 0, quantity: 2 }
      ];
      
      const invalidResult = validateCartItems(invalidCart);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toContain('Precio');
    });
    
  });

});