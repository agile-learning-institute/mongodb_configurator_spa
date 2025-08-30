/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      getByTest(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
      resetApp(): Chainable<void>
      interceptAlias(method: string, url: string, alias: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('getByTest', (selector, ...args) => {
  return cy.get(`[data-test="${selector}"]`, ...args)
})

Cypress.Commands.add('resetApp', () => {
  cy.log('Resetting backend via npm run api...')
  cy.exec('npm run api', { failOnNonZeroExit: false, timeout: 120000 })
    .its('stdout')
    .should('include', 'mongodb_configurator_spa-configurator_api-1  Started')
  cy.visit('/')
})

Cypress.Commands.add('interceptAlias', (method, url, alias) => {
  cy.intercept(method, url).as(alias)
})

export {}


