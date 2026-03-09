import { NextRequest, NextResponse } from 'next/server';
import { getClientConfig } from '@/lib/clients';
import { generatePDF } from '@/lib/pdf';
import { uploadToDrive } from '@/lib/drive';
import { sendNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientSlug, formData, signature } = body;

    if (!clientSlug || !formData || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const config = getClientConfig(clientSlug);
    if (!config) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const customerName = `${formData.firstName} ${formData.lastName}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const fileName = `${formData.lastName}-${dateStr}.pdf`;

    // Generate PDF
    const pdfBuffer = await generatePDF(config, formData, signature);

    // Upload to Google Drive (optional, don't fail if it errors)
    try {
      await uploadToDrive(pdfBuffer, fileName, config.driveFolder);
    } catch (driveErr) {
      console.warn('Drive upload skipped/failed:', driveErr);
    }

    // Send email notification (optional, don't fail if not configured)
    try {
      await sendNotification(
        config.notificationEmail,
        config.clientName,
        customerName,
        pdfBuffer,
        fileName
      );
    } catch (emailErr) {
      console.warn('Email notification skipped/failed:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Agreement submitted successfully.' });
  } catch (error) {
    console.error('Submission error:', error instanceof Error ? error.stack : error);
    const message = error instanceof Error ? error.message : 'An error occurred processing your submission.';
    return NextResponse.json({ error: `Submission failed: ${message}` }, { status: 500 });
  }
}
