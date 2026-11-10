import { Router } from 'express';
import products from './products.admin.js';
import categories from './categories.admin.js';
import posts from './posts.admin.js';
import comments from './comments.admin.js';
import orders from './orders.admin.js';
import settings from './settings.admin.js';
import uploads from '../uploads.routes.js';

const router = Router();
router.get('/me', (_req, res) => res.json({ data: res.locals.admin }));
router.use('/products', products);
router.use('/categories', categories);
router.use('/posts', posts);
router.use('/comments', comments);
router.use('/orders', orders);
router.use('/uploads', uploads);
router.use('/', settings); // /stats, /settings, /about, /catalogs/:slug
export default router;
