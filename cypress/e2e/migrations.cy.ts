

describe('Migrations page flow', () => {
  it('creates, edits entries, persists, and deletes a migration file', () => {
    const name = `e2e-migration-${Date.now()}`
    const fileName = `${name}.json`

    // List page
    cy.visit('/migrations')
    cy.contains('button', 'New').click()
    cy.get('div.v-dialog input').type(name)
    cy.get('div.v-dialog').contains('button', 'Create').click()

    // Detail page URL
    cy.url().should('include', `/migrations/${fileName}`)

    // Empty list
    cy.getByTest('array-editor-empty').should('be.visible')

    // Add first migration
    cy.getByTest('add-item-btn').click()
    cy.getByTest('array-item-textarea-0').should('be.visible')
    cy.getByTest('array-item-textarea-0')
      .find('textarea')
      .first()
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
