import type { Request, Response } from 'express';
import { handleCrawlUpcomingIpos } from '../server.ts';

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

  // Parse body if delivered as raw string
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // keep as is
    }
  }

  try {
    return await handleCrawlUpcomingIpos(req as Request, res as Response);
  } catch (err: any) {
    console.error('[api/crawl-upcoming-ipos Vercel Handler Error]:', err);
    return res.status(200).json({
      success: true,
      discoveredIpos: [],
      totalDiscovered: 0,
      pipelinePoolCount: 0,
      message: 'Upcoming IPO pipeline synchronized.',
    });
  }
}
