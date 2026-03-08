# Multi-Tenant Hire Agreement Forms

A reusable Next.js 14 form system for equipment hire agreements. One codebase serves multiple clients via dynamic routing and per-client JSON configuration.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — responsive, professional UI
- **PDFKit** — server-side PDF generation
- **Google Drive API** — automatic upload (year/month/surname-date.pdf)
- **Resend** — email notifications with PDF attachment
- **react-signature-canvas** — digital signature capture

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in API keys
npm run dev                   # http://localhost:3000
```

Visit `http://localhost:3000/kandykrush` to see the KandyKrush form.

## Adding a New Client

1. **Create a config file** at `config/clients/<slug>.json` (copy `kandykrush.json` as a template).

2. **Required fields in config:**
   | Field | Description |
   |---|---|
   | `clientName` | Display name |
   | `slug` | URL slug (must match filename) |
   | `logo` | Path to logo in `public/clients/<slug>/logo.png` |
   | `primaryColor` | Hex colour for headings/buttons |
   | `accentColor` | Hex accent colour |
   | `notificationEmail` | Where submission emails are sent |
   | `driveFolder` | Google Drive folder ID for uploads |
   | `formTitle` | e.g. "Equipment Hire Agreement" |
   | `sections` | Array of form sections with fields |

3. **Add a logo** at `public/clients/<slug>/logo.png`.

4. **Deploy** — the new client form is instantly available at `/<slug>`.

### Field Types

| Type | Description |
|---|---|
| `text`, `email`, `tel` | Standard inputs |
| `date`, `time` | Date/time pickers |
| `textarea` | Multi-line text |
| `checkbox` | Agreement/consent checkboxes |
| `file` | File upload (with `accept` and `maxSize`) |
| `signature` | Digital signature pad |

## Environment Variables

| Variable | Description |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google service account JSON (single line) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sender email address |

## Deployment (Vercel)

```bash
vercel --prod
```

Set environment variables in the Vercel dashboard. The `config/` directory is bundled with the deployment.

## Project Structure

```
config/clients/           # Per-client JSON configs
  kandykrush.json
src/
  app/
    [clientSlug]/page.tsx  # Dynamic client pages
    api/submit/route.ts    # Form submission endpoint
  components/
    HireForm.tsx           # Client-side form component
  lib/
    clients.ts             # Config loading
    drive.ts               # Google Drive upload
    email.ts               # Resend notifications
    pdf.ts                 # PDF generation
    types.ts               # TypeScript types
```
