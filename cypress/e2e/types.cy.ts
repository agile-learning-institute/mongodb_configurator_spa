describe('Types page flow', () => {
  const name = `e2e-test-data-${Date.now()}`
  const fileName = `${name}.json`
  const thingsToDelete: string[] = []

  const initializeObject = () => {
    cy.visit(`/types/${fileName}`)
    // test description and type chip picker with "void" value
    // change type to object
    // enter a description
    // verify No Properties message is visible
    // add 3 properties to the object
  }

  // Clean up any types created during tests
  beforeEach(() => {
    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/types/${fileName}`)

    thingsToDelete.push(`/api/types/${fileName}.yaml/`)
  })

  afterEach(() => {
    thingsToDelete.forEach((thing) => {
      cy.request({
        method: 'DELETE',
        url: thing,
        failOnStatusCode: false
      })
    })
    cy.visit('/types')
    cy.get('[data-test^="file-card-"]').should('not.contain', fileName)
  })

  describe('Types List Page - Basic Elements', () => {
    it.only('loads types page and shows basic elements', () => {
      cy.visit('/types')
      cy.get('[data-test="page-title"]').should('contain', 'Types')
      cy.get('[data-test="lock-all-btn"]').should('be.visible').and('enabled')
      cy.get('[data-test="new-type-btn"]').should('be.visible').and('enabled')
      cy.get('[data-test^="file-card-"]').should('have.length.above', 10)
    })
  })

  describe('Types Detail Page - Basic', () => {
    it('loads types detail page and shows basic elements', () => {
      // Verify page title is "Type: <file-name>"
      // Verify lock button is visible and enabled
      // Verify delete button is visible and enabled
      // Verify unlock button does not exist

      // Verify description display is visible and contains "Click to add description"
      // Verify type chip picker is visible and contains "void"
      // Verify that card body is empty
    })

    it('can delete a type with confirmation', () => {
      // verify delete button is visible and enabled
      // click delete button
      // verify delete confirmation dialog is visible
      // verify delete confirmation dialog has "Are you sure you want to delete "test-type.yaml"?"
      // verify delete confirmation dialog has "This action cannot be undone. The type will be permanently removed from the system."
      // verify delete confirmation dialog has "Cancel" button
      // verify delete confirmation dialog has "Delete" button
      // click delete button in dialog
      // verify dialog is closed and we're redirected to types list
      // verify type is deleted
    })

  })

  describe('Types Detail Page - Object Property Editor', () => {
    it('can change root type from void to object', () => {
      initializeObject()
      // verify description content and type chip picker with "object" value
    })

    it('displays object action icons', () => {
      initializeObject()
      // verify add-property button is visible and enabled
      // verify allow-additional-properties button is visible and enabled
      // verify show-properties button is visible and enabled
      // verify hide-properties button does not exist
      // verify delete-property button does not exist
    })

    it('adds properties to object', () => {
      initializeObject()
      // verify property list is visible
      // verify property list has 3 properties with Name, Description, and type chip picker with "void" value, required checkbox is unchecked
    })

    it('change non-root property type to object', () => {
      initializeObject()
      // change the type of the second property to object
      // verify property type chip picker with "object" value, 
      // verify required checkbox is unchecked, check and verify checked
      // verify property name and description input are visible and enabled
      // verify object property action icons are visible and enabled
      // add two properties to the object, verify they have Name, Description placeholder, and type chip picker with "void" value, required checkbox is unchecked
      // enter a descriptions for the second property
      // delete the first property
      // verify property list has 1 properties, property 2 is now property 1
    })
    
    it('can show/hide properties', () => {
      initializeObject()
      // click root hide-properties button
      // verify root property list is not visible
      // click root show-properties button
      // verify root property list is visible
      // click hide property on second property
      // verify second property list is not visible
      // click show property on second property
      // verify second property list is visible
    })

    it('can delete properties', () => {
      initializeObject()
      // click delete-property button
      // verify property list has property 2 is now property 1, property 3 is now property 2
    })

    it('locks', () => {
      initializeObject()
      // verify unlocked
      // click lock button
      // verify root property description and type chip picker are disabled
      // verify object action icons do not exist
      // verify property list is visible with 2 properties
      // verify that property list name, description, and type chip picker are disabled
      // verify that property list required checkbox and delete do not exist
      // verify that property list object property action icons do not exist
    })

    it('unlocks', () => {
      initializeObject()
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
