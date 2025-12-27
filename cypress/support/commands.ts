/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      getByTest(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
      resetApp(): Chainable<void>
      interceptAlias(method: string, url: string, alias: string): Chainable<void>
      unlockAndDeleteFile(fileType: 'dictionaries' | 'types' | 'enumerators', fileName: string): Chainable<void>
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

Cypress.Commands.add('unlockAndDeleteFile', (fileType, fileName) => {
  const apiPath = `/api/${fileType}/${fileName}/`
  
  // Unlock the file
  cy.request({
    method: 'PUT',
    url: apiPath,
    headers: { "Content-Type": "application/json" },
    body: { "_locked": false, "root": { "name": "" } },
    failOnStatusCode: false
  }).then((unlockResponse) => {
    if (unlockResponse.status === 200) {
      cy.log(`Successfully unlocked ${apiPath}`)
      // Delete the file
      cy.request({
        method: 'DELETE',
        url: apiPath,
        failOnStatusCode: false
      }).then((deleteResponse) => {
        if (deleteResponse.status === 200) {
          cy.log(`Successfully deleted ${apiPath}`)
        } else {
          cy.log(`Failed to delete ${apiPath}: ${deleteResponse.status}`)
        }
      })
    } else {
      cy.log(`Failed to unlock ${apiPath}: ${unlockResponse.status}`)
      // Try to delete anyway in case it's already unlocked
      cy.request({
        method: 'DELETE',
        url: apiPath,
        failOnStatusCode: false
      })
    }
  })
  
  // Verify the file is deleted
  const listPath = `/${fileType}`
  cy.wait(200)
  cy.visit(listPath)
  cy.url().should('include', listPath)
  
  // Verify deletion - check both common selectors to be robust
  cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
})

export {}


