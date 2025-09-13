describe('Dictionary Details Page', () => {
  const name = `e2e-test-dictionary-array-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with an object root property
  beforeEach(() => {
    thingsToDelete.push(`/api/dictionaries/${fileName}/`)

    cy.visit('/dictionaries')
    cy.wait(500)
    cy.get('[data-test="new-dictionary-btn"]').click()
    cy.get('[data-test="new-dictionary-dialog"]').should('be.visible')
    cy.get('[data-test="new-dictionary-name-input"]').type(name)
    cy.get('[data-test="new-dictionary-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/dictionaries/${name}`)
    // cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
    // cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    // cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    // cy.get('[data-test="built-in-type-array"]').click()
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
    // cy.visit('/dictionaries')
    // cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
  })

  describe('Array Property Editor', () => {
    it('can change root type from void to array', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // enter description
      // verify property type chip picker with "array" value, 
      // verify items type chip picker with "void" value
      // verify required checkbox is unchecked, check and verify checked
      // verify description has same value entered
    })

    it('displays proper items type picker', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // click on items type chip
      // verify items type picker has Built-in Types section
      // verify Built-in types contains only "object", "array" 
      // verify items type picker has Custom Types section
      // verify Custom Types more than 10 chips
      // verify that {name} is in chips
    })

    it('handles array of array', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change the items type to array
      // verify items type chip picker with "array" value
      // verify required checkbox is unchecked, check and verify checked
      // verify property name and description input are visible and enabled
      // verify body has "items" and items type picker with proper values
      // select array (so we have array of array of array)
      // verify nested content is visible
    })

    it('handles array of object', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change the items type to object
      // verify items type chip picker with "object" value
      // verify required checkbox is unchecked, check and verify checked
      // verify property name and description input are visible and enabled
      // verify array of object property action icons are visible and enabled
      // verify properties list has no-properties-message with proper values
      // add three sub-properties to the array of object and set name and description for each
      // verify all properties have Name, Description, and type chip picker with "void" value, required checkbox is unchecked
      // delete the second property
      // verify property list has 2 properties, property 3 is now property 2
    })

    it('can show/hide object properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change the items type to object
      // add three sub-properties to the array of object and set name and description for each
      // click hide-properties button
      // verify property list is not visible
      // click show-properties button
      // verify property list is visible
    })

    it('handles array of one_of', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change items type to one_of
      // verify items type chip picker with "one_of" value
      // verify required checkbox is unchecked, check and verify checked
      // verify property name and description input are visible and enabled
      // verify array of one_of property action icons are visible and enabled
      // verify properties list has no-properties-message with proper values
      // add three sub-properties to the array of object and set name and description for each
      // verify all properties have Name, Description, and type chip picker with "void" value, required checkbox is unchecked
      // delete the second property
      // verify property list has 2 properties, property 3 is now property 2
    })

    it('can show/hide one_of properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change the items type to one_of
      // add three sub-properties to the array of object and set name and description for each
      // click hide-properties button
      // verify property list is not visible
      // click show-properties button
      // verify property list is visible
    })

    it('handles array of ref', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change items type to ref
      // verify items type chip picker with "ref" value
      // verify required checkbox is unchecked, check and verify checked
      // verify property name and description input are visible and enabled
      // verify array of ref property action icons are visible and enabled
      // verify refs list has no-refs-message with proper values
      // add a refs verify picker  to the array of object and set name and description for each
      // verify all properties have Name, Description, and type chip picker with "void" value, required checkbox is unchecked
      // delete the second property
      // verify property list has 2 properties, property 3 is now property 2
    })

    it('handles array of custom', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
    

    it('can delete properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // delete the first property
      // verify property list has property 2 is now property 1, property 3 is now property 2
    })

    it('locks', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change the second property to object
      // add three sub-properties to the object and set name and description for each

      // verify unlocked
      // click lock button
      // verify root property description and type chip picker are disabled
      // verify object action icons do not exist
      // verify property list is visible with 3 properties
      // verify that property list name, description, and type chip picker are disabled
      // verify that property list required checkbox and delete do not exist
      // verify that property list object property action icons do not exist
    })

    it('unlocks', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
      // change the second property to object
      // add three sub-properties to the object and set name and description for each

      // verify unlocked
      // click lock button
      // verify locked
      // click unlock button
      // verify root property description and type chip picker are enabled
      // verify object action icons are enabled
      // verify property list is visible with 2 properties
      // verify that property list name, description, and type chip picker are enabled
      // verify that property list required checkbox and delete are enabled
      // verify that property list object property action icons are enabled
    })
  })
})
