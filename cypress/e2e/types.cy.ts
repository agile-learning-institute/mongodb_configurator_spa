describe('Types page flow', () => {
  const name = `e2e-test-data-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Clean up any types created during tests
  beforeEach(() => {
    thingsToDelete.push(`/api/types/${fileName}/`)
    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/types/${name}`)
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

  describe('Types List Page - Basic Elements', () => {
    it('loads types page and shows basic elements', () => {
      cy.visit('/types')
      cy.get('[data-test="page-title"]').should('contain', 'Types')
      cy.get('[data-test="lock-all-btn"]').should('be.visible').and('to.be.enabled')
      cy.get('[data-test="new-type-btn"]').should('be.visible').and('to.be.enabled')
      cy.get('[data-test^="file-card-"]').should('have.length.above', 10)
    })
  })

  describe('Types Detail Page - Basic', () => {
    it('loads types detail page and shows basic elements', () => {
      // Verify page title is "Type: <file-name>"
      cy.get('h2.text-h3').should('contain', 'Type:')
      cy.get('h2.text-h3').should('contain', name)
      cy.get('[data-test="lock-type-btn"]').should('be.visible').and('be.enabled')
      cy.get('[data-test="delete-type-btn"]').should('be.visible').and('be.enabled')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')
      cy.get('[data-test="root-property-card"] [data-test="card-content"]').should('be.empty')
    })

    it('can lock/unlock a type', () => {
      // verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // verify locked
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      
      // click unlock button
      cy.get('[data-test="unlock-type-btn"]').click()
      
      // verify unlock confirmation dialog is visible
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      
      // verify unlock confirmation dialog has proper message
      cy.get('[data-test="unlock-confirmation-message"]').should('contain', `Are you sure you want to unlock "${name}"?`)
      cy.get('[data-test="unlock-warning-message"]').should('contain', 'This will allow the type to be modified. Changes will be saved automatically.')
      
      // verify unlock confirmation dialog has Cancel and Unlock buttons
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible')
      
      // click unlock confirm button in dialog
      cy.get('[data-test="unlock-confirm-btn"]').click()
      
      // verify dialog is closed
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      
      // verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
    })

    it('has the correct types in the type picker', () => {
      // click on root type chip to open picker
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      
      // verify root type picker contains only "object", "array", "simple", "complex"
      cy.get('[data-test="type-picker-menu"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"]').should('be.visible')
      cy.get('[data-test^="built-in-type-"]').should('have.length', 4)
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-simple"]').should('be.visible')
      cy.get('[data-test="built-in-type-complex"]').should('be.visible')
      
      // close picker by clicking outside
      cy.get('body').click()
    })

    it('can delete a type with confirmation', () => {
      // verify delete button is visible and enabled
      cy.get('[data-test="delete-type-btn"]').should('be.visible').and('be.enabled')
      
      // click delete button
      cy.get('[data-test="delete-type-btn"]').click()
      
      // verify delete confirmation dialog is visible
      cy.get('[data-test="delete-type-dialog"]').should('be.visible')
      
      // verify delete confirmation dialog has "Are you sure you want to delete "test-type.yaml"?"
      cy.get('[data-test="delete-confirmation-message"]').should('contain', `Are you sure you want to delete "${name}"?`)
      
      // verify delete confirmation dialog has "This action cannot be undone. The type will be permanently removed from the system."
      cy.get('[data-test="delete-warning-message"]').should('contain', 'This action cannot be undone. The type will be permanently removed from the system.')
      
      // verify delete confirmation dialog has "Cancel" button
      cy.get('[data-test="delete-cancel-btn"]').should('be.visible')
      
      // verify delete confirmation dialog has "Delete" button
      cy.get('[data-test="delete-confirm-btn"]').should('be.visible')
      
      // click delete button in dialog
      cy.get('[data-test="delete-confirm-btn"]').click()
      
      // verify dialog is closed and we're redirected to types list
      cy.url().should('include', '/types')
      cy.get('[data-test="delete-type-dialog"]').should('not.exist')
      
      // verify type is deleted
      cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
    })

  })

})
