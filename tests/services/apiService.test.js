// Tests para el servicio de API
describe('ApiService', function() {
  
  // Mock del apiService para testing
  let mockApiService;
  
  beforeEach(function() {
    mockApiService = {
      request: jasmine.createSpy('request').and.returnValue(Promise.resolve({})),
      getProducts: jasmine.createSpy('getProducts').and.returnValue(Promise.resolve([
        { id: 1, name: 'Burger Test', price: 10.99, category: 'burgers' }
      ])),
      createOrder: jasmine.createSpy('createOrder').and.returnValue(Promise.resolve({
        success: true,
        order: { id: 'order-123', total: 25.99 }
      }))
    };
  });

  describe('getProducts', function() {
    it('debería obtener la lista de productos', async function() {
      const productos = await mockApiService.getProducts();
      
      expect(mockApiService.getProducts).toHaveBeenCalled();
      expect(productos).toBeInstanceOf(Array);
      expect(productos.length).toBeGreaterThan(0);
      expect(productos[0]).toHaveProperty('name');
      expect(productos[0]).toHaveProperty('price');
    });
  });

  describe('createOrder', function() {
    it('debería crear un pedido exitosamente', async function() {
      const orderData = {
        items: [{ id: 1, quantity: 2, price: 10.99 }],
        total: 21.98,
        customerName: 'Test User'
      };

      const resultado = await mockApiService.createOrder(orderData);
      
      expect(mockApiService.createOrder).toHaveBeenCalledWith(orderData);
      expect(resultado.success).toBe(true);
      expect(resultado.order).toHaveProperty('id');
      expect(resultado.order.total).toBeGreaterThan(0);
    });
  });

});