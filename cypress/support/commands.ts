/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      getByTest(testId: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

Cypress.Commands.add('getByTest', (testId: string) => {
  return cy.get(`[data-test="${testId}"]`)
})

export {}


