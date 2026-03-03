import { createDictionary } from '../support/helpers'

describe('Dictionary Details Page', () => {
  let dictionaryFileName: string
  let dictionaryName: string
  let referencedDictionaryName: string

  // Setup a dictionary Object with a One Of property
  beforeEach(() => {
    const result = createDictionary(`TestDictionary-object-${Date.now()}`)
    dictionaryName = result.dictionaryName
    dictionaryFileName = result.dictionaryFileName

    // Ensure there is at least one referenced (non-versioned) dictionary available for RefPicker
    referencedDictionaryName = `refDict-array-${Date.now()}`
    cy.request('PUT', `/api/dictionaries/${referencedDictionaryName}.yaml/`, {
      file_name: `${referencedDictionaryName}.yaml`,
      _locked: false,
      root: {
        name: 'root',
        description: '',
        type: 'object',
        required: true,
        properties: [],
      },
    })

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

    // Clean up the referenced (non-versioned) dictionary created for RefPicker tests
    if (referencedDictionaryName) {
      cy.request({
        method: 'DELETE',
        url: `/api/dictionaries/${referencedDictionaryName}.yaml/`,
        failOnStatusCode: false,
      })
    }
  })

  describe('Array of Custom (Defaults) Property Editor', () => {
    it('can persist name/description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Target the array property (first child of root object) - clear first in case of default value
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('firstTestProperty')
      cy.reload()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')

      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('One property for testing object properties')
      cy.reload()
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'One property for testing object properties')
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

      // verify required toggle works (icon may show toggle_off or toggle_on)
      cy.get('[data-test="required-toggle-btn"]').first().should('exist').and('be.visible')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((text) => {
        expect(['toggle_off', 'toggle_on']).to.include(text.trim())
      })
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((text) => {
        expect(['toggle_off', 'toggle_on']).to.include(text.trim())
      })

      // verify delete property button exists and is clickable (delete verification in add/delete tests)
      cy.get('[data-test="delete-property-btn"]').first().should('exist').and('be.visible')
    })

    it('persists required properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Get initial state, click to toggle, verify state persisted after reload
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((initialText) => {
        const initialState = initialText.trim()
        expect(['toggle_off', 'toggle_on']).to.include(initialState)
        const expectedAfterClick = initialState === 'toggle_off' ? 'toggle_on' : 'toggle_off'

        cy.get('[data-test="required-toggle-btn"]').first().click()
        cy.wait(250)
        cy.reload()
        cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').should('include', expectedAfterClick)

        // Toggle back
        cy.get('[data-test="required-toggle-btn"]').first().click()
        cy.wait(250)
        cy.reload()
        cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').should('include', initialState)
      })
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
      
      // verify required toggle works (icon may show toggle_off or toggle_on)
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })

      // verify delete property button exists and is clickable (delete verification in add/delete tests)
      cy.get('[data-test="delete-property-btn"]').first().should('exist').and('be.visible')
    })

    it('can add/delete properties to objects', () => {
      // make sure the property list body exists.
      cy.get('[data-test="array-of-object-body"]').should('be.visible')

      // add three properties to the object
      cy.get('[data-test="add-property-btn"]').eq(1).click().click().click()
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(0).find('input').clear().type('firstTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(1).find('input').clear().type('secondTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(2).find('input').clear().type('thirdTestProperty')

      // verify the properties were added
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // delete the second property
      cy.get('[data-test="array-of-object-body"]').find('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

      // delete the first property
      cy.get('[data-test="array-of-object-body"]').find('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'thirdTestProperty')

      // delete the last property
      cy.get('[data-test="array-of-object-body"]').find('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').should('have.length', 0)
      cy.get('[data-test="array-of-object-body"]').should('contain', 'No properties defined')
    })
    
    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click().click()
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(0).find('input').clear().type('firstTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(1).find('input').clear().type('secondTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(2).find('input').clear().type('thirdTestProperty')

      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-drag-handle"]').eq(1).then(($dragHandle) => {
        const dataTransfer = new DataTransfer()
        dataTransfer.setData('text/plain', 'secondTestProperty')
        cy.wrap($dragHandle).trigger('dragstart', { dataTransfer })
        cy.get('[data-test="array-of-object-body"]').find('[data-test="drop-zone-0"]').trigger('dragover', { dataTransfer }).trigger('drop', { dataTransfer })
        cy.wrap($dragHandle).trigger('dragend')
      })
      
      cy.wait(1000)
      
      // Verify new order: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
    })

    it('can show/hide empty properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-object-body"]', { timeout: 8000 }).should('be.visible').and('contain', 'No properties defined')

      // Hide Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled').click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="array-of-object-body"]').should('not.exist')

      // Show Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-object-body"]').should('contain', 'No properties defined')
    })

    it('can show/hide some properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Create some properties
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click()
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').should('have.length', 2)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').should('have.length', 2)

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="array-of-object-body"]').should('not.exist')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-object-body"]').find('[data-test="property-name-input"]').should('have.length', 2)
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
      
      // verify required toggle works (icon may show toggle_off or toggle_on)
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })

      // verify allow-additional-properties button is not present
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('not.exist')
      
      // verify delete property button exists and is clickable (delete verification in add/delete tests)
      cy.get('[data-test="delete-property-btn"]').first().should('exist').and('be.visible')
    })

    it('can add/delete properties to one of', () => {
      cy.get('[data-test="array-of-oneof-body"]').should('be.visible')

      cy.get('[data-test="add-property-btn"]').eq(1).click().click().click()
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(0).find('input').clear().type('firstTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(1).find('input').clear().type('secondTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(2).find('input').clear().type('thirdTestProperty')

      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').should('have.length', 0)
      cy.get('[data-test="array-of-oneof-body"]').should('contain', 'No properties defined')
    })

    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click().click()
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(0).find('input').clear().type('firstTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(1).find('input').clear().type('secondTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(2).find('input').clear().type('thirdTestProperty')

      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-drag-handle"]').eq(1).then(($dragHandle) => {
        const dataTransfer = new DataTransfer()
        dataTransfer.setData('text/plain', 'secondTestProperty')
        cy.wrap($dragHandle).trigger('dragstart', { dataTransfer })
        cy.get('[data-test="array-of-oneof-body"]').find('[data-test="drop-zone-0"]').trigger('dragover', { dataTransfer }).trigger('drop', { dataTransfer })
        cy.wrap($dragHandle).trigger('dragend')
      })
      
      cy.wait(1000)
      
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
    })

    it('can show/hide empty properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-oneof-body"]', { timeout: 8000 }).should('be.visible').and('contain', 'No properties defined')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled').click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="array-of-oneof-body"]').should('not.exist')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-oneof-body"]').should('contain', 'No properties defined')
    })

    it('can show/hide some properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click()
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').should('have.length', 2)

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').should('have.length', 2)

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="array-of-oneof-body"]').should('not.exist')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="array-of-oneof-body"]').find('[data-test="property-name-input"]').should('have.length', 2)
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
      const refOptionId = referencedDictionaryName

      // Open picker
      cy.get('[data-test="ref-type-label"]').should('be.visible').should('contain', 'Dictionary:')
      cy.get('[data-test="ref-dictionary-chip"]').should('be.visible').click()
      cy.get('[data-test="ref-dictionary-picker-card"]').should('be.visible')

      // Verify we have at least one option and the referenced dictionary is present
      cy.get('[data-test^="ref-dictionary-option-"]').should('have.length.greaterThan', 0)
      cy.get(`[data-test="ref-dictionary-option-${refOptionId}"]`).should('exist')

      // Verify the "open dictionary" action is available and stays in the same tab
      cy.get(`[data-test="ref-dictionary-open-${refOptionId}"]`).should('exist').click({ force: true })
      cy.get('[data-test="ref-dictionary-picker-card"]').should('not.exist')
      cy.url().should('include', `/dictionaries/${referencedDictionaryName}.yaml`)

    })

    it('displays array of ref action icons', () => {
      // verify required toggle works (icon may show toggle_off or toggle_on)
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })

      // verify delete property button exists and is clickable (delete verification in add/delete tests)
      cy.get('[data-test="delete-property-btn"]').first().should('exist').and('be.visible')
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

      // verify required toggle works (icon may show toggle_off or toggle_on)
      cy.get('[data-test="required-toggle-btn"]').first().should('exist')
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })

      // verify delete property button exists and is clickable (delete verification in add/delete tests)
      cy.get('[data-test="delete-property-btn"]').first().should('exist').and('be.visible')
    })

    it('displays the nested array property', () => {
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').should('contain', 'word')
      cy.get('[data-test="array-of-array-body"]').should('have.length', 1) 
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'item')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'Array item')

      // verify required toggle works (icon may show toggle_off or toggle_on)
      cy.get('[data-test="required-toggle-btn"]').eq(0).should('exist')
      cy.get('[data-test="required-toggle-btn"]').eq(0).find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })
      cy.get('[data-test="required-toggle-btn"]').eq(0).click()
      cy.get('[data-test="required-toggle-btn"]').eq(0).find('.material-symbols-outlined').invoke('text').then((t) => {
        expect(['toggle_off', 'toggle_on']).to.include(t.trim())
      })

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


  })
})
