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
    describe('Root Object Property Editor', () => {
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

      it('persists root object additional properties', () => {
        // verify allow-additional-properties button is visible and enabled
        cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
        cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')
        cy.get('[data-test="additional-props-toggle-btn"]').click()
        cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
        cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_check')
        cy.reload()
        cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
        cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_check')
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

      it('can arrange root object properties', () => {
        // Arrange root object with three properties
        cy.get('[data-test="add-property-btn"]').click().click().click()
        cy.get('[data-test="property-name-input"]').eq(0).click()
        cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
        cy.get('[data-test="property-name-input"]').eq(1).click()
        cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
        cy.get('[data-test="property-name-input"]').eq(2).click()
        cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')
        cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
        cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
        cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
        
        // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
        cy.get('[data-test="property-drag-handle"]').eq(1).then(($dragHandle) => {
          const dragHandle = $dragHandle[0]
          
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
          
          const dragEndEvent = new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer()
          })
          
          // Trigger the events
          dragHandle.dispatchEvent(dragStartEvent)
          cy.get('[data-test="drop-zone-0"]').then(($dropZone) => {
            const dropZoneEl = $dropZone[0]
            dropZoneEl.dispatchEvent(dragOverEvent)
            dropZoneEl.dispatchEvent(dropEvent)
            dropZoneEl.dispatchEvent(dragEndEvent)
          })
        })
        
        // Wait for the drag operation to complete
        cy.wait(1000)
        
        // Verify new order: secondTestProperty, firstTestProperty, thirdTestProperty
        cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
        cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
        cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
      })

      it('can show/hide root object properties', () => {
        // Arrange root object with three properties
        cy.get('[data-test="add-property-btn"]').click().click().click()
        cy.get('[data-test="property-name-input"]').eq(0).click()
        cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
        cy.get('[data-test="property-name-input"]').eq(1).click()
        cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
        cy.get('[data-test="property-name-input"]').eq(2).click()
        cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')
        cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
        cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
        cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
       
        // click root hide-properties button
        cy.get('[data-test="collapse-toggle-btn"]').click()
        cy.get('[data-test="object-property-body"]').should('not.exist')
        
        // click root show-properties button
        cy.get('[data-test="collapse-toggle-btn"]').click()
        cy.get('[data-test="object-property-body"]').should('be.visible')
      })
  
    })

    describe('Non-Root Object Property Editor', () => {
      it('displays non-root object action icons', () => {
      // Arrange - create a non-root object property
      cy.get('[data-test="add-property-btn"]').click()
      cy.get('[data-test="type-display-name"]').should('contain', 'void')
      cy.get('[data-test="type-chip-picker"]').should('be.visible').wait(100)
      cy.get('[data-test="type-chip-picker"]').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-display-name"]').should('contain', 'Object')

      // Wait for the object property to be fully rendered
      cy.wait(200)

      // The action icons are in the ObjectPropertyExtension, not within the properties section
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

      it('persists non-root object additional properties', () => {
        // Arrange - create a non-root object property
        cy.get('[data-test="add-property-btn"]').click()
        cy.get('[data-test="type-display-name"]').should('contain', 'void')
        cy.get('[data-test="type-chip-picker"]').should('be.visible').wait(100)
        cy.get('[data-test="type-chip-picker"]').click()
        cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
        cy.get('[data-test="type-display-name"]').should('contain', 'Object')
  
        // verify allow-additional-properties button is visible and enabled
        cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
        cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt')
        cy.get('[data-test="additional-props-toggle-btn"]').eq(1).click()
        cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
        cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_check')
        cy.reload()
        cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
        cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_check')
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
    
      it('can arrange non-root object properties', () => {
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

          // Set properties
          cy.get('[data-test="property-name-input"]').eq(0).click()
          cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
          cy.get('[data-test="property-name-input"]').eq(1).click()
          cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
          cy.get('[data-test="property-name-input"]').eq(2).click()
          cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')
          
          // Verify initial order: firstTestProperty, secondTestProperty, thirdTestProperty
          cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
          cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
          cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
          
          // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
          cy.get('[data-test="property-drag-handle"]').eq(1).then(($dragHandle) => {
            const dragHandle = $dragHandle[0]
            
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
            
            const dragEndEvent = new DragEvent('dragend', {
              bubbles: true,
              cancelable: true,
              dataTransfer: new DataTransfer()
            })
            
            // Trigger the events
            dragHandle.dispatchEvent(dragStartEvent)
            cy.get('[data-test="drop-zone-0"]').then(($dropZone) => {
              const dropZoneEl = $dropZone[0]
              dropZoneEl.dispatchEvent(dragOverEvent)
              dropZoneEl.dispatchEvent(dropEvent)
              dropZoneEl.dispatchEvent(dragEndEvent)
            })
          })
        
          // Wait for the drag operation to complete
          cy.wait(1000)
          
          // Verify new order: secondTestProperty, firstTestProperty, thirdTestProperty
          cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
          cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
          cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
        })
      })

      it('can show/hide non-root object properties', () => {
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
          cy.get('[data-test="property-name-input"]').eq(0).click()
          cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
          cy.get('[data-test="property-name-input"]').eq(1).click()
          cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
          cy.get('[data-test="property-name-input"]').eq(2).click()
          cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')
          cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
          cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
          cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
        
        })
        // click root hide-properties button
        cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
        cy.get('[data-test="object-property-body"]').eq(1).should('not.exist')
        
        // click root show-properties button
        cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
        cy.get('[data-test="object-property-body"]').eq(1).should('be.visible')
      })
    
      it('can persist non-root name/description edits', () => {
        cy.visit(`/types/${fileName}`)
        cy.get('[data-test="add-property-btn"]').should('be.visible').click().click()

        cy.get('[data-test="property-name-input"]').eq(0).click()
        cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
        cy.wait(200)
        cy.reload()
        cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')

        cy.get('[data-test="description-input"]').eq(0).click()
        cy.get('[data-test="description-input"]').eq(0).find('input').type('One property for testing object properties')
        cy.wait(200)
        cy.reload()
        cy.get('[data-test="description-input"]').eq(0).find('input').should('have.value', 'One property for testing object properties')

        cy.get('[data-test="property-name-input"]').eq(1).click()
        cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
        cy.wait(200)
        cy.reload()
        cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')

        cy.get('[data-test="description-input"]').eq(1).click()
        cy.get('[data-test="description-input"]').eq(1).find('input').type('Two property for testing object properties')
        cy.wait(200)
        cy.reload()
        cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'Two property for testing object properties')
      })

    })

    describe('Object Property Locking', () => {
      it('locks', () => {
        // Arrange - create a non-root object property
        cy.get('[data-test="add-property-btn"]').click()
        cy.get('[data-test="type-display-name"]').should('contain', 'void')
        cy.get('[data-test="type-chip-picker"]').should('be.visible').wait(100)
        cy.get('[data-test="type-chip-picker"]').click()
        cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
        cy.get('[data-test="type-display-name"]').should('contain', 'Object')

        // Lock
        cy.wait(200)
        cy.get('[data-test="lock-type-btn"]').should('not.be.disabled').click()
        cy.get('[data-test="lock-type-btn"]').should('not.exist')
        cy.get('[data-test="unlock-type-btn"]').should('exist')

        // Make sure the action icons do not exist
        cy.get('[data-test="add-property-btn"]').should('not.exist')
        cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
        cy.get('[data-test="required-toggle-btn"]').should('not.exist')
        cy.get('[data-test="delete-property-btn"]').should('not.exist')
        
        // verify show-hide-properties button is still visible and enabled (collapse should work even when locked)
        cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      })

      it('unlocks', () => {
        // Arrange - create a non-root object property
        cy.get('[data-test="add-property-btn"]').click()
        cy.get('[data-test="type-display-name"]').should('contain', 'void')
        cy.get('[data-test="type-chip-picker"]').should('be.visible').wait(100)
        cy.get('[data-test="type-chip-picker"]').click()
        cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
        cy.get('[data-test="type-display-name"]').should('contain', 'Object')

        // Lock
        cy.wait(200)
        cy.get('[data-test="lock-type-btn"]').should('not.be.disabled').click()
        cy.get('[data-test="lock-type-btn"]').should('not.exist')
        cy.get('[data-test="unlock-type-btn"]').should('exist')

        // Un-Lock
        cy.wait(200)
        cy.get('[data-test="unlock-type-btn"]').should('not.be.disabled').click()
        cy.get('[data-test="unlock-type-dialog"]').should('be.visible')
        cy.get('[data-test="unlock-confirmation-message"]').should('be.visible')
        cy.get('[data-test="unlock-warning-message"]').should('be.visible')
        cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
        cy.get('[data-test="unlock-confirm-btn"]').should('be.visible')
        cy.get('[data-test="unlock-confirm-btn"]').click()
        cy.get('[data-test="unlock-type-dialog"]').should('not.exist')
        cy.get('[data-test="unlock-type-btn"]').should('not.exist')

        // Make sure the action icons do exist
        cy.get('[data-test="add-property-btn"]').should('have.length', 2)
        cy.get('[data-test="additional-props-toggle-btn"]').should('have.length', 2)
        cy.get('[data-test="required-toggle-btn"]').should('have.length', 1)
        cy.get('[data-test="delete-property-btn"]').should('have.length', 1)
        
        // verify show-hide-properties button is still visible and enabled (collapse should work even when locked)
        cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      })
    })
  })
})
