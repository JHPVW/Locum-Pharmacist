import sgMail from '@sendgrid/mail';
import {kv} from '@vercel/kv';
import {NextApiRequest, NextApiResponse} from 'next';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface BreakdownItem {
  label: string;
  value: number;
}

interface QuoteSubmission {
  suburb: string;
  travelTime: number;
  scriptsPerDay: number;
  techQuality: string;
  ostVolume: string;
  daaComplexity: string;
  compounding: string;
  workflowPattern: string;
  email: string;
  phone?: string;
  contactPreference: string;
  pharmacyName?: string;
  rate: number;
  breakdown: BreakdownItem[];
  completedAt?: string;
  status?: string;
  abandonedAt?: string;
  abandonedStep?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const submission: QuoteSubmission = req.body;
    const timestamp = new Date().toISOString();
    const id = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in Vercel KV
    await kv.set(id, {
      ...submission,
      id,
      submittedAt: timestamp,
    });

    // Add to list of all submissions
    await kv.lpush('all_quotes', id);

    // Capture abandoned lead if email was entered but form not completed
    if (submission.email && submission.status !== 'complete') {
      const abandonedId = `abandoned_${id}`;
      await kv.set(abandonedId, {
        ...submission,
        id: abandonedId,
        abandonedAt: timestamp,
        status: 'abandoned',
      });
      await kv.lpush('all_quotes', abandonedId);
    }

    // Send email notification only for complete submissions
    if (submission.status === 'complete') {
      await sendEmailNotification(submission);
    }

    return res.status(200).json({
      success: true,
      message: 'Quote submitted successfully',
      id,
    });
  } catch (error) {
    console.error('Error processing quote:', error);
    return res.status(500).json({error: 'Failed to process quote'});
  }
}

async function sendEmailNotification(data: QuoteSubmission) {
  const {rate, breakdown, email, phone, pharmacyName, suburb, scriptsPerDay, contactPreference} = data;

  const breakdownText = breakdown
    .map(item => `  ${item.label}: ${item.value > 0 ? '+' : ''}${item.value !== 0 ? '$' + item.value : 'Base'}`)
    .join('\n');

  const emailBody = `
New Locum Quote Request

CALCULATED RATE: $${rate}/hr

Pharmacy Details:
- Name: ${pharmacyName || 'Not provided'}
- Location: ${suburb}
- Scripts/day: ${scriptsPerDay}

Rate Breakdown:
${breakdownText}

Contact Information:
- Email: ${email}
- Phone: ${phone || 'Not provided'}
- Preferred Contact: ${contactPreference}

Full Details:
${JSON.stringify(data, null, 2)}

---
Submitted: ${new Date().toLocaleString('en-AU', {timeZone: 'Australia/Melbourne'})}
  `.trim();

  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set');
    return;
  }

  try {
    const msg = {
      to: 'contact@locumpharmacistmelbourne.com.au',
      from: 'contact@locumpharmacistmelbourne.com.au',
      replyTo: email,
      subject: `New Quote Request - $${rate}/hr - ${suburb}`,
      html: `
        <h2>New Locum Quote Request</h2>
        <h3>Calculated Rate: $${rate}/hr</h3>
        
        <h4>Pharmacy Details:</h4>
        <ul>
          <li><strong>Name:</strong> ${pharmacyName || 'Not provided'}</li>
          <li><strong>Location:</strong> ${suburb}</li>
          <li><strong>Scripts/day:</strong> ${scriptsPerDay}</li>
        </ul>
        
        <h4>Rate Breakdown:</h4>
        <pre>${breakdownText}</pre>
        
        <h4>Contact Information:</h4>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
          <li><strong>Preferred Contact:</strong> ${contactPreference}</li>
        </ul>
        
        <hr>
        <p><small>Submitted: ${new Date().toLocaleString('en-AU', {timeZone: 'Australia/Melbourne'})}</small></p>
      `,
      text: emailBody,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
