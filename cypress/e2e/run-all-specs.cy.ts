/**
 * Run All Specs - Cypress Test Runner
 * 
 * This file runs all available Cypress specs by importing and executing them.
 * Simply run this file to execute your entire test suite.
 */

// Import all spec files to run them
// These imports will execute when Cypress runs this file
import './app.smoke.cy.ts'
import './configurations.cy.ts'
import './dictionaries.cy.ts'
import './enumerators.cy.ts'
import './event-viewer.cy.ts'
import './migrations.cy.ts'
import './test_data.cy.ts'
import './types.cy.ts'

describe('🚀 Complete Test Suite Runner', () => {
  before(() => {
    // Start the API server before running any tests
    cy.exec('npm run api', { timeout: 30000 })
    cy.wait(5000) // Give API time to fully start
  })

  it('should run all test specs', () => {
    // This test will execute all imported specs
    cy.log('🎯 Running complete test suite...')
    cy.log('📋 All specs have been imported and will run')
    
    // Simple assertion to ensure the test runs
    expect(true).to.be.true
  })
})
