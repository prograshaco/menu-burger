import React, { useState, useEffect } from 'react'

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const specialties = [
    {
      id: 1,
      name: "Burger Clásica",
      description: "Nuestra hamburguesa tradicional con carne 100% angus, lechuga fresca, tomate, cebolla y nuestra salsa especial",
      image: "🍔",
      price: "$12.99",
      ingredients: ["Carne Angus", "Lechuga", "Tomate", "Cebolla", "Salsa Especial"],
      popular: true
    },
    {
      id: 2,
      name: "BBQ Deluxe",
      description: "Hamburguesa premium con carne ahumada, bacon crujiente, cebolla caramelizada y salsa BBQ artesanal",
      image: "🥓",
      price: "$15.99",
      ingredients: ["Carne Ahumada", "Bacon", "Cebolla Caramelizada", "Salsa BBQ"],
      popular: false
    },
    {
      id: 3,
      name: "Veggie Supreme",
      description: "Deliciosa opción vegetariana con hamburguesa de quinoa, aguacate, brotes frescos y mayonesa vegana",
      image: "🥬",
      price: "$11.99",
      ingredients: ["Hamburguesa Quinoa", "Aguacate", "Brotes", "Mayo Vegana"],
      popular: false
    },
    {
      id: 4,
      name: "Spicy Jalapeño",
      description: "Para los amantes del picante: carne especiada, jalapeños, queso pepper jack y salsa chipotle",
      image: "🌶️",
      price: "$14.99",
      ingredients: ["Carne Especiada", "Jalapeños", "Queso Pepper Jack", "Salsa Chipotle"],
      popular: true
    },
    {
      id: 5,
      name: "Truffle Gourmet",
      description: "Experiencia gourmet con carne wagyu, trufa negra, rúcula y queso brie en pan brioche artesanal",
      image: "🍄",
      price: "$22.99",
      ingredients: ["Carne Wagyu", "Trufa Negra", "Rúcula", "Queso Brie"],
      popular: false
    }
  ]

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
          className="relative bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/20"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {specialties.map((specialty, index) => (
                <div key={specialty.id} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center p-4 sm:p-6 lg:p-8">
                    {/* Image Side */}
                    <div className="relative order-1 lg:order-none">
                      <div className="text-center">
                        <div className="text-6xl sm:text-7xl lg:text-9xl mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
                          {specialty.image}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
                      </div>
                      
                      {/* Floating Elements */}
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                        {specialty.popular && (
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold animate-pulse">
                            🔥 Popular
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
                        <span className="bg-green-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-lg font-bold">
                          {specialty.price}
                        </span>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="text-white space-y-4 sm:space-y-6 order-2 lg:order-none">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent text-center lg:text-left">
                        {specialty.name}
                      </h3>
                      
                      <p className="text-sm sm:text-base lg:text-xl text-gray-300 leading-relaxed text-center lg:text-left">
                        {specialty.description}
                      </p>
                      
                      {/* Ingredients */}
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-orange-400 text-center lg:text-left">Ingredientes:</h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center lg:justify-start">
                          {specialty.ingredients.map((ingredient, idx) => (
                            <span 
                              key={idx}
                              className="bg-white/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm border border-white/30"
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-2 sm:pt-4">
                        <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 sm:px-6 lg:px-8 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base">
                          🛒 Ordenar Ahora
                        </button>
                        <button className="border-2 border-white/30 text-white px-4 py-2 sm:px-6 lg:px-8 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-white/10 transition-all duration-300 text-sm sm:text-base">
                          📋 Ver Detalles
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
              <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">{specialty.image}</div>
              <div className="text-white text-xs sm:text-sm font-medium hidden sm:block">{specialty.name}</div>
              <div className="text-orange-400 text-xs hidden sm:block">{specialty.price}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImageCarousel