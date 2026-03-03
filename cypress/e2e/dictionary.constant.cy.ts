import { createDictionary } from '../support/helpers'

describe('Dictionary Details Page', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary Object with a Object property
  beforeEach(() => {
    const result = createDictionary(`TestDictionary-object-${Date.now()}`)
    dictionaryName = result.dictionaryName
    dictionaryFileName = result.dictionaryFileName

    // Set type to Object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'Object')

    // Add a property with Constant type
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-constant"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Constant')
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // force a blur of the active input fields
    cy.visit('/dictionaries')
    cy.unlockAndDeleteFile('dictionaries', dictionaryFileName)
  })

  describe('Constant Property Editor', () => {
    it('can persist name/description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="property-name-input"]').eq(0).find('input').clear().type('firstTestProperty')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')

      cy.get('[data-test="description-input"]').eq(0).find('input').clear().type('One property for testing object properties')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="description-input"]').eq(0).find('input').should('have.value', 'One property for testing object properties')
    })

    it('shows control icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="property-drag-handle"]').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').first().invoke('text').then((t) => {
        const icon = (t || '').trim()
        expect(['toggle_off', 'toggle_on']).to.include(icon)
      })
      cy.get('[data-test="delete-property-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').find('.material-symbols-outlined').should('contain', 'delete')
    })

    it('can delete', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="delete-property-btn"]').first().should('be.visible').click()
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
    })

    it('persists required properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((initialText) => {
        const initialState = (initialText || '').trim()
        expect(['toggle_off', 'toggle_on']).to.include(initialState)
        const expectedAfter = initialState === 'toggle_off' ? 'toggle_on' : 'toggle_off'
        cy.get('[data-test="required-toggle-btn"]').first().click()
        cy.wait(250)
        cy.reload()
        cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').first().invoke('text').should('include', expectedAfter)
      })
    })

    it('displays type picker with proper values', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
      cy.get('[data-test="type-chip"]').eq(1).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"] i').should('have.length', 7)
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible')
      cy.get('[data-test="built-in-type-ref"]').should('be.visible')
      cy.get('[data-test="built-in-type-constant"]').should('be.visible')
      cy.get('[data-test="built-in-type-enum"]').should('be.visible')
      cy.get('[data-test="built-in-type-enum_array"]').should('be.visible')

      // verify type picker has Custom Types section
      cy.get('[data-test="custom-types-category"]').should('be.visible')
      cy.get('[data-test="custom-types-category"] i').should('have.length.greaterThan', 10)

      // Change type to word
      cy.get('[data-test="custom-type-name-word.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'word')
    })

    it('displays constant input with proper placeholder', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="constant-type-label"]').should('be.visible').should('contain', 'Value:')
      cy.get('[data-test="constant-value-input"]').eq(0).find('input').invoke('attr', 'placeholder').should('eq', 'Enter value')
      cy.get('[data-test="constant-value-input"]').eq(0).find('input').clear().type('Constant Value')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="constant-value-input"]').eq(0).find('input').should('have.value', 'Constant Value')
    })

    // Lock/unlock behavior for dictionaries is deprecated; lock tests removed.
  })
})
