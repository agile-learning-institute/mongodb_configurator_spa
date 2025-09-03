describe('Types page flow', () => {
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

    it.only('shows both JSON and BSON input fields', () => {      
      // Verify both input fields are visible
      cy.visit(`/types/${fileName}`)
      cy.get('[data-test="complex-property-json-input"]').should('be.visible')
      cy.get('[data-test="complex-property-bson-input"]').should('be.visible')
      
      // Verify field labels
      cy.get('[data-test="complex-property-json-input"]').parent().should('contain', 'JSON Type Definition')
      cy.get('[data-test="complex-property-bson-input"]').parent().should('contain', 'BSON Type Definition')
      
      // Verify default values are present (empty JSON objects)
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().invoke('val')
        .should('contain', '{}')
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().invoke('val')
        .should('contain', '{}')
    })

    it('can enter JSON schema', () => {
      const jsonSchema = {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          age: { type: "number", minimum: 0 }
        },
        required: ["name"]
      }
      
      // Enter JSON schema
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first()
        .type(JSON.stringify(jsonSchema, null, 2), { parseSpecialCharSequences: false })

      cy.reload()
      cy.wait(500)
      
      // Verify JSON schema persisted
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().invoke('val')
        .should('contain', 'type').and('contain', 'object')
        .and('contain', 'properties').and('contain', 'name')
        .and('contain', 'age').and('contain', 'required')
    })

    it('can enter BSON schema', () => {
      const bsonSchema = {
        bsonType: "object",
        properties: {
          name: { bsonType: "string" },
          age: { bsonType: "int" }
        },
        required: ["name"]
      }
      
      // Enter BSON schema
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first()
        .type(JSON.stringify(bsonSchema, null, 2), { parseSpecialCharSequences: false })

      cy.reload()
      cy.wait(500)
      
      // Verify BSON schema persisted
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().invoke('val')
        .should('contain', 'bsonType').and('contain', 'object')
        .and('contain', 'properties').and('contain', 'name')
        .and('contain', 'age').and('contain', 'required')
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
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().should('be.disabled')
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().should('be.disabled')
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
      cy.get('[data-test="complex-property-json-input"]').find('textarea').should('not.be.disabled')
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').should('not.be.disabled')
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

    it('can clear and re-enter schemas', () => {
      // Enter initial schemas
      const initialJson = '{"type": "string"}'
      const initialBson = '{"bsonType": "string"}'
      
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first()
        .type(initialJson, { parseSpecialCharSequences: false })
      
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first()
        .type(initialBson, { parseSpecialCharSequences: false })

      // Clear and enter new schemas
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first()
        .clear()
        .type('{"type": "object", "properties": {"id": {"type": "string"}}}', { parseSpecialCharSequences: false })
      
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first()
        .clear()
        .type('{"bsonType": "object", "properties": {"id": {"bsonType": "string"}}}', { parseSpecialCharSequences: false })

      cy.reload()
      cy.wait(500)
      
      // Verify new schemas persisted
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().invoke('val')
        .should('contain', 'type').and('contain', 'object')
        .and('contain', 'properties').and('contain', 'id')
        .and('not.contain', 'string')
      
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().invoke('val')
        .should('contain', 'bsonType').and('contain', 'object')
        .and('contain', 'properties').and('contain', 'id')
        .and('not.contain', 'string')
    })
  })
})