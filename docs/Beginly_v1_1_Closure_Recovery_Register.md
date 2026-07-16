# Beginly v1.1 Closure Recovery Register

**Prepared:** 12 July 2026  
**Purpose:** Establish the exact evidence baseline, source-recovery gate, patch specification, rerun sequence and release criteria for the proposed `Beginly_Verified_Pre_Live_Release_Candidate_v1_1.zip`.

## 1. Governing rule

No result from one Beginly source tree may be combined with evidence generated from another tree.

The final v1.1 archive must be generated from one frozen source snapshot whose fingerprint is recorded before modification and whose final fingerprint is recorded after all patches and reruns.

## 2. Current evidence baseline

| Gate | Preserved evidence | Honest status |
|---|---:|---|
| PGlite PostgreSQL/RLS actor matrix | 46/46 | Passed in PostgreSQL-compatible PGlite; not Supabase CLI/Docker or hosted Supabase |
| Database static audit | 63 tables, 67 policies, 3 migrations, 32 authored RLS tests | Passed statically |
| Hardening suite | 58/58 | Passed using Node's native test runner |
| Unit assertions | 50 passed | Assertions passed, but the combined Vitest command failed because it collected four Node-native hardening files |
| TypeScript | 4 errors | Failed |
| Lint | Passed | Passed |
| Browser E2E | 0 completed | Failed/runtime-blocked |
| Visual QA | Representative screenshots and partial inspection | Static representative proof only; not complete interactive browser QA |
| Synthetic pilot | 100/100, zero recorded failures | Passed deterministically; not a human pilot |
| Final truth audit | Not completed against the latest run | Open |
| Final v1.1 ZIP | Does not exist | Open |

## 3. Source-recovery gate

The preserved logs were generated from a local tree identified as:

```text
/mnt/data/_beginly_v1_1_current/Beginly_Maximum_Pre_Live_Hardening_v1_0
```

That local tree is not present in the active runtime.

The accessible public GitHub repository is an older Beginly source state with package version `0.1.0`; it is not the `2.0.0` tree that produced the preserved closure logs. It must not be substituted.

### Required canonical source

Recover one of the following, in order of preference:

1. `Beginly_Maximum_Pre_Live_Hardening_and_Activation_Ready_Build_v1_0.zip`;
2. the exact `Beginly_Maximum_Pre_Live_Hardening_v1_0` source folder;
3. another archive proven by manifest/hash to contain the exact `beginly@2.0.0` tree used for the final logs.

The source must include at minimum:

```text
package.json
package-lock.json
tsconfig.json
vitest.config.*
hardening/
lib/providers/email.ts
scripts/local-services.ts
mobile/
supabase/
qa/
docs/activation/
```

## 4. Patch specification

These are the four preserved TypeScript failures and the intended minimal corrections. Exact edits must be made only after reading the recovered source.

### TS-01 — unsupported regular-expression flag

Affected:

```text
hardening/tests/security-config.test.ts
lib/providers/email.ts
```

Preferred correction:

- remove the `s`/dotAll dependency by replacing cross-line `.*` expressions with an explicit cross-line class such as `[\s\S]*`, where semantically equivalent;
- avoid raising the project-wide TypeScript target solely to silence two expressions unless the complete compatibility matrix is rechecked.

Acceptance:

```bash
npm run typecheck
```

reports no TS1501 error.

### TS-02 — provider name literal narrowing

Affected:

```text
lib/providers/email.ts
```

Observed problem:

```text
ConsoleEmailProvider.name = "console-email"
```

cannot override a base member inferred as the literal type:

```text
"memory-email"
```

Preferred correction:

- type the base provider name as `string`, or define the provider contract/interface as `readonly name: string`;
- preserve distinct runtime names for memory and console providers.

Acceptance:

- no TS2416 error;
- provider tests still prove both adapters identify themselves correctly.

### TS-03 — callback returning a Server object

Affected:

```text
scripts/local-services.ts
```

Observed problem:

A callback expected to return `void` returns the result of an expression involving the created server.

Preferred correction:

```ts
() => {
  resolve(server);
}
```

rather than an expression-bodied callback that returns the server.

Acceptance:

- no TS2322 error;
- local-service startup and shutdown tests pass;
- no dangling server/process remains after the suite.

### TEST-01 — Vitest collecting Node-native hardening files

Affected:

```text
vitest.config.*
package.json
```

Required separation:

