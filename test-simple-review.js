// Usando fetch nativo de Node.js (disponible desde v18)

const testReview = {
  userId: 'admin-test-001',
  userName: 'Usuario de Prueba',
  rating: 5,
  comment: 'Esta es una reseña de prueba para verificar la funcionalidad.',
  approved: false
};

console.log('🔍 Probando servidor simple...');
console.log('📝 Datos de la reseña a enviar:');
console.log(JSON.stringify(testReview, null, 2));

try {
  const response = await fetch('http://localhost:3002/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testReview)
  });

  console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

  if (response.ok) {
    const result = await response.json();
    console.log('✅ Reseña creada exitosamente:');
    console.log(JSON.stringify(result, null, 2));
  } else {
    const error = await response.json();
    console.log('❌ Error al crear reseña:');
    console.log(JSON.stringify(error, null, 2));
  }
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
}