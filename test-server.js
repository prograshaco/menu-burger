import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba simple
app.post('/api/reviews', async (req, res) => {
  console.log('🔍 Endpoint /api/reviews llamado');
  console.log('🔍 Datos recibidos:', req.body);
  
  try {
    // Simular creación de reseña
    const review = {
      id: 'test-review-123',
      ...req.body,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ Reseña simulada creada:', review);
    res.json(review);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de prueba ejecutándose en http://localhost:${PORT}`);
});