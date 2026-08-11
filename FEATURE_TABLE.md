# CLINIQAI — Feature Description Table

> AI-Integrated School Clinic Management System
> Last updated: 2026-07-07

---

## Module 1: Student Health Records

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 1.1 | **Student Registration** | Register new students with complete profile information including personal details, grade, section, and a school-assigned student ID. | Nurse or admin fills in the student form modal. A unique internal UUID and QR code ID are auto-generated. Data is stored in the `students` table in PostgreSQL. |
| 1.2 | **Student Profile View** | A dedicated profile page for each student showing all personal, medical, and emergency contact information at a glance. | Accessible at `/students/[studentId]`. Loads student data, emergency contacts, and recent visit history from the database in a single server-side load. |
| 1.3 | **Chronic Health Conditions** | Store and display the student's known chronic conditions (e.g., asthma, diabetes, epilepsy) on their profile. | Stored as a JSONB string array on the student record. Displayed as badges on the profile page and passed to the AI pre-diagnosis engine for context-aware analysis. |
| 1.4 | **Allergies & Health History** | Free-text field capturing the student's known allergies, past illnesses, and relevant health notes. | Stored in the `health_history` text field. The AI engine reads this before generating medication suggestions to avoid allergen conflicts. |
| 1.5 | **Current Medications** | List of ongoing medications the student is currently taking, stored on their profile. | Stored as a JSONB string array. Surfaced on the profile and sent to the AI engine so it can check for drug interactions or conflicts. |
| 1.6 | **Emergency Contacts** | Multiple emergency contacts per student (parent, guardian, relative) with phone, email, relationship, and priority ranking. | Stored in the `emergency_contacts` table linked to the student. The highest-priority contact with a phone or email is auto-notified when a clinic visit is created. |
| 1.7 | **QR Code per Student** | Each student has a unique QR code tied to their student ID that can be printed on their ID card. | Generated via the `/api/qr` endpoint using the `qrcode` library. Displayed in a modal on the student profile. Scanning the QR code resolves to the student's profile page. |
| 1.8 | **Clinic Visit Creation** | Record a new clinic visit for a student directly from their profile page. | A modal collects visit type, severity, reason, details, vitals (temp/BP/pulse), nurse, and medications given. Submitted via SvelteKit form action `?/createVisit` and saved to the `clinic_visits` table. |
| 1.9 | **Vital Signs Recording** | Capture the student's temperature (°C), blood pressure (systolic/diastolic mmHg), and pulse (bpm) during a clinic visit. | Optional fields in the new visit modal. Values are serialized as JSON and saved to the `vital_signs` JSONB column on the visit record. |
| 1.10 | **Visit History per Student** | View the last 10 clinic visits for each student directly on their profile page. | Queried from `clinic_visits` ordered by check-in time descending, joined with the attending nurse's name. |
| 1.11 | **Visit Detail View** | Full detail page for each clinic visit showing all recorded information — vitals, diagnosis, treatment, medications, severity, and status. | Accessible at `/visits/[id]`. Displays a structured card layout with badges for visit type and severity, and quick stats at a glance. |
| 1.12 | **All Visits List** | Paginated, sortable, filterable table of all clinic visits across all students. | Accessible at `/visits`. Supports filtering by date, type, and severity. Includes student name, grade, nurse, and visit status. |

---

