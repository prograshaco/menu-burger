import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogIn, UserPlus } from 'lucide-react';
import AuthModal from './AuthModal.jsx';
import authService from '../services/authService.js';

const MenuHeader = ({ cartItemsCount, onCartClick, onAdminClick }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    };
    checkAuth();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };


  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🍔</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Burger Menu</h1>
              <p className="text-gray-400 text-sm">Hamburguesas Gourmet</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Botones de autenticación */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  title="Mi Perfil"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentUser.name}</span>
                  {currentUser.role === 'admin' && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">Admin</span>
                  )}
                </Link>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onAdminClick}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    title="Panel de Administración"
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="hidden sm:inline">Panel Admin</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  title="Iniciar Sesión"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  title="Registrarse"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Registro</span>
                </button>
              </div>
            )}
            
            <button
              onClick={onCartClick}
              className="relative bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
            >
              <span className="text-xl">🛒</span>
              <span>Carrito</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
        </div>

        {/* Modales */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authMode}
        />
      </header>
    );
  };
  
  export default MenuHeader;