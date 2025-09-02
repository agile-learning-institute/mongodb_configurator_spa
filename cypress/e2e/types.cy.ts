describe('Types page flow', () => {
  let createdTypeName: string

  // Clean up any types created during tests
  afterEach(() => {
    if (createdTypeName) {
      cy.log(`Cleaning up created type: ${createdTypeName}`)
      
      // Delete via API
      cy.request({
        method: 'DELETE',
        url: `/api/types/${createdTypeName}.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted ${createdTypeName}`)
        } else {
          cy.log(`Failed to delete ${createdTypeName}: ${response.status}`)
        }
      })
      
      createdTypeName = ''
    }
  })

  it('loads types page and shows basic elements', () => {
    // List page
    cy.visit('/types')
    
    // Verify starting state
    cy.get('h3').should('contain', 'Types')
    cy.contains('button', 'New').should('be.visible')
  })

  it('can create a new type via dialog', () => {
    // Visit types page
    cy.visit('/types')
    
    // Wait for existing types to load
    cy.get('[data-test^="file-card-"]').should('exist')
    
    // Click New button to open dialog
    cy.contains('button', 'New').click()
    
    // Verify dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Create New Type')
    
    // Type a name
    const typeName = `TestType-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    
    // Click Create button - use text content instead of color class
    cy.get('.v-dialog').contains('button', 'Create').click()
    
    // Verify dialog is closed
    cy.get('.v-dialog').should('not.exist')
    
    // Store the type name for cleanup
    createdTypeName = typeName
    
    // Wait a moment for the API call to complete
    cy.wait(1000)
    
    // After creation, we should be redirected to the detail page
    cy.url().should('include', `/types/${typeName}.yaml`)
    
    // Navigate back to the types list to verify the type was created
    cy.visit('/types')
    
    // Wait for the type to appear in the list using the correct selector
    cy.get(`[data-test="file-card-${typeName}.yaml"]`).should('be.visible')
  })

  it('can navigate to newly created type detail page and verify elements', () => {
    // First create a type
    cy.visit('/types')
    cy.contains('button', 'New').click()
    
    const typeName = `TestType-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    
    // After creation, we should be on the detail page
    cy.url().should('include', `/types/${typeName}.yaml`)
    
    // Store the type name for cleanup
    createdTypeName = typeName
    
    // Verify basic page elements exist
    cy.get('h2.text-h3').should('be.visible')
    
    // Check for the specific elements that should be visible on a newly created type
    cy.get('[data-test="description-placeholder"]').should('contain', 'Click to add description')
    cy.get('[data-test="type-chip"]').should('be.visible')
    cy.get('[data-test="type-display-name"]').should('contain', 'void')
  })

  it('can lock and unlock a newly created type', () => {
    // First create a type
    cy.visit('/types')
    cy.contains('button', 'New').click()
    
    const typeName = `TestType-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    
    // After creation, we should be on the detail page
    cy.url().should('include', `/types/${typeName}.yaml`)
    
    // Store the type name for cleanup
    createdTypeName = typeName
    
    // Newly created types should be unlocked by default, so we should see Lock button
    cy.contains('button', 'Lock').should('be.visible')
    
    // Lock the type
    cy.contains('button', 'Lock').click()
    
    // Verify it's now locked (Lock button should be replaced with Unlock)
    cy.contains('button', 'Unlock').should('be.visible')
    cy.contains('button', 'Lock').should('not.exist')
    
    // Unlock the type - this opens a confirmation dialog
    cy.contains('button', 'Unlock').click()
    
    // Verify unlock confirmation dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Final Confirmation')
    
    // Type UNLOCK to confirm
    cy.get('.v-dialog input').type('UNLOCK')
    
    // Click Unlock button in dialog
    cy.get('.v-dialog').contains('button', 'Unlock').click()
    
    // Verify it's now unlocked (Unlock button should be replaced with Lock)
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Unlock').should('not.exist')
  })

  it('can delete a type with confirmation', () => {
    // First create a type to ensure we have one to delete
    cy.visit('/types')
    cy.contains('button', 'New').click()
    const typeName = `TypeToDelete-${Date.now()}`
    cy.get('.v-dialog input').type(typeName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    cy.url().should('include', `/types/${typeName}.yaml`)
    createdTypeName = typeName // Ensure this is set for cleanup
    
    // Check if the type is locked - if so, we need to unlock it first to delete
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Unlock")').length > 0) {
        // Type is locked, unlock it first - this opens a confirmation dialog
        cy.contains('button', 'Unlock').click()
        
        // Verify unlock confirmation dialog is open
        cy.get('.v-dialog').should('be.visible')
        cy.get('.v-dialog .v-card-title').should('contain', 'Final Confirmation')
        
        // Type UNLOCK to confirm
        cy.get('.v-dialog input').type('UNLOCK')
        
        // Click Unlock button in dialog
        cy.get('.v-dialog').contains('button', 'Unlock').click()
        
        cy.wait(1000) // Wait for unlock to complete
      }
      
      // Now click Delete button
      cy.contains('button', 'Delete').click()
      
      // Verify delete confirmation dialog is open
      cy.get('.v-dialog').should('be.visible')
      cy.get('.v-dialog .v-card-title').should('contain', 'Final Confirmation')
      
      // Type DELETE to confirm
      cy.get('.v-dialog input').type('DELETE')
      
      // Click Delete button in dialog
      cy.get('.v-dialog').contains('button', 'Delete').click()
      
      // Verify dialog is closed and we're redirected to types list
      cy.get('.v-dialog').should('not.exist')
      cy.url().should('match', /\/types\/?$/)
    })
  })

  describe('Types Detail Page - Root Property Editor', () => {
    beforeEach(() => {
      // Create a type for testing
      cy.visit('/types')
      cy.contains('button', 'New').click()
      
      const typeName = `TestType-${Date.now()}`
      cy.get('.v-dialog input').type(typeName)
      cy.get('.v-dialog').contains('button', 'Create').click()
      cy.url().should('include', `/types/${typeName}.yaml`)
      
      createdTypeName = typeName
    })

    it('shows page title with "Type:" prefix', () => {
      // Verify the page title includes "Type:" before the filename
      cy.get('h2.text-h3').should('contain', 'Type:')
      cy.get('h2.text-h3').should('contain', createdTypeName)
    })

    it('shows root property editor with card layout', () => {
      // Verify the root property card is visible
      cy.get('[data-test="root-property-card"]').should('be.visible')
      
      // Verify the card title contains description and type picker
      cy.get('[data-test="root-property-card"] [data-test="root-description-display"]').should('be.visible')
      cy.get('[data-test="root-property-card"] [data-test="root-type-chip-picker"]').should('be.visible')
    })

    it('can change root property type to Simple and verify controls', () => {
      // Click on the type chip in the card title to open the type picker
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      
      // Select Simple type
      cy.get('[data-test="built-in-type-simple"]').click()
      
      // Verify the type has changed
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Simple')
      
      // Verify the schema configuration section is visible
      cy.get('[data-test="simple-property-body"]').should('be.visible')
      cy.get('[data-test="schema-configuration-title"]').should('contain', 'Schema Configuration')
      cy.get('[data-test="simple-property-schema-input"]').should('be.visible')
      
      // Enter a schema value
      cy.get('[data-test="simple-property-schema-input"]').clear().type('{"type": "string", "minLength": 1}')
      
      // Reload the page to verify persistence
      cy.reload()
      
      // Verify the type and schema are preserved
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Simple')
      cy.get('[data-test="simple-property-schema-input"]').should('have.value', '{"type": "string", "minLength": 1}')
    })

    it('can change root property type to Complex and verify controls', () => {
      // Click on the type chip in the card title to open the type picker
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      
      // Select Complex type
      cy.get('[data-test="built-in-type-complex"]').click()
      
      // Verify the type has changed
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Complex')
      
      // Verify the type configuration section is visible
      cy.get('[data-test="complex-property-body"]').should('be.visible')
      cy.get('[data-test="type-configuration-title"]').should('contain', 'Type Configuration')
      cy.get('[data-test="complex-property-json-input"]').should('be.visible')
      cy.get('[data-test="complex-property-bson-input"]').should('be.visible')
      
      // Enter JSON and BSON type values
      cy.get('[data-test="complex-property-json-input"]').clear().type('{"type": "object", "properties": {}}')
      cy.get('[data-test="complex-property-bson-input"]').clear().type('{"bsonType": "object", "properties": {}}')
      
      // Reload the page to verify persistence
      cy.reload()
      
      // Verify the type and values are preserved
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Complex')
      cy.get('[data-test="complex-property-json-input"]').should('have.value', '{"type": "object", "properties": {}}')
      cy.get('[data-test="complex-property-bson-input"]').should('have.value', '{"bsonType": "object", "properties": {}}')
    })

    it('can change root property type to Object and verify controls', () => {
      // Click on the type chip in the card title to open the type picker
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      
      // Select Object type
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Verify the type has changed
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Object')
      
      // Verify the object property editor is visible
      cy.get('[data-test="object-property-extension"]').should('be.visible')
      cy.get('[data-test="object-property-body"]').should('be.visible')
      
      // Verify the "no properties" message is shown initially
      cy.get('[data-test="no-object-properties-message"]').should('be.visible')
      cy.get('[data-test="no-object-properties-text"]').should('contain', 'No properties defined')
      
      // Add a property
      cy.get('[data-test="object-property-extension"]').within(() => {
        cy.get('[data-test="add-property-btn"]').click()
      })
      
      // Verify a new property was added
      cy.get('[data-test="object-property-0"]').should('be.visible')
      
      // Reload the page to verify persistence
      cy.reload()
      
      // Verify the type and property are preserved
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Object')
      cy.get('[data-test="object-property-0"]').should('be.visible')
    })

    it('can change root property type to Array and verify controls', () => {
      // Click on the type chip in the card title to open the type picker
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      
      // Select Array type
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Verify the type has changed
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Array')
      
      // Verify the array property extension is visible
      cy.get('[data-test="array-property-extension"]').should('be.visible')
      cy.get('[data-test="items-type-picker"]').should('be.visible')
      
      // Click on the items type picker
      cy.get('[data-test="items-type-picker"]').click()
      
      // Verify only object, array, and custom types are available for non-root properties
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-simple"]').should('not.exist')
      cy.get('[data-test="built-in-type-complex"]').should('not.exist')
      
      // Select object as the items type
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Verify the array of object editor is visible
      cy.get('[data-test="array-of-object-extension"]').should('be.visible')
      cy.get('[data-test="array-of-object-body"]').should('be.visible')
      
      // Reload the page to verify persistence
      cy.reload()
      
      // Verify the type and items type are preserved
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-display-name"]').should('contain', 'Array')
      cy.get('[data-test="array-of-object-extension"]').should('be.visible')
    })
  })

  describe('Types Detail Page - Object Property Editor', () => {
    beforeEach(() => {
      // Create a type with object root property
      cy.visit('/types')
      cy.contains('button', 'New').click()
      
      const typeName = `TestType-${Date.now()}`
      cy.get('.v-dialog input').type(typeName)
      cy.get('.v-dialog').contains('button', 'Create').click()
      cy.url().should('include', `/types/${typeName}.yaml`)
      
      createdTypeName = typeName
      
      // Set root property to Object type
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
    })

    it('can add properties to object', () => {
      // Add a property
      cy.get('[data-test="object-property-extension"]').within(() => {
        cy.get('[data-test="add-property-btn"]').click()
      })
      
      // Verify the property was added
      cy.get('[data-test="object-property-0"]').should('be.visible')
      
      // Set the property name
      cy.get('[data-test="object-property-0"] [data-test="property-name-input"]').clear().type('testProperty')
      
      // Set the property description
      cy.get('[data-test="object-property-0"] [data-test="description-input"]').clear().type('Test property description')
      
      // Reload to verify persistence
      cy.reload()
      
      // Verify the property is preserved
      cy.get('[data-test="object-property-0"] [data-test="property-name-input"]').should('have.value', 'testProperty')
      cy.get('[data-test="object-property-0"] [data-test="description-input"]').should('have.value', 'Test property description')
    })

    it('can edit property types in object', () => {
      // Add a property first
      cy.get('[data-test="object-property-extension"]').within(() => {
        cy.get('[data-test="add-property-btn"]').click()
      })
      
      // Change the property type to array
      cy.get('[data-test="object-property-0"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Verify the array property extension is visible
      cy.get('[data-test="object-property-0"] [data-test="array-property-extension"]').should('be.visible')
      
      // Reload to verify persistence
      cy.reload()
      
      // Verify the property type is preserved
      cy.get('[data-test="object-property-0"] [data-test="type-display-name"]').should('contain', 'Array')
    })

    it('can delete properties from object', () => {
      // Add a property first
      cy.get('[data-test="object-property-extension"]').within(() => {
        cy.get('[data-test="add-property-btn"]').click()
      })
      
      // Verify the property exists
      cy.get('[data-test="object-property-0"]').should('be.visible')
      
      // Delete the property
      cy.get('[data-test="object-property-0"] [data-test="delete-property-btn"]').click()
      
      // Verify the property is gone and "no properties" message is shown
      cy.get('[data-test="object-property-0"]').should('not.exist')
      cy.get('[data-test="no-object-properties-message"]').should('be.visible')
    })
  })

  describe('Types Detail Page - Array Property Editor', () => {
    beforeEach(() => {
      // Create a type with array root property
      cy.visit('/types')
      cy.contains('button', 'New').click()
      
      const typeName = `TestType-${Date.now()}`
      cy.get('.v-dialog input').type(typeName)
      cy.get('.v-dialog').contains('button', 'Create').click()
      cy.url().should('include', `/types/${typeName}.yaml`)
      
      createdTypeName = typeName
      
      // Set root property to Array type
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
    })

    it('shows items type picker with correct options', () => {
      // Verify the items type picker is visible
      cy.get('[data-test="items-type-picker"]').should('be.visible')
      
      // Click on the items type picker
      cy.get('[data-test="items-type-picker"]').click()
      
      // Verify only object, array, and custom types are available
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-simple"]').should('not.exist')
      cy.get('[data-test="built-in-type-complex"]').should('not.exist')
    })

    it('can set items type to Object and manage properties', () => {
      // Set items type to Object
      cy.get('[data-test="items-type-picker"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Verify the array of object editor is visible
      cy.get('[data-test="array-of-object-extension"]').should('be.visible')
      cy.get('[data-test="array-of-object-body"]').should('be.visible')
      
      // Add a property to the array items
      cy.get('[data-test="array-of-object-extension"]').within(() => {
        cy.get('[data-test="add-property-btn"]').click()
      })
      
      // Verify the property was added
      cy.get('[data-test="nested-property-0"]').should('be.visible')
      
      // Set the property name
      cy.get('[data-test="nested-property-0"] [data-test="property-name-input"]').clear().type('itemProperty')
      
      // Reload to verify persistence
      cy.reload()
      
      // Verify the items type and property are preserved
      cy.get('[data-test="array-of-object-extension"]').should('be.visible')
      cy.get('[data-test="nested-property-0"] [data-test="property-name-input"]').should('have.value', 'itemProperty')
    })

    it('can set items type to Array and create nested arrays', () => {
      // Set items type to Array
      cy.get('[data-test="items-type-picker"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Verify the array of array editor is visible
      cy.get('[data-test="array-of-array-extension"]').should('be.visible')
      cy.get('[data-test="array-of-array-body"]').should('be.visible')
      
      // Verify the nested array property editor is visible
      cy.get('[data-test="nested-array-property"]').should('be.visible')
      
      // Reload to verify persistence
      cy.reload()
      
      // Verify the items type is preserved
      cy.get('[data-test="array-of-array-extension"]').should('be.visible')
    })
  })

  describe('Types Detail Page - Type Restrictions', () => {
    beforeEach(() => {
      // Create a type for testing
      cy.visit('/types')
      cy.contains('button', 'New').click()
      
      const typeName = `TestType-${Date.now()}`
      cy.get('.v-dialog input').type(typeName)
      cy.get('.v-dialog').contains('button', 'Create').click()
      cy.url().should('include', `/types/${typeName}.yaml`)
      
      createdTypeName = typeName
    })

    it('shows all built-in types for root property', () => {
      // Click on the root type chip in the card title
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      
      // Verify all built-in types are available for root properties
      cy.get('[data-test="built-in-type-simple"]').should('be.visible')
      cy.get('[data-test="built-in-type-complex"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
    })

    it('shows only object, array, and custom types for non-root properties', () => {
      // Set root property to Object type
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Add a property
      cy.get('[data-test="object-property-extension"]').within(() => {
        cy.get('[data-test="add-property-btn"]').click()
      })
      
      // Click on the non-root property type chip
      cy.get('[data-test="object-property-0"] [data-test="type-chip"]').click()
      
      // Verify only object, array, and custom types are available
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-simple"]').should('not.exist')
      cy.get('[data-test="built-in-type-complex"]').should('not.exist')
    })
  })

  describe('Types Detail Page - Custom Type Integration', () => {
    let customTypeName: string

    before(() => {
      // Create a custom type for testing
      cy.visit('/types')
      cy.contains('button', 'New').click()
      
      customTypeName = `CustomType-${Date.now()}`
      cy.get('.v-dialog input').type(customTypeName)
      cy.get('.v-dialog').contains('button', 'Create').click()
      cy.url().should('include', `/types/${customTypeName}.yaml`)
      
      // Set the custom type to Simple with a schema
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-simple"]').click()
      cy.get('[data-test="simple-property-schema-input"]').clear().type('{"type": "string", "pattern": "^[A-Z]+$"}')
      
      // Lock the custom type so it can be used
      cy.contains('button', 'Lock').click()
    })

    after(() => {
      // Clean up the custom type
      if (customTypeName) {
        cy.request({
          method: 'DELETE',
          url: `/api/types/${customTypeName}.yaml/`,
          failOnStatusCode: false
        })
      }
    })

    it('can use custom types in non-root properties', () => {
      // Create a new type to test custom type integration
      cy.visit('/types')
      cy.contains('button', 'New').click()
      
      const typeName = `TestType-${Date.now()}`
      cy.get('.v-dialog input').type(typeName)
      cy.get('.v-dialog').contains('button', 'Create').click()
      cy.url().should('include', `/types/${typeName}.yaml`)
      
      createdTypeName = typeName
      
      // Set root property to Object type
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-object"]').click()
      
      // Add a property
      cy.get('[data-test="object-property-extension"]').within(() => {
        cy.get('[data-test="add-property-btn"]').click()
      })
      
      // Click on the non-root property type chip
      cy.get('[data-test="object-property-0"] [data-test="type-chip"]').click()
      
      // Verify the custom type is available in the picker
      cy.get('[data-test="custom-types-category"]').should('be.visible')
      cy.get(`[data-test="custom-type-${customTypeName}.yaml"]`).should('be.visible')
      cy.get(`[data-test="custom-type-name-${customTypeName}.yaml"]`).should('contain', customTypeName)
      
      // Select the custom type
      cy.get(`[data-test="custom-type-${customTypeName}.yaml"]`).click()
      
      // Verify the custom type is selected
      cy.get('[data-test="type-display-name"]').should('contain', customTypeName)
      
      // Reload to verify persistence
      cy.reload()
      
      // Verify the custom type is preserved
      cy.get('[data-test="object-property-0"] [data-test="type-display-name"]').should('contain', customTypeName)
    })

    it('can use custom types in array items', () => {
      // Create a new type to test custom type in arrays
      cy.visit('/types')
      cy.contains('button', 'New').click()
      
      const typeName = `TestType-${Date.now()}`
      cy.get('.v-dialog input').type(typeName)
      cy.get('.v-dialog').contains('button', 'Create').click()
      cy.url().should('include', `/types/${typeName}.yaml`)
      
      createdTypeName = typeName
      
      // Set root property to Array type
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="built-in-type-array"]').click()
      
      // Click on the items type picker
      cy.get('[data-test="items-type-picker"]').click()
      
      // Verify the custom type is available in the items type picker
      cy.get('[data-test="custom-types-category"]').should('be.visible')
      cy.get(`[data-test="custom-type-${customTypeName}.yaml"]`).should('be.visible')
      
      // Select the custom type as the items type
      cy.get(`[data-test="custom-type-${customTypeName}.yaml"]`).click()
      
      // Verify the custom type is selected as items type
      cy.get('[data-test="items-type-picker"] [data-test="type-display-name"]').should('contain', customTypeName)
      
      // Reload to verify persistence
      cy.reload()
      
      // Verify the custom type is preserved as items type
      cy.get('[data-test="items-type-picker"] [data-test="type-display-name"]').should('contain', customTypeName)
    })
  })
})
