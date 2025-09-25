import React, { useState } from 'react'

const Footer = () => {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    console.log('Newsletter subscription:', email)
    setEmail('')
    alert('¡Gracias por suscribirte! Recibirás nuestras mejores ofertas.')
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, orange 2px, transparent 2px), radial-gradient(circle at 80% 80%, red 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              🍔 ¡No te pierdas nuestras ofertas especiales!
            </h3>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 px-2">
              Suscríbete a nuestro newsletter y recibe descuentos exclusivos, nuevos sabores y promociones especiales
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email aquí..."
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-gray-900 font-medium focus:ring-4 focus:ring-white/30 focus:outline-none text-sm sm:text-base"
                required
              />
              <button
                type="submit"
                className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
              
              {/* Company Info */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="text-3xl sm:text-4xl mr-2 sm:mr-3">🍔</div>
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    BurgerHouse
                  </h3>
                </div>
                <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Desde 2020, creamos las mejores hamburguesas artesanales con ingredientes frescos y de la más alta calidad. 
                  Nuestra pasión es brindarte una experiencia culinaria inolvidable.
                </p>
                
                {/* Social Media */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="font-semibold text-orange-400 text-sm sm:text-base">Síguenos en:</h4>
                  <div className="flex space-x-3 sm:space-x-4">
                    {[
                      { icon: '📘', name: 'Facebook', link: '#' },
                      { icon: '📷', name: 'Instagram', link: '#' },
                      { icon: '🐦', name: 'Twitter', link: '#' },
                      { icon: '📺', name: 'YouTube', link: '#' }
                    ].map((social) => (
                      <a
                        key={social.name}
                        href={social.link}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 transform hover:scale-110 transition-all duration-300 border border-white/20"
                        title={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-orange-400">Enlaces Rápidos</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {[
                    { name: 'Inicio', link: '#inicio' },
                    { name: 'Menú Completo', link: '#menu' },
                    { name: 'Especialidades', link: '#especialidades' },
                    { name: 'Testimonios', link: '#testimonios' },
                    { name: 'Sobre Nosotros', link: '#nosotros' },
                    { name: 'Contacto', link: '#contacto' }
                  ].map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.link}
                        className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center group text-sm sm:text-base"
                      >
                        <span className="mr-2 group-hover:mr-3 transition-all duration-300">→</span>
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-orange-400">Nuestros Servicios</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {[
                    { name: 'Delivery 24/7', icon: '🚚' },
                    { name: 'Reservas Online', icon: '📅' },
                    { name: 'Eventos Privados', icon: '🎉' },
                    { name: 'Catering Empresarial', icon: '🏢' },
                    { name: 'Programa de Lealtad', icon: '⭐' },
                    { name: 'App Móvil', icon: '📱' }
                  ].map((service) => (
                    <li key={service.name} className="flex items-center text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm sm:text-base">
                      <span className="text-lg sm:text-xl mr-2 sm:mr-3">{service.icon}</span>
                      {service.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-orange-400">Información de Contacto</h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start">
                    <span className="text-xl sm:text-2xl mr-2 sm:mr-3 mt-1">📍</span>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Dirección Principal</p>
                      <p className="text-gray-300 text-sm sm:text-base">Av. Gourmet 123, Centro<br />Ciudad Gastronómica, CP 12345</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📞</span>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Teléfono</p>
                      <p className="text-gray-300 text-sm sm:text-base">+1 (555) 123-BURGER</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-xl sm:text-2xl mr-2 sm:mr-3">✉️</span>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Email</p>
                      <p className="text-gray-300 text-sm sm:text-base">hola@burgerhouse.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-xl sm:text-2xl mr-2 sm:mr-3 mt-1">🕒</span>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Horarios</p>
                      <p className="text-gray-300 text-sm sm:text-base">
                        Lun - Dom: 11:00 AM - 11:00 PM<br />
                        Delivery 24/7
                      </p>
                    </div>
                  </div>
                </div>

                {/* Awards */}
                <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                  <h5 className="font-semibold mb-2 sm:mb-3 text-orange-400 text-sm sm:text-base">Reconocimientos</h5>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                    <p>🏆 Mejor Hamburguesa 2023</p>
                    <p>⭐ 5 estrellas en Google</p>
                    <p>🥇 Premio Calidad Gastronómica</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-gray-400 text-center sm:text-left">
                <p className="text-sm sm:text-base">&copy; 2024 BurgerHouse. Todos los derechos reservados.</p>
                <p className="text-xs sm:text-sm mt-1">Hecho con ❤️ y mucha pasión por las hamburguesas</p>
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Política de Privacidad
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Términos de Servicio
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer