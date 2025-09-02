describe('Configurations page flow', () => {
  let createdConfigurationName: string
  let createdConfigurationVersion: string
  let createdEnumeratorsVersion: string
  let thingsToDelete: string[]
  
  beforeEach(() => {
    createdConfigurationName = `TestConfig_${Date.now()}`
    createdConfigurationVersion = '0.1.0'
    createdEnumeratorsVersion = '2'
    
    cy.visit('/configurations')
    cy.get('[data-test="new-collection-btn"]').click()
    cy.get('[data-test="new-collection-name-input"]').type(createdConfigurationName)
    cy.get('[data-test="new-collection-description-input"]').type('Test configuration for E2E testing')
    cy.get('[data-test="version-minor-plus-btn"]').click()
    cy.get('[data-test="version-display"]').should('contain', '0.1.0.2')
    cy.get('[data-test="new-collection-create-btn"]').click()

    thingsToDelete = []
    thingsToDelete.push(`/api/configurations/${createdConfigurationName}.yaml/`)
    thingsToDelete.push(`/api/dictionaries/${createdConfigurationName}.${createdConfigurationVersion}.yaml/`)
    thingsToDelete.push(`/api/test_data/${createdConfigurationName}.${createdConfigurationVersion}.${createdEnumeratorsVersion}.json/`)
  })

  afterEach(() => {
    thingsToDelete.forEach((thing) => {
      cy.request({
        method: 'DELETE',
        url: thing,
        failOnStatusCode: false
      })
    })
    cy.visit('/configurations')
    cy.get('.v-card').should('exist').should('have.length', 1)
  })

  describe('List Configurations Page Functionality', () => {
    it('loads configurations page and shows basic elements', () => {
      // Visit list configurations page
      cy.visit('/configurations')

      // Verify title and buttons
      cy.get('[data-test="page-title"]').should('contain', 'Collection Configurations')
      cy.get('[data-test="new-collection-btn"]').should('be.visible')
      cy.get('[data-test="configurations-file-list"]').should('exist')

      // Verify one existing configurations + one test configuration
      cy.get('.v-card').should('exist').should('have.length', 2)
    })

    it('can create a new configuration', () => {
      // Before Each created with the dialog
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.wait(500)

      // Verify default values
      // cy.get('[data-test="card-header"]').contains('Version:')
      cy.get('[data-test="active-version"]').should('contain', '0.1.0.2')
      cy.get('[data-test="dictionary-file-chip"]').should('contain', `${createdConfigurationName}.${createdConfigurationVersion}.yaml`)
      cy.get('[data-test="enumerators-file-chip"]').should('contain', 'enumerations.2.yaml')
      cy.get('[data-test="test-data-file-chip"]').should('contain', `${createdConfigurationName}.${createdConfigurationVersion}.${createdEnumeratorsVersion}.json`)
    })

    it('correctly patches version numbers', () => {
      // Visit configurations page
      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()

      // Verify dialog is ready
      cy.get('[data-test="new-collection-dialog"]').should('be.visible')
      cy.get('[data-test="version-major-display"]').should('contain', '0')
      cy.get('[data-test="version-minor-display"]').should('contain', '0')
      cy.get('[data-test="version-patch-display"]').should('contain', '0')
      cy.get('[data-test="version-display"]').should('contain', '0.0.0')

      // Verify patch down and up
      cy.get('[data-test="version-major-plus-btn"]').click()
      cy.get('[data-test="version-major-display"]').should('contain', '1')
      cy.get('[data-test="version-display"]').should('contain', '1.0.0')
      
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-minor-display"]').should('contain', '1')
      cy.get('[data-test="version-display"]').should('contain', '1.1.0')

      cy.get('[data-test="version-patch-plus-btn"]').click()
      cy.get('[data-test="version-patch-display"]').should('contain', '1')
      cy.get('[data-test="version-display"]').should('contain', '1.1.1')

      cy.get('[data-test="version-patch-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '1.1.2')

      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '1.2.0')


      cy.get('[data-test="version-major-plus-btn"]').click()
      cy.get('[data-test="version-display"]').should('contain', '2.0.0')

      // Close dialog without creating
      cy.get('[data-test="new-collection-cancel-btn"]').click()
      cy.get('[data-test="new-collection-dialog"]').should('not.exist')
    })
  })

  describe('Configuration Detail Page', () => {
    it('displays correct elements', () => {
      // First create a configuration
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)

      cy.get('[data-test="page-header"]').should('contain', createdConfigurationName)
      cy.get('[data-test="page-description"]').should('contain', 'Test configuration for E2E testing')
      cy.get('[data-test="page-description"]').should('contain', 'Test configuration for E2E testing')
      cy.get('[data-test="configure-collection-btn"]').should('be.enabled')
      cy.get('[data-test="delete-collection-btn"]').should('be.enabled')
      cy.get('[data-test="json-schema-btn"]').should('be.enabled')
      cy.get('[data-test="bson-schema-btn"]').should('be.enabled')

      cy.get('[data-test="card-header"]').should('contain', 'Version:')
      cy.get('[data-test="active-version"]').should('contain', `${createdConfigurationVersion}.${createdEnumeratorsVersion}`)
      cy.get('[data-test="new-version-btn"]').should('be.enabled')
      cy.get('[data-test="toggle-lock-btn"]').should('be.enabled')
      cy.get('[data-test="delete-version-btn"]').should('be.enabled')

      cy.get('[data-test="step1-name"]').should('contain', 'Step 1: Drop existing schema validation')
      cy.get('[data-test="step2-name"]').should('contain', 'Step 2: Drop the following indexes (none)')
      cy.get('[data-test="step3-name"]').should('contain', 'Step 3: Execute the following migrations (none)')
      cy.get('[data-test="step4-name"]').should('contain', 'Step 4: Apply Schema')
      cy.get('[data-test="dictionary-file-chip"]').should('contain', `${createdConfigurationVersion}.yaml`)
      cy.get('[data-test="enumerators-file-chip"]').should('contain', `enumerations.${createdEnumeratorsVersion}.yaml`)
      cy.get('[data-test="step5-name"]').should('contain', 'Step 5: Add these indexes (none)')
      cy.get('[data-test="step6-name"]').should('contain', 'Step 6: Load Test Data')
      cy.get('[data-test="test-data-file-chip"]').should('contain', `${createdConfigurationName}.${createdConfigurationVersion}.${createdEnumeratorsVersion}.json`)
    })

    it('displays correct version navigator icons', () => {
      // Create two new versions (0.1.1) and (0.1.2)
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get("[data-test='base-card-default']").should('exist')

      // Create two new versions (0.1.1) and (0.1.2)
      thingsToDelete.push(`/api/configurations/${createdConfigurationName}.0.1.1.yaml/`)
      thingsToDelete.push(`/api/dictionaries/${createdConfigurationName}.0.1.1.yaml/`)
      thingsToDelete.push(`/api/test_data/${createdConfigurationName}.0.1.1.${createdEnumeratorsVersion}.json/`)
      thingsToDelete.push(`/api/configurations/${createdConfigurationName}.0.1.2.yaml/`)
      thingsToDelete.push(`/api/dictionaries/${createdConfigurationName}.0.1.2.yaml/`)
      thingsToDelete.push(`/api/test_data/${createdConfigurationName}.0.1.2.${createdEnumeratorsVersion}.json/`)

      cy.get('[data-test="new-version-btn"]').click()
      cy.get('[data-test="new-version-dialog"]').should('be.visible')
      cy.get('[data-test="new-version-patch-plus-btn"]').click()
      cy.get('[data-test="new-version-create-btn"]').click()
      cy.get('[data-test="new-version-btn"]').click()
      cy.get('[data-test="new-version-dialog"]').should('be.visible')
      cy.get('[data-test="new-version-patch-plus-btn"]').click()
      cy.get('[data-test="new-version-create-btn"]').click()
      
      // Verify Previous and New Version buttons are visible and enabled
      cy.get('[data-test="active-version"]').should('contain', '0.1.2.2')
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"]').should('be.visible')
      cy.get('[data-test="previous-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="next-version-btn"]').should('not.exist')
      cy.get('[data-test="new-version-btn"]').should('exist')
      cy.get('[data-test="new-version-btn"]').should('be.visible')
      cy.get('[data-test="new-version-btn"]').should('not.be.disabled')

      // Move to version 0.1.1.2 and test navigator icons
      cy.get('[data-test="previous-version-btn"]').click()
      cy.get('[data-test="active-version"]').should('contain', '0.1.1.2')
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"]').should('be.visible')
      cy.get('[data-test="previous-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="next-version-btn"]').should('exist')
      cy.get('[data-test="next-version-btn"]').should('be.visible')
      cy.get('[data-test="next-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="new-version-btn"]').should('not.exist')

      // Move to version 0.1.0.2 and test navigator icons
      cy.get('[data-test="previous-version-btn"]').click()
      cy.get('[data-test="active-version"]').should('contain', '0.1.0.2')
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"]').should('be.visible')
      cy.get('[data-test="previous-version-btn"]').should('be.disabled')
      cy.get('[data-test="next-version-btn"]').should('exist')
      cy.get('[data-test="next-version-btn"]').should('be.visible')
      cy.get('[data-test="next-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="new-version-btn"]').should('not.exist')
    })

    it('can delete with confirmation', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="delete-collection-btn"]').click()
      cy.get('[data-test="delete-collection-dialog"]').should('be.visible')
      cy.get('[data-test="delete-collection-confirm-btn"]').click()
      cy.get('[data-test="delete-collection-dialog"]').should('not.exist')
    })
  })

  describe('New Version Management', () => {
    it('can create new version with patch logic', () => {
      // Arrange - very minimal assertions
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="new-version-btn"]').click()
      
      // Assert we are in Create New Version dialog
      cy.get('[data-test="new-version-dialog"]').should('be.visible')
      cy.get('[data-test="new-version-dialog-title"]').should('contain', 'Create New Version')
      // Verify patch down and up
      cy.get('[data-test="new-version-major-plus-btn"]').click()
      cy.get('[data-test="new-version-major"]').should('contain', '1')
      cy.get('[data-test="new-version-display"]').should('contain', '1.0.0.2')
      
      cy.get('[data-test="new-version-minor-plus-btn"]').click()
      cy.get('[data-test="new-version-minor"]').should('contain', '1')
      cy.get('[data-test="new-version-display"]').should('contain', '1.1.0.2')

      cy.get('[data-test="new-version-patch-plus-btn"]').click()
      cy.get('[data-test="new-version-patch"]').should('contain', '1')
      cy.get('[data-test="new-version-display"]').should('contain', '1.1.1.2')

      cy.get('[data-test="new-version-patch-plus-btn"]').click()
      cy.get('[data-test="new-version-patch"]').should('contain', '2')
      cy.get('[data-test="new-version-display"]').should('contain', '1.1.2.2')

      cy.get('[data-test="new-version-minor-plus-btn"]').click()
      cy.get('[data-test="new-version-minor"]').should('contain', '2')
      cy.get('[data-test="new-version-display"]').should('contain', '1.2.0.2')

      cy.get('[data-test="new-version-major-plus-btn"]').click()
      cy.get('[data-test="new-version-major"]').should('contain', '2')
      cy.get('[data-test="new-version-display"]').should('contain', '2.0.0.2')

      // Close dialog without creating
      cy.get('[data-test="new-version-cancel-btn"]').click()
      cy.get('[data-test="new-version-dialog"]').should('not.exist')
    })

    it('creates new enumerators if needed', () => {
      // First open the test configuration, and new version dialog
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="new-version-btn"]').click()
      cy.get('[data-test="new-version-dialog"]').should('be.visible')

      // click on increment enumerators
      cy.get('[data-test="new-version-enumerators-plus-btn"]').click()
      cy.get('[data-test="new-version-enumerators"]').should('contain', '3')
      cy.get('[data-test="new-version-enumerators-plus-btn"]').should('not.exist')
      cy.get('[data-test="new-version-create-btn"]').click()
      cy.wait(500)
      cy.get('[data-test="new-version-dialog"]').should('not.exist')
      
      // Verify enumerations.3.yaml was created
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.url().should('contain', '/enumerators/enumerations.3.yaml')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')

      // Add things to delete
      thingsToDelete.push(`/api/enumerators/enumerations.3.yaml/`)
      thingsToDelete.push(`/api/dictionaries/${createdConfigurationName}.0.1.0.yaml/`)
      thingsToDelete.push(`/api/test_data/${createdConfigurationName}.0.1.0.3.json/`)
    })
  })

  describe('Step2: Drop Indexes', () => {
    it('can add and delete index with new name', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)

      // Test adding new index with custom name
      cy.get('[data-test="add-drop-index-btn"]').click()
      cy.get('[data-test="drop-index-name-input"]').type('custom_index_name')
      cy.get('[data-test="drop-index-create-btn"]').click()

      // Verify index was added - wait for the content to appear within the card
      cy.get('[data-test="drop-indexes-card"]').within(() => {
        cy.get('[data-test="drop-indexes-content"]').should('be.visible')
        cy.get('[data-test="drop-indexes-content"]').should('contain', 'custom_index_name')
      })

      // Test deleting index
      cy.get('[data-test="remove-drop-index-btn"]').first().click()

      // Verify index was deleted - the content div should not exist when no indexes remain
      cy.get('[data-test="drop-indexes-content"]').should('not.exist')

    })

    it('can add and delete an index from existing indexes', () => {
      // Add a index to the current version (so it exists as "previously created")
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="add-index-btn"]').click()
      cy.get('[data-test="step5-json-editor-container"]').should('be.visible')
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').clear().type('{"name": "test_index_name", "key": {"field": 1}, "options": {}}', { parseSpecialCharSequences: false })
      cy.get('[data-test="save-index-btn"]').should('be.enabled')
      cy.get('[data-test="save-index-btn"]').click()
      cy.get('[data-test="step-5-card"]').within(() => {
        cy.get('[data-test="step5-indexes-content"]').should('contain', 'test_index_name')
      })

      // Create a new version
      cy.get('[data-test="new-version-btn"]').click()
      cy.get('[data-test="new-version-dialog"]').should('be.visible')
      cy.get('[data-test="new-version-minor-plus-btn"]').click()
      cy.get('[data-test="new-version-create-btn"]').click()
      thingsToDelete.push(`/api/dictionaries/${createdConfigurationName}.0.2.0.yaml/`)
      thingsToDelete.push(`/api/test_data/${createdConfigurationName}.0.2.0.${createdEnumeratorsVersion}.json/`)

      // Test adding drop index by selecting previously created index
      cy.get('[data-test="add-drop-index-btn"]').click()
      cy.get('[data-test="drop-index-name-input"]').should('be.visible')
      cy.get('[data-test="step5-json-editor-container"]').should('not.exist') // Make sure we're in the right dialog
      cy.contains('.v-chip', 'test_index_name').should('be.visible').click()
      cy.get('[data-test="drop-indexes-card"]').within(() => {
        cy.get('[data-test="drop-indexes-content"]').should('be.visible')
        cy.get('[data-test="drop-indexes-content"]').should('contain', 'test_index_name')
      })

      // Test deleting the drop index
      cy.get('[data-test="remove-drop-index-btn"]').first().click()
      cy.get('[data-test="drop-indexes-content"]').should('not.exist')
    })
  })

  describe('Step3 Migration Management', () => {
    it('can add, link, and delete new migration', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      // Test adding new migration
      cy.get('[data-test="add-migration-btn"]').click()
      cy.get('[data-test="new-migration-name-input"]').type('test_migration')
      cy.get('[data-test="new-migration-create-btn"]').click()

      // Verify migration was added
      cy.get('[data-test="migrations-content"]').should('contain', 'test_migration')

      // Verify chip links to migration detail page
      cy.get('[data-test="migration-chip"]').first().click()
      cy.url().should('include', `/migrations/test_migration.json`)

      // Add things to delete
      thingsToDelete.push(`/api/migrations/test_migration.json/`)
    })

    it('can add, link, and delete existing migration', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="add-migration-btn"]').click()
      cy.get('[data-test="new-migration-existing-migrations"]').first()
      .contains('first_last_to_full_name.json').click()

      // Verify migration was added
      cy.get('[data-test="migrations-content"]').should('contain', 'first_last_to_full_name.json')

      // Verify chip links to migration detail page
      cy.get('[data-test="migration-chip"]').first().click()
      cy.url().should('include', `/migrations/first_last_to_full_name.json`)
    })

  })

  describe('Step4: Schema Links', () => {
    it('links to the correct schema file', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="dictionary-file-chip"]').should('contain', `${createdConfigurationName}.${createdConfigurationVersion}.yaml`)
      cy.get('[data-test="dictionary-file-chip"]').click()
      cy.url().should('include', `/dictionaries/${createdConfigurationName}.${createdConfigurationVersion}.yaml`)
    })

    it('links to the correct enumerators file', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="enumerators-file-chip"]').should('contain', `enumerations.${createdEnumeratorsVersion}.yaml`)
      cy.get('[data-test="enumerators-file-chip"]').click()
      cy.url().should('include', `/enumerators/enumerations.${createdEnumeratorsVersion}.yaml`)
    })
  })

  describe('Step 5 Index Management', () => {
    it('can add, edit, and remove indexes', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      // Test adding new index
      cy.get('[data-test="add-index-btn"]').click()
      
      // Verify dialog is open
      cy.get('[data-test="step5-json-editor-container"]').should('be.visible')
      
      // Verify dialog shows default JSON structure - target the main textarea (exclude sizer)
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').invoke('val').should('contain', '"name": ""')
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').invoke('val').should('contain', '"key": {}')
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').invoke('val').should('contain', '"options": {}')
      
      // Test validation - try to save without a name
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').clear().type('{"key": {}, "options": {}}', { parseSpecialCharSequences: false })
      cy.get('[data-test="save-index-btn"]').should('be.disabled')
      
      // Test validation - try to save with invalid JSON
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').clear().type('invalid json')
      cy.get('[data-test="save-index-btn"]').should('be.disabled')
      
      // Edit the JSON to set the name
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').clear().type('{"name": "name1", "key": {}, "options": {}}', { parseSpecialCharSequences: false })
      cy.get('[data-test="save-index-btn"]').should('be.enabled')
      cy.get('[data-test="save-index-btn"]').click()

      // Verify index was added - wait for the content to appear within the card
      cy.get('[data-test="step-5-card"]').within(() => {
        cy.get('[data-test="step5-indexes-content"]').should('contain', 'name1')
      })

      // Test editing index
      cy.get('[data-test="index-chip"]').first().click()
      
      // Verify dialog shows current JSON
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').invoke('val').should('contain', '"name": "name1"')
      
      // Edit the JSON to change the name
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)').clear().type('{"name": "edited_name", "key": {}, "options": {}}', { parseSpecialCharSequences: false })
      cy.get('[data-test="save-index-btn"]').click()

      // Verify index was edited - chip should show new name
      cy.get('[data-test="step-5-card"]').within(() => {
        cy.get('[data-test="step5-indexes-content"]').should('contain', 'edited_name')
      })

      // Test removing index with x button
      cy.get('[data-test="delete-index-btn"]').first().click()

      // Verify index was removed
      cy.get('[data-test="step5-indexes-content"]').should('not.contain', 'edited_name')
    })
  })

  describe('Step6: Load Test Data', () => {
    it('links to the correct test data file', () => {
      cy.visit(`/configurations/${createdConfigurationName}.yaml`)
      cy.get('[data-test="test-data-file-chip"]').should('contain', `${createdConfigurationName}.${createdConfigurationVersion}.${createdEnumeratorsVersion}.json`)
    })
  })
})