## Module 2: AI Pre-Diagnosis

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 2.1 | **AI Symptom Analysis** | Analyzes the nurse-entered reason and symptom details against the student's medical profile to suggest possible diagnoses. | A POST request to `/api/ai-diagnosis` sends the case to Groq Llama 3.1 8B Instant with a structured prompt. The response is parsed as structured JSON. |
| 2.2 | **Student Medical Context** | The AI is automatically given the student's age, gender, chronic conditions, current medications, and health history before analyzing symptoms. | Data is fetched server-side from the database — the client never sends medical data. This prevents data tampering and ensures the AI always has accurate context. |
| 2.3 | **Possible Conditions** | The AI returns 2–4 possible conditions ranked by likelihood (High / Moderate / Low) with a one-sentence clinical explanation for each. | Displayed in the "Causes" tab of the AI result card. Each condition shows a color-coded likelihood badge (red/amber/green). |
| 2.4 | **Severity Auto-Assessment** | The AI independently assesses the severity of the case (Low / Moderate / High / Critical) based on the symptoms and medical context. | The AI-assessed severity is automatically applied to the severity field in the visit form, which the nurse can override. Uses its own clinical reasoning rather than copying the nurse's initial guess. |
| 2.5 | **Medication Suggestions** | Suggests appropriate OTC medications for the school clinic (e.g., Paracetamol, ORS, Cetirizine) with dosage notes and allergy cautions. | Displayed in the "Treatment" tab. For structural injuries (dislocation, fracture), medications are deprioritized behind immobilization. Allergy conflicts flagged with amber warning. Dosage notes are kept short (e.g., "500mg every 4-6 hrs"). |
| 2.6 | **First Aid Steps** | Step-by-step first aid instructions the nurse can follow immediately, generated from the AI's analysis of the presenting case. | Displayed in the "First Aid" tab as a numbered list with circular step indicators. Injury cases prioritize immobilization over medication. |
| 2.7 | **Red Flags & Escalation Warnings** | A list of warning signs the nurse should watch for that indicate the student needs urgent escalation or emergency referral. | Displayed in the "Red Flags" tab with amber warning icons. Each flag is a concise phrase (e.g., "No pulse below injury", "Temperature >40°C"). |
| 2.8 | **Referral Recommendation** | The AI flags whether the case requires referral to a physician or hospital, with a one-sentence reason. | Shown as a red banner at the top of the AI result card when referral is recommended. A "Refer" pill badge also appears in the summary bar for quick scanning. |
| 2.9 | **Tabbed Result UI** | The AI result is organized into 4 tabs (Causes / Treatment / First Aid / Red Flags) so the nurse only reads what she needs. | Built with a simple `$state`-based tab switcher. The summary bar with severity and referral flag is always visible above the tabs regardless of which tab is active. |
| 2.10 | **Animated Loading State** | A polished loading animation plays while the AI processes the request, showing 4 animated steps with progress bars. | A pulsing Sparkles icon with concentric ping/pulse rings, plus 4 staggered fade-in steps ("Reading student medical profile", "Matching symptoms to conditions", etc.) each with a looping progress bar. |
| 2.11 | **Add to Details** | The nurse can append the AI's findings as a brief clinical note to the visit details field with one click. | Writes a condensed 3–4 line note (possible conditions, care, medications, referral if applicable) — deliberately short and neutral so it doesn't alarm parents if referenced in notifications. |
| 2.12 | **Offline Rule-Based Fallback** | If the Groq API is unavailable, the system automatically falls back to a local rule-based engine that matches symptoms to pre-defined protocols. | `ai-rules.ts` contains 10 rules covering fever, headache, stomach issues, dislocation, fracture, sprain, wound, asthma, allergic reaction, and fainting. Keyword matching on reason + details + visit type. An amber "Offline mode" badge appears in the result card when the fallback fires. |

---

## Module 3: First Aid Guidance

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 3.1 | **AI-Generated First Aid Steps** | Context-aware, step-by-step first aid instructions generated from the student's presenting symptoms and medical history. | Included in the AI pre-diagnosis response. Each step is one short, actionable sentence. Injury cases always prioritize immobilization and "do not attempt reduction" instructions before any medication. |
| 3.2 | **Emergency Escalation Alerts** | Clear red flags shown to the nurse indicating when a case requires urgent escalation beyond school clinic care. | Displayed in the Red Flags tab with amber icons. Examples: "Breathing difficulty after 2 inhaler doses", "Bone visible through skin", "Loss of consciousness". |
| 3.3 | **Injury-Specific Protocols** | Special handling for common sports injuries (dislocation, fracture, sprain) — immobilization-first, referral-recommended. | Built into both the AI prompt instructions and the offline rule engine. The prompt explicitly instructs Gemini to never suggest attempting joint reduction and to always lead with immobilization for structural injuries. |
| 3.4 | **Referral Guidance** | Clear recommendation on whether the student needs to be referred to a physician or hospital, with the specific reason stated. | Part of the AI/rule engine output. Shown prominently as a red banner and a "Refer" badge in the result summary. |

---

