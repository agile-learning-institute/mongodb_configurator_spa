Selectors and Stability

- Prefer semantic selectors (role, label, text). Use `data-test` only when needed.
- Use `cy.getByTest('<id>')` to access `data-test` elements.
- Avoid arbitrary waits; rely on Cypress' retryable assertions or `cy.intercept` aliases.

Custom Commands

- `cy.getByTest(id)`: queries by `[data-test="<id>"]`.
- `cy.resetApp()`: minimal reset to ensure the app is responsive in watch mode. Full resets occur with `npm run service` before CLI runs.
- `cy.alias(method, urlPattern, alias)`: shorthand for `cy.intercept` with `.as(alias)`.


