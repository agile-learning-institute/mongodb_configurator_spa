/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      getByTest(testId: string): Chainable<JQuery<HTMLElement>>
      resetApp(): Chainable<void>
      alias(method: string | RegExp, urlPattern: string | RegExp, alias: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('getByTest', (testId: string) => {
  return cy.get(`[data-test="${testId}"]`)
})

// Lightweight reset hook. We rely on `npm run e2e` to perform a full reset in CI/CLI.
// In interactive mode, this ensures the app root is reachable.
Cypress.Commands.add('resetApp', () => {
  cy.visit('/')
  cy.get('[data-test="help-carousel"]').should('be.visible')
})

// Convenience helper for common route aliasing
Cypress.Commands.add('alias', (method: string | RegExp, urlPattern: string | RegExp, alias: string) => {
  cy.intercept(method as any, urlPattern as any).as(alias)
})

export {}


