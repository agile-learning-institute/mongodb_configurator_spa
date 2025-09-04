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
    cy.url().should('include', '/types')
    cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
  })

  describe('Object Property Editor', () => {
    it('can change root type from void to object', () => {
      // beforeEach sets up the type 
      // verify property type chip picker with "object" value, 
      cy.get('[data-test="type-display-name"]').should('contain', 'Object')
      
      // enter description
      cy.get('[data-test="root-description-placeholder"]').click()
      cy.get('[data-test="root-description-input-edit"]').type('Root object description')
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="root-description-display"]').should('contain', 'Root object description')
      cy.get('[data-test="card-content"]').should('contain', 'No properties defined')
    })

    it('displays root object action icons', () => {
      // verify add property button is visible and enabled
      cy.get('[data-test="add-property-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify allow-additional-properties button is visible and enabled
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')
      cy.get('[data-test="additional-props-toggle-btn"]').click()
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_check')
      
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').click()
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify delete and required buttons do not exist (root properties can't be deleted and required has no effect)
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
    })

    it('displays non-root object action icons', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="type-display-name"]').should('contain', 'void')
      cy.get('[data-test="property-name-input"] input').should('have.value', '')
      cy.get('[data-test="property-name-input"] input').should('have.attr', 'placeholder', 'Name')
      cy.get('[data-test="description-input"] input').should('have.value', '')
      cy.get('[data-test="description-input"] input').should('have.attr', 'placeholder', 'Description')

      cy.get('[data-test="property-name-input"]').click()
      cy.get('[data-test="property-name-input"] input').first().type('testProperty')
      cy.get('[data-test="description-input"]').click()
      cy.get('[data-test="description-input"] input').type('A property for testing object properties')
      
      // change the property to object
      cy.get('[data-test="type-chip-picker"]').should('be.visible').wait(100)
      cy.get('[data-test="type-chip-picker"]').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-display-name"]').should('contain', 'Object')
      
      // verify add property button is visible and enabled
      cy.get('[data-test="add-property-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
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
      cy.get('[data-test="required-toggle-btn"]').should('exist')
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_off')
      cy.get('[data-test="required-toggle-btn"]').click()
      cy.get('[data-test="required-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'toggle_on')

      // verify delete property button works
      cy.get('[data-test="delete-property-btn"]').should('exist').click()
      cy.get('[data-test="no-object-properties-text"]').should('exist')
    })

    it('has the correct non-root type picker', () => {
      // First add a property to the root object
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()
      
      // verify type picker has Built-in Types section
      cy.get('[data-test="built-in-types-category"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"] i').should('have.length', 2)
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      
      // verify type picker has Custom Types section
      cy.get('[data-test="custom-types-category"]').should('be.visible')
      cy.get('[data-test="custom-types-category"] i').should('have.length.greaterThan', 10)
      cy.get(`[data-test="custom-type-name-${fileName}"]`).should('be.visible')
    })

    it('adds and removes properties to root object', () => {
      cy.get('[data-test="add-property-btn"]').click().click().click()

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
    })

    it('adds and removes properties to non-root object', () => {
      // Arrange - create a non-root object property
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="type-display-name"]').should('contain', 'void')
      cy.get('[data-test="type-chip-picker"]').should('be.visible').wait(100)
      cy.get('[data-test="type-chip-picker"]').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-display-name"]').should('contain', 'Object')

      // Add three properties to the object property body
      cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').wait(100)
        .click().click().click()

      // set context to the object property section
      cy.get('[data-test="object-properties-section"]').eq(1).within(() => {

        // Input names and descriptions for the properties
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

        // verify the properties were added
        cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'firstTestProperty')
        cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'secondTestProperty')
        cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.attr', 'value', 'thirdTestProperty')
  
        // delete the second property
        cy.get('[data-test="delete-property-btn"]').eq(1).click()
        cy.get('[data-test="property-name-input"]').should('have.length', 2)
        cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'firstTestProperty')
        cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'thirdTestProperty')
  
        // delete the first property
        cy.get('[data-test="delete-property-btn"]').eq(0).click()
        cy.get('[data-test="property-name-input"]').eq(0).should('have.length', 1)
        cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'thirdTestProperty')
        
        // delete the last property
        cy.get('[data-test="delete-property-btn"]').eq(0).click()
        cy.wait(100)
      })
      
      // Check for "No properties defined" message outside the within block
      cy.get('[data-test="property-body"]').should('contain', 'No properties defined')
    })
    
    it.only('can arrange root object properties', () => {
      // Arrange root object with three properties
      cy.get('[data-test="add-property-btn"]').click().click().click()

      // Set up first property
      cy.get('[data-test="property-name-input"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
      cy.get('[data-test="description-input"]').eq(0).click()
      cy.get('[data-test="description-input"]').eq(0).find('input').type('A property for testing object properties')

      // Set up second property
      cy.get('[data-test="property-name-input"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
      cy.get('[data-test="description-input"]').eq(1).click()
      cy.get('[data-test="description-input"]').eq(1).find('input').type('A property for testing object properties')
      
      // Set up third property
      cy.get('[data-test="property-name-input"]').eq(2).click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')
      cy.get('[data-test="description-input"]').eq(2).click()
      cy.get('[data-test="description-input"]').eq(2).find('input').type('A property for testing object properties')
      
      // Verify initial order: firstTestProperty, secondTestProperty, thirdTestProperty
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
      
      // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="property-drag-handle"]').eq(1).then(($dragHandle) => {
        const dragHandle = $dragHandle[0]
        const dropZone = cy.get('[data-test="drop-zone-0"]')
        
        // Create a proper drag and drop sequence
        const dragStartEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        dragStartEvent.dataTransfer?.setData('text/plain', 'secondTestProperty')
        
        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        dropEvent.dataTransfer?.setData('text/plain', 'secondTestProperty')
        
        // Trigger the events
        dragHandle.dispatchEvent(dragStartEvent)
        cy.get('[data-test="drop-zone-0"]').then(($dropZone) => {
          const dropZoneEl = $dropZone[0]
          dropZoneEl.dispatchEvent(dragOverEvent)
          dropZoneEl.dispatchEvent(dropEvent)
        })
      })
      
      // Wait for the drag operation to complete
      cy.wait(500)
      
      // Verify new order: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
      
      // Drag the 1st property (now at index 1) to after the 3rd property and verify: secondTestProperty, thirdTestProperty, firstTestProperty
      cy.get('[data-test="property-drag-handle"]').eq(1)
        .trigger('mousedown', { which: 1 })
        .trigger('dragstart', { dataTransfer: new DataTransfer() })
      cy.get('[data-test="drop-zone-3"]')
        .trigger('dragover', { dataTransfer: new DataTransfer() })
        .trigger('drop', { dataTransfer: new DataTransfer() })
      cy.get('[data-test="property-drag-handle"]').eq(1).trigger('dragend')
      
      // Wait for the drag operation to complete
      cy.wait(200)
      
      // Verify new order: secondTestProperty, thirdTestProperty, firstTestProperty
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'firstTestProperty')
      
      // Drag the 3rd property (now at index 2) to before the 1st property and verify: firstTestProperty, secondTestProperty, thirdTestProperty
      cy.get('[data-test="property-drag-handle"]').eq(2)
        .trigger('mousedown', { which: 1 })
        .trigger('dragstart', { dataTransfer: new DataTransfer() })
      cy.get('[data-test="drop-zone-0"]')
        .trigger('dragover', { dataTransfer: new DataTransfer() })
        .trigger('drop', { dataTransfer: new DataTransfer() })
      cy.get('[data-test="property-drag-handle"]').eq(2).trigger('dragend')
      
      // Wait for the drag operation to complete
      cy.wait(200)
      
      // Verify final order: firstTestProperty, secondTestProperty, thirdTestProperty
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
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
