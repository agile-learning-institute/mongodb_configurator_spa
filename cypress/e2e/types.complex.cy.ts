describe('Types Complex page flow', () => {
  const name = `e2e-test-type-complex-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with a complex root property
  beforeEach(() => {
    thingsToDelete.push(`/api/types/${fileName}/`)

    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/types/${name}`)
    cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="built-in-type-complex"]').click()
  })

  // Clean up any types created during tests
  afterEach(() => {
    thingsToDelete.forEach((thing) => {
      cy.request({
        method: 'PUT',    
        url: thing,
        headers: {"Content-Type": "application/json"},
        body: {"_locked": false, "root":{"name":""}},
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully unlocked ${thing}`)
          cy.request({
            method: 'DELETE',
            url: thing,
            failOnStatusCode: false
          }).then((response) => {
            if (response.status === 200) {
              cy.log(`Successfully deleted ${thing}`)
            } else {
              cy.log(`Failed to delete ${thing}: ${response.status}`)
            }
          })
        } else {
          cy.log(`Failed to unlock ${thing}: ${response.status}`)
        }
      })
    })
    cy.visit('/types')
    cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
  })

  describe('Complex Property Editor', () => {
    it('can change type', () => {
      cy.visit(`/types/${fileName}`)
      cy.get('[data-test="type-display-name"]').should('contain', 'Complex')
    })
    
    it('can add description', () => {
      // Add description
      cy.visit(`/types/${fileName}`)
      cy.get('[data-test="root-description-display"]').click()
      cy.get('[data-test="root-description-input-edit"]').type('Complex property for testing')

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="root-description-display"]').should('contain', 'Complex property for testing')
    })

    it('shows both JSON and BSON input fields', () => {      
      // Verify both input fields are visible
      cy.visit(`/types/${fileName}`)
      cy.get('[data-test="complex-property-json-input"]').should('be.visible')
      cy.get('[data-test="complex-property-bson-input"]').should('be.visible')
      
      // Verify field labels
      cy.get('[data-test="complex-property-json-input"]').parent().should('contain', 'JSON Type Definition')
      cy.get('[data-test="complex-property-bson-input"]').parent().should('contain', 'BSON Type Definition')
      
      // Verify default values are present (string type with maxLength)
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().invoke('val')
        .should('contain', 'type').and('contain', 'string').and('contain', 'maxLength').and('contain', '40')
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().invoke('val')
        .should('contain', 'type').and('contain', 'string').and('contain', 'maxLength').and('contain', '40')
    })

    it('can enter JSON schema', () => {
      const jsonSchema = {"foo":"bar", "boo":"far"}
      
      // Enter JSON schema
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().clear()
        .type(JSON.stringify(jsonSchema, null, 2), { parseSpecialCharSequences: false })

      cy.reload()
      cy.wait(500)
      
      // Verify JSON schema persisted
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().invoke('val')
        .should('contain', 'foo').and('contain', 'bar')
        .and('contain', 'boo').and('contain', 'far')
    })

    it('can enter BSON schema', () => {
      const bsonSchema = {"fat":"box", "bat":"fox"}
      
      // Enter BSON schema
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().clear()
        .type(JSON.stringify(bsonSchema, null, 2), { parseSpecialCharSequences: false })

      cy.reload()
      cy.wait(500)
      
      // Verify JSON schema persisted
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().invoke('val')
        .should('contain', 'fat').and('contain', 'box')
        .and('contain', 'bat').and('contain', 'fox')
    })

    it('locks', () => {
      cy.visit(`/types/${fileName}`)

      // Arrange unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')

      // Act - Lock the type
      cy.get('[data-test="lock-type-btn"]').click()

      // Verify the state
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="root-description-display"]').should('contain', 'Click to add description') 
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('not.have.attr', 'data-disabled')
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().should('have.attr', 'readonly')
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().should('have.attr', 'readonly')
    })

    it('unlocks', () => {
      cy.visit(`/types/${fileName}`)

      // Arrange an unlocked type
      cy.get('[data-test="lock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('be.visible')

      // Act - Lock the type
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify the state
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')

      // Act - Unlock the type
      cy.get('[data-test="unlock-type-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      
      // Verify unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="root-description-display"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible')
      cy.get('[data-test="complex-property-json-input"]').find('textarea').should('not.have.attr', 'readonly')
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').should('not.have.attr', 'readonly')
    })

    it('handles invalid JSON gracefully', () => {
      // Test invalid JSON in JSON input
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first()
        .type('{"invalid": json}', { parseSpecialCharSequences: false })
      
      // Test invalid JSON in BSON input  
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first()
        .type('{"invalid": bson}', { parseSpecialCharSequences: false })

      // Should not crash the application
      cy.get('[data-test="complex-property-json-input"]').should('be.visible')
      cy.get('[data-test="complex-property-bson-input"]').should('be.visible')
    })

  })

})