## Module 4: Referral Management

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 4.1 | **Referral Form Generation** | Generate a formatted medical referral document for a student that can be printed or sent to a receiving facility. | The `medical-referral-modal.svelte` collects referring diagnosis, recommended facility, and notes. Form is submitted and saved to the database linked to the student's visit. |
| 4.2 | **Hospital / Health Center Info** | Include the recommended hospital or health center in the referral form. | Free-text field in the referral modal allowing the nurse to specify the nearest appropriate facility (e.g., Tupi Rural Health Unit, SOCCSKSARGEN Medical Center). |
| 4.3 | **Referral Record Storage** | All referral records are saved to the database and linked to the student and visit. | Stored in the referrals table with student ID, visit ID, facility, diagnosis, and timestamp. |
| 4.4 | **Referral History** | Past referrals for a student are viewable on their profile and visit detail pages. | Fetched alongside visit data in the student profile server load and displayed in the visit history section. |
| 4.5 | **AI Referral Recommendation** | The AI pre-diagnosis engine independently recommends referral when it determines the case exceeds school clinic capabilities. | A `referralRecommended: boolean` field in the AI response. When true, the referral reason is displayed as a red alert banner in the AI result card. |

---

## Module 5: Medicine Inventory

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 5.1 | **Medicine List** | A complete list of all medicines registered in the school clinic's inventory. | Accessible at `/inventory`. Displays medicine name, generic name, form, dosage, current stock, and status. |
| 5.2 | **Add Medicine & Batch** | Register a new medicine with its details and initial stock batch including expiration date. | The `/inventory/add` page has a 3-section form: Basic Info (blue), Stock Thresholds (amber), and Initial Batch (emerald). Saves to `medicines` and `medicine_batches` tables. |
| 5.3 | **Stock Quantity Monitoring** | Real-time tracking of available stock per medicine across all active batches. | Aggregated from `medicine_batches` where `is_active = true`. Compared against `min_stock_level` to determine low-stock status. |
| 5.4 | **Low-Stock Alerts** | Automated alerts generated when a medicine's stock falls below its defined minimum level. | Stored as unresolved records in `inventory_alerts` with `alert_type = 'low_stock'`. Count surfaced on the dashboard with an amber warning widget. |
| 5.5 | **Expiration Date Tracking** | Track expiration dates for every medicine batch and alert when items are expiring within 30 days. | `expiration_date` stored per batch in `medicine_batches`. Dashboard queries batches expiring within 30 days and shows count in a red widget. |
| 5.6 | **Inventory Transaction History** | Full log of all stock movements — stock-in, stock-out, adjustments, expired, damaged. | Each movement recorded in `inventory_transactions` with type, quantity, reason, performed-by user, and timestamp. |

---

## Module 6: Parent & Guardian Notifications

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 6.1 | **Automatic Visit SMS** | When a clinic visit is created, an SMS is automatically sent to the student's primary emergency contact. | Triggered in the `createVisit` server action. Sends via UniSMS through a make.com webhook (`MAKE_WEBHOOK_URL`). Includes student name, grade, reason, severity, and time. Capped at 160 characters. |
| 6.2 | **Automatic Visit Email** | A formatted HTML email is automatically sent to the parent/guardian alongside the SMS. | Same trigger as SMS. Gmail module in make.com sends the HTML email with a branded table layout showing visit details. Content-Type set to HTML for proper rendering. |
| 6.3 | **Emergency Flag in Notification** | Notifications for emergency visits include a clear "EMERGENCY." marker to alert parents urgently. | The `isEmergency` flag on the visit record appends "EMERGENCY." to the SMS text and adds prominent styling in the HTML email. |
| 6.4 | **Manual Email to Contact** | The nurse can manually send a custom email to any emergency contact from the student profile page. | `sendEmergencyContactMail` form action on the student profile. Supports three recipient types: emergency contact, student, and doctor — each with a properly formatted HTML email template. |
| 6.5 | **Make.com Webhook Integration** | All notifications (email + SMS) are routed through a make.com automation webhook that handles delivery via Gmail and UniSMS. | `src/lib/server/notify.ts` POSTs a JSON payload with `channel` field (`email`, `sms`, `both`) to the webhook URL. Make.com routes to Gmail or UniSMS based on the channel. Includes message sanitization to prevent JSON parsing errors. |
| 6.6 | **Phone Number Normalization** | Philippine mobile numbers in `09xxx` format are automatically converted to E.164 international format (`+639xxx`) for UniSMS compatibility. | `normalizePhone()` function in `notify.ts` handles `09`, `639`, `+639` formats and normalizes to `+639xxxxxxxxx`. |

