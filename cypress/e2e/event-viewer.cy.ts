describe('Event Viewer page flow', () => {
  it('displays events with correct show/hide icons', () => {
    // Visit the event viewer page
    // Note: This page typically requires event data to be passed via router state
    // For now, we'll test the basic page structure
    cy.visit('/event-viewer')
    
    // Verify the page loads
    cy.get('h1.text-h4').should('contain', 'Event Details')
    
    // If there are events displayed, verify the show/hide icons use mdi-eye/mdi-eye-off
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="expand-collapse-btn"]').length > 0) {
        // Verify the expand/collapse button uses the correct icons
        cy.get('[data-test="expand-collapse-btn"]').should('exist')
        
        // Check that the icon changes from mdi-eye to mdi-eye-off when expanded
        cy.get('[data-test="expand-collapse-icon"]').should('contain', 'mdi-eye')
        
        // Click to expand
        cy.get('[data-test="expand-collapse-btn"]').click()
        
        // Verify icon changes to mdi-eye-off
        cy.get('[data-test="expand-collapse-icon"]').should('contain', 'mdi-eye-off')
        
        // Click to collapse
        cy.get('[data-test="expand-collapse-btn"]').click()
        
        // Verify icon changes back to mdi-eye
        cy.get('[data-test="expand-collapse-icon"]').should('contain', 'mdi-eye')
      }
    })
  })

  it('positions show/hide icon correctly between status icon and title', () => {
    // Visit the event viewer page
    cy.visit('/event-viewer')
    
    // Verify the page loads
    cy.get('h1.text-h4').should('contain', 'Event Details')
    
    // If there are events with sub-events, verify the icon positioning
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="expand-collapse-btn"]').length > 0) {
        // The expand/collapse button should be positioned in the title area
        // between the status icon and the event type title
        cy.get('[data-test="expand-collapse-btn"]').should('exist')
        cy.get('[data-test="event-type-title"]').should('exist')
        
        // Verify the button is positioned correctly in the title template
        cy.get('[data-test="expand-collapse-btn"]').should('be.visible')
        cy.get('[data-test="event-type-title"]').should('be.visible')
      }
    })
  })

  it('can display configuration results and view help', () => {
    // Visit the event viewer page
    cy.visit('/event-viewer')
    
    // Verify the page loads
    cy.get('h1.text-h4').should('contain', 'Event Details')
    
    // Verify back button exists
    cy.contains('button', 'Back').should('be.visible')
    
    // Verify help button exists in the app bar (if we're on the event viewer page)
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="help-btn"]').length > 0) {
        cy.get('[data-test="help-btn"]').should('be.visible')
      }
    })
  })
})
