import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MenuPage from './pages/MenuPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import UserProfilePage from './pages/UserProfilePage'
import ReviewsPage from './pages/ReviewsPage'
import ContactPage from './pages/ContactPage'
import apiService from './services/apiService.js'
import authService from './services/authService.js'

function App() {
  useEffect(() => {
    // Inicializar la API al cargar la aplicación
    apiService.init();
    
    // Verificar sesión temporal solo si no hay usuario autenticado
    const initializeAuth = async () => {
      if (!authService.isAuthenticated()) {
        authService.checkTempSession();
      }
    };
    
    initializeAuth();
  }, []);
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App