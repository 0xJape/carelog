# CLINIQAI

School clinic management system for fast, accurate emergency care. Staff scan student QR codes, review medical context, record visits, and notify guardians.

## Features

- Student profiles with health history, chronic conditions, allergies, medications, photos, and emergency contacts
- QR code generation, display, camera scanning, and direct student profile lookup
- Clinic visits with symptoms, vital signs, treatment, medications, severity, status, and visit history
- AI pre-diagnosis using Groq Llama 3.1 8B Instant
- Offline rule-based AI fallback for common fever, injury, asthma, allergy, fainting, and wound cases
- AI-generated possible conditions, severity assessment, first-aid steps, medication cautions, red flags, and referral guidance
- Medical referral form generation and referral history
- Medicine inventory with batches, stock levels, low-stock alerts, expiration tracking, and transaction history
- Dashboard with visit statistics, severity breakdown, student count, inventory status, and recent visits
- Staff directory with Admin, Nurse, Doctor, and Staff roles
- Parent or guardian SMS and email notifications through Make.com, UniSMS, and Gmail
- Argon2 password hashing and secure HTTP-only session cookies
- Responsive mobile, tablet, and desktop UI
- Dark/light theme, toast feedback, voice guides, and GSAP landing-page animations

## Tech stack

| Area | Technology |
|---|---|
| Framework | SvelteKit 2, Svelte 5, Vite 7 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn-svelte, Bits UI |
| Database | PostgreSQL, Supabase; SQLite support for local/read-only use |
| ORM | Drizzle ORM |
| Authentication | Oslo sessions, secure cookies, `@node-rs/argon2` |
| AI | Groq Llama 3.1 8B Instant with local rule-based fallback |
| Speech | Groq Whisper Large V3 Turbo for transcription and `canopylabs/orpheus-v1-english` for voice output |
| QR | `qrcode`, `qr-scanner` |
| Notifications | Nodemailer, SMTP2GO, Make.com webhooks, UniSMS, Gmail |
| UI and animation | Lucide Svelte, GSAP, svelte-sonner |
| Validation | Zod, SvelteKit Superforms |

## Local development

Requirements: Node.js, pnpm, PostgreSQL or configured local database.

```bash
pnpm install
pnpm db:push
pnpm dev
```

Open `http://localhost:5173`.

Useful commands:

```bash
pnpm check       # TypeScript and Svelte diagnostics
pnpm lint        # Formatting and ESLint checks
pnpm build       # Production build
pnpm db:generate # Generate Drizzle migrations
pnpm db:studio   # Open Drizzle Studio
```

## Environment variables

Create `.env` and configure values required by your deployment:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Groq diagnosis, transcription, and speech features |
| `MAKE_WEBHOOK_URL` | Parent SMS/email notification workflow |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | SMTP email delivery |
| `PUBLIC_SUPABASE_URL` | Supabase project URL, when used |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public key, when used |

Never commit secrets. Check deployment configuration before production launch.

## Emergency visit flow

1. Scan student QR code.
2. Verify photo and student details.
3. Review conditions, allergies, medications, and contacts.
4. Record symptoms, vital signs, treatment, and severity.
5. Review AI or offline first-aid guidance and referral warnings.
6. Save visit and notify guardian.
7. Record outcome and follow-up instructions.

## Current limitation

Medical history timeline on student profile remains planned work. See `FEATURES.md` for status details and `FEATURE_TABLE.md` for module-level behavior.

## License

MIT
