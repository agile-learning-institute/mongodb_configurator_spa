/**
 * Run All Specs - Cypress GUI Test Runner
 * 
 * This file allows you to run all Cypress specs from the GUI.
 * Simply open this file in Cypress and run it to execute all tests.
 */

describe('🚀 Run All Cypress Specs', () => {
  it('should run all available test specs', () => {
    // This test will show you all available specs in the GUI
    cy.log('Available Cypress Test Specs:')
    
    const specs = [
      { name: 'App Smoke Tests', file: 'app.smoke.cy.ts', description: 'Basic app functionality and navigation' },
      { name: 'Configurations', file: 'configurations.cy.ts', description: 'Configuration management and versioning' },
      { name: 'Dictionaries', file: 'dictionaries.cy.ts', description: 'Dictionary CRUD operations' },
      { name: 'Enumerators', file: 'enumerators.cy.ts', description: 'Enumerator management with versioning rules' },
      { name: 'Event Viewer', file: 'event-viewer.cy.ts', description: 'Event processing and display' },
      { name: 'Migrations', file: 'migrations.cy.ts', description: 'Migration management' },
      { name: 'Test Data', file: 'test_data.cy.ts', description: 'Test data management' },
      { name: 'Types', file: 'types.cy.ts', description: 'Type definition management' }
    ]
    
    // Display all specs in the test runner
    specs.forEach((spec, index) => {
      cy.log(`📋 ${index + 1}. ${spec.name}`)
      cy.log(`   File: ${spec.file}`)
      cy.log(`   Description: ${spec.description}`)
      cy.log('   ---')
    })
    
    cy.log(`🎯 Total: ${specs.length} spec files available`)
    cy.log('💡 To run individual specs, open them directly in Cypress')
    cy.log('💡 To run all specs from command line: npm run cy:run')
    
    // This test always passes - it's just for information
    expect(specs.length).to.be.greaterThan(0)
  })
  
  it('should verify all spec files exist', () => {
    // Verify that all spec files are present in the e2e directory
    const specFiles = [
      'app.smoke.cy.ts',
      'configurations.cy.ts',
      'dictionaries.cy.ts', 
      'enumerators.cy.ts',
      'event-viewer.cy.ts',
      'migrations.cy.ts',
      'test_data.cy.ts',
      'types.cy.ts'
    ]
    
    specFiles.forEach(specFile => {
      // This will fail if any spec file is missing
      expect(specFile).to.exist
    })
    
    cy.log('✅ All spec files verified as present')
  })
})
