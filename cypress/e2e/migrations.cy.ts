describe('Migrations detail page', () => {
  let name: string = `e2e-migration-${Date.now()}`
  let fileName: string = `${name}.json`

  it('can create a migrations file', () => {
    // Create a new migrations file
    cy.visit('/migrations')
    cy.get('[data-test="new-migration-btn"]').click()
    cy.get('[data-test="new-migration-dialog"]').should('be.visible')
    cy.get('[data-test="new-migration-name-input"]').type(name)
    cy.get('[data-test="new-migration-create-btn"]').click()

    // Verify the migrations file was created
    cy.url().should('include', `/migrations/${fileName}`)
    cy.get('[data-test="card-title"]').should('contain', fileName)
    cy.get('[data-test="delete-file-btn"]').should('be.enabled')
    cy.get('[data-test="array-editor-title"]').should('contain', 'Migrations')
    cy.get('[data-test="add-item-btn"]').should('be.enabled')
    cy.get('[data-test=array-editor-empty').should('be.visible')
  })

  it('can add migrations', () => {
    cy.visit(`/migrations/${fileName}`)

    // Add first migration
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"foo":"bar"}', { parseSpecialCharSequences: false }).blur()

    // Add second migration
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-1"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="remove-item-btn-1"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"boo":"far"}', { parseSpecialCharSequences: false }).blur()

    // Reload and verify persistence
    cy.reload()
    cy.wait(500)

    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-panel-title-0"]').click() // Show panel
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"foo"').and('contain', '"bar"')
    
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="remove-item-btn-1"]').should('be.enabled')
    cy.get('[data-test="array-panel-title-1"]').click() // Show panel
    cy.get('[data-test="array-panel-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"boo"').and('contain', '"far"')
  })

  it('can show/hide migrations', () => {
    cy.visit(`/migrations/${fileName}`)

    // Test hide/show functionality using expansion panel title
    cy.get('[data-test="array-panel-title-0"]').click() // Show panel
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-panel-title-0"]').click() // Hide panel
    cy.get('[data-test="array-item-textarea-0"]').should('not.exist')
  })

  it('can delete a migration', () => {
    cy.visit(`/migrations/${fileName}`)

    // Delete first migration
    cy.get('[data-test="remove-item-btn-0"]').click()

    // Confirm the 2nd migration is now the first one
    cy.get('[data-test="array-panel-title-0"]').click() // Show panel
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"boo"').and('contain', '"far"')
  })

  it('can delete the migrations file', () => {
    cy.visit(`/migrations/${fileName}`)

    // Delete the migrations file
    cy.get('[data-test="delete-file-btn"]').click()
    cy.get('[data-test="confirm-delete-btn"]').click()
    cy.url().should('contain', 'migrations')
    cy.get(`[data-test="file-card-${fileName}"]`).should('not.exist')
  })
})
