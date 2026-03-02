describe('Event Viewer detail page', () => {
  it('displays events and can show/hide sub-events', () => {
    cy.visit('/configurations/sample.yaml')
    cy.get('[data-test="configure-collection-btn"]').click()
    cy.url().should('include', '/event-viewer')
    
    // Wait for the page to fully load and check for either success or error states
    cy.get('body').should('not.contain', 'Loading...')
    
    // Verify event with sub events (single config process: CFG-09 or CFG-05)
    cy.get('[data-test="card-header"]').should('be.visible').within(() => {
      cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
    })

    cy.get('[data-test="expanded-sub-events"]').eq(0).should('be.visible')

    // Hide the sub-events
    cy.get('[data-test="expand-collapse-icon"]').first().should('be.visible').click()
    cy.get('[data-test="expanded-sub-events"]').should('not.exist')
  })

  it('can display configuration results and view help', () => {
    cy.visit('/configurations/sample.yaml')
    cy.get('[data-test="configure-collection-btn"]').click()
    cy.url().should('include', '/event-viewer')
    cy.get('body').should('not.contain', 'Loading...')
    
    // Check if we have event data (single config: "Configuration Processed")
    cy.get('h1.text-h4').should('be.visible').invoke('text').then((text) => {
      expect(text).to.match(/Processing Complete|Configuration Processed/)
    })
    cy.contains('button', 'Back').should('be.visible')
    
    // Verify help button exists in the app bar (if we're on the event viewer page)
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('be.visible').should('contain', 'Configuration Processing Events')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('h1.text-h4').should('be.visible').invoke('text').then((text) => {
      expect(text).to.match(/Processing Complete|Configuration Processed/)
    })
  })
})
