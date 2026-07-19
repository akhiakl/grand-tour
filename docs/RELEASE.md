# Releases, versioning & the MVP gate

## Versioning (semver, automated)

Releases are driven by Conventional Commits via
[release-please](https://github.com/googleapis/release-please-action):

- `fix:` → patch, `feat:` → minor, `feat!:` / `BREAKING CHANGE:` → major.
- Every merge to `main` updates a rolling **release PR** (version bump +
  `CHANGELOG.md`). Merging that PR creates the `vX.Y.Z` tag and a GitHub
  Release. Nothing else creates tags.
- Pre-launch we stay on `0.x` minors per completed build-order step.
- **`v1.0.0` is reserved for the MVP** — it may only be cut when every
  box in the checklist below is checked.

One-time setup: add a repo PAT as the `RELEASE_PLEASE_TOKEN` secret so
required CI checks run on release PRs (PRs created by the default
`GITHUB_TOKEN` don't trigger workflows).

## Deploy policy — deploy only when everything is complete

- **Production never deploys from `main` pushes.** The only production
  trigger is a _published GitHub Release_: `.github/workflows/deploy.yml`
  fires on `release: published` and calls the `DEPLOY_HOOK_URL` secret
  (Vercel/Netlify deploy hook — set it when the host is chosen; until
  then releases are tags only).
- If the repo is connected to Vercel, disable its automatic production
  deploys from `main` (Project → Git → Production Branch behavior) so
  the release hook stays the single path. PR preview deploys are fine
  and encouraged.
- The **first production deploy is `v1.0.0`** — after the MVP checklist
  is 100% complete. `0.x` releases are internal milestones (tags +
  changelog, optionally deployed to a staging/preview URL only).
- Hotfix flow: `fix:` commit → release PR → patch release → auto deploy.

## MVP launch checklist (the `v1.0.0` gate)

Copy unchecked items into the release PR description; every box must be
checked before merging the `1.0.0` release PR.

### Features complete (see `docs/ROADMAP.md` for specs)

- [x] Step 1 — scaffold, tokens/fonts/theme, Zod schema
- [x] Step 2 — Redis service layer, `/api/trips`, `/api/generate`, rate limits
- [x] Step 3 — immersive map experience (reference design), drawer, rail
- [ ] Step 4 — manual editor, Nominatim search, localStorage store, My Maps
- [ ] Step 5 — `/t/[id]` shared view, OG image, expired page, remix flow
- [ ] Step 6 — AI chat, ghost-stops upsell
- [ ] Step 7 — landing page with both CTAs, polish pass
- [ ] Step 8 — Playwright e2e: all four journeys green in CI

### Guest limit verified at all three layers

- [ ] Server: 6-city POST returns `403 {error:"city_limit",limit:5}`
- [ ] Editor: counter + upsell modal at 5/5
- [ ] AI: >5-city request yields 5 cities + `suggestedExtra` ghost stops

### Quality

- [ ] All CI checks green on `main` (Lint, Typecheck, Tests & coverage,
      Build, SonarQube, e2e)
- [ ] Coverage ≥ 85% overall; SonarQube quality gate passing
- [ ] Keyboard audit: ESC closes drawer/modals, focus trapped & restored,
      full tab-through of editor and chat
- [ ] Lighthouse: a11y ≥ 95, performance ≥ 85 on `/`, `/new`, `/t/[id]`
- [ ] Both themes checked on every page; no layout shift on toggle
- [ ] `prefers-reduced-motion` honored everywhere (splash, route, drawers)
- [ ] Responsive at 360 / 768 / 1280; no horizontal scroll
- [ ] Loading, error, empty and expired states designed in-voice

### Infrastructure (production values)

- [ ] Upstash prod database; `UPSTASH_REDIS_REST_URL/_TOKEN` set on host
- [ ] Rate limits verified live (11th trip POST in an hour → 429)
- [ ] `GROQ_API_KEY` set; generation verified live including the
      validation-retry path
- [ ] Share TTL verified: `GETEX` refresh on read (open a link, check TTL)
- [ ] 50KB payload cap returns 413 against prod
- [ ] Sentry receiving prod events (`NEXT_PUBLIC_SENTRY_DSN` set; trigger
      a test error; source maps readable if `SENTRY_AUTH_TOKEN` in CI)
- [ ] OG image verified in a real unfurler (Slack / WhatsApp / X)
- [ ] Branch protection on `main` with all required checks + review
- [ ] Domain + HTTPS, favicon, metadata/robots sane

### Launch

- [ ] Merge the `1.0.0` release PR → tag + GitHub Release published
- [ ] `DEPLOY_HOOK_URL` fires; production smoke test of the four core
      journeys (manual create→share→open→remix; AI create; 5-city upsell;
      expired link)
- [ ] README badges green; CHANGELOG reads clean

## After launch

Normal cadence: features merge to `main` behind green checks; releases
cut deliberately (not on every merge) by merging the release PR; every
release auto-deploys. Phase 2 work (auth, premium) starts at `v1.1.0+`.
