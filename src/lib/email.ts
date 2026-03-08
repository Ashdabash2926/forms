import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendNotification(
  to: string,
  clientName: string,
  customerName: string,
  pdfBuffer: Buffer,
  fileName: string
): Promise<void> {
  if (!resend) {
    console.warn('Email notification skipped: RESEND_API_KEY not set');
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'forms@notifications.example.com',
    to,
    subject: `New Hire Agreement — ${customerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2>${clientName} — New Hire Agreement</h2>
        <p>A new equipment hire agreement has been submitted by <strong>${customerName}</strong>.</p>
        <p>The signed agreement is attached as a PDF.</p>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer.toString('base64'),
      },
    ],
  });
}
