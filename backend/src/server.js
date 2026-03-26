import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pharmaciesRouter } from './routes/pharmacies.js';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { ordersRouter } from './routes/orders.js';
import { adminRouter } from './routes/admin.js';
import { notificationsRouter } from './routes/notifications.js';
import { assertSupabaseEnv } from './lib/supabase.js';
import { chatRouter } from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📊 Verifying Supabase configuration...');
try {
  assertSupabaseEnv();
  console.log('✅ Supabase environment variables present');
} catch (error) {
  console.error('❌', error.message);
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '100mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediFinder API is running' });
});

app.get('/api-docs', (req, res) => {
  res.json({
    message: 'MediFinder API Documentation',
    version: '1.0.0',
    baseUrl: `http://localhost:${PORT}/api`,
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Check if the API server is running',
      },
      pharmacies: {
        getAll: {
          method: 'GET',
          path: '/api/pharmacies',
          description: 'Search and filter pharmacies',
          queryParams: ['q', 'loc', 'insurance'],
        },
        getById: {
          method: 'GET',
          path: '/api/pharmacies/:id',
          description: 'Get single pharmacy details',
        },
      },
      auth: {
        signup: {
          method: 'POST',
          path: '/api/auth/signup',
          description: 'Register a new user',
          body: {
            name: 'string (required)',
            email: 'string (required)',
            password: 'string (required, min 6 chars)',
            phone: 'string (optional)',
          },
        },
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login with email and password',
          body: {
            email: 'string (required)',
            password: 'string (required)',
          },
        },
      },
    },
    documentation: 'See README.md or API_DOCS.md for complete documentation',
  });
});

app.use('/api/pharmacies', pharmaciesRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use("/api/chat", chatRouter);
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 MediFinder API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
