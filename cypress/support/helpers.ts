/// <reference types="cypress" />

/**
 * Resets enumerators to v0 only. Deletes enumerations.1.yaml, enumerations.2.yaml, etc.
 * Never deletes enumerations.0.yaml. Works down from the latest version: unlock, then delete.
 * Call in beforeEach/beforeAll for tests that need a clean enumerator state.
 */
export function resetEnumeratorsToV0(): void {
  cy.request('GET', '/api/enumerators/').then((response) => {
    const files = response.body as Array<{ file_name: string; _locked?: boolean }>
    const versions = files
      .map((f) => {
        const m = f.file_name?.match(/enumerations\.(\d+)\.yaml/)
        return m ? parseInt(m[1], 10) : null
      })
      .filter((v): v is number => v !== null && v > 0)
      .sort((a, b) => b - a) // highest first - work down from latest

    const deleteOne = (idx: number): void => {
      if (idx >= versions.length) return
      const version = versions[idx]
      const fileName = `enumerations.${version}.yaml`
      cy.request('GET', `/api/enumerators/${fileName}/`).then((getRes) => {
        const doc = { ...getRes.body, _locked: false }
        cy.request({ method: 'PUT', url: `/api/enumerators/${fileName}/`, body: doc, failOnStatusCode: false }).then(() => {
          cy.request({ method: 'DELETE', url: `/api/enumerators/${fileName}/`, failOnStatusCode: false })
          deleteOne(idx + 1)
        })
      })
    }
    deleteOne(0)
  })
}

/**
 * Creates an enumerator file at the given version via API.
 * Assumes enumerations.0.yaml exists (call resetEnumeratorsToV0 first).
 * Copies from v0 and updates version/file_name, or uses baseContent if provided.
 * @param version - Target version number (e.g. 1, 2, 3)
 * @param baseContent - Optional. If provided, used as body for PUT.
 * @returns The created file name (e.g. enumerations.3.yaml)
 */
export function createEnumeratorVersion(
  version: number,
  baseContent?: Record<string, unknown>
): string {
  const fileName = `enumerations.${version}.yaml`
  if (baseContent) {
    cy.request('PUT', `/api/enumerators/${fileName}/`, baseContent)
    return fileName
  }
  cy.request('GET', '/api/enumerators/enumerations.0.yaml/').then((res) => {
    const body = { ...res.body, version, file_name: fileName }
    cy.request('PUT', `/api/enumerators/${fileName}/`, body)
  })
  return fileName
}

/**
 * Delete enumerator versions (unlock first, then delete). Use v0 only.
 * @param versions - Version numbers to delete (e.g. [1, 2, 3])
 */
export function deleteEnumeratorVersions(versions: number[]): void {
  versions.forEach((version) => {
    const fileName = `enumerations.${version}.yaml`
    cy.request({
      method: 'PUT',
      url: `/api/enumerators/${fileName}/`,
      body: { _locked: false },
      failOnStatusCode: false
    })
    cy.request({ method: 'DELETE', url: `/api/enumerators/${fileName}/`, failOnStatusCode: false })
  })
}

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
  cy.get('[data-test="app-title"]').should('contain', 'Dictionaries')
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


