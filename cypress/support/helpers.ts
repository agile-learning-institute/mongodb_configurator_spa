/// <reference types="cypress" />

/**
 * Creates a new dictionary (collection) with the given name via R160 API.
 * Uses version 1.0.0.0, so dictionary file is {name}.1.0.0.yaml
 * @param name - The name of the collection to create (without .yaml extension)
 * @returns An object with dictionaryName and dictionaryFileName
 */
export function createDictionary(name: string): { dictionaryName: string; dictionaryFileName: string } {
  const dictionaryName = name
  const dictionaryFileName = `${dictionaryName}.1.0.0.yaml`

  cy.request('POST', `/api/configurations/collection/${dictionaryName}/`, { description: '' })
  cy.visit('/dictionaries')
  cy.get('h3').should('contain', 'Dictionaries')
  cy.get(`[data-test="collection-card-${dictionaryName}"]`, { timeout: 10000 }).should('be.visible')

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
  cy.get('[data-test="new-type-name-input"]').find('input').type(typeName)
  cy.get('[data-test="new-type-create-btn"]').click()
  cy.wait(500)
  cy.url().should('include', `/types/${typeName}`)

  return { typeName, typeFileName }
}

/**
 * Creates a collection via R160 API; returns the test data file name for that collection.
 * Test data is reachable from Configuration detail via test-data-file-chip.
 * @param name - Collection name (without extension)
 * @returns Object with collectionName, configFileName, testDataFileName
 */
export function createCollectionWithTestData(name: string): {
  collectionName: string
  configFileName: string
  testDataFileName: string
} {
  const configFileName = `${name}.yaml`
  const testDataFileName = `${name}.1.0.0.0.json`

  cy.request('POST', `/api/configurations/collection/${name}/`, { description: '' })

  return { collectionName: name, configFileName, testDataFileName }
}


