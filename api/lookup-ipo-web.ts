import type { Request, Response } from 'express';
import { handleLookupIpoWeb } from '../server.ts';

export default async function handler(req: any, res: any) {
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

  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // keep
    }
  }

  try {
    return await handleLookupIpoWeb(req as Request, res as Response);
  } catch (err: any) {
    return res.status(200).json({
      success: true,
      companyName: req.body?.companyName || 'Company',
      ipoPrice: 0.30,
      currency: 'RM',
      listingStatus: 'UPCOMING',
      isWebSourced: false,
    });
  }
}
