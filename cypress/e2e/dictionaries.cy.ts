describe('Dictionaries basic page flow', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary to test with
  beforeEach(() => {
    dictionaryName = `TestDictionary-${Date.now()}`
    dictionaryFileName = `${dictionaryName}.yaml`

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
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // Unlock the dictionary
    cy.request({
      method: 'PUT',    
      url: `/api/dictionaries/${dictionaryFileName}/`,
      headers: {"Content-Type": "application/json"},
      body: {"_locked": false, "root":{"name":""}},
      failOnStatusCode: false
    })
    
    // Delete the dictionary
    cy.request({
      method: 'DELETE',
      url: `/api/dictionaries/${dictionaryFileName}/`,
      failOnStatusCode: false
    })

    // Verify the dictionary is deleted
    cy.visit('/dictionaries')
    cy.url().should('include', '/dictionaries')
    cy.get('[data-test^="file-card-"]').should('not.contain', dictionaryFileName)
  })

  it('loads the default dictionary page', () => {
    // Visit dictionary detail page
    cy.visit(`/dictionaries/${dictionaryFileName}`)

    cy.get('h2.text-h4').should('be.visible')
    // cy.get('h2.text-h4').should('contain', 'Type:')
    cy.get('h2.text-h4').should('contain', `${dictionaryName}.yaml`)
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Delete').should('be.visible')
    cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')

    // Verify type-picker dialog has only Array, Object, OneOf built-in types
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-types-category"]').should('be.visible')
    cy.get('[data-test="built-in-type-array"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible')
    cy.get('[data-test="built-in-type-one_of"]').should('be.visible')
    cy.get('[data-test="custom-types-category"]').should('not.exist')
    cy.get('header').first().click()

    // Verify description persists
    cy.get('[data-test="root-description-placeholder"]').click()
    cy.get('[data-test="root-description-input-edit"]').type('Test description')
    cy.reload()
    cy.get('[data-test="root-description-placeholder"]').should('not.exist')
    cy.get('[data-test="root-description-display"]').should('contain', 'Test description')
  })

  it('can lock a dictionary', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.contains('button', 'Unlock').should('not.exist')
    cy.contains('button', 'Lock').should('be.visible').click()

    // Verify it's now locked (Lock button should be replaced with Unlock)
    cy.contains('button', 'Unlock').should('be.visible')
    cy.contains('button', 'Lock').should('not.exist')
    cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('not.exist')
  })

  it('can unlock a dictionary', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.contains('button', 'Unlock').should('not.exist')
    cy.contains('button', 'Lock').should('be.visible').click()

    // Unlock the dictionary
    cy.contains('button', 'Unlock').should('be.visible').click()
    cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
    cy.get('[data-test="unlock-confirmation-message"]').should('contain', `Are you sure you want to unlock "${dictionaryName}"?`)
    cy.get('[data-test="unlock-warning-message"]').should('contain', 'This will allow the dictionary to be modified. Changes will be saved automatically.')
    cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
    cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()

    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Unlock').should('not.exist')
    cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('be.visible')
  })

  it('can delete a dictionary', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Delete').click()

    // Verify delete confirmation dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('exist').should('contain', 'Delete Dictionary?')
    cy.get('.v-dialog .v-card-text').find('p').eq(0).should('exist').should('contain', 'Are you sure you want to delete')
    cy.get('.v-dialog .v-card-text').find('p').eq(1).should('contain', 'This action cannot be undone.')
    cy.get('[data-test="delete-dialog-cancel-btn"]').should('be.visible')
    cy.get('[data-test="delete-dialog-confirm-btn"]').should('be.visible').click()
    cy.get('.v-dialog').should('not.exist')
    cy.url().should('include', '/dictionaries')
    cy.get('[data-test^="file-card-"]').should('not.contain', dictionaryFileName)
  })
})
