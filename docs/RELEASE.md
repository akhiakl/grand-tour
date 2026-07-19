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

## How to cut a release — step by step

Nobody runs version commands by hand. The whole flow is: merge work,
then merge the release PR when you decide it's time.

### 0. Day to day (nothing release-specific to do)

Merge feature PRs into `main` as usual — squash-merge with a
conventional PR title (`feat: …`, `fix: …`). That title becomes the
commit on `main`, which is what release-please reads.

### 1. The release PR appears by itself

After the first releasable commit lands on `main`, the Release workflow
opens (and keeps updating) a PR titled
**`chore(main): release X.Y.Z`**. It contains exactly two changes:

- `package.json` / `.release-please-manifest.json` version bump
- `CHANGELOG.md` section generated from the commit messages

Leave it open as long as you like — every new merge to `main` updates
it automatically. Only `feat`/`fix` (and breaking) commits are
"releasable"; `chore`/`docs`/`test`/`refactor` merges alone won't open
or bump it.

### 2. When you decide to release

1. Open the release PR and read the generated CHANGELOG section — it is
   the release notes; fix commit messages in future PRs if it reads
   badly.
2. Check the version is what you expect (see "controlling the number"
   below).
3. Make sure its CI checks are green (requires the
   `RELEASE_PLEASE_TOKEN` PAT secret — without it the PR gets no checks
   and can't pass branch protection).
4. **Merge it.** That's the release: release-please immediately creates
   the `vX.Y.Z` tag and publishes the GitHub Release with the changelog
   as its notes.

### 3. What happens after the merge

`deploy.yml` fires on the published release:

- `DEPLOY_HOOK_URL` secret set → the host's deploy hook is called and
  production ships this exact tag.
- Not set → nothing deploys; the release is a tag + changelog milestone
  (this is the correct state for all `0.x` releases before launch).

Then verify: the Releases page shows `vX.Y.Z`, and — once deploys are
live — smoke-test production.

### 4. Controlling the version number

- Normal bumps come from commit types: `fix:` → `0.1.1`,
  `feat:` → `0.2.0`.
- To force a specific version, put a footer in any commit on `main`
  (e.g. the last feature merge):

  ```
  feat: complete landing polish

  Release-As: 1.0.0
  ```

  This is exactly how **`v1.0.0` gets cut**: 0.x feat commits only bump
  the minor, so the MVP release is made by adding `Release-As: 1.0.0`
  once the checklist above is fully checked — never before.

### 5. Cutting v1.0.0 (the launch, end to end)

1. Steps 4–8 merged; MVP checklist 100% (paste it into the release PR
   description and tick every box).
2. Land a commit with `Release-As: 1.0.0` → release PR becomes
   `chore(main): release 1.0.0`.
3. Merge it → tag + Release published → deploy hook fires → production
   smoke test of the four core journeys.

### 6. Hotfix walkthrough

1. `git checkout -b fix/broken-share main` → fix + test → PR → merge
   (`fix: …` title).
2. Release PR updates to the next patch (e.g. `1.0.1`). Merge it.
3. Tag published → auto-deploy → verify the fix in production.
   Total ceremony: two PR merges.

### Troubleshooting

| Symptom                         | Cause / fix                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| No release PR after merging     | Only non-releasable types landed (`chore`/`docs`/…) — expected; or the Release workflow failed — check Actions.     |
| Release PR has no CI checks     | Created with the default `GITHUB_TOKEN`; add the `RELEASE_PLEASE_TOKEN` PAT secret and re-run the Release workflow. |
| Wrong version proposed          | Add a `Release-As: x.y.z` footer commit; the PR retargets on the next workflow run.                                 |
| Merged release PR but no deploy | `DEPLOY_HOOK_URL` unset (fine pre-launch) or the hook URL is invalid — check the Deploy workflow logs.              |
| Need to unpublish               | Never delete tags; ship a `fix:`/revert commit and cut the next patch instead.                                      |

## After launch

Normal cadence: features merge to `main` behind green checks; releases
cut deliberately (not on every merge) by merging the release PR; every
release auto-deploys. Phase 2 work (auth, premium) starts at `v1.1.0+`.
