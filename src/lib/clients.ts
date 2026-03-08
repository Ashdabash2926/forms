import fs from 'fs';
import path from 'path';
import { ClientConfig } from './types';

const configDir = path.join(process.cwd(), 'config', 'clients');

export function getClientConfig(slug: string): ClientConfig | null {
  const filePath = path.join(configDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getAllClientSlugs(): string[] {
  if (!fs.existsSync(configDir)) return [];
  return fs
    .readdirSync(configDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}
