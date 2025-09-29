import React, { useState, useEffect } from 'react'
import { Star, MessageCircle, User, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import database from '../services/database'
import authService from '../services/authService'

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
    setCurrentUser(authService.getCurrentUser())
  }, [])

  const loadReviews = async () => {
    try {
      const reviewsData = await database.getAllReviews()
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error al cargar reseñas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert('Debes iniciar sesión para dejar una reseña')
      return
    }

    if (!newReview.comment.trim()) {
      alert('Por favor escribe un comentario')
      return
    }

    try {
      await database.createReview({
        userId: currentUser.id,
        userName: currentUser.name,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        date: new Date().toISOString()
      })

      setNewReview({ rating: 5, comment: '' })
      loadReviews()
      alert('¡Reseña enviada exitosamente!')
    } catch (error) {
      console.error('Error al enviar reseña:', error)
      alert('Error al enviar la reseña')
    }
  }

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    )
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Reseñas de Nuestros Clientes
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre lo que dicen nuestros clientes sobre su experiencia en BurgerHouse
          </p>
          
          {reviews.length > 0 && (
            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                {renderStars(Math.round(getAverageRating()))}
                <span className="text-2xl font-bold text-gray-800">
                  {getAverageRating()}
                </span>
                <span className="text-gray-600">
                  ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Formulario para nueva reseña */}
          {currentUser && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-orange-600" />
                Deja tu Reseña
              </h2>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación
                  </label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="4"
                    placeholder="Comparte tu experiencia con nosotros..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors duration-300"
                >
                  Enviar Reseña
                </button>
              </form>
            </div>
          )}

          {/* Lista de reseñas */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando reseñas...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay reseñas aún
              </h3>
              <p className="text-gray-500">
                {currentUser 
                  ? '¡Sé el primero en dejar una reseña!' 
                  : 'Inicia sesión para dejar la primera reseña'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {review.user_name || review.userName || 'Usuario Anónimo'}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(review.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!currentUser && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8 text-center">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                ¿Quieres dejar una reseña?
              </h3>
              <p className="text-orange-700 mb-4">
                Inicia sesión para compartir tu experiencia con otros clientes
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors duration-300"
              >
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ReviewsPage