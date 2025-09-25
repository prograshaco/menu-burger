import React, { useState, useEffect } from 'react'
import apiService from '../services/apiService'
import authService from '../services/authService'

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  })

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
      rating: 5, 
      comment: "Ingredientes frescos y de calidad premium. La carne está perfectamente cocida y los sabores se complementan a la perfección.", 
      approved: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 3, 
      userName: "Ana López", 
      rating: 4, 
      comment: "Muy buena experiencia. La entrega fue rápida y todo llegó caliente. El packaging es excelente y mantiene la temperatura.", 
      approved: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 4, 
      userName: "Pedro Martín", 
      rating: 5, 
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
      
      // Filtrar solo reseñas aprobadas
      const approvedReviews = reviewsData.filter(review => review.approved)
      
      // Si no hay reseñas aprobadas, usar las de respaldo
      if (approvedReviews.length === 0) {
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
    
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      alert('Por favor, completa todos los campos.')
      return
    }

    try {
      const reviewData = {
        userName: newReview.name.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        approved: false, // Las nuevas reseñas requieren aprobación
        createdAt: new Date().toISOString()
      }

      await apiService.addReview(reviewData)
      
      setNewReview({ name: '', rating: 5, comment: '' })
      alert('¡Gracias por tu reseña! Será revisada y publicada pronto.')
      
      // Recargar las reseñas para mostrar cualquier cambio
      loadReviews()
    } catch (error) {
      console.error('Error al enviar reseña:', error)
      alert('Hubo un error al enviar tu reseña. Por favor, inténtalo de nuevo.')
    }
  }

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? "button" : undefined}
        onClick={interactive ? () => onRatingChange(i + 1) : undefined}
        className={`text-sm sm:text-lg ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        } flex-shrink-0`}
        disabled={!interactive}
      >
        ⭐
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
                      {review.userName || review.name || 'Usuario Anónimo'}
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
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Ingresa tu nombre"
                  required
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
    </section>
  )
}

export default ReviewsSection