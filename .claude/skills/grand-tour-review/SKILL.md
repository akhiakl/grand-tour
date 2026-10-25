---
name: grand-tour-review
description: Senior-developer quality review for Grand Tour, in three modes — a change (diff, commit, branch or PR), the whole repo or a folder (audit), or the `shortcut:` debt ledger. Checks correctness, safety, behavior under real load, risky code without tests, speed, and lines that should not exist; every finding comes with a concrete failing case and the smallest fix, in plain English. Use for "review this", "code review", "review my PR", "is this over-engineered", "audit the repo", "find bloat", "what can I delete", "list the shortcuts", and on your own diff before every push or PR. Reports only; changes no code unless asked.
---

# Grand Tour review

Review like the developer who gets paged when it breaks. Order of
importance: correct, safe, holds under load, tested, fast, lean. Lean still
matters: every extra line is read, tested and fixed later.

## Pick the mode

- **Change** (default): what the user names (uncommitted changes, a commit,
  a branch, a PR). Nothing named: uncommitted changes, else the last commit.
  Also run it on your own diff before pushing; fix what it finds first.
- **Audit**: a folder or the whole repo ("audit", "find bloat", "what can I
  delete"). Go deep where mistakes cost most (API routes, `lib/trip/service`,
  `lib/ai`, rate limits, share snapshots); say which parts you did not read.
- **Debt ledger**: "list the shortcuts" / "what did we defer". See below.

## 1. Understand first

- Read the diff (or entry points for an audit), then the connected code:
  callers of every changed function, what it calls, its tests, the docs.
  A changed signature or return value means grepping every caller.
- Trace the real flow: input → validation → storage → response.
- Load to assume: a public, anonymous web app on Vercel serverless (many
  concurrent instances, no shared memory), Upstash Redis shared by all,
  per-IP rate limits, trips capped at 5 stops and 50KB. Say if you assumed
  otherwise.

## 2. Look for

1. **Bug:** wrong result, crash, missed edge case (empty, zero, last item,
   time zones, rounding, km/mi or currency conversion), a broken caller, a
   fix in one caller while the shared function stays broken.
2. **Risk:** missing Zod validation at a trust boundary, secrets reaching
   client bundles, data loss (swallowed errors, writes in the wrong order),
   privacy (IPs, query strings or trip contents sent to a third party not on
   the `/privacy` processor list).
3. **Scale:** check-then-write races, per-instance state that must be
   shared, work repeated on every request, lists that only grow, a Redis
   call per item.
4. **Missing test:** risky logic (a branch, parser, limit, security, data
   write, bug fix) with no test that fails when it breaks. One good test.
5. **Speed:** real slowdowns, and anything new in the startup bundle
   (see Performance budget in `docs/ARCHITECTURE.md`).
6. **Lean:** delete (dead code, unused options), reuse (name the existing
   helper's path), platform (the browser, Next or the stdlib already does
   it; a dependency for a few lines), yagni (an abstraction with one use),
   merge (near-copies that change together), split (one function doing
   unrelated jobs; by job, never by line count).

Repo rules count as findings when broken: copy outside `en.json`, hex
colors in components, deep imports across `src/lib` domains, files over
300 lines, mock data defined inside a test file.

## 3. Check before reporting

- Every finding needs a concrete case: "this input leads to this wrong
  result". No case, no finding. Re-read the lines to confirm.
- Before calling code unused, grep the whole tree, including tests,
  fixtures, config and string references.
- A `shortcut:` comment that names its limit is a decision, not a finding,
  unless the expected load already crosses it.
- Propose the smallest fix; prefer fixes that delete code. No style taste,
  no "consider", no vague worries.

## 4. Output

Short sentences, everyday words; explain a technical term once. Start with
`What this change does:` (or `What this repo does:` plus the load assumed)
in two or three sentences. Then findings, numbered across groups so the
user can say "fix 2 and 5", skipping empty groups:

- **Must fix:** bug, security, privacy, data loss, breaks at expected load.
- **Should fix:** risky code without a test, real slowness, duplication,
  code that should not exist.
- **Nice to have:** small speed-ups, shorter forms.

Each finding: **title** (`path:line`), then four one-line parts: **What
this is**, **Problem** (the concrete case), **Fix**, **If we skip it**.
An audit lists at most 20; say how many smaller ones were left out.

End with `Verdict:` (Ship / fix N first / healthy), `Lean: -<N> lines
possible` when lean findings exist, and `Not checked:` for what you could
not read or run. Nothing found: the summary, then `Looks good. Ship.`

## Debt ledger

`git grep -nE '(//|/[*]|#) ?shortcut:' -- ':!node_modules'` lists every
deliberate shortcut. One row per hit, grouped by file:
`<file>:<line>, <what was simplified>. ceiling: <limit>. upgrade: <trigger>.`
Tag rows with no upgrade trigger `no-trigger`; those rot silently. Also
list `TODO(legal)` / `TODO(analytics)` markers, which gate `v1.0.0`. End
with `<N> markers, <M> with no trigger.`
