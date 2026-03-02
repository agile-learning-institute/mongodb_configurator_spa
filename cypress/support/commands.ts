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
  cy.visit('/dictionaries')
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
    }
    // Delete the file (try even if unlock failed - might already be unlocked)
    cy.request({
      method: 'DELETE',
      url: apiPath,
      failOnStatusCode: false
    })
    // For dictionaries: full collection cleanup so collection disappears from list
    if (fileType === 'dictionaries') {
      const match = fileName.match(/^(.+)\.(\d+)\.(\d+)\.(\d+)\.yaml$/)
      if (match) {
        const [, name, major, minor, patch] = match
        const configFile = `${name}.yaml`
        const testDataFile = `${name}.${major}.${minor}.${patch}.0.json`
        cy.request({ method: 'DELETE', url: `/api/configurations/${configFile}/`, failOnStatusCode: false })
        cy.request({ method: 'DELETE', url: `/api/test_data/${testDataFile}/`, failOnStatusCode: false })
      }
    }
  })

  // Verify deletion
  const listPath = `/${fileType}`
  cy.wait(200)
  cy.visit(listPath)
  cy.url().should('include', listPath)

  if (fileType === 'dictionaries') {
    const match = fileName.match(/^(.+)\.\d+\.\d+\.\d+\.yaml$/)
    const collectionName = match ? match[1] : fileName
    cy.get(`[data-test="collection-card-${collectionName}"]`).should('not.exist')
  } else if (fileType === 'types') {
    cy.get(`[data-test="type-card-${fileName}"]`).should('not.exist')
  } else {
    cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
  }
})

export {}


