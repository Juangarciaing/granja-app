# Granja — Calculadora de Alimento en Lactancia

Livestock management PWA for tracking breeding sows, farrowings, and the
daily lactation feed calculation. Next.js 16 App Router + TypeScript +
Tailwind CSS, backed by Supabase (Postgres + Auth, RLS-scoped per user).

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables (manual step required)

This repo does **not** commit a `.env.example` file (dotenv-pattern files are
blocked by the local write-permission policy used to build this project).
Create `.env.local` yourself in the project root with:

```bash
# Public (safe to expose to the browser -- protected by Row Level Security)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Server-only -- NEVER prefix with NEXT_PUBLIC_, never expose to the browser.
# Only needed for admin/maintenance scripts, not used by the app at runtime.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Provision Supabase (manual step required — real cloud infra)

This project cannot create cloud infrastructure on your behalf. Before the
app can run against a real backend:

1. Create a project at <https://supabase.com/dashboard>.
2. Copy the Project URL and anon public key into `.env.local` (step 2 above).
3. Link the local CLI config to your project:
   ```bash
   pnpm exec supabase link --project-ref <your-project-ref>
   ```
4. Apply the schema migrations:
   ```bash
   pnpm exec supabase db push
   ```
   - `0001_init.sql` — creates `sows`, `farrowings`, `feeding_config` with
     RLS and the default `feeding_config` auto-provisioning trigger.
   - `0002_farrowings_counter_decrement_only.sql` — decrement-only trigger
     for `farrowings.current_piglets`.
   - `0003_fattening_pigs_and_weight_checkins.sql` — creates
     `fattening_pigs` and `weight_checkins` (module 2), both with full
     select/insert/update/delete RLS, plus the partial unique index that
     rejects a duplicate active `arete` per user.
5. Regenerate the typed schema (replaces the hand-authored placeholder at
   `types/database.ts`):
   ```bash
   pnpm exec supabase gen types typescript --linked > types/database.ts
   ```
6. Create at least one user (Authentication → Users in the Supabase
   dashboard, or `supabase.auth.signUp`) — this app uses a single shared
   family login, not self-service signup.

Local Supabase development (`supabase start`) requires Docker, which was not
available in the environment this scaffold was built in — schema/RLS were
authored and reviewed statically but not executed against a live Postgres
instance. Verify with `pnpm exec supabase db push` or `supabase start`
locally once Docker is available.

## Development

```bash
pnpm dev          # dev server (--webpack; @serwist/next does not support Turbopack yet)
pnpm build        # production build (also --webpack)
pnpm start        # serve the production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest (unit/component)
pnpm test:watch   # Vitest watch mode
pnpm test:coverage
pnpm test:e2e     # Playwright (requires `pnpm build` artifacts; see playwright.config.ts)
```

## Architecture

See the SDD design artifact (`sdd/calculadora-alimento-lactancia/design`) for
full technical decisions. Summary:

- **Auth**: single shared family login, `user_id = auth.uid()` RLS ownership
  on all tables (no `farm_id`/memberships in v1).
- **Feed calculation**: computed live client-side from `feeding_config` +
  `farrowings.current_piglets`, not persisted (`lib/feed/calc.ts`, added in
  a later phase).
- **Data flow**: RSC reads via `lib/supabase/server.ts`, writes via Server
  Actions, session refresh via `middleware.ts` + `lib/supabase/middleware.ts`.
- **PWA**: `app/manifest.ts` (native Next.js manifest route) + Serwist
  (`app/sw.ts`, `@serwist/next` webpack plugin) for the service worker.
