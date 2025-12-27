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

      cy.get('[data-test="property-name-input"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')

      cy.get('[data-test="description-input"]').eq(0).click()
      cy.get('[data-test="description-input"]').eq(0).find('input').type('One property for testing object properties')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="description-input"]').eq(0).find('input').should('have.value', 'One property for testing object properties')
    })

    it('shows control icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="property-drag-handle"]').should('be.visible')
      cy.get('[data-test="property-drag-handle"] .mdi-drag').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="delete-property-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').find('.material-symbols-outlined').should('contain', 'delete')
    })

    it('can delete', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="delete-property-btn"]').should('be.visible').click()
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
    })

    it('persists required properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').click()
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_on')
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
      cy.get('[data-test="constant-value-input"]').eq(0).find('input').should('have.attr', 'placeholder', 'Enter value')
      cy.get('[data-test="constant-value-input"]').eq(0).click()
      cy.get('[data-test="constant-value-input"]').eq(0).find('input').type('Constant Value')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'Constant Value')
    })

    it('locks', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      // lock the dictionary
      cy.get('[data-test="lock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')

      // Make sure the property name and description and constant value are locked
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'readonly')
      cy.get('[data-test="description-input"]').eq(0).find('input').should('have.attr', 'readonly')
      cy.get('[data-test="constant-value-input"]').eq(0).find('input').should('have.attr', 'readonly')

      // Make sure none of the action icons exist
      cy.get('[data-test="property-drag-handle"]').should('not.exist')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')

      // Make type pickers are disabled
      cy.get('[data-test="type-chip-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
    })

    it('unlocks', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      // lock and unlock the dictionary
      cy.get('[data-test="lock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('not.exist')

      // Make sure the property name and description and constant value are unlocked
      cy.get('[data-test="property-name-input"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('be.enabled')
      cy.get('[data-test="description-input"]').eq(0).click()
      cy.get('[data-test="description-input"]').eq(0).find('input').should('be.enabled')
      cy.get('[data-test="constant-value-input"]').eq(0).click()
      cy.get('[data-test="constant-value-input"]').eq(0).find('input').should('be.enabled')

      // Make sure the action icons exist
      cy.get('[data-test="property-drag-handle"]').should('be.visible')
      cy.get('[data-test="property-drag-handle"] .mdi-drag').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="delete-property-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').find('.material-symbols-outlined').should('contain', 'delete')

      // Make type pickers are enabled
      cy.get('[data-test="type-chip-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
    })
  })
})
