describe('Types page flow', () => {
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
      // enter description
      // verify required checkbox is unchecked, check and verify checked
      // verify description has same value entered
      // verify No properties defined message is visible
    })

    it('displays root object action icons', () => {
      // verify allow-additional-properties button is visible and enabled
      // verify show-properties button is visible and enabled
      // verify hide-properties button does not exist
      // verify delete-property button does not exist
    })

    it('displays non-root object action icons', () => {
      // change the second property to object
      // verify add-property button is visible and enabled
      // verify allow-additional-properties button is visible and enabled
      // verify show-properties button is visible and enabled
      // verify hide-properties button does not exist
      // verify delete-property button does not exist
    })

    it('has the correct non-root type picker', () => {
      // click on the first property type chip 
      // verify type picker has Built-in Types section
      // verify Built-in types contains only "object", "array" 
      // verify type picker has Custom Types section
      // verify Custom Types more than 10 chips
      // verify that {name} is in chips
    })

    it('adds properties to non-root object', () => {
      // change the second property to object
      // verify property type chip picker with "object" value, 
      // verify required checkbox is unchecked, check and verify checked
      // verify property name and description input are visible and enabled
      // verify object property action icons are visible and enabled
      // add three sub-properties to the object and set name and description for each
      // verify all properties have Name, Description, and type chip picker with "void" value, required checkbox is unchecked
      // delete the second property
      // verify property list has 2 properties, property 3 is now property 2
    })
    
    it('can arrange properties', () => {
      // drag the 2nd to before 1 and verify 2,1,3
      // drag the 1st property to after spot 3 and verify 1,3,2
      // drag the 3rd property to before spot 1 and verify 2,1,3
    })

    it('can show/hide properties', () => {
      // click root hide-properties button
      // verify root property list is not visible
      // click root show-properties button
      // verify root property list is visible

      // change the second property to object
      // click hide property on second property
      // add three sub-properties to the object and set name and description for each
      // verify list is visible
      // click hide properties
      // verify list is not visible
    })

    it('can delete properties', () => {
      // delete the first property
      // verify property list has property 2 is now property 1, property 3 is now property 2
    })

    it('locks', () => {
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
