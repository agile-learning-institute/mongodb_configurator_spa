describe('Configurations page flow', () => {
  let createdConfigurationName: string



  // Clean up any configurations created during tests
  afterEach(() => {
    if (createdConfigurationName) {
      cy.log(`Cleaning up created configuration: ${createdConfigurationName}`)

      // Delete via API - configurations create multiple files, so we need to clean them up
      cy.request({
        method: 'DELETE',
        url: `/api/configurations/${createdConfigurationName}.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted configuration ${createdConfigurationName}`)
        } else {
          cy.log(`Failed to delete configuration ${createdConfigurationName}: ${response.status}`)
        }
      })

      // Also try to delete the associated dictionary file
      cy.request({
        method: 'DELETE',
        url: `/api/dictionaries/${createdConfigurationName}.0.0.0.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted dictionary ${createdConfigurationName}.0.0.0.yaml`)
        }
      })

      // And the test data file
      cy.request({
        method: 'DELETE',
        url: `/api/test-data/${createdConfigurationName}.0.0.0.0.json/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted test data ${createdConfigurationName}.0.0.0.0.json`)
        }
      })

      createdConfigurationName = ''
    }
  })

  it('loads configurations page and shows basic elements', () => {
    // Visit configurations page
    cy.visit('/configurations')

    // Verify basic page elements
    cy.get('[data-test="page-title"]').should('contain', 'Collection Configurations')
    cy.get('[data-test="new-collection-btn"]').should('be.visible')
    cy.get('[data-test="configurations-file-list"]').should('exist')
    
    // Wait for any existing configurations to load
    cy.get('[data-test^="file-card-"]').should('exist')
  })

  it('can create a new configuration via dialog', () => {
    // Visit configurations page
    cy.visit('/configurations')

    // Click New button to open dialog
    cy.get('[data-test="new-collection-btn"]').click()

    // Verify dialog is open
    cy.get('[data-test="new-collection-dialog"]').should('be.visible')
    cy.get('[data-test="new-collection-dialog-title"]').should('contain', 'Create New Collection')

    // Type a name
    const configurationName = `TestConfig_${Date.now()}`
    cy.get('[data-test="new-collection-name-input"]').type(configurationName)

    // Type a description
    cy.get('[data-test="new-collection-description-input"]').type('Test configuration for E2E testing')

    // Simply bump minor version to 1 (don't test complex patch logic)
    cy.get('[data-test="version-minor-plus-btn"]').click()
    
    // Verify minor version increased
    cy.get('[data-test="version-minor-display"]').should('contain', '1')
    cy.get('[data-test="version-display"]').should('contain', '0.1.0')

    // Click Create button
    cy.get('[data-test="new-collection-create-btn"]').click()

    // Verify dialog is closed
    cy.get('[data-test="new-collection-dialog"]').should('not.exist')

    // Store the configuration name for cleanup
    createdConfigurationName = configurationName

    // Wait a moment for the API calls to complete
    cy.wait(2000)

    // After creation, we should be redirected to the detail page
    cy.url().should('include', `/configurations/${configurationName}.yaml`)

    // Navigate back to the configurations list to verify the configuration was created
    cy.visit('/configurations')

    // Wait for the configuration to appear in the list using the correct selector
    cy.get(`[data-test="file-card-${configurationName}.yaml"]`).should('be.visible')
  })

  it('tests version patch logic and validation', () => {
    // Visit configurations page
    cy.visit('/configurations')

    // Click New button to open dialog
    cy.get('[data-test="new-collection-btn"]').click()

    // Verify dialog is open
    cy.get('[data-test="new-collection-dialog"]').should('be.visible')

    // Verify initial state
    cy.get('[data-test="version-major-display"]').should('contain', '0')
    cy.get('[data-test="version-minor-display"]').should('contain', '0')
    cy.get('[data-test="version-patch-display"]').should('contain', '0')
    cy.get('[data-test="version-display"]').should('contain', '0.0.0')

    // Test major version increment
    cy.get('[data-test="version-major-plus-btn"]').click()
    
    // Verify major version increased and minor/patch reset to 0
    cy.get('[data-test="version-major-display"]').should('contain', '1')
    cy.get('[data-test="version-minor-display"]').should('contain', '0')
    cy.get('[data-test="version-patch-display"]').should('contain', '0')
    cy.get('[data-test="version-display"]').should('contain', '1.0.0')

    // Test minor version increment
    cy.get('[data-test="version-minor-plus-btn"]').click()
    
    // Verify minor version increased and patch reset to 0
    cy.get('[data-test="version-major-display"]').should('contain', '1')
    cy.get('[data-test="version-minor-display"]').should('contain', '1')
    cy.get('[data-test="version-patch-display"]').should('contain', '0')
    cy.get('[data-test="version-display"]').should('contain', '1.1.0')

    // Test patch version increment
    cy.get('[data-test="version-patch-plus-btn"]').click()
    
    // Verify patch version increased
    cy.get('[data-test="version-major-display"]').should('contain', '1')
    cy.get('[data-test="version-minor-display"]').should('contain', '1')
    cy.get('[data-test="version-patch-display"]').should('contain', '1')
    cy.get('[data-test="version-display"]').should('contain', '1.1.1')

    // Close dialog without creating
    cy.get('[data-test="new-collection-cancel-btn"]').click()
    cy.get('[data-test="new-collection-dialog"]').should('not.exist')
  })

  it('can navigate to newly created configuration detail page and verify elements', () => {
    // First create a configuration
    cy.visit('/configurations')
    cy.get('[data-test="new-collection-btn"]').click()

    const configurationName = `TestConfig_${Date.now()}`
    cy.get('[data-test="new-collection-name-input"]').type(configurationName)
    cy.get('[data-test="new-collection-description-input"]').type('Test configuration for E2E testing')
    
    // Simply bump minor version to 1 to enable Create button
    cy.get('[data-test="version-minor-plus-btn"]').click()
    cy.get('[data-test="version-display"]').should('contain', '0.1.0')
    
    cy.get('[data-test="new-collection-create-btn"]').click()

    // After creation, we should be on the detail page
    cy.url().should('include', `/configurations/${configurationName}.yaml`)

    // Store the configuration name for cleanup
    createdConfigurationName = configurationName

    // Verify basic page elements exist
    cy.get('h3.text-h5').should('be.visible')
    cy.get('h3.text-h5').should('contain', configurationName)

    // Check for the specific elements that should be visible on a newly created configuration
    cy.contains('button', 'Configure Collection').should('be.visible')
    cy.contains('button', 'Delete Collection').should('be.visible')
    cy.contains('button', 'JSON Schema').should('be.visible')
    cy.contains('button', 'BSON Schema').should('be.visible')
  })

  it('can lock and unlock a newly created configuration version', () => {
    // First create a configuration
    cy.visit('/configurations')
    cy.get('[data-test="new-collection-btn"]').click()

    const configurationName = `TestConfig_${Date.now()}`
    cy.get('[data-test="new-collection-name-input"]').type(configurationName)
    cy.get('[data-test="new-collection-description-input"]').type('Test configuration for E2E testing')
    
    // Simply bump minor version to 1 to enable Create button
    cy.get('[data-test="version-minor-plus-btn"]').click()
    cy.get('[data-test="version-display"]').should('contain', '0.1.0')
    
    cy.get('[data-test="new-collection-create-btn"]').click()

    // After creation, we should be on the detail page
    cy.url().should('include', `/configurations/${configurationName}.yaml`)

    // Store the configuration name for cleanup
    createdConfigurationName = configurationName

    // Wait for the page to fully load
    cy.wait(1000)

    // Newly created configurations should be unlocked by default, so we should see Lock button
    cy.contains('button', 'Lock').should('be.visible')

    // Lock the configuration version
    cy.contains('button', 'Lock').click()

    // Verify it's now locked (Lock button should be replaced with Unlock)
    cy.contains('button', 'Unlock').should('be.visible')
    cy.contains('button', 'Lock').should('not.exist')

    // Unlock the configuration version
    cy.contains('button', 'Unlock').click()

    // Verify it's now unlocked (Unlock button should be replaced with Lock)
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Unlock').should('not.exist')
  })

  it('can delete a configuration with confirmation', () => {
    // First create a configuration to ensure we have one to delete
    cy.visit('/configurations')
    cy.get('[data-test="new-collection-btn"]').click()
    const configurationName = `ConfigToDelete_${Date.now()}`
    cy.get('[data-test="new-collection-name-input"]').type(configurationName)
    cy.get('[data-test="new-collection-description-input"]').type('Test configuration for deletion')
    
    // Simply bump minor version to 1 to enable Create button
    cy.get('[data-test="version-minor-plus-btn"]').click()
    cy.get('[data-test="version-display"]').should('contain', '0.1.0')
    
    cy.get('[data-test="new-collection-create-btn"]').click()
    cy.url().should('include', `/configurations/${configurationName}.yaml`)
    createdConfigurationName = configurationName // Ensure this is set for cleanup

    // Wait for the page to fully load
    cy.wait(1000)

    // Check if the configuration version is locked - if so, we need to unlock it first to delete
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Unlock")').length > 0) {
        // Configuration version is locked, unlock it first
        cy.contains('button', 'Unlock').click()
        cy.wait(1000) // Wait for unlock to complete
      }

      // Now click Delete Collection button
      cy.contains('button', 'Delete Collection').click()

      // Verify delete confirmation dialog is open
      cy.get('.v-dialog').should('be.visible')
      cy.get('.v-dialog .v-card-title').should('contain', 'Delete Collection')

      // Click Delete button in dialog
      cy.get('.v-dialog').contains('button', 'Delete').click()

      // Verify dialog is closed and we're redirected to configurations list
      cy.get('.v-dialog').should('not.exist')
      cy.url().should('match', /\/configurations\/?$/)
    })
  })

  it('displays correct version navigator icons', () => {
    // Visit configurations page
    cy.visit('/configurations')
    
    // Wait for any existing configurations to load
    cy.get('[data-test^="file-card-"]').should('exist')
    
    // Click on the first configuration to go to detail page
    cy.get('[data-test^="file-card-"]').first().click()
    
    // Wait for the detail page to load
    cy.url().should('include', '/configurations/')
    
    // Verify the version navigator uses the correct icons
    // Previous version button should use mdi-skip-previous
    cy.get('[data-test="previous-version-btn"]').should('exist')
    cy.get('[data-test="previous-version-btn"] .v-icon').should('contain', 'mdi-skip-previous')
    
    // Next version button should use mdi-skip-next (if it exists)
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="next-version-btn"]').length > 0) {
        cy.get('[data-test="next-version-btn"] .v-icon').should('contain', 'mdi-skip-next')
      }
    })
    
    // Verify the active version is displayed
    cy.get('[data-test="active-version"]').should('be.visible')
    
    // Verify the new version button exists and has correct icon
    cy.get('[data-test="new-version-btn"]').should('exist')
    cy.get('[data-test="new-version-btn"] .v-icon').should('contain', 'mdi-plus')
    
    // Verify lock/unlock and delete buttons have correct data-test attributes
    cy.get('[data-test="toggle-lock-btn"]').should('exist')
    cy.get('[data-test="lock-icon"]').should('exist')
    cy.get('[data-test="lock-btn-text"]').should('exist')
    
    // Check if delete button exists (only for unlocked versions)
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="delete-version-btn"]').length > 0) {
        cy.get('[data-test="delete-version-btn"]').should('exist')
        cy.get('[data-test="delete-icon"]').should('exist')
        cy.get('[data-test="delete-btn-text"]').should('exist')
      }
    })
  })
})
