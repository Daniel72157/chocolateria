import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { isDemo } from './lib/supabase.js';
import { publicLimiter, writeLimiter } from './middleware/rateLimit.js';
import { requireAdmin } from './middleware/requireAdmin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { publicCache } from './middleware/cache.js';
import catalogs from './routes/catalogs.routes.js';
import products from './routes/products.routes.js';
import posts from './routes/posts.routes.js';
import orders from './routes/orders.routes.js';
import pqr from './routes/pqr.routes.js';
import settings from './routes/settings.routes.js';
import sitemap from './routes/sitemap.routes.js';
import admin from './routes/admin/index.js';
import demo from './demo/router.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(',') ?? false }));
app.use(express.json({ limit: '200kb' }));

app.use(sitemap);
app.use('/api', publicLimiter);

if (isDemo) {
  console.warn('[api] Sin SUPABASE_URL: modo DEMO con datos de ejemplo en memoria.');
  app.use('/api', publicCache, demo);
} else {
  app.use('/api', publicCache, settings);
  app.use('/api/catalogs', catalogs);
  app.use('/api/products', products);
  app.use('/api/posts', posts);
  app.use('/api/orders', writeLimiter, orders);
  app.use('/api/pqr', pqr);
  app.use('/api/admin', requireAdmin, admin);
}

app.use((_req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Ruta no encontrada' } }));
app.use(errorHandler);

export default app;
