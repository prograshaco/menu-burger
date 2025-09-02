import emailjs from '@emailjs/browser';

// Configuración de EmailJS
// IMPORTANTE: Estos valores deben ser reemplazados con los reales de tu cuenta EmailJS
const EMAIL_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID', // Reemplazar con tu Service ID
  templateId: 'YOUR_TEMPLATE_ID', // Reemplazar con tu Template ID
  publicKey: 'YOUR_PUBLIC_KEY' // Reemplazar con tu Public Key
};

// Inicializar EmailJS
const initEmailJS = () => {
  try {
    emailjs.init(EMAIL_CONFIG.publicKey);
    console.log('EmailJS inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar EmailJS:', error);
  }
};

// Enviar notificación de pedido por email
export const sendOrderNotification = async (orderData) => {
  try {
    // Formatear los items del pedido
    const itemsList = orderData.items.map(item => 
      `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');

    // Formatear la fecha
    const orderDate = new Date(orderData.timestamp).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Parámetros del template
    const templateParams = {
      order_id: orderData.id,
      customer_name: orderData.customer.name,
      customer_phone: orderData.customer.phone,
      customer_email: orderData.customer.email || 'No proporcionado',
      customer_address: orderData.customer.address,
      order_items: itemsList,
      order_total: `$${orderData.total.toLocaleString()}`,
      order_notes: orderData.customer.notes || 'Ninguna',
      order_date: orderDate,
      notification_method: orderData.customer.notificationMethod || 'email'
    };

    // Enviar email
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams
    );

    console.log('Email enviado exitosamente:', response);
    return {
      success: true,
      message: 'Notificación enviada por email exitosamente'
    };

  } catch (error) {
    console.error('Error al enviar email:', error);
    return {
      success: false,
      message: 'Error al enviar la notificación por email',
      error: error.message
    };
  }
};

// Función para validar la configuración
export const validateEmailConfig = () => {
  const isConfigured = 
    EMAIL_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
    EMAIL_CONFIG.templateId !== 'YOUR_TEMPLATE_ID' &&
    EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY';

  if (!isConfigured) {
    console.warn('⚠️ EmailJS no está configurado. Por favor actualiza las credenciales en emailService.js');
    return false;
  }

  return true;
};

// Función para probar la conexión
export const testEmailService = async () => {
  if (!validateEmailConfig()) {
    return {
      success: false,
      message: 'EmailJS no está configurado correctamente'
    };
  }

  try {
    // Enviar email de prueba
    const testParams = {
      order_id: 'TEST-001',
      customer_name: 'Cliente de Prueba',
      customer_phone: '+56 9 1234 5678',
      customer_email: 'test@example.com',
      customer_address: 'Dirección de prueba',
      order_items: '1x Hamburguesa Clásica - $8.990',
      order_total: '$8.990',
      order_notes: 'Pedido de prueba',
      order_date: new Date().toLocaleString('es-CL'),
      notification_method: 'email'
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      testParams
    );

    return {
      success: true,
      message: 'Email de prueba enviado exitosamente',
      response
    };

  } catch (error) {
    return {
      success: false,
      message: 'Error en el email de prueba',
      error: error.message
    };
  }
};

// Inicializar el servicio
initEmailJS();

// Instrucciones para configurar EmailJS
export const EMAIL_SETUP_INSTRUCTIONS = {
  steps: [
    '1. Crear cuenta en https://www.emailjs.com/',
    '2. Crear un nuevo servicio de email (Gmail, Outlook, etc.)',
    '3. Crear un template de email con las variables necesarias',
    '4. Obtener Service ID, Template ID y Public Key',
    '5. Reemplazar los valores en EMAIL_CONFIG en este archivo',
    '6. Probar con testEmailService()'
  ],
  templateVariables: [
    '{{order_id}} - ID del pedido',
    '{{customer_name}} - Nombre del cliente',
    '{{customer_phone}} - Teléfono del cliente',
    '{{customer_email}} - Email del cliente',
    '{{customer_address}} - Dirección del cliente',
    '{{order_items}} - Lista de productos',
    '{{order_total}} - Total del pedido',
    '{{order_notes}} - Notas adicionales',
    '{{order_date}} - Fecha del pedido',
    '{{notification_method}} - Método de notificación preferido'
  ]
};

export default {
  sendOrderNotification,
  validateEmailConfig,
  testEmailService,
  EMAIL_SETUP_INSTRUCTIONS
};