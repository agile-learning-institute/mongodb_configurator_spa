import { createType } from '../support/helpers'

describe('Types Detail Page', () => {
  let typeName: string
  let typeFileName: string

  // Setup a type with a simple root property
  beforeEach(() => {
    const result = createType(`e2e-test-type-simple-${Date.now()}`)
    typeName = result.typeName
    typeFileName = result.typeFileName

    cy.get('[data-test="root-description-input"]').should('be.visible')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="built-in-type-simple"]').click()
  })

  // Clean up any types created during tests
  afterEach(() => {
    cy.unlockAndDeleteFile('types', typeFileName)
  })

  describe('Simple Property Editor', () => {
    it('can change type', () => {
      cy.visit(`/types/${typeFileName}`)
      cy.get('[data-test="type-display-name"]').should('contain', 'Simple')
    })
    
    it('can add description', () => {
      // Add description
      cy.get('[data-test="root-description-input"]').find('input').clear().type('Simple property for testing{enter}')

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="root-description-input"]').find('input').should('have.value', 'Simple property for testing')
    })

    it('can enter schema string', () => {
      // Enter a schema string
      cy.get('[data-test="simple-property-schema-input"]').should('be.visible')
      cy.get('[data-test="simple-property-schema-input"]').find('textarea').first().clear()
        .type('{"type": "string", "minLength": 1, "maxLength": 100}', { parseSpecialCharSequences: false })

      cy.reload()
      cy.wait(500)
      cy.get('[data-test="simple-property-schema-input"]').find('textarea').first().invoke('val')
        .should('contain', 'type').and('contain', 'string')
        .and('contain', 'minLength').and('contain', '1')
        .and('contain', 'maxLength').and('contain', '100')
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
      // cy.get('[data-test="simple-property-schema-input"]').find('textarea').first().should('have.attr', 'readonly')
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
      cy.get('[data-test="simple-property-schema-input"]').find('textarea').should('not.have.attr', 'readonly')
    })
  })
})
