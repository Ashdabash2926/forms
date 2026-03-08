import PDFDocument from 'pdfkit';
import { ClientConfig } from './types';

export async function generatePDF(
  config: ClientConfig,
  data: Record<string, string | boolean>,
  signatureDataUrl: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(22).fillColor(config.primaryColor).text(config.clientName, { align: 'center' });
    doc.fontSize(16).fillColor('#333').text(config.formTitle, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#666').text(`Generated: ${new Date().toLocaleString('en-GB')}`, { align: 'center' });
    doc.moveDown(1);

    // Sections
    for (const section of config.sections) {
      doc.fontSize(13).fillColor(config.primaryColor).text(section.title);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke();
      doc.moveDown(0.3);

      for (const field of section.fields) {
        if (field.type === 'signature' || field.type === 'file') continue;
        const value = data[field.name];
        if (field.type === 'checkbox') {
          doc.fontSize(10).fillColor('#333').text(`☑ ${field.label}`, { indent: 10 });
        } else if (value) {
          doc.fontSize(10).fillColor('#666').text(`${field.label}:`, { continued: true });
          doc.fillColor('#000').text(`  ${value}`);
        }
      }
      doc.moveDown(0.8);
    }

    // Signature
    if (signatureDataUrl) {
      doc.fontSize(13).fillColor(config.primaryColor).text('Signature');
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke();
      doc.moveDown(0.5);
      try {
        const imgData = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(imgData, 'base64');
        doc.image(imgBuffer, { width: 200, height: 80 });
      } catch {
        doc.fontSize(10).text('[Signature attached]');
      }
    }

    doc.end();
  });
}
