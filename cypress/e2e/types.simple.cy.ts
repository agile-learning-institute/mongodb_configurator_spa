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
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="built-in-type-simple"]').click()
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
    it('can change type', () => {
      cy.visit(`/types/${fileName}`)
      cy.get('[data-test="type-display-name"]').should('contain', 'Simple')
    })
    
    it('can add description', () => {
      // Add description
      cy.get('[data-test="root-description-display"]').click()
      cy.get('[data-test="root-description-input-edit"]').type('Simple property for testing')

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="root-description-display"]').should('contain', 'Simple property for testing')
    })

    it('can enter schema string', () => {
      // Enter a schema string
      cy.get('[data-test="simple-property-schema-input"]').should('be.visible')
      cy.get('[data-test="simple-property-schema-input"]').find('textarea').type('{"type": "string", "minLength": 1, "maxLength": 100}', { parseSpecialCharSequences: false })

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="simple-property-schema-display"]')
        .should('contain', 'type').and('contain', 'string')
        .and('contain', 'minLength').and('contain', '1')
        .and('contain', 'maxLength').and('contain', '100')
    })

    it.only('locks', () => {
      cy.visit(`/types/${fileName}`)

      // Arrange unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')

      // Act - Lock the type
      cy.get('[data-test="lock-type-btn"]').click()

      // Verify the state
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="root-description-display"]').should('contain', 'Click to add description') 
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('not.have.attr', 'data-disabled')
      cy.get('[data-test="simple-property-schema-input"]').find('textarea').should('be.disabled')
    })

    it('unlocks', () => {
      cy.visit(`/types/${fileName}`)

      // Arrange an unlocked type
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').click()
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')

      // Act - Lock the type
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify the state
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')

      // Act - Unlock the type
      cy.get('[data-test="unlock-type-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      
      // Verify unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="root-description-display"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible')
      cy.get('[data-test="simple-property-schema-input"]').find('textarea').should('not.be.disabled')
    })
  })
})
