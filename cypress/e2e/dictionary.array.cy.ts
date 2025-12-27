import { createDictionary } from '../support/helpers'

describe('Dictionary Details Page', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary Object with a One Of property
  beforeEach(() => {
    const result = createDictionary(`TestDictionary-object-${Date.now()}`)
    dictionaryName = result.dictionaryName
    dictionaryFileName = result.dictionaryFileName

    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'Object')

    // Add a property with Array type
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-array"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Array')
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // force a blur of the active input fields
    cy.visit('/dictionaries')
    cy.unlockAndDeleteFile('dictionaries', dictionaryFileName)
  })

  describe('Array of Custom (Defaults) Property Editor', () => {
    it('can persist name/description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="property-name-input"]').find('input').type('firstTestProperty')
      cy.reload()
      cy.get('[data-test="property-name-input"]').find('input').should('have.value', 'firstTestProperty')

      cy.get('[data-test="description-input"]').find('input').type('One property for testing object properties')
      cy.reload()
      cy.get('[data-test="description-input"]').find('input').should('have.value', 'One property for testing object properties')
    })

    it('has the correct type picker', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
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
    })

    it('has the correct items type picker', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').click()
      
      // verify items type picker has Built-in Types section
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"] i').should('have.length', 4)
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible')
      cy.get('[data-test="built-in-type-ref"]').should('be.visible')

      // verify items type picker does not have other built-in types
      cy.get('[data-test="built-in-type-constant"]').should('not.exist')
      cy.get('[data-test="built-in-type-enum"]').should('not.exist')
      cy.get('[data-test="built-in-type-enum_array"]').should('not.exist')

      // verify items type picker has Custom Types section
      cy.get('[data-test="custom-types-category"]').should('be.visible')
      cy.get('[data-test="custom-types-category"] i').should('have.length.greaterThan', 10)
    })

    it('can change type to one_of', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'One Of')
    })

    it('can change type to object', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    })

    it('can change type to word', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="custom-type-name-word.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'word')
    })

    it('displays array action icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

      // verify delete property button works
      cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
      cy.get('[data-test="no-object-properties-text"]').should('exist')
    })

    it('persists required properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')

      cy.get('[data-test="required-toggle-btn"]').first().should('be.visible').click()
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

      cy.get('[data-test="required-toggle-btn"]').first().should('be.visible').click()
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
    })

    it('locks', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="lock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')

      // verify that everything is locked
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('not.exist')
    })

    it('unlocks', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="lock-dictionary-btn"]').should('not.be.disabled').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="unlock-dictionary-btn"]').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('not.exist')

      // verify that everything is unlocked
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').should('be.visible')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('exist')
    })
  })

  describe('Array of Objects Property Editor', () => {
    beforeEach(() => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').eq(0).should('be.visible').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
    })

    it('displays array of objects action icons', () => {
      // verify add property button is visible and enabled (second one for the non-root object)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify allow-additional-properties button is visible and enabled
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt')
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).click()
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_check')
      
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

      // verify delete property button works
      cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
      cy.get('[data-test="no-object-properties-text"]').should('exist')
    })

    it('can add/delete properties to objects', () => {
      // make sure the property list body exists.
      cy.get('[data-test="property-body"]').eq(1).should('be.visible')

      // add three properties to the object
      cy.get('[data-test="add-property-btn"]').eq(1).click().click().click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').type('thirdTestProperty')

      // verify the properties were added
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')

      // delete the second property
      cy.get('[data-test="delete-property-btn"]').eq(2).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // delete the first property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

      // delete the last property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="property-body"]').eq(1).should('be.visible').should('contain', 'No properties defined')
    })
    
    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click().click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').type('thirdTestProperty')

      cy.get('[data-test="property-name-input"]').should('have.length', 4)
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')

      // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="property-drag-handle"]').eq(2).then(($dragHandle) => {
        // Create a proper DataTransfer object
        const dataTransfer = new DataTransfer()
        dataTransfer.setData('text/plain', 'secondTestProperty')
        
        // Trigger dragstart with proper dataTransfer
        cy.wrap($dragHandle)
          .trigger('dragstart', { dataTransfer })
        
        // Drop on the first drop zone within the non-root property context
        cy.get('[data-test="drop-zone-0"]').eq(1)
          .trigger('dragover', { dataTransfer })
          .trigger('drop', { dataTransfer })
        
        // Trigger dragend
        cy.wrap($dragHandle)
          .trigger('dragend')
      })
      
      // Wait for the drag operation to complete
      cy.wait(1000)
      
      // Verify new order: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')
    })

    it('can show/hide empty properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(1).should('contain', 'No properties defined')

      // Hide Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled').click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-body"]').eq(1).should('be.empty')

      // Show Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(1).should('contain', 'No properties defined')
    })

    it('can show/hide some properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Create some properties
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click()
      cy.get('[data-test="property-name-input"]').should('have.length', 3)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="property-body"]').eq(1).should('be.empty')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
    })

    it('locks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')

      // verify that everything is locked
      cy.get('[data-test="add-property-btn"]').should('not.exist')
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('not.exist')
      
      // verify show-hide-properties button is visible and enabled even when locked
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
    })

    it('unlocks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('not.be.disabled').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="unlock-dictionary-btn"]').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('not.exist')

      // verify add property button is visible and enabled (second one for the non-root object)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify allow-additional-properties button is visible and enabled
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt')
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).click()
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_check')
      
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify type chip pickers are enabled
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('exist')
      
      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

      // verify delete property button works
      cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
      cy.get('[data-test="no-object-properties-text"]').should('exist')
    })
  })

  describe('Array of One Of Property Editor', () => {
    beforeEach(() => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').eq(0).should('be.visible').click()
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
    })

    it('displays array of one_of action icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify add property button is visible and enabled (second one for the non-root object)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

      // verify allow-additional-properties button is not present
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('not.exist')
      
      // verify delete property button works
      cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
      cy.get('[data-test="no-object-properties-text"]').should('exist')
    })

    it('can add/delete properties to one of', () => {
      // make sure the property list body exists.
      cy.get('[data-test="property-body"]').eq(1).should('be.visible')

      // add three properties to the object
      cy.get('[data-test="add-property-btn"]').eq(1).click().click().click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').type('thirdTestProperty')

      // verify the properties were added
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')

      // delete the second property
      cy.get('[data-test="delete-property-btn"]').eq(2).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // delete the first property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

      // delete the last property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="property-body"]').eq(1).should('contain', 'No properties defined')
    })
    
    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click().click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').type('thirdTestProperty')

      cy.get('[data-test="property-name-input"]').should('have.length', 4)
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')

      // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="property-drag-handle"]').eq(2).then(($dragHandle) => {
        // Create a proper DataTransfer object
        const dataTransfer = new DataTransfer()
        dataTransfer.setData('text/plain', 'secondTestProperty')
        
        // Trigger dragstart with proper dataTransfer
        cy.wrap($dragHandle)
          .trigger('dragstart', { dataTransfer })
        
        // Drop on the first drop zone within the non-root property context
        cy.get('[data-test="object-property-0"]').within(() => {
          cy.get('[data-test="drop-zone-0"]')
            .trigger('dragover', { dataTransfer })
            .trigger('drop', { dataTransfer })
        })
        
        // Trigger dragend
        cy.wrap($dragHandle)
          .trigger('dragend')
      })
      
      // Wait for the drag operation to complete
      cy.wait(1000)
      
      // Verify new order: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')
    })

    it('can show/hide empty properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(1).should('contain', 'No properties defined')

      // Hide Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled').click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-body"]').eq(1).should('be.empty')

      // Show Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(1).should('contain', 'No properties defined')
    })

    it('can show/hide some properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Create some properties
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click()
      cy.get('[data-test="property-name-input"]').should('have.length', 3)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="property-body"]').eq(1).should('be.empty')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
    })

    it('locks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')

      // verify that everything is locked
      cy.get('[data-test="add-property-btn"]').should('not.exist')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('not.exist')

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
    })

    it('unlocks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('not.be.disabled').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="unlock-dictionary-btn"]').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('not.exist')

      // verify that everything is unlocked
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="delete-property-btn"]').eq(0).should('exist')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('exist')

      // verify allow-additional-properties button is not present
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('not.exist')
    })
  })

  describe('Array of Ref Property Editor', () => {  
    beforeEach(() => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').eq(0).should('be.visible').click()
      cy.get('[data-test="built-in-type-ref"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
    })

    it('displays ref picker with proper values', () => {
      cy.get('[data-test="ref-type-label"]').should('be.visible').should('contain', 'Dictionary:')
      cy.get('[data-test="ref-dictionary-chip"]').should('be.visible').click()
      cy.get('[data-test="ref-dictionary-picker-card"]').should('be.visible')
      cy.get('[data-test^="ref-dictionary-option-"].v-chip').should('have.length.greaterThan', 2)
      cy.get(`[data-test="ref-dictionary-option-${dictionaryName}"]`).should('be.visible').click()
      cy.get('[data-test="ref-dictionary-picker-card"]').should('not.exist')
      cy.get('[data-test="ref-dictionary-chip"]').should('be.visible').should('contain', dictionaryName)
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="ref-dictionary-chip"]').should('be.visible').should('contain', dictionaryName)
    })

    it('displays array of ref action icons', () => {
      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

      // verify delete property button works
      cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
      cy.get('[data-test="no-object-properties-text"]').should('exist')
    })

    it('locks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')

      // verify that everything is locked
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="ref-dictionary-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
    })

    it('unlocks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('not.be.disabled').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="unlock-dictionary-btn"]').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('not.exist')

      // verify that everything is unlocked
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').should('be.visible')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="ref-dictionary-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
    })
  })

  describe('Array of Array Property Editor', () => {
    beforeEach(() => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').click()
      cy.get('[data-test="built-in-type-array"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
    })

    it('displays array of array action icons', () => {
      // verify expand-collapse button works
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('exist')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')

      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

      // verify delete property button works
      cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
      cy.get('[data-test="no-object-properties-text"]').should('exist')
    })

    it('displays the nested array property', () => {
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').should('contain', 'word')
      cy.get('[data-test="array-of-array-body"]').should('have.length', 1) 
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'item')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.attr', 'value', 'Array item')

      // verify required toggle works
      cy.get('[data-test="required-toggle-btn"]').eq(0).should('exist')
      cy.get('[data-test="required-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').eq(0).click()
      cy.get('[data-test="required-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'toggle_on')

    })
  
    it('persists name/description edits', () => {
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('firstTestProperty')
      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('One property for testing array of array properties')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'One property for testing array of array properties')
    })
  
    it('can change items type to array', () => {
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').click()
      cy.get('[data-test="built-in-type-array"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'Array')
    })

    it('can change items type to object', () => {
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(3).should('contain', 'Object')
    })

    it('can change items type to one_of', () => {
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').click()
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(3).should('contain', 'One Of')
    })

    it('can change items type to ref', () => {
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').click()
      cy.get('[data-test="built-in-type-ref"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(3).should('contain', 'Ref')
    })

    it('can show/hide nested array details', () => {
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(1).should('have.length', 1) 

      // Hide nested array details
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-body"]').eq(1).should('be.empty')

      // Show nested array details
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(1).should('have.length', 1) 
    })

    it('locks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')

      // verify that everything is locked
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(3).find('[data-test="dropdown-icon"]').should('not.exist')
    })

    it('unlocks', () => {
      cy.get('[data-test="lock-dictionary-btn"]').should('not.be.disabled').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="unlock-dictionary-btn"]').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('not.exist')

      // verify that everything is unlocked
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').should('be.visible')
      cy.get('[data-test="type-chip"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(1).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(2).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="type-chip"]').eq(3).find('[data-test="dropdown-icon"]').should('exist')
    })
  })
})
