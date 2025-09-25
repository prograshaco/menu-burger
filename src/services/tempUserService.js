import { v4 as uuidv4 } from 'uuid';

class TempUserService {
  constructor() {
    this.storageKey = 'temp_user_profile';
    this.sessionKey = 'temp_user_session';
    this.tempUserDuration = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
  }

  // Crear un perfil temporal para usuario anónimo
  createTempProfile(orderData = {}) {
    const tempUser = {
      id: `temp_${uuidv4()}`,
      type: 'temporary',
      name: orderData.name || 'Usuario Temporal',
      phone: orderData.phone || '',
      address: orderData.address || '',
      email: orderData.email || '',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.tempUserDuration).toISOString(),
      isTemporary: true
    };

    // Guardar en localStorage
    localStorage.setItem(this.storageKey, JSON.stringify(tempUser));
    
    // Crear sesión temporal persistente
    this.createTempSession(tempUser);
    
    // Configurar limpieza automática
    this.scheduleCleanup(tempUser.id);
    
    return tempUser;
  }

  // Obtener el perfil temporal actual
  getTempProfile() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;

      const tempUser = JSON.parse(stored);
      
      // Verificar si ha expirado
      if (new Date() > new Date(tempUser.expiresAt)) {
        this.clearTempProfile();
        return null;
      }

      return tempUser;
    } catch (error) {
      console.error('Error al obtener perfil temporal:', error);
      return null;
    }
  }

  // Actualizar perfil temporal con nueva información
  updateTempProfile(updates) {
    const currentProfile = this.getTempProfile();
    if (!currentProfile) return null;

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(updatedProfile));
    return updatedProfile;
  }

  // Verificar si existe un perfil temporal válido
  hasTempProfile() {
    return this.getTempProfile() !== null;
  }

  // Limpiar perfil temporal
  clearTempProfile() {
    localStorage.removeItem(this.storageKey);
    this.clearTempSession();
  }

  // Programar limpieza automática
  scheduleCleanup(userId) {
    setTimeout(() => {
      const current = this.getTempProfile();
      if (current && current.id === userId) {
        this.clearTempProfile();
        console.log('Perfil temporal expirado y eliminado');
      }
    }, this.tempUserDuration);
  }

  // Obtener tiempo restante del perfil temporal
  getTimeRemaining() {
    const profile = this.getTempProfile();
    if (!profile) return 0;

    const remaining = new Date(profile.expiresAt) - new Date();
    return Math.max(0, remaining);
  }

  // Formatear tiempo restante para mostrar al usuario
  getFormattedTimeRemaining() {
    const remaining = this.getTimeRemaining();
    if (remaining === 0) return 'Expirado';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`;
    } else {
      return `${minutes}m restantes`;
    }
  }

  // Convertir perfil temporal a datos de usuario para la base de datos
  getTempUserForDatabase() {
    const profile = this.getTempProfile();
    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      notes: profile.notes,
      type: 'temporary',
      isTemporary: true,
      createdAt: profile.createdAt,
      expiresAt: profile.expiresAt
    };
  }

  // Migrar perfil temporal a cuenta permanente
  async migrateToPermAccount(authService, userData) {
    const tempProfile = this.getTempProfile();
    if (!tempProfile) return null;

    try {
      // Crear cuenta permanente con datos del perfil temporal
      const accountData = {
        ...userData,
        name: userData.name || tempProfile.name,
        phone: userData.phone || tempProfile.phone,
        address: userData.address || tempProfile.address
      };

      const result = await authService.register(accountData);
      
      if (result.success) {
        // Limpiar perfil temporal después de migración exitosa
        this.clearTempProfile();
        return result;
      }

      return result;
    } catch (error) {
      console.error('Error al migrar perfil temporal:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== MÉTODOS DE SESIÓN TEMPORAL =====

  // Crear sesión temporal persistente
  createTempSession(tempUser) {
    const session = {
      userId: tempUser.id,
      createdAt: tempUser.createdAt,
      expiresAt: tempUser.expiresAt,
      lastAccess: new Date().toISOString(),
      isActive: true
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  }

  // Obtener sesión temporal
  getTempSession() {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (!stored) return null;

      const session = JSON.parse(stored);
      
      // Verificar si ha expirado
      if (new Date() > new Date(session.expiresAt)) {
        this.clearTempSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error al obtener sesión temporal:', error);
      return null;
    }
  }

  // Actualizar último acceso de la sesión
  updateSessionAccess() {
    const session = this.getTempSession();
    if (session) {
      session.lastAccess = new Date().toISOString();
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }
  }

  // Verificar si hay una sesión temporal activa
  hasActiveSession() {
    const session = this.getTempSession();
    return session && session.isActive;
  }

  // Limpiar sesión temporal
  clearTempSession() {
    localStorage.removeItem(this.sessionKey);
  }

  // Reactivar sesión temporal (cuando el usuario vuelve)
  reactivateTempSession() {
    const session = this.getTempSession();
    const profile = this.getTempProfile();
    
    if (session && profile && session.userId === profile.id) {
      this.updateSessionAccess();
      return {
        user: profile,
        session: session
      };
    }
    
    return null;
  }

  // Verificar si el usuario puede acceder a sus pedidos temporales
  canAccessTempOrders() {
    return this.hasActiveSession() && this.hasTempProfile();
  }

  // Obtener información de la sesión para mostrar al usuario
  getSessionInfo() {
    const session = this.getTempSession();
    const profile = this.getTempProfile();
    
    if (!session || !profile) return null;
    
    return {
      userId: profile.id,
      userName: profile.name,
      timeRemaining: this.getFormattedTimeRemaining(),
      lastAccess: session.lastAccess,
      canAccessOrders: this.canAccessTempOrders()
    };
  }
}

export default new TempUserService();