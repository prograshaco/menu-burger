import React, { useState, useEffect } from 'react';
import { sendOrderNotification, validateEmailConfig } from '../services/emailService';

const OrderConfirmation = ({ order, onClose, onNewOrder }) => {
  const [emailStatus, setEmailStatus] = useState(null);
  const [isEmailConfigured] = useState(validateEmailConfig());
  const [autoSentStatus, setAutoSentStatus] = useState('sending');

  // Envío automático al dueño cuando se confirma el pedido
  useEffect(() => {
    const sendAutomaticNotification = async () => {
      try {
        if (isEmailConfigured) {
          // Intentar enviar por EmailJS primero
          const result = await sendOrderNotification(order);
          if (result.success) {
            setAutoSentStatus('email-sent');
            return;
          }
        }
        
        // Si EmailJS no está configurado o falló, enviar por WhatsApp automáticamente
        sendWhatsAppMessage();
        setAutoSentStatus('whatsapp-sent');
      } catch (error) {
        console.error('Error en envío automático:', error);
        // Como fallback, enviar por WhatsApp
        sendWhatsAppMessage();
        setAutoSentStatus('whatsapp-sent');
      }
    };

    sendAutomaticNotification();
  }, [order, isEmailConfigured]);
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sendWhatsAppMessage = () => {
    const message = `¡Hola! Tengo un nuevo pedido:

` +
      `*Pedido #${order.id}*
` +
      `*Cliente:* ${order.customer.name}
` +
      `*Teléfono:* ${order.customer.phone}
` +
      `*Email:* ${order.customer.email || 'No proporcionado'}
` +
      `*Dirección:* ${order.customer.address}

` +
      `*Productos:*
` +
      order.items.map(item => 
        `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString()}`
      ).join('\n') +
      `

*Total: $${order.total.toLocaleString()}*

` +
      `*Notas:* ${order.customer.notes || 'Ninguna'}

` +
      `*Fecha:* ${formatDate(order.timestamp)}`;

    const encodedMessage = encodeURIComponent(message);
    // Reemplaza este número con el número de WhatsApp del local
    const phoneNumber = '56948919755'; // Formato: código país + número sin +
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const sendEmail = async () => {
    if (!isEmailConfigured) {
      // Fallback al método mailto si EmailJS no está configurado
      const subject = `Nuevo Pedido #${order.id} - ${order.customer.name}`;
      const body = `Nuevo pedido recibido:

` +
        `Pedido #: ${order.id}
` +
        `Cliente: ${order.customer.name}
` +
        `Teléfono: ${order.customer.phone}
` +
        `Email: ${order.customer.email || 'No proporcionado'}
` +
        `Dirección: ${order.customer.address}

` +
        `Productos:
` +
        order.items.map(item => 
          `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString()}`
        ).join('\n') +
        `

Total: $${order.total.toLocaleString()}

` +
        `Notas: ${order.customer.notes || 'Ninguna'}

` +
        `Fecha: ${formatDate(order.timestamp)}`;

      const mailtoUrl = `mailto:local@burgerplace.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      return;
    }

    // Usar EmailJS si está configurado
    setEmailStatus('sending');
    try {
      const result = await sendOrderNotification(order);
      if (result.success) {
        setEmailStatus('success');
        setTimeout(() => setEmailStatus(null), 3000);
      } else {
        setEmailStatus('error');
        setTimeout(() => setEmailStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error al enviar email:', error);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus(null), 3000);
    }
  };

  const copyOrderDetails = () => {
    const orderText = `Pedido #${order.id}
` +
      `Cliente: ${order.customer.name}
` +
      `Teléfono: ${order.customer.phone}
` +
      `Email: ${order.customer.email || 'No proporcionado'}
` +
      `Dirección: ${order.customer.address}

` +
      `Productos:
` +
      order.items.map(item => 
        `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString()}`
      ).join('\n') +
      `

Total: $${order.total.toLocaleString()}
` +
      `Notas: ${order.customer.notes || 'Ninguna'}
` +
      `Fecha: ${formatDate(order.timestamp)}`;

    navigator.clipboard.writeText(orderText).then(() => {
      alert('Detalles del pedido copiados al portapapeles');
    }).catch(() => {
      alert('No se pudo copiar al portapapeles');
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Confirmado!</h2>
            <p className="text-gray-600">Tu pedido ha sido registrado exitosamente</p>
            
            {/* Auto-send notification */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              {autoSentStatus === 'sending' && (
                <div className="flex items-center justify-center text-blue-700">
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Enviando pedido al local...</span>
                </div>
              )}
              {autoSentStatus === 'email-sent' && (
                <div className="flex items-center justify-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">✅ Pedido enviado automáticamente por email</span>
                </div>
              )}
              {autoSentStatus === 'whatsapp-sent' && (
                <div className="flex items-center justify-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">✅ Pedido enviado automáticamente por WhatsApp</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Pedido #{order.id}</h3>
              <span className="text-sm text-gray-500">{formatDate(order.timestamp)}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Cliente:</span>
                <span className="ml-2 text-gray-600">{order.customer.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Teléfono:</span>
                <span className="ml-2 text-gray-600">{order.customer.phone}</span>
              </div>
              {order.customer.email && (
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{order.customer.email}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Dirección:</span>
                <span className="ml-2 text-gray-600">{order.customer.address}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Productos</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-600">Cantidad: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      ${item.price.toLocaleString()} c/u
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-burger-yellow">${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notification Options */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">
              {autoSentStatus === 'sending' ? 'Notificar al local' : 'Opciones adicionales de notificación'}
            </h4>
            {autoSentStatus !== 'sending' && (
              <p className="text-sm text-gray-600 mb-3">
                El pedido ya fue enviado automáticamente. Puedes usar estas opciones si necesitas enviar una copia adicional.
              </p>
            )}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={sendWhatsAppMessage}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Enviar por WhatsApp
              </button>
              
              <button
                onClick={sendEmail}
                disabled={emailStatus === 'sending'}
                className={`flex items-center justify-center px-4 py-3 text-white rounded-md transition-colors ${
                  emailStatus === 'sending' 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : emailStatus === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : emailStatus === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {emailStatus === 'sending' ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : emailStatus === 'success' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Enviado!
                  </>
                ) : emailStatus === 'error' ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Error
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {isEmailConfigured ? 'Enviar por Email' : 'Abrir Email (mailto)'}
                  </>
                )}
              </button>
              
              <button
                onClick={copyOrderDetails}
                className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar detalles
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={onNewOrder}
              className="flex-1 px-4 py-2 bg-burger-yellow text-burger-dark font-semibold rounded-md hover:bg-yellow-400 transition-colors"
            >
              Nuevo Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;