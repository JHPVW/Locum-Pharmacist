import {kv} from '@vercel/kv';
import {NextApiRequest, NextApiResponse} from 'next';

interface Lead {
  [key: string]: unknown;
  id: string;
  submittedAt?: string;
  abandonedAt?: string;
  timestamp?: string;
  status?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    // Get all quote IDs from the list
    const quoteIds = await kv.lrange('all_quotes', 0, -1);

    // Fetch all quote data
    const leads: Lead[] = [];
    for (const id of quoteIds) {
      const quote = await kv.get(id);
      if (quote) {
        leads.push(quote as Lead);
      }
    }

    // Sort by date (newest first)
    leads.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.abandonedAt || a.timestamp || 0);
      const dateB = new Date(b.submittedAt || b.abandonedAt || b.timestamp || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return res.status(200).json({leads});
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({error: 'Failed to fetch leads'});
  }
}