---

## Module 7: Dashboard

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 7.1 | **Today's Visit Count** | Shows the number of clinic visits recorded today. | Queried from `clinic_visits` with a date range filter for the current day. Displayed as a summary card with a link to filtered visits. |
| 7.2 | **Monthly Visit Count** | Shows the total clinic visits for the current calendar month. | Queried with start-of-month to end-of-month date range. Displayed alongside today's count for context. |
| 7.3 | **All-Time Visit Count** | Total number of clinic visits ever recorded in the system. | Count of all non-cancelled visits. Shown on the visit summary cards section. |
| 7.4 | **Severity Breakdown** | Visual breakdown of visit severity distribution (Medium / High / Critical) for the current month. | Queried with `GROUP BY severity`. Displayed as an inline list with color-coded icons — medium (yellow), high (orange), critical (red). |
| 7.5 | **Total Students Widget** | Dashboard card showing the number of currently active enrolled students. | Queries `students` table with `is_active = true`. Links to `/students`. |
| 7.6 | **Inventory Count Widget** | Dashboard card showing total medicine types registered in the clinic inventory. | Queries `medicines` with `is_active = true`. Links to `/inventory`. |
| 7.7 | **Low-Stock Alert Widget** | Dashboard card showing the number of medicines with unresolved low-stock alerts. | Queries `inventory_alerts` for unresolved `low_stock` type. Card turns amber with warning icon when count > 0. |
| 7.8 | **Expiring-Soon Widget** | Dashboard card showing the number of medicine batches expiring within 30 days. | Queries `medicine_batches` with expiration date between today and 30 days from now. Card turns red when count > 0. |
| 7.9 | **Recent Visits Table** | A live table of the 10 most recent clinic visits across all students. | Joins `clinic_visits` with `students` ordered by `check_in_time` descending. Shows student name, grade, visit type, severity badge, and status. |
| 7.10 | **QR Scan from Dashboard** | Nurse can scan a student's QR code directly from the dashboard to instantly navigate to their profile. | "Scan QR" button opens the `qr-scanner.svelte` component which uses the device camera via the `qr-scanner` library to decode the QR and redirect. |

---

## Module 8: Staff Management

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 8.1 | **Staff Directory** | View all clinic staff members with their name, role, contact details, and active status. | Accessible at `/staffs`. Queries the `users` table ordered by name. |
| 8.2 | **Add / Edit Staff** | Register new staff or update existing staff details including name, role, phone, and profile photo. | `staff-form-modal.svelte` handles both create and edit flows via SvelteKit form actions. |
| 8.3 | **Role Assignment** | Assign roles to staff members: Admin, Nurse, Doctor, or Staff. | Role stored in `users.role` field using a typed enum. Determines what the user sees and can do in the system. |
| 8.4 | **Nurse Selection on Visits** | When creating a clinic visit, the nurse on duty is selected from the registered staff list. | A searchable combobox in the new visit modal lists all users with `role = 'nurse'`. The selected nurse's ID is saved to `clinic_visits.attended_by_id`. |

---

## Module 9: Authentication & Security

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 9.1 | **Login / Logout** | Secure staff login with username/password and persistent session management. | `/login` page submits credentials to a form action that validates against the `users` table using Argon2 password comparison. Session token stored in a secure HTTP-only cookie. |
| 9.2 | **Argon2 Password Hashing** | All passwords are hashed using the Argon2id algorithm before storage — never stored in plain text. | Uses `@node-rs/argon2` library for hashing on account creation and verification on login. |
| 9.3 | **Secure Session Cookies** | Sessions are managed with cryptographically secure tokens stored in HTTP-only, SameSite cookies. | Session tokens generated using `@oslojs/crypto`. The `sessionCookieName` cookie is set with `httpOnly: true` to prevent JavaScript access. |
| 9.4 | **Authentication Guard** | All pages inside the `(app)` route group are protected — unauthenticated users are redirected to the landing page. | `hooks.server.ts` checks for a valid session on every request matching the `(app)` route group. Redirects to `/` if no valid session is found. |

---

