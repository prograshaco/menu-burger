// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import apiService from './apiService.js';
import tempUserService from './tempUserService.js';

const JWT_SECRET = 'tu_clave_secreta_super_segura_aqui_2024';
const JWT_EXPIRES_IN = '7d';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.database = null;
    this.initDatabase();
    this.loadStoredAuth();
  }

  // Inicializar la base de datos según la configuración
  async initDatabase() {
    this.database = apiService;
  }

  // Asegurar que la base de datos esté inicializada
  async ensureDatabase() {
    if (!this.database) {
      await this.initDatabase();
    }
    return this.database;
  }

  // Cargar autenticación almacenada en localStorage
  loadStoredAuth() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('current_user');
      
      if (storedToken && storedUser) {
        try {
          this.token = storedToken;
          this.currentUser = JSON.parse(storedUser);
          this.verifyToken();
        } catch (error) {
          this.clearAuth();
        }
      }
      // Nota: Las sesiones temporales se activarán solo cuando sea necesario,
      // no automáticamente al cargar la autenticación
    }
  }

  // Verificar si el token es válido
  verifyToken() {
    if (!this.token) return false;
    
    try {
      const tokenData = JSON.parse(atob(this.token));
      const isExpired = Date.now() > tokenData.expires;
      
      if (isExpired) {
        this.clearAuth();
        return false;
      }
      
      return true;
    } catch (error) {
      this.clearAuth();
      return false;
    }
  }

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const { email, password, name, phone, address, username } = userData;

      // Validaciones básicas
      if (!email || !password || !name) {
        throw new Error('Email, contraseña y nombre son requeridos');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Crear el usuario usando la API
      const result = await apiService.register({
        email,
        password,
        name,
        username,
        phone,
        address,
        role: 'customer'
      });
      
      console.log('🔍 Resultado del registro:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al registrar usuario');
      }
      
      const newUser = result.user;

      // Generar token y establecer sesión
      const token = this.generateToken(newUser);
      this.setCurrentUser(newUser, token);

      return {
        success: true,
        user: newUser,
        token,
        message: 'Usuario registrado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Intentar login usando la API
      const result = await apiService.login(email, password);
      const user = result.user;

      // Generar token y establecer sesión
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        phone: user.phone,
        address: user.address,
        role: user.role
      };

      const token = this.generateToken(userWithoutPassword);
      this.setCurrentUser(userWithoutPassword, token);

      // Registrar actividad
      await apiService.logActivity('USER_LOGIN', `Usuario inició sesión: ${email}`, user.id);

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Sesión iniciada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Iniciar sesión por username
  async loginByUsername(username, password) {
    try {
      if (!username || !password) {
        throw new Error('Nombre de usuario y contraseña son requeridos');
      }

      // Intentar login usando la API
      const result = await apiService.login(username, password);
      const user = result.user;

      // Generar token y establecer sesión
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role
      };

      const token = this.generateToken(userWithoutPassword);
      this.setCurrentUser(userWithoutPassword, token);

      // Registrar actividad
      await apiService.logActivity('USER_LOGIN', `Usuario inició sesión: ${username}`, user.id);

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Sesión iniciada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Cerrar sesión
  async logout() {
    if (this.currentUser) {
      await apiService.logActivity('USER_LOGOUT', 'Usuario cerró sesión', this.currentUser.id);
    }
    this.clearAuth();
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  }

  // Generar token simple (sin JWT para compatibilidad con navegador)
  generateToken(user) {
    const tokenData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      timestamp: Date.now(),
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
    };
    
    // Crear un token simple codificado en base64
    return btoa(JSON.stringify(tokenData));
  }

  // Establecer usuario actual y almacenar en localStorage
  setCurrentUser(user, token) {
    this.currentUser = user;
    this.token = token;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  // Limpiar autenticación
  clearAuth() {
    this.currentUser = null;
    this.token = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return this.currentUser !== null && this.verifyToken();
  }

  // Verificar si el usuario es administrador
  isAdmin() {
    return this.isAuthenticated() && this.currentUser.role === 'admin';
  }

  // Actualizar perfil del usuario
  async updateProfile(userData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Usuario no autenticado');
      }

      const updatedUser = await apiService.updateUser(this.currentUser.id, userData);
      
      // Actualizar usuario actual
      this.currentUser = {
        ...this.currentUser,
        ...updatedUser
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_user', JSON.stringify(this.currentUser));
      }

      return {
        success: true,
        user: this.currentUser,
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword, newPassword) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Usuario no autenticado');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // Verificar contraseña actual
      const user = await apiService.getUserById(this.currentUser.id);
      
      // Verificar contraseña (comparación directa - en producción usar bcrypt)
      if (currentPassword !== user.password) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Actualizar contraseña directamente (en producción usar bcrypt)
      await apiService.updateUser(this.currentUser.id, { password: newPassword });

      await apiService.logActivity('PASSWORD_CHANGED', 'Contraseña cambiada', this.currentUser.id);

      return {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Middleware para verificar autenticación (para uso en componentes)
  requireAuth() {
    if (!this.isAuthenticated()) {
      throw new Error('Acceso denegado. Inicia sesión para continuar.');
    }
    return true;
  }

  // Middleware para verificar rol de administrador
  requireAdmin() {
    this.requireAuth();
    if (!this.isAdmin()) {
      throw new Error('Acceso denegado. Se requieren permisos de administrador.');
    }
    return true;
  }

  // Obtener estadísticas del usuario (para dashboard)
  async getUserStats() {
    try {
      this.requireAuth();
      
      const orders = await apiService.getUserOrders(this.currentUser.id);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      return {
        totalOrders,
        totalSpent,
        pendingOrders,
        recentOrders: orders.slice(0, 5)
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== MÉTODOS PARA SESIONES TEMPORALES =====

  // Verificar y reactivar sesión temporal
  checkTempSession() {
    try {
      const tempSession = tempUserService.reactivateTempSession();
      if (tempSession) {
        this.currentUser = tempSession.user;
        this.token = this.generateTempToken(tempSession.user);
        console.log('Sesión temporal reactivada:', tempSession.user.name);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al verificar sesión temporal:', error);
      return false;
    }
  }

  // Crear sesión temporal para usuario anónimo
  createTempSession(orderData) {
    try {
      const tempUser = tempUserService.createTempProfile(orderData);
      this.currentUser = tempUser;
      this.token = this.generateTempToken(tempUser);
      
      console.log('Sesión temporal creada:', tempUser.name);
      return {
        success: true,
        user: tempUser,
        token: this.token
      };
    } catch (error) {
      console.error('Error al crear sesión temporal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generar token temporal (más simple que JWT)
  generateTempToken(tempUser) {
    const tokenData = {
      userId: tempUser.id,
      type: 'temporary',
      expires: new Date(tempUser.expiresAt).getTime(),
      created: Date.now()
    };
    
    return btoa(JSON.stringify(tokenData));
  }

  // Verificar si el usuario actual es temporal
  isTempUser() {
    return this.currentUser && this.currentUser.isTemporary === true;
  }

  // Obtener información de la sesión temporal
  getTempSessionInfo() {
    if (!this.isTempUser()) return null;
    
    return tempUserService.getSessionInfo();
  }

  // Limpiar sesión temporal
  clearTempSession() {
    if (this.isTempUser()) {
      tempUserService.clearTempSession();
      this.clearAuth();
    }
  }

  // Verificar si puede acceder a pedidos temporales
  canAccessTempOrders() {
    return this.isTempUser() && tempUserService.canAccessTempOrders();
  }

  // Migrar sesión temporal a cuenta permanente
  async migrateTempToAccount(userData) {
    if (!this.isTempUser()) {
      throw new Error('No hay sesión temporal activa para migrar');
    }

    try {
      const result = await tempUserService.migrateToPermAccount(this, userData);
      if (result.success) {
        // La sesión temporal se limpia automáticamente en migrateToPermAccount
        return result;
      }
      return result;
    } catch (error) {
      console.error('Error al migrar sesión temporal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Extender sesión temporal (actualizar último acceso)
  extendTempSession() {
    if (this.isTempUser()) {
      tempUserService.updateSessionAccess();
    }
  }

  // Verificar si la sesión temporal está por expirar
  isTempSessionExpiring() {
    if (!this.isTempUser()) return false;
    
    const remaining = tempUserService.getTimeRemaining();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutos en ms
    
    return remaining > 0 && remaining < thirtyMinutes;
  }
}

export default new AuthService();