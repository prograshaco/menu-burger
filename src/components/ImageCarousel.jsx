import React, { useState, useEffect } from 'react'

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const [specialties, setSpecialties] = useState([])

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch("http://localhost:3006/api/specialties")
        const data = await response.json()
        setSpecialties(data)
      } catch (error) {
        console.error("Error al cargar especialidades:", error)
      }
    }
    fetchSpecialties()
  }, [])


  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % specialties.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isAutoPlaying, specialties.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % specialties.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + specialties.length) % specialties.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <section id="especialidades" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, orange 2px, transparent 2px), radial-gradient(circle at 75% 75%, red 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 px-4">
            Nuestras 
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"> Especialidades</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Cada hamburguesa es una obra maestra culinaria, preparada con ingredientes premium y técnicas artesanales
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20 
        + max-w-screen-xl mx-auto overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Carousel */}
          <div
            className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl
            max-h-[380px] sm:max-h-[420px] md:max-h-[500px] lg:max-h-[560px] xl:max-h-[620px]"
            style={{ minHeight: "300px" }}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {specialties.map((specialty) => (
                <div key={specialty.id} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-center p-3 sm:p-5 md:p-6">
                    
                    {/* Imagen */}
                    <div className="relative order-1 lg:order-none flex justify-center items-center">
                      <img
                        src={specialty.image_url || "/uploads/images/placeholder-thumb.png"}
                        alt={specialty.name}
                        className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain rounded-2xl shadow-2xl bg-black/20 p-2 transform hover:scale-105 transition-transform duration-300"
                      />

                      {/* Precio flotante */}
                      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                        <span className="bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold">
                          ${parseFloat(specialty.price).toFixed(2)}
                        </span>
                      </div>

                      {/* Etiqueta "Popular" opcional */}
                      {specialty.popular && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold animate-pulse">
                            🔥 Popular
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="text-white space-y-2 sm:space-y-3 md:space-y-4 order-2 lg:order-none text-center lg:text-left">
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {specialty.name}
                      </h3>

                      <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-snug max-w-md mx-auto lg:mx-0">
                        <span className="font-semibold text-orange-400">Categoría:</span>{" "}
                        {specialty.category || "No especificada"}
                      </p>


                      {/* Descripción */}
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-orange-400">
                          Descripción:
                        </h4>
                        <p className="text-xs sm:text-sm md:text-base text-gray-400 leading-snug max-w-md mx-auto lg:mx-0 italic">
                          {specialty.description && specialty.description.trim() !== ""
                            ? specialty.description
                            : "Descripción no disponible"}
                        </p>
                      </div>

                      {/* Botones */}
                      <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2 pt-2">
                        <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-md">
                          🛒 Ordenar
                        </button>
                        <button className="border border-white/30 text-white px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-white/10 transition-all duration-300">
                          📋 Ver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30 text-sm sm:text-base"
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/30 text-sm sm:text-base"
          >
            →
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 sm:space-x-3 mt-6 sm:mt-8">
            {specialties.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-orange-400 to-red-400 w-6 sm:w-8' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 sm:mt-6 bg-white/20 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / specialties.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Thumbnails */}
        <div className="mt-6 sm:mt-8 lg:mt-12 grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {specialties.map((specialty, index) => (
            <button
              key={specialty.id}
              onClick={() => goToSlide(index)}
              className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl transition-all duration-300 border-2 ${
                index === currentSlide
                  ? 'border-orange-400 bg-white/20 backdrop-blur-sm'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <img
                src={specialty.image_url || "/uploads/images/placeholder-thumb.png"}
                alt={specialty.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md mx-auto mb-1"
              />
              <div className="text-white text-xs sm:text-sm font-medium text-center truncate">{specialty.name}</div>
              <div className="text-orange-400 text-xs text-center">${parseFloat(specialty.price).toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImageCarousel