describe('App smoke', () => {
  it('loads the welcome carousel and navigation', () => {
    cy.visit('/')
    cy.getByTest('help-carousel').should('be.visible')
    cy.getByTest('carousel-title-text').should('contain.text', 'Welcome')
  })
})


