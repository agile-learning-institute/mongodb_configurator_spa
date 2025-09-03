describe('Types page flow', () => {
  const name = `e2e-test-data-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with a simple root property
  beforeEach(() => {
    thingsToDelete.push(`/api/types/${fileName}/`)

    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/types/${name}`)
    cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
  })

  afterEach(() => {
    thingsToDelete.forEach((thing) => {
      cy.request({
        method: 'DELETE',
        url: thing,
        failOnStatusCode: false
      })
    })
    cy.visit('/types')
    cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
  })

  describe('Simple Property Editor', () => {
    it.only('can change type', () => {
      // Change type to simple
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-simple"]').click()

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="type-display-name"]').should('contain', 'Simple')
    })
    
    it.only('can add description', () => {
      // Add description
      cy.get('[data-test="root-description-display"]').click()
      cy.get('[data-test="root-description-input-edit"]').type('Simple property for testing')
      cy.get('[data-test="card-header"]').click()

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="root-description-display"]').should('contain', 'Simple property for testing')
    })

    it('can enter schema string', () => {
      // Enter a schema string
      cy.get('[data-test="simple-property-schema-input"]').should('be.visible')
      cy.get('[data-test="simple-property-schema-input"]').type('{"type": "string", "minLength": 1, "maxLength": 100}', { parseSpecialCharSequences: false })
      cy.get('[data-test="simple-property-schema-input"]').blur()
    })

    it('persists all the data', () => {
      // Reload page to verify persistence
      cy.reload()
      
      // Verify values entered in beforeEach are persisted
      cy.get('[data-test="root-description-text"]').should('contain', 'Simple property for testing')
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('contain', 'simple')
      cy.get('[data-test="simple-property-schema-input"]').should('have.value', '{"type": "string", "minLength": 1, "maxLength": 100}')
    })

    it('locks', () => {
      // Verify unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify locked state
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      
      // Verify root property description and type chip picker are disabled
      cy.get('[data-test="root-description-display"]').should('not.exist') // Should not be clickable
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('not.have.attr', 'data-disabled')
      
      // Verify schema json editor is disabled
      cy.get('[data-test="simple-property-schema-input"]').should('be.disabled')
    })

    it('unlocks', () => {
      // Verify unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify locked state
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      
      // Click unlock button
      cy.get('[data-test="unlock-type-btn"]').click()
      
      // Verify unlock confirmation dialog appears
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      
      // Click unlock confirm button
      cy.get('[data-test="unlock-confirm-btn"]').click()
      
      // Verify dialog closes
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      
      // Verify unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Verify root property description and type chip picker are enabled
      cy.get('[data-test="root-description-display"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible')
      
      // Verify schema json editor is enabled
      cy.get('[data-test="simple-property-schema-input"]').should('not.be.disabled')
    })
  })
})
