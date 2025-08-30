/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      getByTest(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
      resetApp(): Chainable<void>
      interceptAlias(method: string, url: string, alias: string): Chainable<void>
      runAllSpecs(): Chainable<void>
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

Cypress.Commands.add('runAllSpecs', () => {
  cy.log('Running all Cypress specs...')
  
  // List of all spec files to run
  const specs = [
    'app.smoke.cy.ts',
    'configurations.cy.ts', 
    'dictionaries.cy.ts',
    'enumerators.cy.ts',
    'event-viewer.cy.ts',
    'migrations.cy.ts',
    'test_data.cy.ts',
    'types.cy.ts'
  ]
  
  cy.log(`Found ${specs.length} spec files to run`)
  
  // This command can be used in the GUI to see all available specs
  // or can be called programmatically to run specific specs
  specs.forEach((spec, index) => {
    cy.log(`${index + 1}. ${spec}`)
  })
})

export {}


