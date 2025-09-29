import React, { useState, useEffect } from 'react'
import apiService from '../services/apiService'
import authService from '../services/authService'

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  })
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' })
    }, 4000) // Se oculta después de 4 segundos
  }

  // Reseñas de respaldo en caso de que no haya reseñas en la base de datos
  const fallbackReviews = [
    { 
      id: 1, 
      userName: "María González", 
      rating: 5, 
      comment: "¡Las mejores hamburguesas de la ciudad! El sabor es increíble y la atención excelente. Definitivamente volveré por más.", 
      approved: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 2, 
      userName: "Carlos Rodríguez", 
      rating: 3, 
      comment: "Ingredientes frescos y de calidad premium. La carne está perfectamente cocida y los sabores se complementan a la perfección.", 
      approved: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 3, 
      userName: "Ana López", 
      rating: 2, 
      comment: "Muy buena experiencia. La entrega fue rápida y todo llegó caliente. El packaging es excelente y mantiene la temperatura.", 
      approved: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 4, 
      userName: "Pedro Martín", 
      rating: 1, 
      comment: "Excelente relación calidad-precio. Las recomiendo al 100%. El servicio al cliente es excepcional y muy amigable.", 
      approved: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  useEffect(() => {
    loadReviews()
    setCurrentUser(authService.getCurrentUser())
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const reviewsData = await apiService.getAllReviews()
      console.log('📊 Reviews data from API:', reviewsData);
      
      // Filtrar solo reseñas aprobadas
      const approvedReviews = reviewsData.filter(review => review.approved)
      console.log('✅ Approved reviews:', approvedReviews);
      
      // Si no hay reseñas aprobadas, usar las de respaldo
      if (approvedReviews.length === 0) {
        console.log('🔄 Using fallback reviews:', fallbackReviews);
        setReviews(fallbackReviews)
      } else {
        setReviews(approvedReviews)
      }
    } catch (error) {
      console.error('Error al cargar reseñas:', error)
      // En caso de error, usar las reseñas de respaldo
      setReviews(fallbackReviews)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Verificar que el usuario esté autenticado
    if (!currentUser) {
      showNotification('Debes iniciar sesión para dejar una reseña.', 'error')
      return
    }
    
    if (!newReview.comment.trim()) {
      showNotification('Por favor, escribe un comentario.', 'error')
      return
    }

    try {
      const reviewData = {
        userId: currentUser.id,
        userName: currentUser.name,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        approved: false, // Las nuevas reseñas requieren aprobación
        createdAt: new Date().toISOString()
      }

      await apiService.addReview(reviewData)
      
      setNewReview({ rating: 5, comment: '' })
      showNotification('¡Gracias por tu reseña! Será revisada y publicada pronto.', 'success')
      
      // Recargar las reseñas para mostrar cualquier cambio
      loadReviews()
    } catch (error) {
      console.error('Error al enviar reseña:', error)
      showNotification('Hubo un error al enviar tu reseña. Por favor, inténtalo de nuevo.', 'error')
    }
  }

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    // Convertir rating a número para asegurar comparación correcta
    const numericRating = Number(rating) || 0;
    
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? "button" : undefined}
        onClick={interactive ? () => onRatingChange(i + 1) : undefined}
        className={`text-xl sm:text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
          i < numericRating ? 'text-yellow-400' : 'text-gray-300'
        } flex-shrink-0`}
        disabled={!interactive}
      >
        {i < numericRating ? '★' : '☆'}
      </button>
    ))
  }

  return (
    <section id="testimonios" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Más de 1,000 clientes satisfechos respaldan la calidad de nuestras hamburguesas
          </p>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Cargando reseñas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
            {reviews.map((review, index) => (
                <div 
                key={review.id || index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-start sm:items-center mb-4 sm:mb-6 space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg lg:text-xl flex-shrink-0">
                    {(review.userName || review.name || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
                      {review.user_name || review.userName || review.name || 'Usuario Anónimo'}
                    </h3>
                    <div className="flex items-center mt-1 space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    {review.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic text-sm sm:text-base">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Review Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
            Comparte tu experiencia
          </h3>
          
          {currentUser ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={currentUser.name}
                    disabled
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm sm:text-base"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación
                </label>
                <div className="flex items-center space-x-1">
                  {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu comentario
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                placeholder="Cuéntanos sobre tu experiencia..."
                required
              />
            </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
                >
                  Enviar Reseña
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                Inicia sesión para dejar una reseña
              </h4>
              <p className="text-gray-600 mb-6">
                Necesitas tener una cuenta para compartir tu experiencia con nosotros
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-100">
            <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4">⭐</div>
            <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">4.8/5</h4>
            <p className="text-gray-600 text-sm sm:text-base">Calificación promedio</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-blue-100">
            <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4">👥</div>
            <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">1,200+</h4>
            <p className="text-gray-600 text-sm sm:text-base">Clientes satisfechos</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-100">
            <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4">🏆</div>
            <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">98%</h4>
            <p className="text-gray-600 text-sm sm:text-base">Recomendación</p>
          </div>
        </div>
      </div>

      {/* Notificación personalizada */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-auto transform transition-all duration-300 ${
          notification.show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <div className={`rounded-lg shadow-lg p-4 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                  className="inline-flex text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ReviewsSection