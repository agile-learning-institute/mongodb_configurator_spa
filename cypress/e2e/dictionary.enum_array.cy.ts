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

    // Add a property with Enum Array type
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-enum_array"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Enum Array')
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // force a blur of the active input fields
    cy.visit('/dictionaries')
    cy.unlockAndDeleteFile('dictionaries', dictionaryFileName)
  })

  describe('Enum Array Property Editor', () => {
    it('can persist name/description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Target the Enum Array property (index 1, after root _id) - clear first
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('firstTestProperty')
      cy.reload()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')

      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('One property for testing object properties')
      cy.reload()
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'One property for testing object properties')
    })

    it('shows control icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="property-drag-handle"]').first().should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').first().should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((text) => {
        expect(['toggle_off', 'toggle_on']).to.include(text.trim())
      })
      cy.get('[data-test="delete-property-btn"]').first().should('be.visible')
      cy.get('[data-test="delete-property-btn"]').first().find('.material-symbols-outlined').should('contain', 'delete')
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
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((initialText) => {
        const initialState = initialText.trim()
        expect(['toggle_off', 'toggle_on']).to.include(initialState)
        const expectedAfterClick = initialState === 'toggle_off' ? 'toggle_on' : 'toggle_off'

        cy.get('[data-test="required-toggle-btn"]').first().click()
        cy.wait(250)
        cy.reload()
        cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').should('include', expectedAfterClick)
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

    it('displays enum picker with proper values', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="enum-type-label"]').should('be.visible').should('contain', 'Enumerators:')

      cy.get('[data-test="enum-type-chip"]').first().should('be.visible').click()
      cy.get('[data-test="enum-type-picker-card"]').should('be.visible')
      cy.get('[data-test^="enum-type-option-"].v-chip').should('have.length.greaterThan', 0)
      cy.get('[data-test="enum-type-option-default_status"]').should('contain', 'default_status').click()
      cy.get('[data-test="enum-type-picker-card"]').should('not.exist')
      cy.get('[data-test="enum-type-chip"]').first().should('be.visible').should('contain', 'default_status')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="enum-type-chip"]').first().should('be.visible').should('contain', 'default_status')
    })

    it('persists enum changes', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Add a new property with Enum type
      cy.get('[data-test="add-property-btn"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').click()
      cy.get('[data-test="built-in-type-enum"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').should('contain', 'Enum')
      cy.get('[data-test="enum-type-chip"]').eq(1).should('be.visible').click()
      cy.get('[data-test="enum-type-option-name-default_status"]').should('be.visible').click()
      cy.get('[data-test="enum-type-chip"]').eq(1).should('be.visible').should('contain', 'default_status')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="enum-type-chip"]').should('be.visible').should('contain', 'default_status')
    })

    // Lock/unlock behavior for dictionaries is deprecated; lock tests removed.
  })
})
