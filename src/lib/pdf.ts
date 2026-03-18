import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ClientConfig } from './types';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

export async function generatePDF(
  config: ClientConfig,
  data: Record<string, string | boolean>,
  signatureDataUrl: string
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const [pr, pg, pb] = hexToRgb(config.primaryColor || '#1a1a2e');
  const primaryColor = rgb(pr, pg, pb);

  let y = height - 50;
  const margin = 50;

  // Title
  page.drawText(config.clientName, {
    x: margin,
    y,
    size: 22,
    font: fontBold,
    color: primaryColor,
  });
  y -= 28;

  page.drawText(config.formTitle, {
    x: margin,
    y,
    size: 16,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 20;

  page.drawText(`Generated: ${new Date().toLocaleString('en-GB')}`, {
    x: margin,
    y,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 30;

  // Sections
  for (const section of config.sections) {
    if (y < 100) break;

    // Section title
    page.drawText(section.title, {
      x: margin,
      y,
      size: 13,
      font: fontBold,
      color: primaryColor,
    });
    y -= 4;

    // Divider line
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 16;

    for (const field of section.fields) {
      if (field.type === 'signature' || field.type === 'file') continue;
      if (y < 100) break;

      const value = data[field.name];

      if (field.type === 'checkbox') {
        page.drawText(`✓ ${field.label}`, {
          x: margin + 10,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 16;
      } else if (value) {
        page.drawText(`${field.label}:`, {
          x: margin,
          y,
          size: 10,
          font: fontBold,
          color: rgb(0.4, 0.4, 0.4),
        });
        const valueText = String(value).substring(0, 80);
        page.drawText(valueText, {
          x: margin + 140,
          y,
          size: 10,
          font: fontRegular,
          color: rgb(0, 0, 0),
        });
        y -= 16;
      }
    }
    y -= 12;
  }

  // Signature
  if (signatureDataUrl && y > 120) {
    page.drawText('Signature', {
      x: margin,
      y,
      size: 13,
      font: fontBold,
      color: primaryColor,
    });
    y -= 4;

    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 16;

    try {
      const imgData = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(imgData, 'base64');
      const sigImage = await doc.embedPng(imgBuffer);
      page.drawImage(sigImage, { x: margin, y: y - 80, width: 200, height: 80 });
    } catch {
      page.drawText('[Signature attached]', {
        x: margin,
        y,
        size: 10,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
