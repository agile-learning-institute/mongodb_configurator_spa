# System & Design Patterns Summary

1. Project Structure
Monorepo-style SPA using Vue 3 (Composition API), TypeScript, and Vite.
Modular organization:
src/components/ – UI components (property editors, pickers, cards, etc.)
src/composables/ – Reusable logic (CRUD, state, property management)
src/pages/ – Top-level route views (e.g., TypeDetailPage, DictionaryDetailPage)
src/types/ – Shared TypeScript interfaces
src/utils/ – API and utility functions
public/ or root – Static assets (favicon, etc.)

2. API-Driven Canonical State
Backend is the source of truth:
All complex type changes (e.g., changing a property’s type) are sent to the API, which returns the canonical, defaulted structure.
The frontend updates its state with the API response, not by merging or guessing defaults.
@openapi.yaml OpenAPI 3.0.3 Spec defines all endpoints and schemas, especially for types, dictionaries, enumerators, etc.

5. Styling and Layout Consistency
Card-based UI:
Editors and detail pages use a consistent card layout, with clear section headers and action bars.

6. Error Handling and UX
Frontend focuses on state and UX:
Error handling, loading states, and user feedback are handled in the UI.
All data validation and canonicalization are handled by the backend.

7. Testing and Test Data
test cases found in tests provide canonical examples for all entity types.

Key Takeaways for New Features (e.g., EnumeratorsDetails Page)
Follow the pattern: Use the ConfigurationDetail page for styling.
Let the backend handle structure: Always update state from the API response after changes.
Keep UI/UX consistent: Reuse card layouts, and action bars.
Centralize types: Use shared TypeScript interfaces for all data models.
Review the enumerators endpoints in the @openapi.yaml spec, and the related schema's.

The current state of the EnumeratorsDetail page is that it is empty. 
The layout I would like is a top-level card with enumerator info (file_name, _locked, version), followed by a list of Enumeration Cards - that are titled with the Enumerations Name (like default_status) - with collapsible content that shows the list of key, value strings of the enumeration. I would like this list to use well-styled text that is click-to-edit-in-place. 

---

## Implementation Plan: Restore EnumeratorsDetailPage Functionality

### Phase 1: Foundation & Data Integration (✅ Completed)
- Defined the `EnumeratorFile` TypeScript interface in `src/types/types.ts` to match the API schema, including all required properties.
- Implemented `useEnumeratorDetail` composable in `src/composables/useEnumeratorDetail.ts` for fetching, updating, and error/loading state management for enumerator files, using the canonical API response and the reusable Event dialog for error handling.
- Refactored `EnumeratorDetailPage.vue` to use the new composable for all data, loading, saving (auto-save), and error handling, removing direct API calls and local state.
- All linter errors resolved and the page is ready for further UI/UX improvements.

**Phase 1 is complete and ready for review/testing.**

---

### Phase 2: Page Layout & Info Card
1. (✅ Done) Top-level card in `EnumeratorDetailPage.vue` now displays enumerator file info (`file_name`, `_locked`, `version`) in a card-based layout, with an 'Add Enumeration' button, following the standard UI pattern.
2. Next: Review and clean up any redundant info cards, and ensure layout consistency with ConfigurationDetailPage.

### Phase 3: Enumeration Cards & Editing
1. For each enumerator in the file, render a card titled with the enumerator name (e.g., `default_status`).
2. Make each card collapsible (collapsed by default), showing a list of key-value pairs (value: description) when expanded.
3. Implement click-to-edit-in-place for each value and description, using well-styled text fields.
4. Implement auto-save on keystroke for all edits (no save buttons), updating from canonical API response.
5. Add delete actions for each enumeration and for each value:description line.

### Phase 4: UX, Validation, and Testing
1. Add loading, error, and success feedback for all actions, using the reusable Event popup dialog for errors.
2. Ensure UI/UX consistency with other detail pages (Configuration, Dictionary, etc.).
3. Write/restore unit tests for the page and composables.
4. Validate with sample/test enumerator files and API responses.

---

**This plan will be updated as phases are completed or requirements change.** 
