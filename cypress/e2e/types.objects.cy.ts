describe('Types Object page flow', () => {
  const name = `e2e-test-type-object-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with an object root property
  beforeEach(() => {
    thingsToDelete.push(`/api/types/${fileName}/`)

    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/types/${name}`)
    cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    cy.get('[data-test="built-in-type-object"]').click()
  })

  // Clean up any documents created during tests
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
    cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
  })

  describe('Object Property Editor', () => {
    it('can change root type from void to object', () => {
      // beforeEach sets up the type 
      // verify property type chip picker with "object" value, 
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('contain', 'object')
      
      // enter description
      cy.get('[data-test="root-description-placeholder"]').click()
      cy.get('[data-test="root-description-input"]').type('Root object description')
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="root-description-display"]').should('contain', 'Root object description')
      
      // verify required checkbox is unchecked, check and verify checked
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').click()
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_on')
            
      // verify No properties defined message is visible
      cy.get('[data-test="card-content"]').should('contain', 'No properties defined')
    })

    it('displays root object action icons', () => {
      // verify allow-additional-properties button is visible and enabled
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')
      
      // verify show-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'expand_content')
      
      // verify hide-properties button does not exist (should show expand_content initially)
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify delete-property button does not exist (root properties can't be deleted)
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
    })

    it('displays non-root object action icons', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('testProperty')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      // change the property to object
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // verify add-property button is visible and enabled
      cy.get('[data-test="add-property-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify allow-additional-properties button is visible and enabled
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')
      
      // verify show-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'expand_content')
      
      // verify hide-properties button does not exist (should show expand_content initially)
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify delete-property button is visible and enabled (non-root properties can be deleted)
      cy.get('[data-test="delete-property-btn"]').should('be.visible').and('not.be.disabled')
    })

    it('has the correct non-root type picker', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('testProperty')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      // click on the first property type chip 
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()
      
      // verify type picker has Built-in Types section
      cy.get('[data-test="built-in-types-section"]').should('be.visible')
      
      // verify Built-in types contains only "object", "array" 
      cy.get('[data-test^="built-in-type-"]').should('have.length', 2)
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      
      // verify type picker has Custom Types section
      cy.get('[data-test="custom-types-section"]').should('be.visible')
      
      // verify Custom Types more than 10 chips
      cy.get('[data-test^="custom-type-"]').should('have.length.greaterThan', 10)
      
      // verify that {name} is in chips
      cy.get(`[data-test="custom-type-${name}"]`).should('be.visible')
    })

    it('adds properties to non-root object', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('testProperty')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      // change the property to object
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // verify property type chip picker with "object" value, 
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().should('contain', 'object')
      
      // verify required checkbox is unchecked, check and verify checked
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').click()
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_on')
      
      // verify property name and description input are visible and enabled
      cy.get('[data-test="property-name-input"]').first().should('be.visible').and('not.be.disabled')
      cy.get('[data-test="description-input"]').first().should('be.visible').and('not.be.disabled')
      
      // verify object property action icons are visible and enabled
      cy.get('[data-test="add-property-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      
      // add three sub-properties to the object and set name and description for each
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).type('subProp1')
      cy.get('[data-test="property-name-input"]').eq(1).blur()
      cy.get('[data-test="description-input"]').eq(1).type('Sub property 1')
      cy.get('[data-test="description-input"]').eq(1).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).type('subProp2')
      cy.get('[data-test="property-name-input"]').eq(2).blur()
      cy.get('[data-test="description-input"]').eq(2).type('Sub property 2')
      cy.get('[data-test="description-input"]').eq(2).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(3).type('subProp3')
      cy.get('[data-test="property-name-input"]').eq(3).blur()
      cy.get('[data-test="description-input"]').eq(3).type('Sub property 3')
      cy.get('[data-test="description-input"]').eq(3).blur()
      
      // verify all properties have Name, Description, and type chip picker with "void" value, required checkbox is unchecked
      cy.get('[data-test="property-name-input"]').should('have.length', 4) // root + 3 sub properties
      cy.get('[data-test="description-input"]').should('have.length', 4)
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').should('have.length', 4)
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').each(($chip) => {
        cy.wrap($chip).should('contain', 'void')
      })
      cy.get('[data-test="required-toggle-btn"]').each(($toggle) => {
        cy.wrap($toggle).find('.material-symbols-outlined').should('contain', 'toggle_off')
      })
      
      // delete the second property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      
      // verify property list has 3 properties (root + 2 remaining sub properties)
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(1).should('have.value', 'subProp2') // subProp2 is now second
      cy.get('[data-test="property-name-input"]').eq(2).should('have.value', 'subProp3') // subProp3 is now third
    })
    
    it('can arrange properties', () => {
      // First add three properties to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('prop1')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).type('prop2')
      cy.get('[data-test="property-name-input"]').eq(1).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).type('prop3')
      cy.get('[data-test="property-name-input"]').eq(2).blur()
      
      // Verify initial order: prop1, prop2, prop3
      cy.get('[data-test="property-name-input"]').eq(0).should('have.value', 'prop1')
      cy.get('[data-test="property-name-input"]').eq(1).should('have.value', 'prop2')
      cy.get('[data-test="property-name-input"]').eq(2).should('have.value', 'prop3')
      
      // drag the 2nd to before 1 and verify 2,1,3
      cy.get('[data-test="property-drag-handle"]').eq(1).trigger('dragstart')
      cy.get('[data-test="drop-zone-0"]').trigger('dragover').trigger('drop')
      cy.get('[data-test="property-name-input"]').eq(0).should('have.value', 'prop2')
      cy.get('[data-test="property-name-input"]').eq(1).should('have.value', 'prop1')
      cy.get('[data-test="property-name-input"]').eq(2).should('have.value', 'prop3')
      
      // drag the 1st property to after spot 3 and verify 1,3,2
      cy.get('[data-test="property-drag-handle"]').eq(0).trigger('dragstart')
      cy.get('[data-test="drop-zone-3"]').trigger('dragover').trigger('drop')
      cy.get('[data-test="property-name-input"]').eq(0).should('have.value', 'prop1')
      cy.get('[data-test="property-name-input"]').eq(1).should('have.value', 'prop3')
      cy.get('[data-test="property-name-input"]').eq(2).should('have.value', 'prop2')
      
      // drag the 3rd property to before spot 1 and verify 2,1,3
      cy.get('[data-test="property-drag-handle"]').eq(2).trigger('dragstart')
      cy.get('[data-test="drop-zone-0"]').trigger('dragover').trigger('drop')
      cy.get('[data-test="property-name-input"]').eq(0).should('have.value', 'prop2')
      cy.get('[data-test="property-name-input"]').eq(1).should('have.value', 'prop1')
      cy.get('[data-test="property-name-input"]').eq(2).should('have.value', 'prop3')
    })

    it('can show/hide properties', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('testProperty')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      // click root hide-properties button
      cy.get('[data-test="collapse-toggle-btn"]').click()
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'collapse_content')
      
      // verify root property list is not visible
      cy.get('[data-test="property-name-input"]').should('not.be.visible')
      
      // click root show-properties button
      cy.get('[data-test="collapse-toggle-btn"]').click()
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'expand_content')
      
      // verify root property list is visible
      cy.get('[data-test="property-name-input"]').should('be.visible')

      // change the property to object
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // add three sub-properties to the object and set name and description for each
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).type('subProp1')
      cy.get('[data-test="property-name-input"]').eq(1).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).type('subProp2')
      cy.get('[data-test="property-name-input"]').eq(2).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(3).type('subProp3')
      cy.get('[data-test="property-name-input"]').eq(3).blur()
      
      // verify list is visible
      cy.get('[data-test="property-name-input"]').should('have.length', 4)
      
      // click hide properties on the object property
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).click() // Second collapse button (for the object property)
      cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
      
      // verify sub-properties list is not visible
      cy.get('[data-test="property-name-input"]').should('have.length', 1) // Only root property visible
    })

    it('can delete properties', () => {
      // First add three properties to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('prop1')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).type('prop2')
      cy.get('[data-test="property-name-input"]').eq(1).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).type('prop3')
      cy.get('[data-test="property-name-input"]').eq(2).blur()
      
      // verify we have 3 properties
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).should('have.value', 'prop1')
      cy.get('[data-test="property-name-input"]').eq(1).should('have.value', 'prop2')
      cy.get('[data-test="property-name-input"]').eq(2).should('have.value', 'prop3')
      
      // delete the first property
      cy.get('[data-test="delete-property-btn"]').first().click()
      
      // verify property list has property 2 is now property 1, property 3 is now property 2
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(0).should('have.value', 'prop2') // prop2 is now first
      cy.get('[data-test="property-name-input"]').eq(1).should('have.value', 'prop3') // prop3 is now second
    })

    it('locks', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('testProperty')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      // change the property to object
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // add three sub-properties to the object and set name and description for each
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).type('subProp1')
      cy.get('[data-test="property-name-input"]').eq(1).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).type('subProp2')
      cy.get('[data-test="property-name-input"]').eq(2).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(3).type('subProp3')
      cy.get('[data-test="property-name-input"]').eq(3).blur()

      // verify unlocked
      cy.get('[data-test="root-description-placeholder"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"]').should('be.visible')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible')
      
      // click lock button
      cy.get('[data-test="lock-btn"]').click()
      cy.get('[data-test="lock-confirmation-dialog"]').should('be.visible')
      cy.get('[data-test="lock-confirm-btn"]').click()
      
      // verify root property description and type chip picker are disabled
      cy.get('[data-test="root-description-placeholder"]').should('not.exist')
      cy.get('[data-test="root-type-chip-picker"]').should('not.exist')
      
      // verify object action icons do not exist
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="collapse-toggle-btn"]').should('not.exist')
      
      // verify property list is visible with 3 properties
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      
      // verify that property list name, description, and type chip picker are disabled
      cy.get('[data-test="property-name-input"]').each(($input) => {
        cy.wrap($input).should('have.attr', 'readonly')
      })
      cy.get('[data-test="description-input"]').each(($input) => {
        cy.wrap($input).should('have.attr', 'readonly')
      })
      cy.get('[data-test="type-chip-picker"]').should('not.exist')
      
      // verify that property list required checkbox and delete do not exist
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      
      // verify that property list object property action icons do not exist
      cy.get('[data-test="add-property-btn"]').should('not.exist')
    })

    it('unlocks', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').first().type('testProperty')
      cy.get('[data-test="property-name-input"]').first().blur()
      
      // change the property to object
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // add three sub-properties to the object and set name and description for each
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(1).type('subProp1')
      cy.get('[data-test="property-name-input"]').eq(1).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(2).type('subProp2')
      cy.get('[data-test="property-name-input"]').eq(2).blur()
      
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="property-name-input"]').eq(3).type('subProp3')
      cy.get('[data-test="property-name-input"]').eq(3).blur()

      // verify unlocked
      cy.get('[data-test="root-description-placeholder"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"]').should('be.visible')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible')
      
      // click lock button
      cy.get('[data-test="lock-btn"]').click()
      cy.get('[data-test="lock-confirmation-dialog"]').should('be.visible')
      cy.get('[data-test="lock-confirm-btn"]').click()
      
      // verify locked
      cy.get('[data-test="root-description-placeholder"]').should('not.exist')
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="collapse-toggle-btn"]').should('not.exist')
      
      // click unlock button
      cy.get('[data-test="unlock-btn"]').click()
      cy.get('[data-test="unlock-confirmation-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').click()
      
      // verify root property description and type chip picker are enabled
      cy.get('[data-test="root-description-placeholder"]').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"]').should('be.visible')
      
      // verify object action icons are enabled
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible')
      
      // verify property list is visible with 3 properties
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      
      // verify that property list name, description, and type chip picker are enabled
      cy.get('[data-test="property-name-input"]').each(($input) => {
        cy.wrap($input).should('not.have.attr', 'readonly')
      })
      cy.get('[data-test="description-input"]').each(($input) => {
        cy.wrap($input).should('not.have.attr', 'readonly')
      })
      cy.get('[data-test="type-chip-picker"]').should('be.visible')
      
      // verify that property list required checkbox and delete are enabled
      cy.get('[data-test="required-toggle-btn"]').should('be.visible')
      cy.get('[data-test="delete-property-btn"]').should('be.visible')
      
      // verify that property list object property action icons are enabled
      cy.get('[data-test="add-property-btn"]').should('be.visible')
    })
  })
})
