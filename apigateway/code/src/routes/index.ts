// apigateway/routes/index.ts
import Express, { Router, Request, Response } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';

const router: Router = Express.Router();

// helper to fix POST/PUT body
function fixRequestBody(proxyReq: any, req: Request, res: Response) {
  if (!req.body || Object.keys(req.body).length === 0) return;

  const bodyData = JSON.stringify(req.body);

  // Update headers
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

  // Write body
  proxyReq.write(bodyData);
}

// Auth Proxy
const authProxy = createProxyMiddleware({
  target: 'http://localhost:3012/auth',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody },
});

// Users Proxy
const usersProxy = createProxyMiddleware({
  target: 'http://localhost:3012/users',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody },
});

// Shop Proxy
const shopProxy = createProxyMiddleware({
  target: 'http://localhost:3014/shop',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody },
});


// Task Proxy
const taskProxy: RequestHandler = createProxyMiddleware({
  target: 'http://localhost:3010/tasks',
  changeOrigin: true,
  on: { proxyReq: fixRequestBody },
});

// Use Proxies
router.use('/auth', authProxy);
router.use('/users', usersProxy);
router.use('/shop', shopProxy);
router.use('/tasks', taskProxy);

export default router;
