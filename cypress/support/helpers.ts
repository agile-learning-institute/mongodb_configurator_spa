/// <reference types="cypress" />

/**
 * Creates a new dictionary with the given name
 * @param name - The name of the dictionary to create (without .yaml extension)
 * @returns An object with dictionaryName and dictionaryFileName
 */
export function createDictionary(name: string): { dictionaryName: string; dictionaryFileName: string } {
  const dictionaryName = name
  const dictionaryFileName = `${dictionaryName}.yaml`

  cy.visit('/dictionaries')
  cy.get('h3').should('contain', 'Dictionaries')
  cy.get('[data-test^="file-card-"]').should('exist')
  cy.contains('button', 'New').should('be.visible').click()
  cy.get('.v-dialog').should('be.visible')
  cy.get('.v-dialog .v-card-title').should('contain', 'Create New Dictionary')
  cy.get('.v-dialog input').type(dictionaryName)
  cy.get('.v-dialog').contains('button', 'Create').click()
  cy.get('.v-dialog').should('not.exist')
  cy.wait(200)
  cy.url().should('include', `/dictionaries/${dictionaryFileName}`)
  cy.visit('/dictionaries')
  cy.get(`[data-test="file-card-${dictionaryName}.yaml"]`).should('be.visible')

  return { dictionaryName, dictionaryFileName }
}

/**
 * Creates a new type with the given name
 * @param name - The name of the type to create (without .yaml extension)
 * @returns An object with typeName and typeFileName
 */
export function createType(name: string): { typeName: string; typeFileName: string } {
  const typeName = name
  const typeFileName = `${typeName}.yaml`

  cy.visit('/types')
  cy.get('[data-test="new-type-btn"]').click()
  cy.get('[data-test="new-type-dialog"]').should('be.visible')
  cy.get('[data-test="new-type-name-input"]').type(typeName)
  cy.get('[data-test="new-type-create-btn"]').click()
  cy.wait(500)
  cy.url().should('include', `/types/${typeName}`)

  return { typeName, typeFileName }
}

