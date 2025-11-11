import sgMail from '@sendgrid/mail';
import {NextApiRequest, NextApiResponse} from 'next';

// Contact form API route - handles form submissions via SendGrid
// Redeploy trigger

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const {name, email, message} = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({message: 'Missing required fields'});
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({message: 'Invalid email address'});
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY is not set');
    return res.status(500).json({message: 'Email service not configured'});
  }

  try {
    const msg = {
      to: 'contact@locumpharmacistmelbourne.com.au',
      from: 'contact@locumpharmacistmelbourne.com.au',
      replyTo: email,
      subject: `New Service Enquiry from ${name}`,
      html: `
        <h2>New Service Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This message was sent from the contact form on locumpharmacistmelbourne.com.au</small></p>
      `,
      text: `
        New Service Enquiry
        
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
        
        ---
        This message was sent from the contact form on locumpharmacistmelbourne.com.au
      `,
    };

    await sgMail.send(msg);

    return res.status(200).json({message: 'Email sent successfully'});
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({message: 'Failed to send email'});
  }
}

