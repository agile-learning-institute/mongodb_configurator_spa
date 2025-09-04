describe('App Help Pages', () => {
  it('loads the welcome carousel and navigation', () => {
    cy.visit('/')
    cy.getByTest('help-carousel').should('be.visible')
    cy.getByTest('carousel-title-text').should('contain.text', 'Welcome')
  })

  it('has help content for each page', () => {
    cy.visit('/')
    cy.getByTest('help-carousel').should('be.visible')
    cy.getByTest('carousel-title-text').should('contain.text', 'Welcome')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Collection Configuration')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Dictionary')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Type')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Enumerator')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Test Data')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Migration')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Admin')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Configuration Processing Events')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Locking')

    cy.get('[data-test="carousel-next-btn"]').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Welcome')
  })
})


