// Script para probar la creación de reseñas

const API_BASE = 'http://localhost:3001/api';

async function testCreateReview() {
  try {
    console.log('🔍 Probando creación de reseña...\n');

    const reviewData = {
      userId: 'admin-test-001',
      userName: 'Usuario de Prueba',
      rating: 5,
      comment: 'Esta es una reseña de prueba para verificar la funcionalidad.',
      approved: false
    };

    console.log('📝 Datos de la reseña a enviar:');
    console.log(JSON.stringify(reviewData, null, 2));

    const response = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData)
    });

    console.log(`\n📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Reseña creada exitosamente:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Error al crear reseña:');
      console.log(error);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testCreateReview();