- Vitest owns the original `__tests__/**` suite;
- Node's native test runner owns `hardening/tests/**`;
- Vitest explicitly excludes `hardening/tests/**`;
- `npm test` and `npm run test:hardening` remain separate blocking commands;
- `npm run test:all` runs both sequentially and fails if either fails.

Acceptance:

```bash
npm test
npm run test:hardening
```

both exit 0 with no collection failures.

## 5. Controlled rerun order

After source recovery and patching:

```bash
# 1. Freeze input
git status --short
git rev-parse HEAD 2>/dev/null || true
find . -type f -not -path './node_modules/*' -not -path './.next/*' -print0   | sort -z | xargs -0 sha256sum > qa/source-before.sha256

# 2. Clean dependency state
rm -rf node_modules .next
npm ci --ignore-scripts --no-audit --no-fund

# 3. Blocking source gates
npm run lint
npm run typecheck
npm test
npm run test:hardening

# 4. Database and domain evidence
npm run db:audit
npm run db:runtime:rls
npm run test:pilot

# 5. Production artefact and API gates
npm run build
npm run test:api

# 6. Mobile gates
npm --prefix mobile ci --ignore-scripts --no-audit --no-fund
npm --prefix mobile run typecheck
npm --prefix mobile run preflight
npm --prefix mobile run export:android

# 7. Browser and visual gates
npm run test:browser
npm run test:visual

# 8. Dependency and secret gates
npm audit --json > qa/npm-audit.json || true
npm --prefix mobile audit --json > qa/mobile-npm-audit.json || true
npm run scan:secrets

# 9. Freeze output
find . -type f -not -path './node_modules/*' -not -path './.next/*' -print0   | sort -z | xargs -0 sha256sum > qa/source-after.sha256
```

Command names must be reconciled with the recovered `package.json`; no missing script may be silently treated as a pass.

## 6. Browser-E2E decision rule

There are only two honest outcomes:

### Outcome A — completed

A browser engine launches, navigates to the local application, and the route/state suite produces:

- machine-readable results;
- traces for failures;
- screenshots tied to named routes/states/viewports;
- zero unexplained console, hydration or page errors;
- a reproducible pass/fail count.

### Outcome B — environmental block retained

The final package may still be created as a **pre-live hardening package**, but:

- Browser E2E remains `runtime_blocked`;
- the archive name must not imply full verification;
- the report must preserve engine attempts and exact errors;
- no “59 checks passed” claim may be used.

## 7. Visual-QA decision rule

A completed visual register must identify:

- route;
- state/persona/role;
- viewport;
- expected result;
- observed result;
- console/hydration status;
- screenshot reference;
- defect and correction;
- final rerun result.

Representative static screenshots alone remain classified as:

```text
representative_static_verified
```

not interactive visual completion.

## 8. Truth-register corrections

The new truth register must record:

- 46/46 PGlite runtime checks;
- PGlite limitations and emulated Supabase roles/functions;
- 63 tables;
- 67 policies;
- 3 ordered migrations;
- 32 authored RLS tests;
- 50 unit assertions, only after a clean Vitest exit;
- 58 hardening tests;
- actual browser check count;
- actual visual check count;
- hosted Supabase and provider verification as false unless separately evidenced;
- signed binaries, physical-device testing and human-pilot outcomes as false unless separately evidenced.

## 9. Release naming gate

Use:

```text
Beginly_Verified_Pre_Live_Release_Candidate_v1_1.zip
```

only when all local blocking gates, browser E2E and reproducible interactive visual QA pass.

If browser E2E remains environmentally blocked, use a bounded name such as:

```text
Beginly_Pre_Live_Hardening_Closure_v1_1.zip
```

and preserve the block prominently.

## 10. Packaging requirements

The final archive must contain:

```text
00_START_HERE/
01_CODEBASE/
02_AUTHORITY_AND_DOCUMENTATION/
03_FINAL_EVIDENCE/
04_ACTIVATION_RUNBOOKS/
05_INTEGRITY/
```

Required integrity evidence:

- release manifest;
- included/excluded file register;
- SHA-256 checksums;
- secret-scan report;
- dependency reports;
- exact command log;
- source-before and source-after fingerprints;
- ZIP extraction test;
- checksum verification after extraction;
- final truth register;
- final release-status JSON.

## 11. Current decision

The closure process is correctly paused at the **canonical source recovery gate**.

No patch, rerun or final archive should be claimed until the exact Beginly 2.0.0 source tree that generated the preserved logs is restored to the active runtime.
