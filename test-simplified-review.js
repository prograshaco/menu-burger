console.log('🔍 Probando creación de reseña en servidor simplificado...');

const reviewData = {
  userId: 'admin-test-001',
  userName: 'Usuario de Prueba Simplificado',
  rating: 5,
  comment: 'Esta es una reseña de prueba para verificar el servidor simplificado.',
  approved: false
};

console.log('\n📝 Datos de la reseña a enviar:');
console.log(JSON.stringify(reviewData, null, 2));

try {
  const response = await fetch('http://localhost:3005/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData)
  });

  console.log(`\n📡 Respuesta del servidor: ${response.status} ${response.statusText}`);
  
  const result = await response.text();
  console.log('📄 Respuesta completa:', result);
  
  if (response.ok) {
    console.log('✅ Reseña creada exitosamente');
    try {
      const jsonResult = JSON.parse(result);
      console.log('📊 Datos de la reseña creada:', jsonResult);
    } catch (e) {
      console.log('⚠️ La respuesta no es JSON válido');
    }
  } else {
    console.log('❌ Error al crear reseña:');
    console.log(result);
  }
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
}