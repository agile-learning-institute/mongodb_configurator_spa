Selectors and Stability

- Prefer `data-test` selectors, Use semantic selectors (role, label, text) only when needed.
- Use `cy.get(['data-test="value"'])` to access `data-test` elements.
- Avoid arbitrary waits; rely on Cypress' retry-able assertions or `cy.intercept` aliases.

Custom Commands

- `cy.getByTest(id)`: queries by `[data-test="<id>"]`.
- `cy.resetApp()`: minimal reset to ensure the app is responsive in watch mode. Full resets occur with `npm run service` before CLI runs.
- `cy.alias(method, urlPattern, alias)`: shorthand for `cy.intercept` with `.as(alias)`.


### TODO: Create universal unlock & delete housekeeping custom command
### TODO: Create Type Arrange - move create code from type tests.
### TODO: Create Dictionary Arrange - move create code from dictionary tests.