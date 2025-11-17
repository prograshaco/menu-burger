import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import WeatherWidget from './WeatherWidget'

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section 
      id="inicio" 
      className="pt-16 min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 text-3xl sm:text-4xl lg:text-6xl animate-bounce">🍔</div>
        <div className="absolute top-32 sm:top-40 right-4 sm:right-20 text-2xl sm:text-3xl lg:text-4xl animate-pulse">🍟</div>
        <div className="absolute bottom-32 sm:bottom-40 left-4 sm:left-20 text-3xl sm:text-4xl lg:text-5xl animate-bounce delay-1000">🥤</div>
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 text-2xl sm:text-3xl animate-pulse delay-500">🧀</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          {/* Main Title */}
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-gray-900 mb-4 sm:mb-6 leading-none">
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                Hamburguesas
              </span>
            </h1>
          </div>
          
          {/* Subtitle */}
          <div className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 font-light mb-4 max-w-4xl mx-auto leading-relaxed px-4">
              Preparadas con <span className="text-orange-600 font-semibold">amor</span> y los mejores 
              <span className="text-red-600 font-semibold"> ingredientes</span> de la región
            </p>
          </div>

          {/* Features */}
          <div className={`transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12 text-sm sm:text-base lg:text-lg text-gray-600 px-4">
              <span className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md">
                🥩 Carne Premium
              </span>
              <span className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md">
                🧀 Queso Artesanal
              </span>
              <span className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md">
                🥬 Vegetales Frescos
              </span>
              <span className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md">
                🚚 Delivery Gratis
              </span>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className={`transform transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <Link 
              to="/menu"
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                <span className="text-xl sm:text-2xl lg:text-3xl mr-2 sm:mr-3 group-hover:animate-bounce">🍔</span>
                Explorar Menú
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Weather Widget */}
          <div className={`transform transition-all duration-1000 delay-900 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="mt-8 max-w-2xl mx-auto px-4">
              <WeatherWidget />
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className={`transform transition-all duration-1000 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="mt-16 flex flex-col items-center">
              <p className="text-gray-500 text-sm mb-2">Descubre más</p>
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-sm font-semibold text-gray-800">4.9/5</p>
          <p className="text-xs text-gray-600">Rating</p>
        </div>
      </div>

      <div className="absolute top-1/3 right-10 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl transform -rotate-12 hover:rotate-0 transition-transform duration-500">
          <div className="text-4xl mb-2">🚚</div>
          <p className="text-sm font-semibold text-gray-800">15-20 min</p>
          <p className="text-xs text-gray-600">Delivery</p>
        </div>
      </div>

      <div className="absolute bottom-1/4 left-1/4 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
          <div className="text-4xl mb-2">💰</div>
          <p className="text-sm font-semibold text-gray-800">Desde $8</p>
          <p className="text-xs text-gray-600">Precios</p>
        </div>
      </div>
    </section>
  )
}

export default HeroSection