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
    
    // Click New button to open dialog
    cy.contains('button', 'New').click()
    
    // Verify dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Create New Type')
    
    // Type a name
    const typeName = 'TestType'
    cy.get('.v-dialog input').type(typeName)
    
    // Click Create button - use text content instead of color class
    cy.get('.v-dialog').contains('button', 'Create').click()
    
    // Verify dialog is closed
    cy.get('.v-dialog').should('not.exist')
    
    // Store the type name for cleanup
    createdTypeName = typeName
    
    // Verify the type appears in the list
    cy.get('.v-card').should('contain', typeName)
  })
})
