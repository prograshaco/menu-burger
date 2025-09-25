import React, { useState, useEffect } from 'react';
import { Clock, User, AlertCircle, X, Eye } from 'lucide-react';
import tempUserService from '../services/tempUserService.js';

const TempUserNotification = ({ onCreateAccount, onDismiss, onViewProfile }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [tempProfile, setTempProfile] = useState(null);

  useEffect(() => {
    // Verificar si hay un perfil temporal
    const profile = tempUserService.getTempProfile();
    if (profile) {
      setTempProfile(profile);
      setIsVisible(true);
      updateTimeRemaining();
      
      // Actualizar el tiempo cada minuto
      const interval = setInterval(updateTimeRemaining, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  const updateTimeRemaining = () => {
    const remaining = tempUserService.getFormattedTimeRemaining();
    setTimeRemaining(remaining);
    
    // Si el tiempo se agotó, ocultar la notificación
    if (remaining === 'Expirado') {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleCreateAccount = () => {
    if (onCreateAccount) onCreateAccount(tempProfile);
  };

  const handleViewProfile = () => {
    if (onViewProfile) onViewProfile(tempProfile);
  };

  if (!isVisible || !tempProfile) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Perfil Temporal
                </span>
              </div>
              <p className="text-sm text-amber-700 mb-2">
                Estás usando un perfil temporal como <strong>{tempProfile.name}</strong>. {timeRemaining} para seguir tus pedidos.
              </p>
              <div className="text-xs text-amber-600 mb-2">
                <p>• Tus pedidos se guardan automáticamente</p>
                <p>• Puedes ver tu historial en cualquier momento</p>
                <p>• ID de sesión: {tempProfile.id.slice(-8)}</p>
              </div>
              <div className="flex items-center space-x-1 mb-3">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-600">
                  Crea una cuenta para no perder el acceso
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleViewProfile}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver Perfil</span>
                </button>
                <button
                  onClick={handleCreateAccount}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
                >
                  Crear Cuenta
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 bg-white text-amber-700 text-xs font-medium rounded-md border border-amber-300 hover:bg-amber-50 transition-colors"
                >
                  Más tarde
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-2 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TempUserNotification;