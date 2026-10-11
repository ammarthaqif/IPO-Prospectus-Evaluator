import app from '../server.ts';

// Vercel Serverless Function entrypoint wrapping the Express application
export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-matched-path, x-forwarded-uri');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return app(req, res);
}
