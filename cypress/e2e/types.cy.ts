describe('Types page flow', () => {
  let createdTypeName: string

  // Clean up any types created during tests
  afterEach(() => {
    if (createdTypeName) {
      cy.log(`Cleaning up created type: ${createdTypeName}`)
      
      // Delete via API
      cy.request({
        method: 'DELETE',
        url: `/api/types/${createdTypeName}.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted ${createdTypeName}`)
        } else {
          cy.log(`Failed to delete ${createdTypeName}: ${response.status}`)
        }
      })
      
      createdTypeName = ''
    }
  })

  it('loads types page and shows basic elements', () => {
    // List page
    cy.visit('/types')
    
    // Verify starting state
    cy.get('h3').should('contain', 'Types')
    cy.contains('button', 'New').should('be.visible')
  })

  it('can create a new type via dialog', () => {
    // Visit types page
    cy.visit('/types')
    
    // Wait for existing types to load
    cy.get('[data-test^="file-card-"]').should('exist')
    
    // Click New button to open dialog
    cy.contains('button', 'New').click()
    
    // Verify dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Create New Type')
    
    // Type a name
    const typeName = `TestType-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    
    // Click Create button - use text content instead of color class
    cy.get('.v-dialog').contains('button', 'Create').click()
    
    // Verify dialog is closed
    cy.get('.v-dialog').should('not.exist')
    
    // Store the type name for cleanup
    createdTypeName = typeName
    
    // Wait a moment for the API call to complete
    cy.wait(1000)
    
    // After creation, we should be redirected to the detail page
    cy.url().should('include', `/types/${typeName}.yaml`)
    
    // Navigate back to the types list to verify the type was created
    cy.visit('/types')
    
    // Wait for the type to appear in the list using the correct selector
    cy.get(`[data-test="file-card-${typeName}.yaml"]`).should('be.visible')
  })

  it('can navigate to newly created type detail page and verify elements', () => {
    // First create a type
    cy.visit('/types')
    cy.contains('button', 'New').click()
    
    const typeName = `TestType-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    
    // After creation, we should be on the detail page
    cy.url().should('include', `/types/${typeName}.yaml`)
    
    // Store the type name for cleanup
    createdTypeName = typeName
    
    // Verify basic page elements exist
    cy.get('h2.text-h3').should('be.visible')
    
    // Check for the specific elements that should be visible on a newly created type
    cy.get('[data-test="description-placeholder"]').should('contain', 'Click to add description')
    cy.get('[data-test="type-chip"]').should('be.visible')
    cy.get('[data-test="type-display-name"]').should('contain', 'void')
  })

  it('can lock and unlock a newly created type', () => {
    // First create a type
    cy.visit('/types')
    cy.contains('button', 'New').click()
    
    const typeName = `TestType-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    
    // After creation, we should be on the detail page
    cy.url().should('include', `/types/${typeName}.yaml`)
    
    // Store the type name for cleanup
    createdTypeName = typeName
    
    // Newly created types should be unlocked by default, so we should see Lock button
    cy.contains('button', 'Lock').should('be.visible')
    
    // Lock the type
    cy.contains('button', 'Lock').click()
    
    // Verify it's now locked (Lock button should be replaced with Unlock)
    cy.contains('button', 'Unlock').should('be.visible')
    cy.contains('button', 'Lock').should('not.exist')
    
    // Unlock the type - this opens a confirmation dialog
    cy.contains('button', 'Unlock').click()
    
    // Verify unlock confirmation dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Final Confirmation')
    
    // Type UNLOCK to confirm
    cy.get('.v-dialog input').type('UNLOCK')
    
    // Click Unlock button in dialog
    cy.get('.v-dialog').contains('button', 'Unlock').click()
    
    // Verify it's now unlocked (Unlock button should be replaced with Lock)
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Unlock').should('not.exist')
  })

  it('can delete a type with confirmation', () => {
    // First create a type to ensure we have one to delete
    cy.visit('/types')
    cy.contains('button', 'New').click()
    const typeName = `TypeToDelete-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    cy.url().should('include', `/types/${typeName}.yaml`)
    createdTypeName = typeName // Ensure this is set for cleanup
    
    // Check if the type is locked - if so, we need to unlock it first to delete
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Unlock")').length > 0) {
        // Type is locked, unlock it first - this opens a confirmation dialog
        cy.contains('button', 'Unlock').click()
        
        // Verify unlock confirmation dialog is open
        cy.get('.v-dialog').should('be.visible')
        cy.get('.v-dialog .v-card-title').should('contain', 'Final Confirmation')
        
        // Type UNLOCK to confirm
        cy.get('.v-dialog input').type('UNLOCK')
        
        // Click Unlock button in dialog
        cy.get('.v-dialog').contains('button', 'Unlock').click()
        
        cy.wait(1000) // Wait for unlock to complete
      }
      
      // Now click Delete button
      cy.contains('button', 'Delete').click()
      
      // Verify delete confirmation dialog is open
      cy.get('.v-dialog').should('be.visible')
      cy.get('.v-dialog .v-card-title').should('contain', 'Final Confirmation')
      
      // Type DELETE to confirm
      cy.get('.v-dialog input').type('DELETE')
      
      // Click Delete button in dialog
      cy.get('.v-dialog').contains('button', 'Delete').click()
      
      // Verify dialog is closed and we're redirected to types list
      cy.get('.v-dialog').should('not.exist')
      cy.url().should('match', /\/types\/?$/)
    })
  })
})
