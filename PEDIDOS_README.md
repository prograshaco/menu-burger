# Sistema de Pedidos - Menú Burger

## 🍔 Funcionalidades Implementadas

El sistema de pedidos permite a los usuarios realizar pedidos completos sin necesidad de una base de datos, utilizando tecnologías web modernas para notificar al local.

### ✅ Características Principales

1. **Formulario de Checkout Completo**
   - Datos del cliente (nombre, teléfono, email, dirección)
   - Validación de formularios en tiempo real
   - Selección de método de notificación
   - Notas adicionales para el pedido

2. **Persistencia Local**
   - Los pedidos se guardan en `localStorage` del navegador
   - Historial de pedidos disponible localmente
   - No requiere base de datos externa

3. **Sistema de Notificaciones**
   - **Email**: Usando EmailJS (requiere configuración)
   - **WhatsApp**: Enlace directo a WhatsApp Web
   - **Copia al portapapeles**: Para usar en cualquier plataforma

4. **Confirmación de Pedido**
   - Resumen completo del pedido
   - Detalles del cliente
   - Opciones múltiples de notificación
   - Interfaz intuitiva y profesional

## 📧 Configuración de EmailJS

### Paso 1: Crear Cuenta en EmailJS
1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita
3. Verifica tu email

### Paso 2: Configurar Servicio de Email
1. En el dashboard, ve a "Email Services"
2. Haz clic en "Add New Service"
3. Selecciona tu proveedor (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. Anota el **Service ID** generado

### Paso 3: Crear Template de Email
1. Ve a "Email Templates"
2. Haz clic en "Create New Template"
3. Usa el siguiente template como base:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Nuevo Pedido - Burger Place</title>
</head>
<body>
    <h2>🍔 Nuevo Pedido Recibido</h2>
    
    <h3>📋 Información del Pedido</h3>
    <p><strong>Pedido #:</strong> {{order_id}}</p>
    <p><strong>Fecha:</strong> {{order_date}}</p>
    
    <h3>👤 Datos del Cliente</h3>
    <p><strong>Nombre:</strong> {{customer_name}}</p>
    <p><strong>Teléfono:</strong> {{customer_phone}}</p>
    <p><strong>Email:</strong> {{customer_email}}</p>
    <p><strong>Dirección:</strong> {{customer_address}}</p>
    <p><strong>Método de notificación preferido:</strong> {{notification_method}}</p>
    
    <h3>🍔 Productos Pedidos</h3>
    <pre>{{order_items}}</pre>
    
    <h3>💰 Total del Pedido</h3>
    <p style="font-size: 18px; font-weight: bold; color: #f59e0b;">{{order_total}}</p>
    
    <h3>📝 Notas Adicionales</h3>
    <p>{{order_notes}}</p>
    
    <hr>
    <p><em>Este pedido fue generado automáticamente desde el menú web.</em></p>
</body>
</html>
```

4. Guarda el template y anota el **Template ID**

### Paso 4: Obtener Public Key
1. Ve a "Account" → "General"
2. Copia tu **Public Key**

### Paso 5: Configurar en el Código
1. Abre el archivo `src/services/emailService.js`
2. Reemplaza los valores en `EMAIL_CONFIG`:

```javascript
const EMAIL_CONFIG = {
  serviceId: 'tu_service_id_aqui',
  templateId: 'tu_template_id_aqui', 
  publicKey: 'tu_public_key_aqui'
};
```

## 📱 Configuración de WhatsApp

### Actualizar Número de WhatsApp
1. Abre `src/components/OrderConfirmation.jsx`
2. Busca la línea con `const phoneNumber = '56912345678';`
3. Reemplaza con el número de WhatsApp del local (formato: código país + número sin +)

Ejemplo para Chile:
```javascript
const phoneNumber = '56987654321'; // +56 9 8765 4321
```

## 🚀 Cómo Usar el Sistema

### Para los Clientes:
1. Navegar por el menú y agregar productos al carrito
2. Hacer clic en "Proceder al Pago" en el carrito
3. Llenar el formulario con sus datos
4. Seleccionar método de notificación preferido
5. Confirmar el pedido
6. Usar los botones de notificación para contactar al local

### Para el Local:
1. **Email**: Recibirás emails automáticos con los detalles del pedido
2. **WhatsApp**: Los clientes pueden enviarte el pedido directamente
3. **Historial**: Los pedidos se guardan localmente en cada dispositivo

## 🔧 Funciones Técnicas

### Validaciones Implementadas
- Nombre requerido
- Teléfono requerido y formato válido
- Email requerido si se selecciona notificación por email
- Dirección requerida
- Formato de email válido

### Persistencia de Datos
```javascript
// Los pedidos se guardan en localStorage
const orders = JSON.parse(localStorage.getItem('burger-orders') || '[]');
```

### Estructura de Datos del Pedido
```javascript
{
  id: "timestamp_string",
  customer: {
    name: "string",
    phone: "string", 
    email: "string",
    address: "string",
    notes: "string",
    notificationMethod: "email|whatsapp|phone"
  },
  items: [
    {
      id: "string",
      name: "string",
      price: number,
      quantity: number,
      icon: "string"
    }
  ],
  total: number,
  timestamp: "ISO_string",
  status: "pending"
}
```

## 🛠️ Personalización

### Cambiar Email de Destino
En el template de EmailJS, puedes configurar a qué email llegan las notificaciones.

### Modificar Campos del Formulario
Edita `src/components/Checkout.jsx` para agregar o quitar campos.

### Personalizar Mensajes
Modifica los textos en `src/components/OrderConfirmation.jsx` para personalizar los mensajes de WhatsApp y email.

## 🐛 Solución de Problemas

### EmailJS no funciona
1. Verifica que las credenciales estén correctas
2. Revisa la consola del navegador para errores
3. Asegúrate de que el template tenga todas las variables
4. Verifica que el servicio de email esté activo

### WhatsApp no abre
1. Verifica que el número esté en formato correcto
2. Asegúrate de que WhatsApp Web esté disponible
3. Revisa que el navegador permita abrir enlaces externos

### Pedidos no se guardan
1. Verifica que localStorage esté habilitado
2. Revisa la consola para errores de JavaScript
3. Asegúrate de que no haya problemas de memoria

## 📞 Soporte

Para soporte técnico o preguntas sobre la implementación, revisa:
1. La consola del navegador para errores
2. Los logs de EmailJS en su dashboard
3. La documentación oficial de EmailJS

---

**¡El sistema está listo para usar!** Solo necesitas configurar EmailJS y actualizar el número de WhatsApp para tener un sistema completo de pedidos sin base de datos.