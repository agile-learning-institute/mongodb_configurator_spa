describe('Types Page', () => {
  const name = `e2e-test-type-array-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with an array root property
  beforeEach(() => {
    thingsToDelete.push(`/api/types/${fileName}/`)

    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(200) // Increased wait time
    cy.url().should('include', `/types/${name}`)
    
    // Change root type to array
    cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="built-in-type-array"]').click()
    cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
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
    cy.get('[data-test^="file-card-"]').should('have.length', 17) 
    // API reset loads 17 types
  })

  describe('Array Property Editor', () => {
    it('can change root type from void to array', () => {
      // Verify default root array type elements visible 
      cy.get('[data-test="property-drag-handle"]').should('not.exist')
      cy.get('[data-test="root-description-placeholder"]').should('contain', 'Click to add description')
      cy.get('[data-test="type-display-name"]').eq(0).should('contain', 'Array')
      cy.get('[data-test="type-display-name"]').eq(1).should('contain', 'word')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')

      // Verify save changes to values
      cy.get('[data-test="root-description-placeholder"]').click()
      cy.get('[data-test="root-description-input-edit"]').type('Test array property')

      cy.reload()
      cy.wait(200)
      cy.get('[data-test="root-description-text"]').should('contain', 'Test array property')
      
    })

    it.only('displays proper items type picker', () => {
      // Click on items type chip
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      
      // Verify items type picker has Built-in Types section
      cy.get('[data-test="type-picker-dialog"]').should('be.visible')
      cy.get('[data-test="built-in-types-section"]').should('be.visible')
      
      // Verify Built-in types contains only "object", "array" 
      cy.get('[data-test="built-in-types-section"] [data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-types-section"] [data-test="built-in-type-array"]').should('be.visible')
      
      // Verify items type picker has Custom Types section
      cy.get('[data-test="custom-types-section"]').should('be.visible')
      
      // Verify Custom Types has multiple chips (including "word")
      cy.get('[data-test="custom-types-section"] [data-test^="custom-type-"]').should('have.length.greaterThan', 10)
      
      // Verify that "word" is in chips
      cy.get('[data-test="custom-types-section"] [data-test="custom-type-word"]').should('be.visible')
      
      // Close the picker
      cy.get('[data-test="type-picker-dialog"]').click()
    })

    it('handles array of array', () => {     
      // Change the items type to array
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Verify items type chip picker with "array" value
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'array')
      
      // Verify required checkbox is unchecked, check and verify checked
      cy.get('[data-test="required-toggle-btn"]').should('not.have.class', 'v-btn--variant-elevated')
      cy.get('[data-test="required-toggle-btn"]').click()
      cy.get('[data-test="required-toggle-btn"]').should('have.class', 'v-btn--variant-elevated')
      
      // Verify property name and description input are visible and enabled
      cy.get('[data-test="root-name-input"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="root-description-input"]').should('be.visible').and('not.be.disabled')
      
      // Verify body has "items" and items type picker with proper values
      cy.get('[data-test="array-of-array-extension"]').should('be.visible')
      cy.get('[data-test="array-of-array-extension"] [data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'word')
      
      // Select array (so we have array of array of array)
      cy.get('[data-test="array-of-array-extension"] [data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Verify nested content is visible
      cy.get('[data-test="array-of-array-extension"] [data-test="array-of-array-extension"]').should('be.visible')
      cy.get('[data-test="array-of-array-extension"] [data-test="array-of-array-extension"] [data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'word')
      
      // Reload and verify persistence
      cy.reload()
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'array')
      cy.get('[data-test="array-of-array-extension"] [data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'array')
    })

    it('array of array locks', () => {
      // Change the items type to array first
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Verify locked - inputs should be disabled
      cy.get('[data-test="root-name-input"]').should('be.disabled')
      cy.get('[data-test="root-description-input"]').should('be.disabled')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').should('be.disabled')
    })

    it('array of array unlocks', () => {
      // Change the items type to array first
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Click unlock button
      cy.get('[data-test="unlock-type-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirmation-message"]').should('be.visible')
      cy.get('[data-test="unlock-warning-message"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      
      // Verify unlocked - inputs should be enabled
      cy.get('[data-test="root-name-input"]').should('not.be.disabled')
      cy.get('[data-test="root-description-input"]').should('not.be.disabled')
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="items-type-picker"]').should('not.be.disabled')
    })

    it('handles array of object', () => {
      // Change the items type to object
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Verify items type chip picker with "object" value
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'object')
      
      // Verify required checkbox is unchecked, check and verify checked
      cy.get('[data-test="required-toggle-btn"]').should('not.have.class', 'v-btn--variant-elevated')
      cy.get('[data-test="required-toggle-btn"]').click()
      cy.get('[data-test="required-toggle-btn"]').should('have.class', 'v-btn--variant-elevated')
      
      // Verify property name and description input are visible and enabled
      cy.get('[data-test="root-name-input"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="root-description-input"]').should('be.visible').and('not.be.disabled')
      
      // Verify array of object property action icons are visible and enabled
      cy.get('[data-test="array-of-object-extension"]').should('be.visible')
      cy.get('[data-test="add-property-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      
      // Verify properties list has no-properties-message with proper values
      cy.get('[data-test="no-properties-message"]').should('be.visible')
      cy.get('[data-test="no-properties-text"]').should('contain', 'No properties defined')
      cy.get('[data-test="add-property-icon"]').should('be.visible')
      
      // Add three sub-properties to the array of object and set name and description for each
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstProperty')
      cy.get('[data-test="property-description-input"]').eq(0).find('input').type('First property description')
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondProperty')
      cy.get('[data-test="property-description-input"]').eq(1).find('input').type('Second property description')
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdProperty')
      cy.get('[data-test="property-description-input"]').eq(2).find('input').type('Third property description')
      
      // Verify all properties have Name, Description, and type chip picker with "void" value, required checkbox is unchecked
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-description-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdProperty')
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').should('have.length', 3)
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').eq(0).should('contain', 'void')
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').eq(1).should('contain', 'void')
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').eq(2).should('contain', 'void')
      cy.get('[data-test="required-toggle-btn"]').should('have.length', 3)
      cy.get('[data-test="required-toggle-btn"]').eq(0).should('not.have.class', 'v-btn--variant-elevated')
      cy.get('[data-test="required-toggle-btn"]').eq(1).should('not.have.class', 'v-btn--variant-elevated')
      cy.get('[data-test="required-toggle-btn"]').eq(2).should('not.have.class', 'v-btn--variant-elevated')
      
      // Delete the second property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      
      // Verify property list has 2 properties, property 3 is now property 2
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdProperty')
      
      // Reload and verify persistence
      cy.reload()
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'object')
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdProperty')
    })

    it('array of object locks', () => {
      // Change the items type to object first
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Verify locked - inputs should be disabled
      cy.get('[data-test="root-name-input"]').should('be.disabled')
      cy.get('[data-test="root-description-input"]').should('be.disabled')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').should('be.disabled')
      cy.get('[data-test="add-property-btn"]').should('not.exist')
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
    })

    it('array of object unlocks', () => {
      // Change the items type to object first
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Click unlock button
      cy.get('[data-test="unlock-type-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirmation-message"]').should('be.visible')
      cy.get('[data-test="unlock-warning-message"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      
      // Verify unlocked - inputs should be enabled
      cy.get('[data-test="root-name-input"]').should('not.be.disabled')
      cy.get('[data-test="root-description-input"]').should('not.be.disabled')
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="items-type-picker"]').should('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').should('be.visible')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
    })

    it('can show/hide object properties', () => {
      // Change the items type to object
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Add three sub-properties to the array of object and set name and description for each
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstProperty')
      cy.get('[data-test="property-description-input"]').eq(0).find('input').type('First property description')
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondProperty')
      cy.get('[data-test="property-description-input"]').eq(1).find('input').type('Second property description')
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdProperty')
      cy.get('[data-test="property-description-input"]').eq(2).find('input').type('Third property description')
      
      // Verify properties are visible
      cy.get('[data-test="properties-section"]').should('be.visible')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      
      // Click hide-properties button
      cy.get('[data-test="collapse-toggle-btn"]').click()
      
      // Verify property list is not visible
      cy.get('[data-test="properties-section"]').should('not.exist')
      cy.get('[data-test="property-name-input"]').should('not.exist')
      
      // Click show-properties button
      cy.get('[data-test="collapse-toggle-btn"]').click()
      
      // Verify property list is visible
      cy.get('[data-test="properties-section"]').should('be.visible')
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdProperty')
    })

    it('handles array of custom', () => {
      // Change the items type to custom (word)
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="custom-type-word"]').click()
      
      // Verify items type chip picker with "word" value
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'word')
      
      // Verify required checkbox is unchecked, check and verify checked
      cy.get('[data-test="required-toggle-btn"]').should('not.have.class', 'v-btn--variant-elevated')
      cy.get('[data-test="required-toggle-btn"]').click()
      cy.get('[data-test="required-toggle-btn"]').should('have.class', 'v-btn--variant-elevated')
      
      // Verify property name and description input are visible and enabled
      cy.get('[data-test="root-name-input"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="root-description-input"]').should('be.visible').and('not.be.disabled')
      
      // Verify array property extension is visible (no object-specific actions)
      cy.get('[data-test="array-property-extension"]').should('be.visible')
      cy.get('[data-test="add-property-btn"]').should('not.exist')
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="collapse-toggle-btn"]').should('not.exist')
      
      // Reload and verify persistence
      cy.reload()
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').should('contain', 'word')
      cy.get('[data-test="required-toggle-btn"]').should('have.class', 'v-btn--variant-elevated')
    })
    
    it('array of custom locks', () => {
      // Change the items type to custom (word) first
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="custom-type-word"]').click()
      
      // Verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Verify locked - inputs should be disabled
      cy.get('[data-test="root-name-input"]').should('be.disabled')
      cy.get('[data-test="root-description-input"]').should('be.disabled')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="items-type-picker"]').should('be.disabled')
    })

    it('array of custom unlocks', () => {
      // Change the items type to custom (word) first
      cy.get('[data-test="items-type-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="custom-type-word"]').click()
      
      // Verify unlocked
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      
      // Click lock button
      cy.get('[data-test="lock-type-btn"]').click()
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="lock-type-btn"]').should('not.exist')
      cy.get('[data-test="unlock-type-btn"]').should('be.visible')
      
      // Click unlock button
      cy.get('[data-test="unlock-type-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirmation-message"]').should('be.visible')
      cy.get('[data-test="unlock-warning-message"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').click()
      cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
      
      // Verify lock button is replaced with unlock button
      cy.get('[data-test="unlock-type-btn"]').should('not.exist')
      cy.get('[data-test="lock-type-btn"]').should('be.visible')
      
      // Verify unlocked - inputs should be enabled
      cy.get('[data-test="root-name-input"]').should('not.be.disabled')
      cy.get('[data-test="root-description-input"]').should('not.be.disabled')
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="items-type-picker"]').should('not.be.disabled')
    })
  })
})
