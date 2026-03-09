import fs from 'fs';
import path from 'path';
import { ClientConfig } from './types';

// Try multiple possible locations for config files (handles Vercel serverless)
function getConfigDir(): string {
  const candidates = [
    path.join(process.cwd(), 'config', 'clients'),
    path.join(__dirname, '..', '..', '..', '..', 'config', 'clients'),
    path.join(__dirname, '..', '..', 'config', 'clients'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0];
}

export function getClientConfig(slug: string): ClientConfig | null {
  // First try filesystem
  const configDir = getConfigDir();
  const filePath = path.join(configDir, `${slug}.json`);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error('FS config read failed:', e);
  }

  // Fallback: try dynamic import from known configs
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`../../../config/clients/${slug}.json`) as ClientConfig;
  } catch {
    return null;
  }
}

export function getAllClientSlugs(): string[] {
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) return [];
  return fs
    .readdirSync(configDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}
