describe('Types page flow', () => {
  const name = `e2e-test-data-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Clean up any types created during tests
  beforeEach(() => {
    thingsToDelete.push(`/api/types/${fileName}/`)
    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/types/${name}`)
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
    it('loads types page and shows basic elements', () => {
      cy.visit('/types')
      cy.get('[data-test="page-title"]').should('contain', 'Types')
      cy.get('[data-test="lock-all-btn"]').should('be.visible').and('to.be.enabled')
      cy.get('[data-test="new-type-btn"]').should('be.visible').and('to.be.enabled')
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

    it('can lock/unlock a type', () => {
      // verify unlocked
      // click lock button
      // verify locked
      // click unlock button
      // verify unlocked
    })

    it('has the correct types in the type picker', () => {
      // verify root type picker contains only "object", "array", "simple", "complex"
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

})
