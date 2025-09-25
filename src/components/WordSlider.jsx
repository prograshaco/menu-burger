import React, { useState, useEffect } from 'react'

const WordSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const words = [
    { text: "Deliciosas", emoji: "😋" },
    { text: "Artesanales", emoji: "👨‍🍳" },
    { text: "Frescas", emoji: "🌿" },
    { text: "Gourmet", emoji: "⭐" },
    { text: "Jugosas", emoji: "💧" },
    { text: "Premium", emoji: "👑" },
    { text: "Caseras", emoji: "🏠" },
    { text: "Sabrosas", emoji: "🤤" },
    { text: "Únicas", emoji: "💎" },
    { text: "Irresistibles", emoji: "🔥" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [words.length])

  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 text-6xl animate-pulse">🍔</div>
        <div className="absolute bottom-10 right-1/4 text-6xl animate-pulse delay-1000">🍟</div>
        <div className="absolute top-1/2 left-10 text-4xl animate-bounce">🥤</div>
        <div className="absolute top-1/2 right-10 text-4xl animate-bounce delay-500">🧀</div>
      </div>

      <div className="relative z-10">
        {/* Main Slider */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl text-gray-300 mb-8 font-light">
            Hamburguesas
          </h2>
          
          <div className="relative h-32 flex items-center justify-center">
            {words.map((word, index) => (
              <div
                key={index}
                className={`absolute transition-all duration-1000 transform ${
                  index === currentIndex
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-75 translate-y-8'
                }`}
              >
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-6xl animate-bounce">{word.emoji}</span>
                  <span className="text-6xl md:text-8xl font-black bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                    {word.text}
                  </span>
                  <span className="text-6xl animate-bounce delay-300">{word.emoji}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continuous Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...words, ...words, ...words].map((word, index) => (
              <div key={index} className="flex items-center mx-8 flex-shrink-0">
                <span className="text-2xl mr-2">{word.emoji}</span>
                <span className="text-3xl md:text-4xl font-bold text-orange-400">
                  {word.text}
                </span>
                <span className="text-2xl ml-2">{word.emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-12 space-x-2">
          {words.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-orange-500 scale-125'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">500+</div>
            <div className="text-gray-400">Clientes Felices</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">15</div>
            <div className="text-gray-400">Variedades</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">4.9</div>
            <div className="text-gray-400">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">24/7</div>
            <div className="text-gray-400">Disponible</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WordSlider