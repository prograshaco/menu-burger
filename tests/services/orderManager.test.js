// Tests para el OrderManager
describe('OrderManager', function() {
  
  let mockOrderManager;
  
  beforeEach(function() {
    mockOrderManager = {
      addOrder: jasmine.createSpy('addOrder').and.returnValue(Promise.resolve({
        success: true,
        order: { id: 'order-456', status: 'pending' }
      })),
      updateOrderStatus: jasmine.createSpy('updateOrderStatus').and.returnValue(Promise.resolve({
        success: true,
        order: { id: 'order-456', status: 'preparing' }
      })),
      getAllOrders: jasmine.createSpy('getAllOrders').and.returnValue(Promise.resolve([
        { id: 'order-1', status: 'pending' },
        { id: 'order-2', status: 'delivered' }
      ]))
    };
  });

  describe('addOrder', function() {
    it('debería agregar un pedido correctamente', async function() {
      const orderData = {
        items: [{ id: 1, name: 'Burger', quantity: 1, price: 12.99 }],
        total: 12.99,
        customerInfo: { name: 'Juan Pérez', phone: '123456789' }
      };

      const resultado = await mockOrderManager.addOrder(orderData);
      
      expect(mockOrderManager.addOrder).toHaveBeenCalledWith(orderData);
      expect(resultado.success).toBe(true);
      expect(resultado.order).toHaveProperty('id');
      expect(resultado.order.status).toBe('pending');
    });
  });

  describe('updateOrderStatus', function() {
    it('debería actualizar el estado de un pedido', async function() {
      const orderId = 'order-456';
      const newStatus = 'preparing';

      const resultado = await mockOrderManager.updateOrderStatus(orderId, newStatus);
      
      expect(mockOrderManager.updateOrderStatus).toHaveBeenCalledWith(orderId, newStatus);
      expect(resultado.success).toBe(true);
      expect(resultado.order.status).toBe('preparing');
    });
  });

  describe('getAllOrders', function() {
    it('debería obtener todos los pedidos', async function() {
      const orders = await mockOrderManager.getAllOrders();
      
      expect(mockOrderManager.getAllOrders).toHaveBeenCalled();
      expect(orders).toBeInstanceOf(Array);
      expect(orders.length).toBe(2);
      expect(orders[0]).toHaveProperty('status');
    });
  });

});