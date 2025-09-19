describe('Event Viewer detail page', () => {
  it('displays events and can show/hide sub-events', () => {
    cy.visit('/')
    cy.get('[data-test="process-all-btn"]').click()
    cy.url().should('include', '/event-viewer')
    
    // Wait for the page to fully load and check for either success or error states
    cy.get('body').should('not.contain', 'Loading...')
    
    // Verify event with sub events
    cy.get('[data-test="card-header"]').should('be.visible').should('contain', 'CFG-07-PROCESS_ALL').within(() => {
      cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
    })

    cy.get('[data-test="expanded-sub-events"]').eq(0).should('be.visible').within(() => {
      cy.get('[data-test="card-header"]:contains("CFG-05-sample.yaml")').should('be.visible')
      cy.get('[data-test="card-header"]:contains("CFG-06-UPDATE_ENUMERATORS")').should('be.visible')
    })

    // Hide the sub-events
    cy.get('[data-test="expand-collapse-icon"]').first().should('be.visible').click()
    cy.get('[data-test="expanded-sub-events"]').should('not.exist')
  })

  it('can display configuration results and view help', () => {
    cy.visit('/')
    cy.get('[data-test="process-all-btn"]').click()
    cy.url().should('include', '/event-viewer')
    cy.get('body').should('not.contain', 'Loading...')
    
    // Check if we have event data or if we're in an error state
    cy.get('h1.text-h4').should('be.visible').should('contain', 'Processing Complete')
    cy.contains('button', 'Back').should('be.visible')
    
    // Verify help button exists in the app bar (if we're on the event viewer page)
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('be.visible').should('contain', 'Configuration Processing Events')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('h1.text-h4').should('be.visible').should('contain', 'Processing Complete')
  })
})
