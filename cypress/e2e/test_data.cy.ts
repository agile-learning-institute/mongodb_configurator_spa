describe('Test Data page flow', () => {
  it('creates, edits entries, persists, and deletes a test data file', () => {
    const name = `e2e-test-data-${Date.now()}`
    const fileName = `${name}.json`

    // List page
    cy.visit('/test_data')
    cy.contains('button', 'New').click()
    cy.get('div.v-dialog input').type(name)
    cy.get('div.v-dialog').contains('button', 'Create').click()

    // Detail page URL
    cy.url().should('include', `/test_data/${fileName}`)

    // Empty list
    cy.getByTest('array-editor-empty').should('be.visible')

    // Add first test data document
    cy.getByTest('add-item-btn').click()
    cy.getByTest('array-item-textarea-0').should('be.visible')
    cy.getByTest('array-item-textarea-0')
      .find('textarea')
      .first()
      .clear({ force: true })
      .type('{"name":"John","age":30}', { parseSpecialCharSequences: false })
      .blur()

    // Verify first added
    cy.getByTest('array-panel-0').should('exist')

    // Add second test data document
    cy.getByTest('add-item-btn').click()
    cy.getByTest('array-item-textarea-1').should('be.visible')
    cy.getByTest('array-item-textarea-1')
      .find('textarea')
      .first()
      .clear({ force: true })
      .type('{"name":"Jane","age":25}', { parseSpecialCharSequences: false })
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
      .should('contain', '"name"')
      .and('contain', '"Jane"')

    // Delete the test data file (header Delete) within the specific BaseCard for this file
    cy.get(`[data-test="base-card-${fileName}"] [data-test="delete-file-btn"]`)
      .click({ force: true })
    cy.get('.v-overlay--active [data-test="confirm-delete-btn"]').first().click({ force: true })

    // Back to list
    cy.url().should('match', /\/test_data\/?$/)
    cy.get(`[data-test="file-card-${fileName}"]`).should('not.exist')
  })
})
