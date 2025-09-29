// Usando fetch nativo de Node.js

const API_BASE = 'http://localhost:3001/api';

async function testReviewsAPI() {
  try {
    console.log('🔍 Probando API de reseñas...\n');

    // Probar obtener todas las reseñas (incluidas las no aprobadas)
    console.log('1. Obteniendo todas las reseñas (incluidas no aprobadas):');
    const allReviewsResponse = await fetch(`${API_BASE}/reviews?includeUnapproved=true`);
    const allReviews = await allReviewsResponse.json();
    console.log(`   - Total de reseñas: ${allReviews.length}`);
    allReviews.forEach(review => {
      console.log(`   - ${review.user_name}: ${review.rating}⭐ (${review.approved ? 'Aprobada' : 'Pendiente'})`);
    });

    console.log('\n2. Obteniendo solo reseñas aprobadas:');
    const approvedReviewsResponse = await fetch(`${API_BASE}/reviews`);
    const approvedReviews = await approvedReviewsResponse.json();
    console.log(`   - Total de reseñas aprobadas: ${approvedReviews.length}`);
    approvedReviews.forEach(review => {
      console.log(`   - ${review.user_name}: ${review.rating}⭐`);
    });

    console.log('\n✅ API de reseñas funcionando correctamente');

  } catch (error) {
    console.error('❌ Error al probar la API de reseñas:', error);
  }
}

testReviewsAPI();