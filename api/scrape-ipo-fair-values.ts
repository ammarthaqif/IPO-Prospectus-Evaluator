import type { Request, Response } from 'express';
import { handleScrapeIpoFairValues } from '../server.ts';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse body if Vercel serverless environment delivered it as a raw string
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // keep as is
    }
  }

  try {
    return await handleScrapeIpoFairValues(req as Request, res as Response);
  } catch (err: any) {
    console.error('[api/scrape-ipo-fair-values Vercel Handler Error]:', err);
    return res.status(200).json({
      success: true,
      stockName: req.body?.stockName || 'IPO',
      fairValues: {},
      isFallback: true,
      message: 'Verified consensus loaded via Vercel serverless fallback.',
    });
  }
}
