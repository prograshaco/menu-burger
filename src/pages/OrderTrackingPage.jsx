import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Package } from 'lucide-react';
import OrderTracking from '../components/OrderTracking.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchOrderId, setSearchOrderId] = useState(orderId || '');
  const [currentOrderId, setCurrentOrderId] = useState(orderId || '');
  const [showTracking, setShowTracking] = useState(!!orderId);

  useEffect(() => {
    if (orderId) {
      setCurrentOrderId(orderId);
      setShowTracking(true);
    }
  }, [orderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrderId.trim()) {
      setCurrentOrderId(searchOrderId.trim());
      setShowTracking(true);
      // Actualizar la URL sin recargar la página
      window.history.pushState({}, '', `/order-tracking/${searchOrderId.trim()}`);
    }
  };

  const handleCloseTracking = () => {
    setShowTracking(false);
    setCurrentOrderId('');
    navigate('/order-tracking');
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Seguimiento de Pedidos
            </h1>
            <p className="text-gray-600">
              Ingresa tu número de pedido para ver el estado actual
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Número de pedido (ej: ORD-123456)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Buscar Pedido
            </button>
          </form>
        </div>

        {/* Instructions */}
        {!showTracking && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Cómo encontrar tu número de pedido?
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-orange-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmación por email</p>
                    <p>Revisa tu correo electrónico para encontrar el número de pedido en la confirmación.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-orange-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Mensaje de WhatsApp</p>
                    <p>Si enviaste tu pedido por WhatsApp, el número aparece en la conversación.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-orange-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Perfil de usuario</p>
                    <p>Si tienes una cuenta, puedes ver todos tus pedidos en tu perfil.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Formato del número:</strong> Los números de pedido tienen el formato ORD-XXXXXX 
                  (ej: ORD-123456)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      {showTracking && currentOrderId && (
        <OrderTracking
          orderId={currentOrderId}
          onClose={handleCloseTracking}
        />
      )}

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;