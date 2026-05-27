import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import taskRoutes from './domain/tasks/routes/taskRoutes.js';
import userRoutes from './domain/users/routes/userRoutes.js';

const app = express();

// Cargar Swagger
let swaggerDocument;
try {
  swaggerDocument = parse(readFileSync('./src/config/openapi.yaml', 'utf8'));
  console.log('✅ Swagger cargado correctamente');
} catch (err) {
  console.log('⚠️ Error cargando Swagger:', err.message);
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Rutas
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
console.log('✅ Rutas /api/tasks registradas');
console.log('✅ Rutas /api/users registradas');

// Middleware 404
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

export default app;