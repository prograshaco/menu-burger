// Servicio API para comunicarse con el backend SQLite
const API_BASE_URL = 'http://localhost:3006/api';

class ApiService {
  // Método de inicialización (para compatibilidad)
  init() {
    console.log('ApiService initialized');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error en API request a ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos de autenticación
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  // Métodos de usuarios
  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, updates) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(id, active) {
    return this.request(`/users/${id}/toggle`, {
      method: 'PATCH',
      body: { active },
    });
  }

  // Métodos de productos
  async getProducts() {
    return this.request('/products');
  }

  async getAllProducts() {
    return this.request('/products/all');
  }

  async getProductById(id) {
    return this.request(`/products/${id}`);
  }

  async getProductCategories() {
    return this.request('/products/categories');
  }

  async getProductsByCategory(category) {
    return this.request(`/products/category/${category}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(id, updates) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async hardDeleteProduct(id) {
    return this.request(`/products/${id}/hard`, {
      method: 'DELETE',
    });
  }

  async toggleProductAvailability(id) {
    return this.request(`/products/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // Métodos de pedidos
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: orderData,
    });
  }

  async getAllOrders() {
    return this.request('/orders');
  }

  async getOrdersByUser(userId) {
    return this.request(`/orders/user/${userId}`);
  }

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id, status, adminId) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status, adminId },
    });
  }

  // Métodos de reseñas
  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: reviewData,
    });
  }

  async getAllReviews(includeUnapproved = false) {
    return this.request(`/reviews?includeUnapproved=${includeUnapproved}`);
  }

  async updateReviewApproval(id, isApproved, adminId) {
    return this.request(`/reviews/${id}/approval`, {
      method: 'PUT',
      body: { isApproved, adminId },
    });
  }

  async addReview(reviewData) {
    return this.createReview(reviewData);
  }

  async deleteReview(id, adminId = null) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
      body: { adminId },
    });
  }

  // Métodos de estadísticas
  async getStats() {
    return this.request('/stats');
  }

  // Métodos de logs de actividad
  async logActivity(action, description, userId = null) {
    return this.request('/activity-logs', {
      method: 'POST',
      body: { action, description, userId },
    });
  }

  async getActivityLogs(limit = 100) {
    return this.request(`/activity-logs?limit=${limit}`);
  }

  // Métodos específicos para orderManager
  async getAllOrdersFromDB() {
    return this.request('/orders');
  }

  async deleteOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  async getUserOrders(userId) {
    return this.request(`/orders/user/${userId}`);
  }

  async updateOrder(orderId, updateData) {
    return this.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: updateData
    });
  }
}

const apiService = new ApiService();
export default apiService;