# Cypress E2E Implementation Plan

This plan replaces the initial brainstorm with a concrete, phased approach for adding Cypress E2E tests to the SPA. Each phase lists review gates (where you review before we continue) and commit checkpoints (work we will complete and commit without a review gate between steps).

Base assumptions:
- SPA runs at `http://localhost:8082`. Use `npm run service` to start/reset API, SPA, and test data to a known state.
- We will prefer real backend interactions. We will only stub network calls when stability requires it.

## Phase 0 — Foundations and Conventions (Review Gate)
Goals: Ensure predictable environments and testability hooks.
 - Define test stability conventions:
  - Use existing `data-test` attributes for unambiguous selectors; prefer semantic roles/text first. Add more `data-test` only when necessary.
  - Avoid arbitrary fixed waits. Use assertions that inherently wait (e.g., `should('be.visible')`, `contains`), or explicit waits on route aliases.
 - Confirm/reset data flow: `npm run service` is verified to fully reset the system to a known starting state for specs.

Deliverables:
- Short list of UI elements that need `data-testid` to avoid brittle selectors (we will add them incrementally in later phases as needed).

Review Gate: Confirm conventions and agree on the minimal `data-test` additions list.

## Phase 1 — Tooling Setup (Commit Checkpoints)
- [x] Install dependencies:
   - `devDependencies`: `cypress` (and `eslint-plugin-cypress` optional). `typescript` already present in repo.
- [x] Add npm scripts to `package.json`:
   - `cy:open`: `cypress open`
   - `cy:run`: `cypress run`
   - `e2e`: `npm run service && cypress run --browser chrome`
- [x] Create `cypress.config.ts` with:
   - `baseUrl: 'http://localhost:8082'`
   - `viewportWidth/Height` reasonable defaults
   - `video: true` for CI, screenshots on failure
- [x] Add Cypress TypeScript support:
   - `cypress/tsconfig.json` extending repo tsconfig with DOM and Cypress types
- [x] Scaffolding:
   - `cypress/e2e/` for specs
   - `cypress/fixtures/` for small JSON payloads (if needed)
   - `cypress/support/commands.ts` for custom commands
   - `cypress/support/e2e.ts` for global hooks and route aliases
- [x] Smoke test:
   - `app.smoke.cy.ts`: open `/`, assert title/primary navigation renders.

Commit after each step (1–6) with focused messages.

## Phase 2 — Utilities and Stability (Commit Checkpoints)
- [ ] Add a custom command `cy.resetApp()` that runs before each spec to ensure a clean state. Given `npm run service` is reliable, we may call it once before the run and ensure specs are independent; `cy.resetApp()` can be a no-op hook or perform lightweight checks.
- [ ] Add helpers:
   - `cy.getByTest(id)` convenience selector for `data-test`
   - Route alias helpers for common API calls if needed (e.g., `@getList`, `@saveItem`)
- [ ] Document selector strategy inside `cypress/support/README.md`.

Commit after each utility addition.

## Phase 3 — Page-Level E2E: Migrations (Review Gate after spec is green)
Specs: `cypress/e2e/migrations.cy.ts`
- Precondition: `cy.resetApp()` to ensure starting state
- Navigate to `/migrations`
- Verify starting list state
- Create: click New → enter name `test-migration`
- Assert URL `/migrations/test-migration.json`
- Verify empty list
- Add migration entries: add `{"foo":"bar"}`, then `{"far":"boo"}`; verify both appear
- Delete first entry; verify only `{"far":"boo"}` remains
- Reload; verify persistence
- Delete the document; assert redirect to `/migrations` and absence of `test-migration.json`

Commit when spec passes. Review Gate: Confirm coverage and selector quality.

## Phase 4 — Page-Level E2E: Test Data (Commit Checkpoints)
Specs: `cypress/e2e/test_data.cy.ts`
- Mirror migrations flow for `/test_data`
- Create `test-data`, add two JSON docs, delete one, verify persistence and final deletion

Commit when spec passes.

## Phase 5 — Page-Level E2E: Enumerators (Review Gate after core CRUD/versioning tests)
Specs: `cypress/e2e/enumerators.cy.ts`
- Basic CRUD
  - `/enumerators` → New → assert URL and default Version (e.g., 3) and unlocked state
  - Add value with name/description; verify display
  - Add an enumeration and values; verify in list and detail after reload
  - Lock → assert locked; Unlock → assert unlocked
  - Delete and confirm → back to list; verify file (e.g., `enumerations.3.yaml`) absent
- Versioning rules
  - Creating a new version locks the previous
  - Cannot delete old version
  - Cannot unlock old version
  - Create new version via unlock dialog

Commit in two parts: (1) CRUD green, (2) versioning rules green. Review Gate after (2).

## Phase 6 — Page-Level E2E: Types, Dictionaries, Configurations (Commit Checkpoints)
Goal: Core navigation + representative CRUD for each area. Focus on one happy path each, avoiding over-specification.
- `types.cy.ts`: visit `/types`, create a minimal type, verify save, reload persistence, delete
- `dictionaries.cy.ts`: visit `/dictionaries`, create dictionary with one entry, verify, delete
- `configurations.cy.ts`: visit `/configurations`, create configuration referencing existing types/dictionaries if required, verify, delete

Commit after each spec passes.

## Phase 7 — Cross-Page User Journey (Review Gate)
Spec: `cypress/e2e/journey.basic.cy.ts`
- From an empty state, create required prerequisites (enumerator/type/dictionary)
- Create a configuration that uses them
- Verify downstream pages reflect the created entities
- Clean up by deleting entities in reverse order (if allowed)

Review Gate: Validate the journey aligns with real-world usage.

## Phase 8 — Hardening and Flake Reduction (Commit Checkpoints)
- Replace any brittle selectors with `data-testid`
- Add route-level waits for critical POST/PUT operations using `cy.intercept`
- Add retries-on-failure in CI via Cypress config or `cypress-grep` (optional)
- Increase assertion specificity where needed

Commit small refactors as we harden specs.

## Phase 9 — CI Integration (Review Gate)
- Add CI job that runs: `npm ci`, `npm run service` (background), wait for health, `npm run e2e`
- Store videos/screenshots as CI artifacts
- Optional: add `cypress-grep` tags to allow smoke vs. full runs

Review Gate: Approve CI config and pass criteria for merges.

---

Notes and Working Agreements
- We keep specs independent and idempotent; any created data must be uniquely named (timestamp or GUID suffix) and cleaned up when feasible.
- Prefer visible UI state assertions over DOM structure assertions.
- Only introduce API stubbing when the real system cannot be made stable or reasonably performant for the scenario.

Next Action
- Begin Phase 1 (Tooling Setup). I will proceed through the Phase 1 commit checkpoints and report back once the smoke test is green.
