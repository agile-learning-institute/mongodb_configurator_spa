describe('Dictionary Details Page', () => {
  const name = `e2e-test-dictionary-constant-${Date.now()}`
  const fileName = `${name}.yaml`
  const thingsToDelete: string[] = []

  // Setup a type with an object root property
  beforeEach(() => {
    thingsToDelete.push(`/api/dictionaries/${fileName}/`)

    cy.visit('/dictionaries')
    cy.wait(200)
    cy.get('[data-test="new-dictionary-btn"]').click()
    cy.get('[data-test="new-dictionary-dialog"]').should('be.visible')
    cy.get('[data-test="new-dictionary-name-input"]').type(name)
    cy.get('[data-test="new-dictionary-create-btn"]').click()
    cy.wait(200)
    cy.url().should('include', `/dictionaries/${name}`)
    // cy.get('[data-test="root-description-placeholder"]').should('be.visible').and('contain', 'Click to add description')
    // cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')    
    // cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
    // cy.get('[data-test="built-in-type-object"]').click()
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

  describe('Constant Property Editor', () => {
    it('can change root type from void to enum', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('displays and edits constant value input', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('locks', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('unlocks', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
  })
})
