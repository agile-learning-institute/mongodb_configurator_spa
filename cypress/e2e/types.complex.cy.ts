describe('Types page flow', () => {
  const name = `e2e-test-data-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with an complex root property
  beforeEach(() => {
    cy.visit('/types')
    cy.get('[data-test="new-type-btn"]').click()
    cy.get('[data-test="new-type-dialog"]').should('be.visible')
    cy.get('[data-test="new-type-name-input"]').type(name)
    cy.get('[data-test="new-type-create-btn"]').click()
    cy.wait(500)
    cy.url().should('include', `/types/${name}`)

    // test description and type chip picker with "void" value
    // change type to complex
    // enter a json schema string
    // enter a bson schema string

    thingsToDelete.push(`/api/types/${fileName}/`)
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

  describe('Simple Property Editor', () => {
    it('persists schema string', () => {
      // visit page
      // verify values entered in beforeEach
    })

    it('locks', () => {
      // verify unlocked
      // click lock button
      // verify root property description and type chip picker are disabled
      // verify json schema json editor is disabled
      // verify bson schema json editor is disabled
    })

    it('unlocks', () => {
      // verify unlocked
      // click lock button
      // verify locked
      // click unlock button
      // verify root property description and type chip picker are enabled
      // verify verify json schema json editor is enabled
      // verify verify bson schema json editor is enabled
    })
  })
})
