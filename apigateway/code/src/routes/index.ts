// apigateway/routes/index.ts
import Express, { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router: Router = Express.Router();

const authProxy = createProxyMiddleware({
  target: 'http://localhost:3012/auth',
  changeOrigin: true,
});


const taskProxy = createProxyMiddleware({
  target: 'http://localhost:3010/tasks',
  changeOrigin: true,
});

router.use('/auth', authProxy);
router.use('/tasks', taskProxy);

export default router;
