import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import studentsRouter from './routes/students';
import statsRouter from './routes/stats';
import authRouter from './routes/auth';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 5000;

// ─── Middleware globaux ──────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env['FRONTEND_URL'] || '*'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🎓 StudentHub Cloud API — Opérationnelle',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

// ─── Routes API ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/stats', statsRouter);

// ─── Gestion des erreurs ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Démarrage du serveur ────────────────────────────────────────────────────
const startServer = async () => {
  console.log('\n🚀 Démarrage de StudentHub Cloud API...');
  
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️  MySQL non connecté — Certaines fonctionnalités seront indisponibles');
    console.warn('   Lancez: npm run init-db pour initialiser la base de données\n');
  }

  app.listen(PORT, () => {
    console.log(`\n✨ StudentHub API démarrée sur http://localhost:${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`👨‍🎓 Students: http://localhost:${PORT}/api/students`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/stats\n`);
  });
};

startServer().catch(console.error);

export default app;
