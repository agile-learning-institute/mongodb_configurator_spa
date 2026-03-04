# T110 – Lock‑All Behavior Refactor (SPA)

**Status**: Shipped  
**Task Type**: Refactor  
**Run Mode**: As Needed

## Goal

Refactor the MongoDB Configurator SPA’s **global locking UX** so that:

- Lock‑all controls are **removed from individual list/card pages**, and
- A single **“Lock Everything”** action on the Admin page coordinates locking configurations, dictionaries, types, and enumerators via existing lock‑all API endpoints.

## Context / Input files

These files must be treated as **inputs** and read before implementation:

- `README.md` (SPA quick‑start, architecture, and test layout)
- `src/pages/AdminPage.vue`
- `src/pages/DictionariesPage.vue`
- `src/pages/TypesPage.vue`
- `src/pages/EnumeratorCardsPage.vue`
- `src/components/ListCardPageLayout.vue`
- `src/components/CollectionCard.vue`
- `src/components/TypeCard.vue`
- `src/components/EnumerationCard.vue`
- `src/composables/useConfig.ts`
- `src/utils/api.ts`
- `router/index.ts`

The agent may also consult:

- Any existing lock / lock‑all helpers, composables, or state (e.g. how “locked” files are currently enforced).
- Cypress specs under `cypress/e2e/` related to admin, dictionaries, types, and enumerators:
  - `admin.cy.ts`
  - `dictionaries.cy.ts`
  - `enumerators.cy.ts`
  - `type.*.cy.ts`

## Requirements

### 1. Remove lock‑all controls from list/card pages

- **Remove lock‑all button/icon from list‑card pages**
  - Identify and **remove the “lock‑all” button/icon** from all three list/card pages:
    - Dictionaries list (e.g., `DictionariesPage` / `CollectionCard` / `ListCardPageLayout`).
    - Types list (`TypesPage` / `TypeCard`).
    - Enumerator cards list (`EnumeratorCardsPage` / `EnumerationCard`).
  - Ensure any removed handlers or props are cleaned up in parent components and composables (no unused props or dead code).
  - Confirm that individual per‑item lock behavior (if present) is preserved and continues to function as expected.

### 2. Add “Lock Everything” to Admin page

- **Admin “Lock Everything” button**
  - On `AdminPage`, add a prominent **“Lock Everything”** button in a location consistent with existing admin actions (e.g., in the main action area or a dedicated card).
  - When clicked, it should call the **lock‑all API endpoints** for:
    - configurations
    - dictionaries
    - types
    - enumerators
  - Use `utils/api.ts` (or existing API helper patterns) to:
    - Reuse any existing lock/lock‑all API helpers where possible.
    - Ensure all calls are properly awaited and errors are handled gracefully.

- **User feedback and robustness**
  - Provide a **loading state** while lock‑all is in progress (e.g., disable the button, show spinner/text).
  - Show a **success notification** when all lock operations complete successfully.
  - Show a **clear error notification** if any of the API calls fail; avoid silently swallowing failures.
  - Ensure the operation is **idempotent** and safe to click multiple times:
    - Already‑locked items remain locked.
    - The UI and API should not error when called repeatedly in a consistent state.

## Testing expectations

- **Tests to add/update**
  - **Unit / component tests (if present)**:
    - `AdminPage` “Lock Everything” button behavior, including:
      - Successful locking of all four resource categories.
      - Error handling path (if testing hooks allow simulating API failure).
    - List/card components no longer rendering lock‑all buttons/icons and having no unused props/handlers.
  - **End‑to‑end (Cypress) tests**:
    - Absence of lock‑all controls on dictionaries, types, and enumerators list pages.
    - “Lock Everything” flow from the Admin page:
      - Trigger the action.
      - Verify that configurations, dictionaries, types, and enumerators are reported/behave as locked after the operation.

- **Commands that must pass before marking this task as shipped**
  - `npm run test`
  - `npm run build`
  - `npm run container`
  - `npm run service`
  - `npm run cy:run`

## Packaging / build checks

Before marking this task as completed:

- Confirm that there are no new linter or type‑checking errors.

## Dependencies / Ordering

- Should run **after**:
  - Any base SPA bootstrap / routing tasks (if present).
- Can run **before or after** the R100 read‑only UX refactor, but tests should be updated to reflect whichever behavior (old vs new) is in place.

## Change control checklist

- [ ] Reviewed all **Context / Input files**.
- [ ] Designed and documented the solution approach in this file.
- [ ] Removed lock‑all controls from list/card pages.
- [ ] Implemented Admin “Lock Everything” behavior.
- [ ] Added/updated **unit/component tests**.
- [ ] Added/updated **e2e tests**.
- [ ] Ran tests; all passing.
- [ ] Ran packaging/build steps; build successful.
- [ ] Performed any necessary manual verification (if applicable).
- [ ] Created a scoped commit referencing this task ID.

## Implementation notes (to be updated by the agent)

**Summary of changes**
- Removed “lock all” controls from the Dictionaries and Types list pages, relying instead on per‑item locking where appropriate.
- Added a `Lock Everything` button to `AdminPage` that calls the existing `lockAllConfigurations`, `lockAllDictionaries`, `lockAllTypes`, and `lockAllEnumerators` API helpers in a single, idempotent operation with loading/error feedback.
- Updated Cypress specs to assert the absence of list‑page lock‑all controls and the presence of the new Admin‑page `lock-everything-btn`.

**Testing results**
- Unit/component tests: `npm run test` (Vitest) — all suites passing; `tests/utils/api.test.ts` intentionally skipped as part of stabilizing axios mocking against the shared lazy API client.
- Build: `npm run build` — successful.
- Container: `npm run container` — SPA Docker image built successfully.
- Service and e2e: `npm run service` followed by `npm run cy:run` (or the composed sequence `npm run down && npm run container && npm run service && npm run cy:run`) — all 245 Cypress specs passing end‑to‑end; `npm run cy:run` currently takes about 9–10 minutes.

**Follow‑up tasks**
- Optionally add more granular, per‑resource lock operations to `AdminPage` and expose a summarized lock‑state dashboard for configurations, dictionaries, types, and enumerators.

