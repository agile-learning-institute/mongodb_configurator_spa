describe('Dictionary Object page flow', () => {
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

  describe('Object Property Basics', () => {
    it('can change root type from void to object', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
  })

  describe('Root Object Property Editor', () => {
    it('displays object action icons', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('has the correct type picker', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('adds properties to object', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
    
    it('can arrange properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('can show/hide properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('can delete properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
  })

  describe('Non-Root Object Property Editor', () => {
    it('displays object action icons', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('has the correct type picker', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('adds properties to object', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
    
    it('can arrange properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('can show/hide properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('can delete properties', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
  })

  describe('Lockable Object Property Editor', () => {
    it('locks', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })

    it('unlocks', () => {
      expect(true, 'Not Yet Implemented').to.equal(false)
    })
  })
})
