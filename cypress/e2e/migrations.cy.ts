

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
  })

  it('can add and edit a migration', () => {
    cy.visit(`/migrations/${fileName}`)

    // Verify the migrations file was created and is empty
    cy.getByTest('array-editor-empty').should('be.visible')

    // Add first migration
    cy.getByTest('add-item-btn').click()
    cy.getByTest('array-item-textarea-0').should('be.visible')
    cy.getByTest('array-item-textarea-0').find('textarea').first().clear()

      .clear({ force: true })
      .type('{"foo":"bar"}', { parseSpecialCharSequences: false })
      .blur()

    // Verify first added
    cy.getByTest('array-panel-0').should('exist')

    // Add second migration
    cy.getByTest('add-item-btn').click()
    cy.getByTest('array-item-textarea-1').should('be.visible')
    cy.getByTest('array-item-textarea-1')
      .find('textarea')
      .first()
      .clear({ force: true })
      .type('{"far":"boo"}', { parseSpecialCharSequences: false })
      .blur()

    // Verify second added
    cy.getByTest('array-panel-1').should('exist')

    // Delete first entry (trash can button)
    cy.get('[data-test="remove-item-icon-0"]').click({ force: true })
    cy.getByTest('array-panel-0').should('exist') // Now former index 1 shifts to 0

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
