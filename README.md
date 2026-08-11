# CLINIQAI

## School clinic management made faster and safer

CLINIQAI is a digital school clinic system designed for nurses, clinic staff, and school administrators. It keeps important student health information in one secure place so staff can find the right information quickly during a clinic visit or emergency.

Instead of searching through paper files, staff can scan a student's QR code, confirm the student's identity, review relevant medical information, document care, and contact a parent or guardian from one system. CLINIQAI helps the clinic save time while keeping visit records organized and easy to review later.

### What happens during a clinic visit?

1. Staff scans the QR code on the student's ID card.
2. CLINIQAI shows the student's profile, photo, medical conditions, allergies, medications, and emergency contacts.
3. Clinic staff records the reason for the visit, vital signs, treatment, and severity.
4. The built-in AI provides decision-support guidance, possible conditions, first-aid suggestions, warning signs, and referral recommendations. A local offline guide remains available if the AI service cannot be reached.
5. The visit is saved to the student's history.
6. The parent or guardian can receive an SMS and email notification.

This system supports clinic staff. It does not replace a licensed healthcare professional or emergency medical services.

## Main features

- **Student health profiles** — Store personal details, photos, conditions, allergies, medications, emergency contacts, and previous clinic visits.
- **QR code identification** — Create and scan student QR codes to open the correct profile quickly.
- **Clinic visit records** — Record symptoms, temperature, blood pressure, pulse, treatment, medication, severity, status, and follow-up notes.
- **AI clinical decision support** — Groq AI reviews the information entered by staff and provides possible conditions, first-aid guidance, medication cautions, red flags, and referral suggestions.
- **Offline safety guidance** — Built-in rules cover common cases such as fever, injuries, asthma, allergic reactions, fainting, and wounds when the AI service is unavailable.
- **Referral management** — Create referral documents, include receiving facility information, and keep referral history with the student's records.
- **Medicine inventory** — Track medicine batches, quantities, low-stock warnings, expiration dates, and stock transactions.
- **Clinic dashboard** — View visit totals, severity summaries, active student counts, medicine status, and recent visits.
- **Staff management** — Maintain staff records and assign Admin, Nurse, Doctor, or Staff roles.
- **Parent notifications** — Send visit updates by SMS and email through the configured notification service.
- **Security and privacy controls** — Protect staff access with password hashing, authenticated sessions, and secure HTTP-only cookies.
- **Accessible responsive design** — Use the system on phones, tablets, and desktop computers with light/dark themes and voice guides.

## Technology overview

Technical details for developers and IT reviewers:

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
