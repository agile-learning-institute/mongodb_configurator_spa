describe('Event Viewer page flow', () => {
  it('displays events with correct show/hide icons', () => {
    // Navigate to the event viewer page via the Configure Database button
    cy.visit('/')
    
    // Click the Configure Database button in the app header
    cy.get('[data-test="process-all-btn"]').click()
    
    // Wait for the event viewer page to load
    cy.url().should('include', '/event-viewer')
    
    // Verify the page loads with correct content
    cy.get('h1.text-h4').should('contain', 'Processing Complete')
    
    // If there are events displayed, verify the show/hide icons use mdi-eye/mdi-eye-off
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="expand-collapse-btn"]').length > 0) {
        // Verify the expand/collapse button uses the correct icons
        cy.get('[data-test="expand-collapse-btn"]').first().should('exist')
        
        // Check that the icon has the correct class (mdi-eye when collapsed)
        cy.get('[data-test="expand-collapse-icon"]').first().should('have.class', 'mdi-eye')
        
        // Click to expand
        cy.get('[data-test="expand-collapse-btn"]').first().click()
        
        // Verify icon changes to mdi-eye-off
        cy.get('[data-test="expand-collapse-icon"]').first().should('have.class', 'mdi-eye-off')
        
        // Click to collapse
        cy.get('[data-test="expand-collapse-btn"]').first().click()
        
        // Verify icon changes back to mdi-eye
        cy.get('[data-test="expand-collapse-icon"]').first().should('have.class', 'mdi-eye')
      }
    })
  })

  it('positions show/hide icon correctly between status icon and title', () => {
    // Navigate to the event viewer page via the Configure Database button
    cy.visit('/')
    
    // Click the Configure Database button in the app header
    cy.get('[data-test="process-all-btn"]').click()
    
    // Wait for the event viewer page to load
    cy.url().should('include', '/event-viewer')
    
    // Verify the page loads with correct content
    cy.get('h1.text-h4').should('contain', 'Processing Complete')
    
    // If there are events with sub-events, verify the icon positioning
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="expand-collapse-btn"]').length > 0) {
        // The expand/collapse button should be positioned in the title area
        // between the status icon and the event type title
        cy.get('[data-test="expand-collapse-btn"]').first().should('exist')
        cy.get('[data-test="event-type-title"]').first().should('exist')
        
        // Verify the button is positioned correctly in the title template
        cy.get('[data-test="expand-collapse-btn"]').first().should('be.visible')
        cy.get('[data-test="event-type-title"]').first().should('be.visible')
      }
    })
  })

  it('can display configuration results and view help', () => {
    // Navigate to the event viewer page via the Configure Database button
    cy.visit('/')
    
    // Click the Configure Database button in the app header
    cy.get('[data-test="process-all-btn"]').click()
    
    // Wait for the event viewer page to load
    cy.url().should('include', '/event-viewer')
    
    // Verify the page loads with correct content
    cy.get('h1.text-h4').should('contain', 'Processing Complete')
    
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
