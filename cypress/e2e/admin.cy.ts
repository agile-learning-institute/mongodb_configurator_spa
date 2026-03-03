describe('Admin page', () => {
  it('shows the page with Configure Database and Drop Database buttons', () => {
    cy.visit('/admin')
    cy.url().should('include', '/admin')

    // Wait for page to load (buttons appear when config is loaded)
    cy.get('[data-test="configure-database-btn"]').should('be.visible').should('contain', 'Configure Database')
    cy.get('[data-test="drop-database-btn"]').should('be.visible').should('contain', 'Drop Database')
  })

  it('shows the config items list with more than a few lines', () => {
    cy.visit('/admin')
    cy.get('[data-test="config-items-table"]').should('be.visible')
    cy.get('[data-test="config-items-list"]').should('exist')
    // Config items list should have multiple rows (API returns several config items)
    cy.get('[data-test="config-items-list"] tr').should('have.length.greaterThan', 3)
  })
})
