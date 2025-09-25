
const formatCLP = (n = 0) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Number(n) || 0);

const getOrderCustomerName = (order) =>
  (order?.customerName ||
   order?.customer_name ||
   order?.clientName ||
   order?.customer?.name ||
   '').toString().trim();

const getOrderTotal = (order) => {
  if (order?.total != null) return Number(order.total);
  if (order?.amount != null) return Number(order.amount);
  if (Array.isArray(order?.items)) {
    return order.items.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.quantity) || 0)), 0);
  }
  return 0;
};

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');


class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.notifications = [];
    this.maxNotifications = 5;
  }

  // Agregar un listener para notificaciones
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notificar a todos los listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.notifications);
      } catch (error) {
        console.error('Error en listener de notificaciones:', error);
      }
    });
  }

  // Agregar una nueva notificación
  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    
    // Mantener solo las últimas notificaciones
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    this.notifyListeners();
    return newNotification;
  }

  // Marcar notificación como leída
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Marcar todas como leídas
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifyListeners();
  }

  // Eliminar notificación
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  // Limpiar todas las notificaciones
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Obtener notificaciones no leídas
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Obtener todas las notificaciones
  getNotifications() {
    return [...this.notifications];
  }

  // Notificaciones específicas para pedidos
  notifyNewOrder(order) {
    try {
      const name = getOrderCustomerName(order);
      const total = getOrderTotal(order);
      const idText = shortId(order?.id);

      const message = `Pedido #${idText}${name ? ` de ${name}` : ''}`;
      const description = total > 0 ? `Total: ${formatCLP(total)}` : undefined;

      return this.addNotification({
        type: 'order',
        title: 'Nuevo Pedido',
        message,
        // si tu UI no usa "description", puedes mover esto a message o usar un campo meta
        ...(description ? { description } : {}),
        priority: 'high',
        duration: 6000,
        data: { orderId: order?.id }
      });
    } catch (e) {
      console.error('notifyNewOrder error:', e);
      // fallback mínimo
      return this.addNotification({
        type: 'order',
        title: 'Nuevo Pedido',
        message: `Pedido #${shortId(order?.id)}`,
        priority: 'high',
        duration: 6000
      });
    }
  }


  notifyOrderStatusChange(order, oldStatus, newStatus) {
    const statusMessages = {
      pending: 'ha sido recibido',
      preparing: 'está siendo preparado',
      on_the_way: 'está en camino',
      delivered: 'ha sido entregado',
      cancelled: 'ha sido cancelado'
    };

    const idText = shortId(order?.id);
    return this.addNotification({
      type: 'status_change',
      title: 'Estado de Pedido Actualizado',
      message: `Tu pedido #${order.id} ${statusMessages[newStatus] || 'ha cambiado de estado'}`,
      data: { orderId: order.id, oldStatus, newStatus },
      message: `Pedido #${idText} ${statusMessages[newStatus] || 'ha cambiado de estado'}`,
      data: { orderId: order?.id, oldStatus, newStatus },
      priority: newStatus === 'on_the_way' ? 'high' : 'medium'
    });
  }

  notifyOrderCancelled(order) {
    return this.addNotification({
      type: 'order_cancelled',
      title: 'Pedido Cancelado',
      message: `El pedido #${order.id} ha sido cancelado`,
      data: { orderId: order.id },
      priority: 'medium'
    });
  }

  notifyLowStock(item) {
    return this.addNotification({
      type: 'low_stock',
      title: 'Stock Bajo',
      message: `Quedan pocas unidades de ${item.name}`,
      data: { itemId: item.id },
      priority: 'medium'
    });
  }

  notifyTempOrderCreated(options) {
    return this.addNotification({
      type: 'temp_order',
      title: 'Pedido Temporal Creado',
      message: options.message,
      data: { orderId: options.orderId },
      priority: 'high',
      duration: options.duration || 6000
    });
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

export default notificationService;