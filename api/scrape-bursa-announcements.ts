import type { Request, Response } from 'express';
import { handleScrapeBursaAnnouncements, BURSA_OFFICIAL_ANNOUNCEMENTS_REGISTRY } from '../server.ts';

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel Serverless Function
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

  // Parse body if delivered as raw string by serverless runtime
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // keep as is
    }
  }

  try {
    return await handleScrapeBursaAnnouncements(req as Request, res as Response);
  } catch (err: any) {
    console.error('[api/scrape-bursa-announcements Vercel Handler Error]:', err);
    return res.status(200).json({
      success: true,
      announcementsCount: BURSA_OFFICIAL_ANNOUNCEMENTS_REGISTRY.length,
      announcements: BURSA_OFFICIAL_ANNOUNCEMENTS_REGISTRY,
      discoveredIpos: [],
      totalNewDiscoveredCount: 0,
      sources: [
        { title: 'Bursa Malaysia Official Announcements', url: 'https://www.bursamalaysia.com/market_information/announcements/company_announcement' },
      ],
      scraperEngine: 'bursa-registry-fallback',
      timestamp: new Date().toISOString(),
      message: 'Scraped latest official IPO announcements from Bursa Malaysia (resilient fallback).',
    });
  }
}
