import { createType } from '../support/helpers'

describe('Types Detail Page', () => {
  let typeName: string
  let typeFileName: string

  // Setup a type with a complex root property
  beforeEach(() => {
    const result = createType(`e2e-test-type-complex-${Date.now()}`)
    typeName = result.typeName
    typeFileName = result.typeFileName

    cy.get('[data-test="root-description-input"]').should('be.visible')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="built-in-type-complex"]').click()
  })

  // Clean up any types created during tests
  afterEach(() => {
    cy.unlockAndDeleteFile('types', typeFileName)
  })

  describe('Complex Property Editor', () => {
    it('can change type', () => {
      cy.visit(`/types/${typeFileName}`)
      cy.get('[data-test="type-display-name"]').should('contain', 'Complex')
    })
    
    it('can add description', () => {
      // Add description
      cy.visit(`/types/${typeFileName}`)
      cy.get('[data-test="root-description-input"]').find('input').clear().type('Complex property for testing{enter}')

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="root-description-input"]').find('input').should('have.value', 'Complex property for testing')
    })

    it('shows both JSON and BSON input fields', () => {      
      // Verify both input fields are visible
      cy.visit(`/types/${typeFileName}`)
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
      cy.visit(`/types/${typeFileName}`)

      // Arrange unlocked state
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')

      // Act - Lock the type
      cy.get('[data-test="lock-type-btn"]').click()

      // Verify the state
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="root-description-input"]').find('input').should('have.value', '') 
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('not.have.attr', 'data-disabled')
      cy.get('[data-test="complex-property-json-input"]').find('textarea').first().should('have.attr', 'readonly')
      cy.get('[data-test="complex-property-bson-input"]').find('textarea').first().should('have.attr', 'readonly')
    })

    it('unlocks', () => {
      cy.visit(`/types/${typeFileName}`)

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
      cy.get('[data-test="root-description-input"]').should('be.visible')
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