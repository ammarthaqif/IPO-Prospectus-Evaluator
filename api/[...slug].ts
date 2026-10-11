import app from '../server.ts';

// Catch-all serverless function for /api/* routes on Vercel
export default function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-matched-path, x-forwarded-uri');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // If Vercel provided slug in query, normalize req.url for Express
  if (req.query && req.query.slug) {
    const slugParts = Array.isArray(req.query.slug) ? req.query.slug : [String(req.query.slug)];
    req.url = '/api/' + slugParts.join('/');
  }

  return app(req, res);
}
