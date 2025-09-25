import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'
import orderManager from '../services/orderManager'
import { generateTestNotifications, clearTestNotifications } from '../utils/testNotifications.js'

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState({})
  const [allowNavigation, setAllowNavigation] = useState(false)
  const [showNavigationModal, setShowNavigationModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Verificar si ya está autenticado al cargar el componente
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuthenticated')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // Cargar estadísticas cuando esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const loadStats = async () => {
        try {
          const orderStats = await orderManager.getOrderStats()
          setStats(orderStats)
        } catch (error) {
          console.error('Error al cargar estadísticas:', error)
          setStats({
            total: 0,
            today: 0,
            pending: 0,
            preparing: 0,
            ready: 0,
            delivered: 0
          })
        }
      }
      
      loadStats()
      
      // Suscribirse a cambios en tiempo real
      const unsubscribe = orderManager.onOrderUpdate(() => {
        loadStats()
      })

      return unsubscribe
    }
  }, [isAuthenticated])

  // Interceptar navegación con clicks en enlaces
  useEffect(() => {
    if (isAuthenticated && !allowNavigation) {
      const handleClick = (e) => {
        const link = e.target.closest('a')
        if (link && link.href && !link.href.includes('/admin')) {
          e.preventDefault()
          setPendingNavigation(link.href)
          setShowNavigationModal(true)
        }
      }

      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [isAuthenticated, allowNavigation])

  // Proteger contra cambios de URL directos
  useEffect(() => {
    if (isAuthenticated && !allowNavigation) {
      const handlePopState = (e) => {
        e.preventDefault()
        setShowNavigationModal(true)
        setPendingNavigation(window.location.href)
        // Mantener la URL actual
        window.history.pushState(null, '', '/admin')
      }

      window.addEventListener('popstate', handlePopState)
      // Prevenir navegación hacia atrás/adelante
      window.history.pushState(null, '', '/admin')
      
      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [isAuthenticated, allowNavigation])

  // Prevenir cierre de pestaña/navegador sin cerrar sesión
  useEffect(() => {
    if (isAuthenticated && !allowNavigation) {
      const handleBeforeUnload = (e) => {
        e.preventDefault()
        e.returnValue = '¿Estás seguro de que quieres salir? Perderás la sesión de administración.'
        return '¿Estás seguro de que quieres salir? Perderás la sesión de administración.'
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [isAuthenticated, allowNavigation])

  const handleLogin = () => {
    setIsAuthenticated(true)
    sessionStorage.setItem('adminAuthenticated', 'true')
  }

  const handleLogout = () => {
    setAllowNavigation(true) // Permitir navegación antes de cerrar sesión
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuthenticated')
    // Redirigir al inicio después de cerrar sesión
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  // Modal de confirmación para navegación bloqueada
  const NavigationBlockModal = () => {
    if (!showNavigationModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Salir del Panel de Administración?
          </h3>
          <p className="text-gray-600 mb-6">
            Si sales del panel de administración perderás la sesión actual. 
            ¿Estás seguro de que quieres continuar?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setAllowNavigation(true)
                setIsAuthenticated(false)
                sessionStorage.removeItem('adminAuthenticated')
                setShowNavigationModal(false)
                if (pendingNavigation) {
                  window.location.href = pendingNavigation
                }
              }}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Sí, salir
            </button>
            <button
              onClick={() => {
                setShowNavigationModal(false)
                setPendingNavigation(null)
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header con botón de volver */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">Panel de Administración</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                <span className="font-medium">{stats.today || 0}</span> pedidos hoy
              </div>
              <button
                onClick={generateTestNotifications}
                className="px-3 py-1 text-sm bg-blue-600 text-blue-100 hover:bg-blue-700 rounded-md transition-colors"
                title="Generar notificaciones de prueba"
              >
                Probar Notificaciones
              </button>
              <button
                onClick={clearTestNotifications}
                className="px-3 py-1 text-sm bg-purple-600 text-purple-100 hover:bg-purple-700 rounded-md transition-colors"
                title="Limpiar notificaciones de prueba"
              >
                Limpiar Notificaciones
              </button>
              <button
                onClick={() => orderManager.cleanOldOrders()}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 rounded-md transition-colors"
                title="Limpiar pedidos antiguos"
              >
                Limpiar Antiguos
              </button>
              <Link 
                to="/menu" 
                className="px-3 py-1 text-sm bg-orange-600 text-orange-100 hover:bg-orange-700 rounded-md transition-colors"
                title="Ir al menú principal"
              >
                Ver Menú
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <AdminDashboard onBackToMenu={() => {}} onLogout={handleLogout} />
      
      {/* Modal de confirmación de navegación */}
      <NavigationBlockModal />
    </div>
  )
}

// Componente de Login para proteger el acceso
const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Hash de la contraseña "admin123" (simplificado para el ejemplo)
  const ADMIN_PASSWORD = 'admin123'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simular verificación
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onLogin()
      } else {
        setError('Contraseña incorrecta')
        setPassword('')
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header con botón de volver */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-burger-yellow hover:text-yellow-400 transition-colors inline-flex items-center space-x-2 mb-6"
          >
            <span>←</span>
            <span>Volver al Inicio</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Panel de Administración</h2>
          <p className="text-gray-400">Ingresa la contraseña para acceder</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burger-yellow focus:border-transparent"
              placeholder="Ingresa tu contraseña"
              required
              disabled={isLoading}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-burger-dark bg-burger-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-burger-yellow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-burger-dark mr-2"></div>
                Verificando...
              </div>
            ) : (
              'Acceder'
            )}
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Contraseña: admin123
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminPage