describe('Types Detail Page', () => {
  const name = `e2e-test-type-array-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with an array root property
  beforeEach(() => {
    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(200) // Increased wait time
    cy.url().should('include', `/types/${name}`)
    
    // Change root type to array
    cy.get('[data-test="root-description-input"]').should('be.visible')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="built-in-type-array"]').click()
    cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
  })

  // Clean up any types created during tests
  afterEach(() => {
    // force a blur of the active input fields
    cy.visit('/types') 
    
    // Unlock the type
    cy.request({
      method: 'PUT',    
      url: `/api/types/${fileName}/`,
      headers: {"Content-Type": "application/json"},
      body: {"_locked": false, "root":{"name":""}},
      failOnStatusCode: false
    })
    
    // Delete the type
    cy.request({
      method: 'DELETE',
      url: `/api/types/${fileName}/`,
      failOnStatusCode: false
    })

    // Verify the type is deleted
    cy.wait(200)
    cy.visit('/types')
    cy.url().should('include', '/types')
    cy.get('[data-test="file-name"]').should('not.contain.text', fileName)
  })

  describe('Array Property Editor', () => {
    it('can change root type from void to array', () => {
      // Verify default root array type elements visible 
      cy.get('[data-test="property-drag-handle"]').should('not.exist')
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'word')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')

      // Verify save changes to values
      cy.get('[data-test="root-description-input"]').find('input').clear().type('Test array property')

      cy.reload()
      cy.wait(200)
      cy.get('[data-test="root-description-input"]').find('input').should('have.value', 'Test array property')
      
    })

    it('displays proper items type picker', () => {
      // Click on items type chip
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-simple"]').should('not.exist')
      cy.get('[data-test="built-in-type-complex"]').should('not.exist')
      
      // Verify items type picker has Custom Types section
      cy.get('[data-test="custom-types-category"]').should('be.visible')
      cy.get('[data-test^="custom-type-name-"]').should('have.length.greaterThan', 17)
      
      // Close the picker
      cy.get('header').first().click()
    })
  })

  describe('Array of Array Editor', () => {
    it('handles array of array', () => {     
      // Change the items type to array
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').should('have.length', 1).click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')

      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      
      // Verify sub-items editor
      cy.get('[data-test="property-body"]').should('be.visible')
      cy.get('[data-test="nested-array-property"]').should('have.length', 1)
      cy.get('[data-test="property-name-input"]').find('input').should('have.attr', 'value', 'item').clear().type('test_sub1')
      cy.get('[data-test="description-input"]').find('input').should('have.attr', 'value', 'Array item').clear().type('test_sub1_description')
      cy.get('[data-test="property-name-input"]').find('input').should('have.attr', 'value', 'test_sub1')
      cy.get('[data-test="description-input"]').find('input').should('have.attr', 'value', 'test_sub1_description')
      cy.get('[data-test="type-display-name"]').should('contain', 'word')
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')

      // Verify sub-items type picker 
      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'word').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="type-picker-card"]').within(() => {
        cy.get('[data-test="built-in-types-category"]').should('be.visible')
        cy.get('[data-test="built-in-type-object"]').should('be.visible')
        cy.get('[data-test="built-in-type-array"]').should('be.visible')
        cy.get('[data-test="built-in-type-simple"]').should('not.exist')
        cy.get('[data-test="built-in-type-complex"]').should('not.exist')
        cy.get('[data-test="custom-types-category"]').should('be.visible')
        cy.get('[data-test^="custom-type-name-"]').should('have.length.greaterThan', 17)

        // Create another nested array property        
        cy.get('[data-test="built-in-type-array"]').should('have.length', 1).click()
      })

      // Set nested array property name and description
      cy.get('[data-test="nested-array-property"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'item').clear().type('test_sub2')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.attr', 'value', 'Array item').clear().type('test_sub2_description')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'test_sub2')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.attr', 'value', 'test_sub2_description').blur()

      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="nested-array-property"]').should('have.length', 2)
      cy.get('[data-test="type-display-name"]').eq(3).should('contain', 'word')

      // Reload and verify persistence
      cy.reload()
      cy.get('[data-test="nested-array-property"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'test_sub1')
      cy.get('[data-test="description-input"]').eq(0).find('input').should('have.attr', 'value', 'test_sub1_description')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'test_sub2')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.attr', 'value', 'test_sub2_description')

      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(3).should('contain', 'word')      
    })

    it('locks array of array', () => {
      // Arrange array of array of array of word
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('have.length', 1).click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')

      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(2).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('have.length', 1).click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')

      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(3).should('contain', 'word')      
      
      // Verify unlocked and Lock 
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('have.length', 1).click()

      // Verify locked
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').eq(1).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').eq(2).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="required-toggle-btn"]').should('have.length', 0)
    })

    it('unlocks array of array', () => {
      // Arrange array of array of array of word
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('have.length', 1).click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')

      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(2).click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('have.length', 1).click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')

      cy.get('[data-test="type-display-name"]').eq(2).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(3).should('contain', 'word')      
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Lock and Unlock Type
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('have.length', 1).click()
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('have.length', 1).click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('have.length', 1).click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('be.visible')

      // Verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="root-type-chip-picker"]').eq(0).should('exist')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="items-type-picker"]').eq(1).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="items-type-picker"]').eq(2).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('be.enabled')
      cy.get('[data-test="description-input"]').eq(0).find('input').should('be.enabled')

      cy.get('[data-test="required-toggle-btn"]').should('have.length', 2)
      cy.get('[data-test="required-toggle-btn"]').eq(0).should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').eq(1).should('be.visible')
    })

  })

  describe('Array of Object Editor', () => {
    it('handles array of object', () => {
      // Arrange an array of object type
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('have.length', 1).click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')

      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Object')
      
      // Verify required checkbox is unchecked, check and verify checked
      cy.get('[data-test="no-properties-message"]').should('be.visible')
      cy.get('[data-test="add-property-btn"]').should('be.enabled')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.enabled')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.enabled')

      // Add a few properties and set name and description for each
      cy.get('[data-test="add-property-btn"]').should('have.length', 1).click().click().click()

      cy.get('[data-test="property-name-input"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
      cy.get('[data-test="description-input"]').eq(0).click()
      cy.get('[data-test="description-input"]').eq(0).find('input').type('A property for testing object properties')

      cy.get('[data-test="property-name-input"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
      cy.get('[data-test="description-input"]').eq(1).click()
      cy.get('[data-test="description-input"]').eq(1).find('input').type('A property for testing object properties')
      
      cy.get('[data-test="property-name-input"]').eq(2).click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')
      cy.get('[data-test="description-input"]').eq(2).click()
      cy.get('[data-test="description-input"]').eq(2).find('input').type('A property for testing object properties')

      // Reload and verify persistence
      cy.reload()
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Object')
      cy.get('[data-test="no-properties-message"]').should('not.exist')
      cy.get('[data-test="add-property-btn"]').should('be.enabled')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.enabled')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.enabled')
      cy.get('[data-test="description-input"]').eq(0).find('input').type('A property for testing object properties')
      cy.get('[data-test="description-input"]').eq(1).find('input').type('A property for testing object properties')
      cy.get('[data-test="description-input"]').eq(2).find('input').type('A property for testing object properties')
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.attr', 'value', 'thirdTestProperty')

      // Test delete property button
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.attr', 'value', 'thirdTestProperty')

      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'thirdTestProperty')

      cy.get('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).should('have.length', 1)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'thirdTestProperty')
      
      cy.get('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="card-content"]').should('contain', 'No properties defined')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')      
    })

    it('locks array of object', () => {
      // Arrange an array of object type
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('be.visible').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Object')
      cy.get('[data-test="add-property-btn"]').should('have.length', 1).click().click().click()

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')

      // Verify unlocked
      cy.get('[data-test="add-property-btn"]').should('be.enabled')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.enabled')
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="description-input"]').should('have.length', 3)
      cy.get('[data-test="description-input"]').eq(0).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="description-input"]').eq(2).find('input').should('not.have.attr', 'readonly')
      
      // Lock Type and verify locked
      cy.get('[data-test="lock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Verify locked - inputs should be disabled
      cy.get('[data-test="add-property-btn"]').should('not.exist')
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible')
      cy.get('[data-test="root-name-input"]').should('not.exist')
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-description-input"]').find('input').should('have.attr', 'readonly')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')

      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'readonly')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'readonly')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.attr', 'readonly')
      cy.get('[data-test="description-input"]').should('have.length', 3)
      cy.get('[data-test="description-input"]').eq(0).find('input').should('have.attr', 'readonly')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.attr', 'readonly')
      cy.get('[data-test="description-input"]').eq(2).find('input').should('have.attr', 'readonly')
    })

    it('unlocks array of object', () => {
      // Arrange an array of object type
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('be.visible').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Object')
      cy.get('[data-test="add-property-btn"]').should('be.visible').click().click().click()

      // Lock Type and Unlock
      cy.get('[data-test="lock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('be.visible')

      // Verify unlocked
      cy.get('[data-test="add-property-btn"]').should('be.enabled')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.enabled')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.enabled')
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="description-input"]').should('have.length', 3)
      cy.get('[data-test="description-input"]').eq(0).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('not.have.attr', 'readonly')
      cy.get('[data-test="description-input"]').eq(2).find('input').should('not.have.attr', 'readonly')
    })

    it('can show/hide object properties', () => {
      // Arrange an array of object type
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('have.length', 1).click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')

      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'Object')
      cy.get('[data-test="no-properties-message"]').should('be.visible')
      cy.get('[data-test="add-property-btn"]').should('be.enabled').click().click().click()
      cy.get('[data-test="description-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="collapse-toggle-btn"]').should('be.enabled')

      // Click hide-properties button
      cy.get('[data-test="collapse-toggle-btn"]').should('have.length', 1).click()
      cy.get('[data-test="properties-section"]').should('not.exist')
      cy.get('[data-test="property-name-input"]').should('not.exist')
      
      // Click show-properties button
      cy.get('[data-test="collapse-toggle-btn"]').should('have.length', 1).click()
      cy.get('[data-test="description-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="collapse-toggle-btn"]').should('be.enabled')
    })
  })

  describe('Array of Custom Editor', () => {
    it('handles array of custom', () => {
      // Arrange an array of word
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="custom-type-name-word.yaml"]').click()
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'word')

      // Verify items type chip picker with "word" value
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'word')
      
      // Reload and verify persistence
      cy.reload()
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'word')
    })
    
    it('locks array of custom', () => {
      // Arrange an array of word
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="custom-type-name-word.yaml"]').click()
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'word')

      // Verify unlocked
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')

      // Lock Type
      cy.get('[data-test="lock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Verify locked - inputs should be disabled
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-description-input"]').find('input').should('have.attr', 'readonly')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('not.exist')
    })

    it('unlocks array of custom', () => {
      // Arrange an array of word
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="custom-type-name-word.yaml"]').click()
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'word')

      // Lock Type and Unlock
      cy.get('[data-test="lock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      
      // Verify unlocked
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-description-input"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('exist')
      cy.get('[data-test="items-type-picker"]').eq(0).find('[data-test="dropdown-icon"]').should('exist')
    })
  })
})
