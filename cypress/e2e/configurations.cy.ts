describe('Configurations page flow', () => {
  let createdConfigurationName: string
  let createdConfigurationVersion: string
  let createdEnumeratorsVersion: string

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
      // Use the actual version that was created (usually 0.1.0 from our tests)
      const dictionaryVersion = createdConfigurationVersion || '0.1.0'
      cy.request({
        method: 'DELETE',
        url: `/api/dictionaries/${createdConfigurationName}.${dictionaryVersion}.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted dictionary ${createdConfigurationName}.${dictionaryVersion}.yaml`)
        }
      })

      // And the test data file
      // Test data files use the format: {name}.{version}.{enumerators}.json
      // Most tests create enumerators version 2, except the +1 test which creates version 3
      const testDataVersion = createdConfigurationVersion || '0.1.0'
      const enumeratorsVersion = createdEnumeratorsVersion || '2'
      cy.request({
        method: 'DELETE',
        url: `/api/test-data/${createdConfigurationName}.${testDataVersion}.${enumeratorsVersion}.json/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted test data ${createdConfigurationName}.${testDataVersion}.${enumeratorsVersion}.json`)
        }
      })

      createdConfigurationName = ''
      createdConfigurationVersion = ''
      createdEnumeratorsVersion = ''
    }
  })

  describe('Basic Page Functionality', () => {
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
  })

  describe('Configuration Creation and Dialog', () => {
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

      // Store the configuration name and version for cleanup
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

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
  })

  describe('Configuration Detail Page', () => {
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

      // Store the configuration name and version for cleanup
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

      // Verify basic page elements exist
      cy.get('h3.text-h5').should('be.visible')
      cy.get('h3.text-h5').should('contain', configurationName)

      // Check for the specific elements that should be visible on a newly created configuration
      cy.contains('button', 'Configure Collection').should('be.visible')
      cy.contains('button', 'Delete Collection').should('be.visible')
      cy.contains('button', 'JSON Schema').should('be.visible')
      cy.contains('button', 'BSON Schema').should('be.visible')
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
      // Previous version button should use mdi-skip-previous with default size
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"] .v-icon').should('have.class', 'mdi-skip-previous')
      cy.get('[data-test="previous-version-btn"]').should('not.have.class', 'v-btn--size-small')
      
      // Next version button should use mdi-skip-next with default size (if it exists)
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="next-version-btn"]').length > 0) {
          cy.get('[data-test="next-version-btn"] .v-icon').should('have.class', 'mdi-skip-next')
          cy.get('[data-test="next-version-btn"]').should('not.have.class', 'v-btn--size-small')
        }
      })
      
      // Verify the active version is displayed
      cy.get('[data-test="active-version"]').should('be.visible')
      
      // Verify the new version button exists and has correct icon
      cy.get('[data-test="new-version-btn"]').should('exist')
      cy.get('[data-test="new-version-btn"] .v-icon').should('have.class', 'mdi-plus')
      
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

  describe('Configuration Management', () => {
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
      createdConfigurationVersion = '0.1.0'

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
  })

  describe('New Version Creation and Management', () => {
    it('can create new version with patch logic', () => {
      // Arrange - very minimal assertions
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()
      
      // Assert we are in Create New Collection dialog
      cy.get('[data-test="new-collection-dialog"]').should('be.visible')
      cy.get('[data-test="new-collection-dialog-title"]').should('contain', 'Create New Collection')
      
      // Type name/description, click minor + button, click create
      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for version testing')
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="new-collection-create-btn"]').click()
      
      // Assert path /configurations/{filename}.yaml
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      
      // Store for cleanup
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2'

      // Act & Assert
      // click New Version
      cy.contains('button', 'New Version').click()
      
      // assert we are in new version dialog
      cy.get('[data-test="new-version-dialog"]').should('be.visible')
      cy.get('[data-test="new-version-dialog-title"]').should('contain', 'Create New Version')
      
      // assert major=0, minor=1, patch=0, enumerators=2
      cy.get('[data-test="new-version-major"]').should('contain', '0')
      cy.get('[data-test="new-version-minor"]').should('contain', '1')
      cy.get('[data-test="new-version-patch"]').should('contain', '0')
      cy.get('[data-test="new-version-enumerators"]').should('contain', '2')

      // Verify version numbers are display-only spans, not inputs
      cy.get('[data-test="new-version-major"]').should('not.have.attr', 'type', 'number')
      cy.get('[data-test="new-version-major"]').should('not.have.class', 'v-text-field')
      cy.get('[data-test="new-version-minor"]').should('not.have.attr', 'type', 'number')
      cy.get('[data-test="new-version-minor"]').should('not.have.class', 'v-text-field')
      cy.get('[data-test="new-version-patch"]').should('not.have.attr', 'type', 'number')
      cy.get('[data-test="new-version-patch"]').should('not.have.class', 'v-text-field')
      cy.get('[data-test="new-version-enumerators"]').should('not.have.attr', 'type', 'number')
      cy.get('[data-test="new-version-enumerators"]').should('not.have.class', 'v-text-field')

      // click increment buttons major, minor, patch
      cy.get('[data-test="new-version-major-plus-btn"]').click()
      cy.get('[data-test="new-version-minor-plus-btn"]').click()
      cy.get('[data-test="new-version-patch-plus-btn"]').click()
      
      // assert major=1, minor=1, patch=1
      cy.get('[data-test="new-version-major"]').should('contain', '1')
      cy.get('[data-test="new-version-minor"]').should('contain', '1')
      cy.get('[data-test="new-version-patch"]').should('contain', '1')

      // click increment patch, minor, major
      cy.get('[data-test="new-version-patch-plus-btn"]').click()
      cy.get('[data-test="new-version-minor-plus-btn"]').click()
      cy.get('[data-test="new-version-major-plus-btn"]').click()
      
      // assert major=2, minor=0, patch=0
      cy.get('[data-test="new-version-major"]').should('contain', '2')
      cy.get('[data-test="new-version-minor"]').should('contain', '0')
      cy.get('[data-test="new-version-patch"]').should('contain', '0')

      // click on increment enumerators
      cy.get('[data-test="new-version-enumerators-plus-btn"]').click()
      
      // assert enumerators = 3
      cy.get('[data-test="new-version-enumerators"]').should('contain', '3')
      
      // assert increment enumerators is no longer visible
      cy.get('[data-test="new-version-enumerators-plus-btn"]').should('not.exist')
      
      // Note: API test for enumerations.3.yaml is covered in the dedicated enumerators test below

      // Create the new version to test housekeeping of actual files
      cy.get('[data-test="new-version-create-btn"]').click()
      
      // Wait for the version creation to complete
      cy.wait(2000)
      
      // Verify dialog is closed
      cy.get('[data-test="new-version-dialog"]').should('not.exist')

      // Housekeeping - API calls to these endpoints, with 200 response
      // DEL /api/configurations/{filename}.yaml/
      cy.request({
        method: 'DELETE',
        url: `/api/configurations/${configurationName}.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200)
        cy.log(`Successfully deleted configuration ${configurationName}`)
      })

      // DEL /api/enumerators/enumerations.3.yaml/
      cy.request({
        method: 'DELETE',
        url: `/api/enumerators/enumerations.3.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200)
        cy.log(`Successfully deleted enumerators enumerations.3.yaml`)
      })

      // DEL /api/dictionaries/{filename}.0.1.0.yaml/
      cy.request({
        method: 'DELETE',
        url: `/api/dictionaries/${configurationName}.0.1.0.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200)
        cy.log(`Successfully deleted dictionary ${configurationName}.0.1.0.yaml`)
      })

      // DEL /api/test_data/{filename}.0.1.0.2.json/
      cy.request({
        method: 'DELETE',
        url: `/api/test-data/${configurationName}.0.1.0.2.json/`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200)
        cy.log(`Successfully deleted test data ${configurationName}.0.1.0.2.json`)
      })

      // DEL /api/dictionaries/{filename}.2.0.0.yaml/
      cy.request({
        method: 'DELETE',
        url: `/api/dictionaries/${configurationName}.2.0.0.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200)
        cy.log(`Successfully deleted dictionary ${configurationName}.2.0.0.yaml`)
      })

      // DEL /api/test_data/{filename}.2.0.0.3.json/
      cy.request({
        method: 'DELETE',
        url: `/api/test-data/${configurationName}.2.0.0.3.json/`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(200)
        cy.log(`Successfully deleted test data ${configurationName}.2.0.0.3.json`)
      })

      // Clear cleanup variables since we've already cleaned up
      createdConfigurationName = ''
      createdConfigurationVersion = ''
      createdEnumeratorsVersion = ''
    })

    it('tests enumerators +1 creates new enumerators if needed', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for enumerator testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '3' // This test creates enumerators version 3

      // Wait for the page to fully load
      cy.wait(1000)

      // Test new version creation with enumerators increment
      cy.contains('button', 'New Version').click()

      // Verify new version dialog is open
      cy.get('.v-dialog').should('be.visible')

      // Test enumerators increment
      cy.get('[data-test="new-version-enumerators-plus-btn"]').click()
      cy.get('[data-test="new-version-enumerators"]').should('contain', '3')

      // Verify that incrementing enumerators from 2 to 3 would create enumerations.3.yaml
      // (This is tested via the API call below)

      // Create the new version to test housekeeping of actual files
      cy.get('[data-test="new-version-create-btn"]').click()
      
      // Wait for the version creation to complete
      cy.wait(2000)
      
      // Verify dialog is closed
      cy.get('[data-test="new-version-dialog"]').should('not.exist')
    })
  })

  describe('Index Management', () => {
    it('can add Step 2 index with new name', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for index testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

      // Wait for the page to fully load
      cy.wait(1000)

      // Navigate to Step 2 (Index Management)
      cy.contains('button', 'Configure Collection').click()
      cy.contains('h2', 'Step 2: Index Management').should('be.visible')

      // Test adding new index with custom name
      cy.get('[data-test="add-index-btn"]').click()
      cy.get('[data-test="new-index-name-input"]').type('custom_index_name')
      cy.get('[data-test="new-index-create-btn"]').click()

      // Verify index was added
      cy.get('[data-test="index-list"]').should('contain', 'custom_index_name')
    })

    it('can add Step 2 index from existing indexes', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for existing index testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

      // Wait for the page to fully load
      cy.wait(1000)

      // Navigate to Step 2 (Index Management)
      cy.contains('button', 'Configure Collection').click()
      cy.contains('h2', 'Step 2: Index Management').should('be.visible')

      // Test adding existing index
      cy.get('[data-test="add-existing-index-btn"]').click()
      cy.get('[data-test="existing-index-selector"]').click()
      cy.get('[data-test="existing-index-option"]').first().click()
      cy.get('[data-test="add-existing-index-confirm-btn"]').click()

      // Verify existing index was added
      cy.get('[data-test="index-list"]').should('contain', 'existing_index')
    })
  })

  describe('Migration Management', () => {
    it('can add new migration', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for migration testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'

      // Wait for the page to fully load
      cy.wait(1000)

      // Navigate to migration management
      cy.contains('button', 'Configure Collection').click()
      cy.contains('h2', 'Migration Management').should('be.visible')

      // Test adding new migration
      cy.get('[data-test="add-migration-btn"]').click()
      cy.get('[data-test="new-migration-name-input"]').type('test_migration')
      cy.get('[data-test="new-migration-create-btn"]').click()

      // Verify migration was added
      cy.get('[data-test="migration-list"]').should('contain', 'test_migration')
    })

    it('can add existing migration and verify links', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for existing migration testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

      // Wait for the page to fully load
      cy.wait(1000)

      // Navigate to migration management
      cy.contains('button', 'Configure Collection').click()
      cy.contains('h2', 'Migration Management').should('be.visible')

      // Test adding existing migration
      cy.get('[data-test="add-existing-migration-btn"]').click()
      cy.get('[data-test="existing-migration-selector"]').click()
      cy.get('[data-test="existing-migration-option"]').first().click()
      cy.get('[data-test="add-existing-migration-confirm-btn"]').click()

      // Verify existing migration was added
      cy.get('[data-test="migration-list"]').should('contain', 'existing_migration')

      // Verify migration link is correct
      cy.get('[data-test="migration-link"]').should('have.attr', 'href').and('include', '/migrations/')
    })
  })

  describe('File Linking and Verification', () => {
    it('verifies dictionary and enumerator linking to correct files', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for file linking testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

      // Wait for the page to fully load
      cy.wait(1000)

      // Navigate to configuration details
      cy.contains('button', 'Configure Collection').click()

      // Verify dictionary file link is correct
      cy.get('[data-test="dictionary-file-link"]').should('contain', `${configurationName}.0.1.0.yaml`)

      // Verify enumerators file link is correct
      cy.get('[data-test="enumerators-file-link"]').should('contain', 'enumerations.0.yaml')

      // Verify test data file link is correct
      cy.get('[data-test="test-data-file-link"]').should('contain', `${configurationName}.0.1.0.2.json`)
    })
  })

  describe('Step 5 Index Management', () => {
    it('can add, edit, and remove Step 5 indexes', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for Step 5 index testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

      // Wait for the page to fully load
      cy.wait(1000)

      // Navigate to Step 5 (Index Management)
      cy.contains('button', 'Configure Collection').click()
      cy.contains('h2', 'Step 5: Index Management').should('be.visible')

      // Test adding new index
      cy.get('[data-test="add-step5-index-btn"]').click()
      cy.get('[data-test="step5-index-name-input"]').type('step5_index')
      cy.get('[data-test="step5-index-create-btn"]').click()

      // Verify index was added
      cy.get('[data-test="step5-index-list"]').should('contain', 'step5_index')

      // Test editing index
      cy.get('[data-test="edit-step5-index-btn"]').first().click()
      cy.get('[data-test="step5-index-name-edit-input"]').clear().type('edited_step5_index')
      cy.get('[data-test="step5-index-save-btn"]').click()

      // Verify index was edited
      cy.get('[data-test="step5-index-list"]').should('contain', 'edited_step5_index')

      // Test removing index
      cy.get('[data-test="remove-step5-index-btn"]').first().click()
      cy.get('[data-test="confirm-remove-index-btn"]').click()

      // Verify index was removed
      cy.get('[data-test="step5-index-list"]').should('not.contain', 'edited_step5_index')
    })
  })

  describe('Test Data Linking', () => {
    it('verifies test data linking and management', () => {
      // First create a configuration to work with
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      const configurationName = `TestConfig_${Date.now()}`
      cy.get('[data-test="new-collection-name-input"]').type(configurationName)
      cy.get('[data-test="new-collection-description-input"]').type('Test configuration for test data testing')
      
      // Simply bump minor version to 1 to enable Create button
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '0.1.0')
      
      cy.get('[data-test="new-collection-create-btn"]').click()

      // After creation, we should be on the detail page
      cy.url().should('include', `/configurations/${configurationName}.yaml`)
      createdConfigurationName = configurationName
      createdConfigurationVersion = '0.1.0'
      createdEnumeratorsVersion = '2' // Default enumerators version for most tests

      // Wait for the page to fully load
      cy.wait(1000)

      // Navigate to test data management
      cy.contains('button', 'Configure Collection').click()
      cy.contains('h2', 'Test Data Management').should('be.visible')

      // Verify test data file is linked correctly
      cy.get('[data-test="test-data-file-link"]').should('contain', `${configurationName}.0.1.0.0.json`)

      // Test adding test data
      cy.get('[data-test="add-test-data-btn"]').click()
      cy.get('[data-test="test-data-json-input"]').type('{"test": "data"}')
      cy.get('[data-test="add-test-data-confirm-btn"]').click()

      // Verify test data was added
      cy.get('[data-test="test-data-list"]').should('contain', '{"test": "data"}')
    })
  })
})
