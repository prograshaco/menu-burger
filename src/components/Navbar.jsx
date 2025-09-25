import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { User, LogIn, UserPlus, LogOut, Edit, ChevronDown } from 'lucide-react'
import AuthModal from './AuthModal.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import authService from '../services/authService.js'

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Manejar scroll para cambiar apariencia del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser()
      setCurrentUser(user)
    }
    checkAuth()
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
    setShowAuthModal(false)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setCurrentUser(null)
      setShowProfileDropdown(false)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }



  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white/90 backdrop-blur-sm shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 transform group-hover:scale-110 transition-transform duration-300">
              🍔
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              BurgerHouse
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 relative group"
            >
              Inicio
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/menu" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 relative group"
            >
              Menú
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/reviews" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 relative group"
            >
              Reseñas
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 relative group"
            >
              Contacto
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {currentUser ? (
              // Usuario autenticado
              <div className="flex items-center space-x-3">
                <NotificationCenter />
                
                {/* Dropdown de perfil */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-3 lg:px-4 py-2 rounded-lg hover:bg-orange-50 text-sm lg:text-base"
                  >
                    <User className="w-4 h-4" />
                    <span>{currentUser.name}</span>
                    {currentUser.role === 'admin' && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Admin</span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Ver/Editar Perfil</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>

                {currentUser.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 lg:px-6 py-2 rounded-full font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm lg:text-base"
                  >
                    Panel Admin
                  </Link>
                )}
              </div>
            ) : (
              // Usuario no autenticado
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-3 lg:px-4 py-2 rounded-lg hover:bg-orange-50 text-sm lg:text-base"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 lg:px-6 py-2 rounded-full font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm lg:text-base"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-4 py-2.5 rounded-lg hover:bg-orange-50 text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/menu" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-4 py-2.5 rounded-lg hover:bg-orange-50 text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menú
              </Link>
              <Link 
                to="/reviews" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-4 py-2.5 rounded-lg hover:bg-orange-50 text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reseñas
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-4 py-2.5 rounded-lg hover:bg-orange-50 text-sm sm:text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <div className="flex flex-col space-y-2 pt-3 sm:pt-4 border-t border-gray-200">
                {currentUser ? (
                  // Usuario autenticado - móvil
                  <>
                    <div className="flex items-center space-x-2 text-gray-700 px-4 py-2.5 text-sm sm:text-base">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{currentUser.name}</span>
                      {currentUser.role === 'admin' && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Admin</span>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-4 py-2.5 rounded-lg hover:bg-orange-50 text-sm sm:text-base"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Ver/Editar Perfil</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium transition-colors duration-300 px-4 py-2.5 rounded-lg hover:bg-red-50 text-sm sm:text-base w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                    {currentUser.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-full font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg text-center text-sm sm:text-base mx-4"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Panel Admin
                      </Link>
                    )}
                  </>
                ) : (
                  // Usuario no autenticado - móvil
                  <>
                    <button
                      onClick={() => {
                        openAuthModal('login')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300 px-4 py-2.5 rounded-lg hover:bg-orange-50 text-sm sm:text-base"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión</span>
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal('register')
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-full font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg text-sm sm:text-base mx-4"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Registrarse</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </nav>
  )
}

export default Navbar