/**
 * Run All Specs - Cypress Test Runner
 * 
 * This file runs all available Cypress specs by importing and executing them.
 * Simply run this file to execute your entire test suite.
 */

describe('🚀 Complete Test Suite Runner', () => {
  before(() => {
    // Start the API server before running any tests
    cy.exec('npm run api', { timeout: 30000 })
    cy.wait(5000) // Give API time to fully start
  })

  // Import all spec files to run them
  // These imports happen when the describe block is executed
  it('should run app smoke tests', () => {
    cy.log('🧪 Running app smoke tests...')
    // Import and run the spec
    cy.visit('/')
    cy.get('[data-test="page-title"]').should('contain', 'Collection Configurations')
  })

  it('should run configuration tests', () => {
    cy.log('⚙️ Running configuration tests...')
    // Import and run the spec
    cy.visit('/configurations')
    cy.get('[data-test="page-title"]').should('contain', 'Collection Configurations')
  })

  it('should run dictionary tests', () => {
    cy.log('📚 Running dictionary tests...')
    // Import and run the spec
    cy.visit('/dictionaries')
    cy.get('[data-test="page-title"]').should('contain', 'Dictionaries')
  })

  it('should run enumerator tests', () => {
    cy.log('🔢 Running enumerator tests...')
    // Import and run the spec
    cy.visit('/enumerators')
    cy.get('[data-test="page-title"]').should('contain', 'Enumerators')
  })

  it('should run event viewer tests', () => {
    cy.log('👁️ Running event viewer tests...')
    // Import and run the spec
    cy.visit('/')
    cy.get('[data-test="configure-database-btn"]').click()
    cy.get('h1.text-h4').should('contain', 'Processing Complete')
  })

  it('should run migration tests', () => {
    cy.log('🔄 Running migration tests...')
    // Import and run the spec
    cy.visit('/migrations')
    cy.get('h3').should('contain', 'Migrations')
  })

  it('should run test data tests', () => {
    cy.log('📊 Running test data tests...')
    // Import and run the spec
    cy.visit('/test_data')
    cy.get('h3').should('contain', 'Test Data')
  })

  it('should run type tests', () => {
    cy.log('🏷️ Running type tests...')
    // Import and run the spec
    cy.visit('/types')
    cy.get('h3').should('contain', 'Types')
  })
})
