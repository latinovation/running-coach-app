# Running Coach App — Decision Log

This document tracks all major decisions made during the development of the running coach app. It is the canonical record of what was decided, why, and what alternatives were considered.

**Synced to:** Google Drive at `01 Home/02 Running-and-training/CIM2026/DECISIONS.md`

---

## 2026-05-30 — Architecture & Tech Stack

**Decision:** Next.js 16 monolith with Supabase backend, deployed on Vercel.

**Context:** Evaluated three approaches:
1. Next.js monolith with Supabase (chosen)
2. Next.js frontend + separate API layer
3. Next.js + Supabase Edge Functions for backend

**Rationale:** A monolith is appropriate for a two-user coaching app. Supabase bundles auth, database, storage, and realtime — avoiding the complexity of managing 3-4 separate services. If a mobile app is needed later, Supabase's REST API is already available.

---

## 2026-05-30 — Authentication

**Decision:** Supabase Auth with email/password, role stored in `profiles` table.

**Alternatives considered:**
- Clerk (polished UI but adds a separate service and 10K MAU free tier cap)
- NextAuth (more manual setup, no built-in storage/realtime bundle)

**Rationale:** Supabase Auth is bundled with the database, supports RLS natively, and the 50K MAU free tier is more than sufficient.

---

## 2026-05-30 — Workout Data Integration

**Decision:** Strava API as the single integration point for Apple Watch, Nike Run Club, and direct Strava data.

**Context:**
- Apple Health has no web API (HealthKit is iOS-only)
- Nike Run Club has no public API but officially syncs to Strava
- Strava provides OAuth2, webhooks, and rich activity data

**Rationale:** Strava is the natural aggregation layer. Screenshot upload is available as a fallback for non-Strava data.

---

## 2026-05-30 — AI Integration

**Decision:** Vercel AI Gateway with Gemini (multimodal) for the AI agent.

**Alternatives considered:**
- Direct Gemini SDK (simpler but locked to one provider)
- Direct provider SDKs for multiple models

**Rationale:** AI Gateway provides model routing, failover, and cost tracking. Allows switching models later without code changes. Gemini supports vision for screenshot analysis.

---

## 2026-05-30 — Domain & Deployment

**Decision:** `run.latinovation.com` on Vercel, DNS via Namecheap CNAME.

**Setup:** CNAME record `run` -> `cname.vercel-dns.com` (to be added manually by user).

---

## 2026-05-30 — Calendar Conflict System

**Decision:** General-purpose calendar plan uploads (CSV/spreadsheet) with auto-detection of conflict types via keyword matching.

**Rationale:** Not limited to travel itineraries — works for any date-based plan. Conflict types (travel, hiking, rest) are auto-detected from activity keywords but can be overridden by the user.

---

## 2026-05-30 — Community Feed

**Decision:** Public feed where runners share achievements and milestones. Single "cheer" reaction (like Strava kudos). Visible to all authenticated users.

---

## 2026-05-31 — shadcn/ui Component Library

**Decision:** shadcn/ui uses `@base-ui/react` (not Radix UI) as of v4.8+. The `DropdownMenuTrigger` no longer supports `asChild` — children are rendered directly inside the trigger element.

**Impact:** All dropdown trigger patterns must place the trigger content as children, not use the `asChild` prop pattern from older Radix-based examples.
