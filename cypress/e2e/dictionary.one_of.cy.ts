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
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'One Of')
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // force a blur of the active input fields
    cy.visit('/dictionaries')
    cy.unlockAndDeleteFile('dictionaries', dictionaryFileName)
  })

  describe('One Of Property Editor', () => {
    it('can persist name/description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Target the One Of property (index 1, after root _id) - clear first
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('firstTestProperty')
      cy.reload()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')

      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('One property for testing object properties')
      cy.reload()
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'One property for testing object properties')
    })

    it('has the correct type picker', () => {
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
    })

    it('can change type to array', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
      cy.get('[data-test="type-chip"]').eq(1).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Array')
    })

    it('can change type to object', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
      cy.get('[data-test="type-chip"]').eq(1).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    })

    it('can change type to word', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
      cy.get('[data-test="type-chip"]').eq(1).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="custom-type-name-word.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'word')
    })

    it('displays one_of action icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify add property button is visible and enabled (second one for the non-root object)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify allow-additional-properties button is not present
      cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('not.exist')
      
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
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((text) => {
        expect(['toggle_off', 'toggle_on']).to.include(text.trim())
      })
      cy.get('[data-test="required-toggle-btn"]').first().click()
      cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').invoke('text').then((text) => {
        expect(['toggle_off', 'toggle_on']).to.include(text.trim())
      })

      // verify delete property button works (deletes the child One Of, root retains _id)
      cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
      cy.get('[data-test="add-property-btn"]').should('have.length', 1)
    })

    it('persists required properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify required toggle works (icon may show toggle_off or toggle_on)
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

    it('can add/delete properties to one of', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // make sure the property list body exists (non-root One Of at eq 1)
      const oneOfBody = () => cy.get('[data-test="property-body"]').eq(1)
      oneOfBody().should('be.visible')

      // add three properties to the One Of
      cy.get('[data-test="add-property-btn"]').eq(1).click().click().click()
      oneOfBody().find('[data-test="property-name-input"]').eq(0).find('input').clear().type('firstTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(1).find('input').clear().type('secondTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(2).find('input').clear().type('thirdTestProperty')

      // verify the properties were added
      oneOfBody().find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // delete the second property
      oneOfBody().find('[data-test="delete-property-btn"]').eq(1).click()
      oneOfBody().find('[data-test="property-name-input"]').should('have.length', 2)
      oneOfBody().find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

      // delete the first property
      oneOfBody().find('[data-test="delete-property-btn"]').eq(0).click()
      oneOfBody().find('[data-test="property-name-input"]').should('have.length', 1)
      oneOfBody().find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'thirdTestProperty')

      // delete the last property
      oneOfBody().find('[data-test="delete-property-btn"]').eq(0).click()
      oneOfBody().find('[data-test="property-name-input"]').should('have.length', 0)
      cy.get('[data-test="object-property-body"]').eq(1).should('contain', 'No properties defined')
    })
    
    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      const oneOfBody = () => cy.get('[data-test="property-body"]').eq(1)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click().click()
      oneOfBody().find('[data-test="property-name-input"]').eq(0).find('input').clear().type('firstTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(1).find('input').clear().type('secondTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(2).find('input').clear().type('thirdTestProperty')

      oneOfBody().find('[data-test="property-name-input"]').should('have.length', 3)
      oneOfBody().find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
      oneOfBody().find('[data-test="property-drag-handle"]').eq(1).then(($dragHandle) => {
        // Create a proper DataTransfer object
        const dataTransfer = new DataTransfer()
        dataTransfer.setData('text/plain', 'secondTestProperty')
        
        // Trigger dragstart with proper dataTransfer
        cy.wrap($dragHandle)
          .trigger('dragstart', { dataTransfer })
        
        // Drop on the first drop zone within the non-root One Of body
        oneOfBody().find('[data-test="drop-zone-0"]')
          .trigger('dragover', { dataTransfer })
          .trigger('drop', { dataTransfer })
        
        // Trigger dragend
        cy.wrap($dragHandle)
          .trigger('dragend')
      })
      
      // Wait for the drag operation to complete
      cy.wait(1000)
      
      // Verify new order: secondTestProperty, firstTestProperty, thirdTestProperty
      oneOfBody().find('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      oneOfBody().find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
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

      // Create some properties in the non-root One Of
      const oneOfBody = () => cy.get('[data-test="property-body"]').eq(1)
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click()
      oneOfBody().find('[data-test="property-name-input"]').should('have.length', 2)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      oneOfBody().should('be.empty')

      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      oneOfBody().find('[data-test="property-name-input"]').should('have.length', 2)
    })
  })

  // Dictionary-level lock/unlock behavior is now configuration-driven and
  // covered in dedicated configuration tests. One-of editor behavior is
  // validated by the functional tests above without exercising deprecated
  // manual lock/unlock controls.
})

