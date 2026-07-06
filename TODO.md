# CLINIQAI — Implementation Todo List

> Notifications module is handled externally via **make.com** — excluded from this list.
> Last updated: 2026-07-06

---

## 1. Patient Medical Logging

- [ ] **Vital signs input UI** — Add vital signs fields (temperature, BP, pulse, SpO₂, height, weight, BMI, blood sugar) to the new visit modal (`new-visit-modal.svelte`). Data structure already exists in schema as JSONB.
- [ ] **Medical history timeline** — Add a structured, chronological history view on the student profile page (`/students/[id]`) showing past diagnoses, treatments, and medications across visits.

---

## 2. AI Pre-Diagnosis

- [ ] **Symptom input form** — Create a dedicated symptom selection/input UI (checkboxes + free text) accessible from the visit flow.
- [ ] **Rule-based expert system** — Implement a server-side rule engine (`src/lib/server/ai/diagnosis.ts`) that maps symptom combinations to possible illnesses.
- [ ] **Possible illness suggestions** — Display ranked illness suggestions with confidence levels in the visit form after symptom analysis.
- [ ] **Automated severity indication** — Auto-suggest severity level (Low / Moderate / High / Critical) based on symptom analysis results instead of manual nurse selection.
- [ ] **Basic ML model integration** — Integrate a pre-trained classification model (or external API) for pre-diagnosis pattern recognition.

---

## 3. First Aid Guidance

- [ ] **First aid recommendation engine** — Implement a server-side rule lookup (`src/lib/server/ai/firstaid.ts`) that maps symptoms/conditions to first aid steps.
- [ ] **Step-by-step instructions UI** — Create a dedicated first aid guidance panel/modal shown during active visits with numbered steps.
- [ ] **Emergency warning messages** — Implement rule-based alerts that trigger prominent warnings for high-risk symptom combinations (e.g. chest pain + shortness of breath).

---

## 4. Referral Management

- [x] ~~**Referrals database table**~~
- [x] ~~**Save referral to DB**~~
- [x] ~~**Hospital/clinic recommendation list**~~
- [x] ~~**Referral record view**~~
- [x] ~~**Referral statistics on dashboard**~~

---

## 5. Inventory Management

- [x] ~~**Batch management UI**~~
- [x] ~~**Inventory transaction history**~~
- [x] ~~**Automated alert generation**~~

---

## 6. Admin Dashboard

- [ ] **Total patients count** — Add student/patient count card to the dashboard (query already available in `/students/+page.server.ts`, just not surfaced on dashboard).
- [ ] **Medicine inventory status widget** — Add a dashboard card showing total medicines, low-stock count, and expiring-soon count.
- [ ] **Referral statistics widget** — Add referral stats (total, pending) to the dashboard once the referrals table is implemented.

---

## 7. AI Components (Infrastructure)

- [ ] **`src/lib/server/ai/` module** — Create the AI server module directory with:
  - `diagnosis.ts` — rule-based symptom → illness mapping
  - `firstaid.ts` — symptom → first aid steps mapping
  - `severity.ts` — symptom combination → severity level logic
- [ ] **Symptom master list** — Create a structured symptom taxonomy (JSON or DB table) used by both the input form and the rule engine.
- [ ] **Illness/condition master list** — Create a structured illness list with associated symptoms, severity thresholds, and first aid protocols.

---

## 8. User Roles & Access Control

- [ ] **Route-level RBAC** — Enforce role-based access in `hooks.server.ts` so nurses/staff cannot access admin-only routes (e.g. staffs management, settings).
- [ ] **Patient portal** — Create a patient-facing view (`/portal` or QR-accessible route) where patients can see their own visit history, medications, and records without full staff access.
- [ ] **Patient QR login flow** — Update QR scan handler so unauthenticated scans redirect to the patient portal view instead of `/login`.
- [ ] **Role-specific dashboard views** — Show different dashboard content based on role (admin sees all stats, nurse sees only today's visits and their assigned patients).

---

## Priority Order (Suggested)

| Priority | Item |
|---|---|
| ~~🔴 High~~ | ~~Referrals DB table + save to DB~~ |
| 🔴 High | Vital signs input UI in visit modal |
| 🔴 High | Dashboard — total patients + inventory widget |
| 🟡 Medium | Symptom input form + rule-based expert system |
| 🟡 Medium | First aid guidance engine + UI |
| ~~🟡 Medium~~ | ~~Automated inventory alert generation~~ |
| ~~🟡 Medium~~ | ~~Batch management UI~~ |
| 🟢 Low | ML model integration |
| 🟢 Low | Patient portal + QR flow |
| 🟢 Low | Full RBAC enforcement |
| 🟢 Low | Referral hospital recommendation list |