## Module 10: QR Code System

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 10.1 | **QR Code Generation** | Every student has a unique QR code that encodes their student ID for instant identification. | `/api/qr` POST endpoint uses the `qrcode` npm library to generate a QR code image (base64 PNG) from the student's `qr_code_id`. |
| 10.2 | **QR Code Display** | The student's QR code can be viewed and downloaded from their profile page. | `qr-modal.svelte` fetches and displays the QR code image in a dialog with a download button. Intended for printing on student ID cards. |
| 10.3 | **QR Scanner** | Built-in camera-based QR code scanner accessible from the dashboard and student search. | `qr-scanner.svelte` uses the `qr-scanner` library to access the device camera and decode QR codes in real time. Works on mobile and desktop browsers. |
| 10.4 | **Scan to Student Profile** | Scanning a student's QR code immediately navigates to their full clinic profile. | After a successful scan, the decoded student ID is looked up via `/api/qr` (GET) which returns the student's internal ID. The app then navigates to `/students/[studentId]`. |

---

## Module 11: UX & System Features

| # | Feature | Description | How It Works |
|---|---------|-------------|--------------|
| 11.1 | **Dark / Light Theme** | System-wide dark and light mode toggle with persistent preference. | `theme-switcher.svelte` sets a `theme` cookie on toggle. `hooks.server.ts` reads the cookie and passes it to the layout. TailwindCSS dark mode classes apply throughout. |
| 11.2 | **Fully Responsive Design** | The entire application is usable on mobile phones, tablets, and desktop computers. | Built with TailwindCSS responsive prefixes (`sm:`, `md:`, `lg:`). Sidebar collapses to a mobile bottom navigation on small screens. |
| 11.3 | **Voice Guide System** | Pre-recorded audio guides play automatically when the nurse navigates to each page, providing a brief introduction to what the page does and how to use it. | `voice-guide.ts` singleton manages a single `Audio` object. `(app)/+layout.svelte` watches the current pathname and calls `voiceGuide.playForRoute()` on every navigation, stopping the previous audio first. 9 MP3 files cover all major pages. |
| 11.4 | **Voice Guide Toggle** | Users can mute/unmute the voice guide at any time using a toggle button in the sidebar and landing page navigation. | `voice-guide-button.svelte` calls `voiceGuide.setEnabled()` which saves the preference to `localStorage`. The guide respects this preference on all subsequent page navigations. |
| 11.5 | **GSAP Landing Page Animations** | The public landing page features smooth scroll-triggered animations on all major sections. | GSAP 3.15 with `ScrollTrigger` dynamically imported inside `onMount` to avoid SSR crashes. Hero elements stagger in on load; features, workflow steps, and tech stack cards animate in as they scroll into view. |
| 11.6 | **Toast Notifications** | Non-blocking feedback messages appear for all user actions (visit created, email sent, error occurred, etc.). | `svelte-sonner` library. `toast.success()`, `toast.error()`, and `toast.info()` called throughout form submit handlers. |
| 11.7 | **Version Skew Handling** | When Vercel deploys a new version, users with a stale browser cache are automatically refreshed to avoid 404 errors on JS chunks. | A version polling mechanism checks the deployed version against the client's cached version. On mismatch, triggers a full page reload to load the latest assets. |
| 11.8 | **AI-Integrated Landing Page** | The public landing page presents CLINIQAI as a school clinic management system with a full-bleed hero image of Tupi Municipal Hall, gradient overlays, and a QR code integration showcase. | Hero uses `z-index` layering with a `position: absolute` background image, two gradient overlays (left-to-right + top-to-bottom), and a glassmorphic QR showcase card. GSAP animates all hero elements on load. |

---

## Summary Table

| Module | Features | Implemented |
|--------|----------|-------------|
| 1. Student Health Records | 12 | 11 ✅ 1 ❌ |
| 2. AI Pre-Diagnosis | 12 | 12 ✅ |
| 3. First Aid Guidance | 4 | 4 ✅ |
| 4. Referral Management | 5 | 5 ✅ |
| 5. Medicine Inventory | 6 | 6 ✅ |
| 6. Parent Notifications | 6 | 6 ✅ |
| 7. Dashboard | 10 | 10 ✅ |
| 8. Staff Management | 4 | 4 ✅ |
| 9. Auth & Security | 4 | 4 ✅ |
| 10. QR Code System | 4 | 4 ✅ |
| 11. UX & System | 8 | 8 ✅ |
| **Total** | **75** | **74 ✅ 1 ❌** |

> ❌ Remaining: Medical history timeline on student profile page.
