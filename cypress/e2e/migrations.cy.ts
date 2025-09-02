

describe('Migrations page flow', () => {
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

  it('can add a migration', () => {
    cy.visit(`/migrations/${fileName}`)

    // Add first migration
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label-0"]').should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"foo":"bar"}', { parseSpecialCharSequences: false }).blur()

    // Test hide/show functionality using expansion panel title
    cy.get('[data-test="array-panel-title-0"]').click() // Hide panel
    cy.get('[data-test="array-item-textarea-0"]').should('not.be.visible')
    cy.get('[data-test="array-panel-title-0"]').click() // Show panel
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')

    // Add second migration
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-1"]').should('be.visible')
    cy.get('[data-test="array-item-label-1"]').should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-1"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"boo":"far"}', { parseSpecialCharSequences: false }).blur()

    // Reload and verify persistence
    cy.reload()
    cy.getByTest('array-panel-0').should('exist')
    
    // Click the chevron to expand the panel after reload
    cy.get('.mdi-chevron-down').first().click()
    
    cy.getByTest('array-item-textarea-0').should('be.visible') // Ensure panel is visible after reload
    cy.getByTest('array-item-textarea-0')
      .find('textarea')
      .first()
      .invoke('val')
      .should('contain', '"far"')
      .and('contain', '"boo"')

    // Delete the migration file (header Delete) within the specific BaseCard for this file
    // Debug: Check how many delete buttons exist
    cy.get('[data-test="delete-file-btn"]').then(($btns) => {
      cy.log(`Total delete-file-btn count: ${$btns.length}`)
      cy.wrap($btns).each(($b, i) => {
        const parentTestAttr = $b.closest('[data-test]')?.attr('data-test') || 'none'
        cy.log(`delete-file-btn[${i}] parent: ${parentTestAttr}`)
      })
    })
    
    cy.get(`[data-test="base-card-${fileName}"] [data-test="delete-file-btn"]`)
      .click({ force: true })
    cy.get('.v-overlay--active [data-test="confirm-delete-btn"]').first().click({ force: true })

    // Back to list
    cy.url().should('match', /\/migrations\/?$/)
    cy.get(`[data-test="file-card-${fileName}"]`).should('not.exist')
  })
})
