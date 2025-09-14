describe('Dictionary Details Page', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary Object with a Object property
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
    cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'One Of')
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

  describe('One Of Root Property Editor', () => {
    it('can persist description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="root-description-placeholder"]').should('be.visible')
      cy.get('[data-test="root-description-display"]').should('be.visible').click()
      cy.get('[data-test="root-description-input-edit"]').type('A Root One Of property')
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="root-description-display"]').should('contain', 'A Root One Of property')

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
      cy.get('[data-test="built-in-type-ref"]').should('not.exist')
      cy.get('[data-test="built-in-type-constant"]').should('not.exist')
      cy.get('[data-test="built-in-type-enum"]').should('not.exist')
      cy.get('[data-test="built-in-type-enum_array"]').should('not.exist')

      // verify type picker does not have Custom Types section
      cy.get('[data-test="custom-types-category"]').should('not.exist')
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

    it('displays one_of action icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify add property button is visible and enabled (second one for the non-root object)
      cy.get('[data-test="add-property-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify these controls do not exist
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
    })

    it('can add/delete properties to one of', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // make sure the property list body exists.
      cy.get('[data-test="property-body"]').eq(0).should('be.visible')

      // add three properties to the object
      cy.get('[data-test="add-property-btn"]').eq(0).click().click().click()
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

      // delete the second property
      cy.get('[data-test="delete-property-btn"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

      // delete the first property
      cy.get('[data-test="delete-property-btn"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'thirdTestProperty')

      // delete the last property
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      cy.get('[data-test="property-name-input"]').should('not.exist')
      cy.get('[data-test="object-property-body"]').should('contain', 'No properties defined')
    })
    
    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="add-property-btn"]').eq(0).should('be.visible').click().click().click()
      cy.get('[data-test="property-name-input"]').eq(0).click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').type('thirdTestProperty')

      cy.get('[data-test="property-name-input"]').should('have.length', 3)
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // Drag the 2nd property to before the 1st property and verify: secondTestProperty, firstTestProperty, thirdTestProperty
      cy.get('[data-test="property-drag-handle"]').eq(1).then(($dragHandle) => {
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
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'secondTestProperty')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')
    })

    it('can show/hide empty properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(0).should('contain', 'No properties defined')

      // Hide Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled').click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-body"]').eq(0).should('be.empty')

      // Show Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-body"]').eq(0).should('contain', 'No properties defined')
    })

    it('can show/hide some properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Create some properties
      cy.get('[data-test="add-property-btn"]').eq(0).should('be.visible').click().click()
      cy.get('[data-test="property-name-input"]').should('have.length', 2)

      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 2)

      // Hide Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled').click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 1)
      cy.get('[data-test="property-body"]').eq(1).should('be.empty')

      // Show Properties
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled').click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="property-name-input"]').should('have.length', 2)
    })
  })

  describe('Lockable One_Of Root Property', () => {
    it('locks', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      // lock the dictionary
      cy.get('[data-test="lock-dictionary-btn"]').should('not.be.disabled').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')

      // Make sure the description is locked
      cy.get('[data-test="root-description-display"]').eq(0).find('input').should('have.attr', 'readonly')

      // verify these controls do not exist
      cy.get('[data-test="add-property-btn"]').should('not.exist')
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
      
      // verify show-hide-properties button is still visible and enabled (collapse should work even when locked)
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'expand_content')

    })

    it('unlocks', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      // lock and unlock the dictionary
      cy.get('[data-test="lock-dictionary-btn"]').should('not.be.disabled').click()
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('exist')
      cy.get('[data-test="unlock-dictionary-btn"]').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()
      cy.get('[data-test="unlock-dictionary-dialog"]').should('not.exist')

      // Make sure the description is unlocked
      cy.get('[data-test="root-description-display"]').eq(0).click()
      cy.get('[data-test="root-description-input-edit"]').eq(0).find('input').should('be.enabled')

      // Make sure add-property button is visible and enabled
      cy.get('[data-test="add-property-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'list_alt_add')
      
      // verify show-hide-properties button is visible and enabled
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).click()
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="collapse-toggle-btn"]').eq(0).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
      
      // verify these controls do not exist
      cy.get('[data-test="additional-props-toggle-btn"]').should('not.exist')
      cy.get('[data-test="required-toggle-btn"]').should('not.exist')
      cy.get('[data-test="delete-property-btn"]').should('not.exist')
    })
  })
})

