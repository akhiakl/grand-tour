# Branching strategy

Trunk-based development with short-lived branches. `main` is always
deployable.

## Branches

| Branch      | Purpose                                              |
| ----------- | ---------------------------------------------------- |
| `main`      | Protected. Always green, always deployable.          |
| `feature/*` | New features (e.g. `feature/init`, `feature/editor`) |
| `fix/*`     | Bug fixes                                            |
| `chore/*`   | Tooling, deps, CI, refactors with no behavior change |
| `docs/*`    | Documentation-only changes                           |

Naming: lowercase, kebab-case, scoped to one deliverable —
`feature/share-links`, not `feature/misc-stuff`.

## Workflow

1. Branch off latest `main`:
   `git checkout main && git pull && git checkout -b feature/<name>`
2. Commit small and often using **Conventional Commits**
   (enforced by commitlint): `feat: …`, `fix: …`, `chore: …`,
   `refactor: …`, `test: …`, `docs: …`. Optional scope:
   `feat(editor): add drag-to-reorder stops`.
3. Pre-commit hooks run lint + typecheck + related unit tests — do not
   bypass with `--no-verify`.
4. Push and open a PR into `main`. Keep PRs reviewable
   (one build-order step ≈ one PR).
5. Squash-merge or rebase-merge (linear history; no merge commits on
   `main`). The PR title must itself be a valid conventional commit —
   it becomes the commit on `main`.
6. Delete the branch after merge; never reuse a merged branch — follow-up
   work starts from fresh `main`.

## Rules

- Never commit directly to `main`.
- Rebase on `main` (`git pull --rebase origin main`) rather than merging
  `main` into your branch.
- A PR merges only with all gates green: `lint`, `typecheck`, `test`,
  `build` (and `test:e2e` once Playwright lands).
- Phase gates: each build-order step lands as its own PR and gets reviewed
  before the next step starts.

## Releases (Phase 1)

`main` deploys continuously. Tag milestones as needed
(`v0.1.0` = Phase 1 complete) following semver.
