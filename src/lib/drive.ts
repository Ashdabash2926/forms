import { google } from 'googleapis';
import { Readable } from 'stream';

export async function uploadToDrive(
  pdfBuffer: Buffer,
  fileName: string,
  folderId: string
): Promise<string | null> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.warn('Google Drive upload skipped: GOOGLE_SERVICE_ACCOUNT_KEY not set');
    return null;
  }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = now.toLocaleString('en-GB', { month: '2-digit' });

  // Ensure year/month folder structure
  const yearFolder = await findOrCreateFolder(drive, year, folderId);
  const monthFolder = await findOrCreateFolder(drive, month, yearFolder);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [monthFolder],
      mimeType: 'application/pdf',
    },
    media: {
      mimeType: 'application/pdf',
      body: Readable.from(pdfBuffer),
    },
  });

  return response.data.id || null;
}

async function findOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId: string
): Promise<string> {
  const res = await drive.files.list({
    q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
  });

  return folder.data.id!;
}
