describe('Dictionary Object Editor', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary to test with
  beforeEach(() => {
    dictionaryName = `TestDictionary-object-${Date.now()}`
    dictionaryFileName = `${dictionaryName}.yaml`

    cy.visit('/dictionaries')
    cy.get('h3').should('contain', 'Dictionaries')
    cy.get('[data-test^="file-card-"]').should('exist')
    cy.contains('button', 'New').should('be.visible').click()
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Create New Dictionary')
    cy.get('.v-dialog input').type(dictionaryName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    cy.get('.v-dialog').should('not.exist')
    cy.wait(200)
    cy.url().should('include', `/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'Object')
    cy.visit('/dictionaries')
    cy.get(`[data-test="file-card-${dictionaryName}.yaml"]`).should('be.visible')
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // Unlock the dictionary
    cy.request({
      method: 'PUT',    
      url: `/api/dictionaries/${dictionaryFileName}/`,
      headers: {"Content-Type": "application/json"},
      body: {"_locked": false, "root":{"name":""}},
      failOnStatusCode: false
    })
    
    // Delete the dictionary
    cy.request({
      method: 'DELETE',
      url: `/api/dictionaries/${dictionaryFileName}/`,
      failOnStatusCode: false
    })

    // Verify the dictionary is deleted
    cy.visit('/dictionaries')
    cy.url().should('include', '/dictionaries')
    cy.get('[data-test^="file-card-"]').should('not.contain', dictionaryFileName)
  })

  describe('Root Object Property Editor', () => {
    it('can persist description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-display-name"]').should('contain', 'Object')
      
      // enter description
      cy.get('[data-test="root-description-placeholder"]').click()
      cy.get('[data-test="root-description-input-edit"]').type('Root object description')
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="root-description-display"]').should('contain', 'Root object description')
      cy.get('[data-test="card-content"]').should('contain', 'No properties defined')
    })

    it('has the correct type picker', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-chip"]').eq(0).should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"] i').should('have.length', 3)
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible')
    })

    it('can change type to array', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-display-name"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'Array')

      cy.reload()
      cy.wait(100)
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'Array')
    })

    it('can change type to one_of', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-display-name"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'One Of')

      cy.reload()
      cy.wait(100)
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'One Of')
    })

    it('displays object action icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="add-property-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_add')
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'expand_content')
      
      // verify delete and required buttons do not exist (root properties can't be deleted and required has no effect)
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
    })

    it('persists object additional properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')

      cy.get('[data-test="additional-props-toggle-btn"]').click()
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_check')

      cy.get('[data-test="additional-props-toggle-btn"]').click()
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')
    })

    it('can add/delete properties to object', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // add three properties to the object
      cy.get('[data-test="add-property-btn"]').should('be.visible').click().click().click()
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

      // delete the second property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.attr', 'value', 'thirdTestProperty')

      // delete the first property
      cy.get('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.attr', 'value', 'thirdTestProperty')

      // delete the last property
      cy.get('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 0)
      cy.get('[data-test="card-content"]').should('contain', 'No properties defined')
    })
    
    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      // Arrange root object with three properties
      cy.get('[data-test="add-property-btn"]').click().click().click()
      cy.get('[data-test="property-name-input"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')

      // verify the properties were added
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

    it('can show/hide empty properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="card-content"]').should('contain', 'No properties defined')

      cy.get('[data-test="collapse-toggle-btn"]').click()
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-body"]').should('be.empty')

      cy.get('[data-test="collapse-toggle-btn"]').click()
      cy.get('[data-test="collapse-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="card-content"]').should('contain', 'No properties defined')      
    })

    it('can show/hide some properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      // Arrange root object with three properties
      cy.get('[data-test="add-property-btn"]').click().click().click()
      cy.get('[data-test="property-name-input"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')

      // verify the properties were added
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
})
