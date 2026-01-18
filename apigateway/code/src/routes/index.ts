/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// apigateway/routes/index.ts
import Express, { Router, Request, Response } from 'express';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';

const router: Router = Express.Router();

// Service URLs from environment variables (for Docker) or defaults (for local dev)
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3012';
const TASKS_SERVICE_URL = process.env.TASKS_SERVICE_URL || 'http://localhost:3010';
const SHOP_SERVICE_URL = process.env.SHOP_SERVICE_URL || 'http://localhost:3014';

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

// Common proxy options for cookie handling
const commonProxyOptions = {
  changeOrigin: true,
  cookieDomainRewrite: '',
  on: { proxyReq: fixRequestBody },
};

// Auth Proxy
const authProxy = createProxyMiddleware({
  target: `${USERS_SERVICE_URL}/auth`,
  ...commonProxyOptions,
});

// Users Proxy
const usersProxy = createProxyMiddleware({
  target: `${USERS_SERVICE_URL}/users`,
  ...commonProxyOptions,
});

// Shop Proxy
const shopProxy = createProxyMiddleware({
  target: SHOP_SERVICE_URL,
  ...commonProxyOptions,
});

// Task Proxy
const taskProxy: RequestHandler = createProxyMiddleware({
  target: `${TASKS_SERVICE_URL}/tasks`,
  ...commonProxyOptions,
});

// Use Proxies
router.use('/auth', authProxy);
router.use('/users', usersProxy);
router.use('/shop', shopProxy);
router.use('/tasks', taskProxy);

export default router;
