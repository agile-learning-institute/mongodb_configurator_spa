describe('User Journey - Create, configure, revise, and re-configure a new collection', () => {
  let collectionName: string
  let Version1: string
  let EnumeratorsVersion1: string
  let Version2: string
  let EnumeratorsVersion2: string

  // Reset backend
  before(() => {
    cy.exec('npm run service', { failOnNonZeroExit: true, timeout: 120000 })
    cy.wait(1000)
  })

  // Clean up 
  after(() => {
    const filesToDelete = [
      `configurations/${collectionName}.yaml`, 
      `dictionaries/${collectionName}.${Version1}.yaml`, 
      `test_data/${collectionName}.${Version1}.${EnumeratorsVersion1}.json`,
      `dictionaries/${collectionName}.${Version2}.yaml`, 
      `migrations/${collectionName}.names_to_full_name.yaml`,
      `test_data/${collectionName}.${Version2}.${EnumeratorsVersion2}.json`
    ]
    filesToDelete.forEach((file) => {
      // cy.request({method: 'PUT', url: `/api/${file}/`, body: {"_locked": false, "root": {"name":""}}, failOnStatusCode: false})
      // cy.request({method: 'DELETE', url: `/api/${file}/`, failOnStatusCode: false})
    })
  })

  describe('User Journey Part 1 - Create and configure a new collection', () => {
    it('sets up empty enumerators', () => {
      const filesToDelete = ["enumerations.1.yaml", "enumerations.2.yaml", "enumerations.3.yaml", "enumerations.4.yaml"]
      filesToDelete.forEach((file) => {
        cy.request({method: 'PUT', url: `/api/enumerators/${file}/`, body: {"_locked": false}, failOnStatusCode: false})
        cy.request({method: 'DELETE', url: `/api/enumerators/${file}/`, failOnStatusCode: false})
      })
    })

    it('creates a new configuration', () => {
      collectionName = 'Journey1'
      Version1 = '0.1.0'
      EnumeratorsVersion1 = '0'
      Version2 = '1.0.0'
      EnumeratorsVersion2 = '1'

      cy.visit('/configurations')
      cy.get('[data-test="new-collection-btn"]').click()
      cy.get('[data-test="new-collection-name-input"]').find('input').type(collectionName)
      cy.get('[data-test="new-collection-description-input"]').find('input').type('User Journey 1 Collection')
      cy.get('[data-test="version-minor-plus-btn"]').click()
      cy.get('[data-test="new-collection-create-btn"]').click()
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="page-header"]').find('textarea').should('have.value', 'User Journey 1 Collection')
    })
    
    it('updates the dictionary', () => {
      // Follow the dictionary link
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="dictionary-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/dictionaries/${collectionName}.${Version1}.yaml`)

      // Set root type to Object and add 2 properties (making 5 total)
      cy.get('[data-test="type-chip"]').eq(0).should('be.visible').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(0).should('be.visible').should('contain', 'Object')
      cy.get('[data-test="add-property-btn"]').should('be.visible').click().click()
      cy.get('[data-test="property-name-input"]').should('have.length', 5)

      // Add the ID property
      cy.get('[data-test="property-name-input"]').eq(0).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').clear().type('_id')
      cy.get('[data-test="description-input"]').eq(0).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(0).find('input').clear().type('Unique identifier for the document')
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('be.visible').click()
      cy.get('[data-test="custom-type-name-identifier.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'identifier')
      cy.get('[data-test="required-toggle-btn"]').eq(0).should('be.visible').click()
      cy.get('[data-test="required-toggle-btn"]').eq(0).should('be.visible').should('contain', 'toggle_on')

      // Add the First Name property
      cy.get('[data-test="property-name-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('first_name')
      cy.get('[data-test="description-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('First Name of the person')    
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').should('be.visible').click()
      cy.get('[data-test="custom-type-name-word.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').should('contain', 'word')

      // Add the Last Name property
      cy.get('[data-test="property-name-input"]').eq(2).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(2).find('input').clear().type('last_name')
      cy.get('[data-test="description-input"]').eq(2).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(2).find('input').clear().type('Last Name of the person')
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').should('be.visible').click()
      cy.get('[data-test="custom-type-name-word.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').should('contain', 'word')

      // Add the Status property
      cy.get('[data-test="property-name-input"]').eq(3).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(3).find('input').clear().type('status')
      cy.get('[data-test="description-input"]').eq(3).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(3).find('input').clear().type('Status of the person')
      cy.get('[data-test="type-chip"]').eq(4).should('be.visible').should('be.visible').click()
      cy.get('[data-test="built-in-type-enum"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(4).should('be.visible').should('contain', 'Enum')
      cy.get('[data-test="enum-type-chip"]').should('be.visible').click()
      cy.get('[data-test="enum-type-option-name-default_status"]').should('be.visible').click()
      cy.get('[data-test="enum-type-chip"]').should('be.visible').should('contain', 'default_status')

      // Add the Last Saved property
      cy.get('[data-test="property-name-input"]').eq(4).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(4).find('input').clear().type('last_saved')
      cy.get('[data-test="description-input"]').eq(4).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(4).find('input').clear().type('Last Saved Breadcrumb')
      cy.get('[data-test="type-chip"]').eq(5).should('be.visible').should('be.visible').click()
      cy.get('[data-test="custom-type-name-breadcrumb.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(5).should('be.visible').should('contain', 'breadcrumb')

      // Verify persistence
      cy.reload()
      cy.get('[data-test="type-chip"]').eq(0).should('be.visible').should('contain', 'Object')
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'identifier')
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').should('contain', 'word')
      cy.get('[data-test="type-chip"]').eq(3).should('be.visible').should('contain', 'word')
      cy.get('[data-test="type-chip"]').eq(4).should('be.visible').should('contain', 'Enum')
      cy.get('[data-test="enum-type-value"]').eq(0).should('contain', 'default_status')
      cy.get('[data-test="type-chip"]').eq(5).should('be.visible').should('contain', 'breadcrumb')
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', '_id')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'first_name')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'last_name')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'status')
      cy.get('[data-test="property-name-input"]').eq(4).find('input').should('have.value', 'last_saved')
      cy.get('[data-test="description-input"]').eq(0).find('input').should('have.value', 'Unique identifier for the document')
      cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'First Name of the person')
      cy.get('[data-test="description-input"]').eq(2).find('input').should('have.value', 'Last Name of the person')
      cy.get('[data-test="description-input"]').eq(3).find('input').should('have.value', 'Status of the person')
      cy.get('[data-test="description-input"]').eq(4).find('input').should('have.value', 'Last Saved Breadcrumb')
    })

    it('updates the enumerators', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="enumerators-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/enumerators/enumerations.${EnumeratorsVersion1}`)

      // Unlock the enumerator
      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-btn"]').should('not.exist')

      // Add a new value to the default_status enumerator
      cy.get('[data-test="add-enum-value-btn-0"]').click()
      cy.get('[data-test="enum-value-input-0-2"]').should('be.visible').click()
      cy.get('[data-test="enum-value-input-0-2"]').type('draft')
      cy.get('[data-test="enum-value-input-0-2"] input').should('have.value', 'draft')
      cy.get('[data-test="enum-description-input-0-2"]').should('be.visible').click()
      cy.get('[data-test="enum-description-input-0-2"]').type('A Draft Status')
      cy.get('[data-test="enum-description-input-0-2"] input').should('have.value', 'A Draft Status')

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="enum-value-input-0-2"] input').should('have.value', 'draft')
      cy.get('[data-test="enum-description-input-0-2"] input').should('have.value', 'A Draft Status')
    })

    it('adds indexes', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      
      // Add the name index
      cy.get('[data-test="add-index-btn"]').should('be.visible').click()
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)')
        .clear()
        .type('{"name": "nameIndex", "key": { "first_name": 1, "last_name": 1 }, "options": { "unique": true }}'
          , { parseSpecialCharSequences: false }
        )
      cy.get('[data-test="save-index-btn"]').should('be.visible').click()
      cy.get('[data-test="step5-indexes-content"]').should('be.visible').should('contain', 'nameIndex')

      // Add the status index
      cy.get('[data-test="add-index-btn"]').should('be.visible').click()
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)')
        .clear()
        .type('{"name": "statusIndex", "key": { "status": 1 }, "options": { "unique": false }}', 
          { parseSpecialCharSequences: false }
        )
      cy.get('[data-test="save-index-btn"]').should('be.visible').click()
      cy.get('[data-test="step5-indexes-content"]').should('be.visible').should('contain', 'statusIndex')

      // Verify persistence
      cy.reload()
      cy.get('[data-test="step5-indexes-content"]').should('be.visible').should('contain', 'nameIndex')
      cy.get('[data-test="step5-indexes-content"]').should('be.visible').should('contain', 'statusIndex')
    })

    it('creates some test data', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="test-data-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/test_data/${collectionName}.${Version1}.${EnumeratorsVersion1}.json`)

      // Add the first test data document
      var test_document = {
        "_id": {"$oid": "000000000000000000000001"},
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "last_saved": {
          "from_ip": "127.0.0.1", 
          "by_user": "john.doe", 
          "at_time": {"$date": "2021-01-01T01:23:45.678Z"}, 
          "correlation_id": "1234567890"
        }
      }
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false })

      // Add the second test data document
      test_document = {
        "_id": {"$oid": "000000000000000000000002"}, 
        "first_name": "Jane", 
        "last_name": "Doe", 
        "status": "archived", 
        "last_saved": {
          "from_ip": "127.0.0.1", 
          "by_user": "jane.doe", 
          "at_time": {"$date": "2021-01-02T01:23:45.678Z"}, 
          "correlation_id": "0987654321"
        }
      }

      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false })

      // Add the third test data document
      test_document = {
        "_id": {"$oid": "000000000000000000000003"}, 
        "first_name": "Foo", 
        "last_name": "Bar", 
        "status": "draft", 
        "last_saved": {
          "from_ip": "127.0.0.1", 
          "by_user": "jane.doe", 
          "at_time": {"$date": "2021-01-02T01:23:45.678Z"}, 
          "correlation_id": "0987654321"
        }
      }
      
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false })

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="array-panel-title-0"] i').eq(1).should('be.visible').click()
      cy.get('[data-test="array-item-textarea-0"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000001"')
        .should('contain', '"first_name"').and('contain', '"John"')
      
      cy.get('[data-test="array-panel-title-1"] i').eq(1).should('be.visible').click()
      cy.get('[data-test="array-item-textarea-1"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000002"')
        .should('contain', '"first_name"').and('contain', '"Jane"')

      cy.get('[data-test="array-panel-title-2"] i').eq(1).should('be.visible').click()
      cy.get('[data-test="array-item-textarea-2"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000003"')
        .should('contain', '"first_name"').and('contain', '"Foo"')
    })

    it('configures the collection', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="configure-collection-btn"]').should('be.visible').click()

      cy.url().should('include', '/event-viewer')
      cy.get('body').should('not.contain', 'Loading...')

      // Find the Load Test Data event and verify 2 documents were loaded
      cy.get('[data-test="card-header"]').should('be.visible').should('contain', 'CFG-09-PROCESS_ONE_CONFIGURATION').within(() => {
        cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
      })

      cy.get('[data-test="expanded-sub-events"]').eq(0).should('be.visible').within(() => {
        cy.get('[data-test="card-header"]:contains("CFG-05-Journey1.yaml")').should('be.visible').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })

      cy.get('[data-test="expanded-sub-events"]').eq(1).should('be.visible').within(() => {
        cy.get('[data-test="card-header"]:contains("PROCESS_VERSION-0.1.0.0")').should('be.visible').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })

      cy.get('[data-test="expanded-sub-events"]').eq(2).should('be.visible').within(() => {
        cy.get('[data-test="card-header"]:contains("PRO-06-LOAD_TEST_DATA")').should('be.visible').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })

      cy.get('[data-test="sub-event-card-MON-11"]').should('be.visible').within(() => {
        cy.get('[data-test="event-data-json"]').should('be.visible').should('contain', '"documents_loaded": 3')
      })
    })
  })

  describe('User Journey Part 2 - Create and configure a new version of the collection', () => {
    it('creates a new version', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="new-version-btn"]').should('be.visible').click()
      cy.get('[data-test="new-version-major-plus-btn"]').should('be.visible').click()
      cy.get('[data-test="new-version-enumerators-plus-btn"]').should('be.visible').click()
      cy.get('[data-test="new-version-create-btn"]').click()
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)
    })

    it('drops a previously created index', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)

      cy.get('[data-test="add-drop-index-btn"]').click()
      cy.get('.v-chip:contains("nameIndex")').eq(0).should('be.visible').click()
      cy.get('[data-test="drop-indexes-content"]').should('be.visible').should('contain', 'nameIndex')
    })

    it('updates the dictionary', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)
      cy.get('[data-test="dictionary-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/dictionaries/${collectionName}.${Version2}.yaml`)

      // Change Name to Full Name
      cy.get('[data-test="property-name-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('full_name')
      cy.get('[data-test="description-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('A User Full Name')
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').should('be.visible').click()
      cy.get('[data-test="custom-type-name-sentence.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').should('contain', 'sentence')

      // Delete the Last Name property
      cy.get('[data-test="delete-property-btn"]').eq(2).should('be.visible').click()
    })

    it('updates the enumerators', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)
      cy.get('[data-test="enumerators-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/enumerators/enumerations.${EnumeratorsVersion2}.yaml`)

      // Add a new value to the default_status enumerator
      cy.get('[data-test="add-enum-value-btn-0"]').click()
      cy.get('[data-test="enum-value-input-0-3"]').should('be.visible').click()
      cy.get('[data-test="enum-value-input-0-3"]').type('suspended')
      cy.get('[data-test="enum-value-input-0-3"] input').should('have.value', 'suspended')
      cy.get('[data-test="enum-description-input-0-3"]').should('be.visible').click()
      cy.get('[data-test="enum-description-input-0-3"]').type('A Suspended Account')
      cy.get('[data-test="enum-description-input-0-3"] input').should('have.value', 'A Suspended Account')

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="enum-value-input-0-3"] input').should('have.value', 'suspended')
      cy.get('[data-test="enum-description-input-0-3"] input').should('have.value', 'A Suspended Account')
    })

    it('creates a migration', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)
      cy.get('[data-test="add-migration-btn"]').should('be.visible').click()

      // Create a new migration
      cy.get('[data-test="new-migration-name-input"]').type('names_to_full_name.json')
      cy.get('[data-test="new-migration-create-btn"]').click()
      cy.get('[data-test="migrations-content"]').should('contain', 'names_to_full_name.json')
      cy.get('[data-test="migration-chip"]').should('be.visible').click()
      cy.url().should('include', `/migrations/names_to_full_name.json`)

      // Add the first migration step
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-0"]')
        .find('textarea')
        .first()
        .clear()
        .type('{"$addFields": {"full_name": {"$concat": ["$first_name"," ","$last_name"]}}}', 
          { parseSpecialCharSequences: false })

      // Add the second migration step
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-1"]')
        .find('textarea')
        .first()
        .clear()
        .type('{"$unset": ["first_name","last_name"]}', 
          { parseSpecialCharSequences: false })

      // Add the third migration step
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-2"]')
        .find('textarea')
        .first()
        .clear()
        .type(`{"$out": "${collectionName}"}`, 
          { parseSpecialCharSequences: false })

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="array-panel-title-0"]').eq(0).should('be.visible').click()
      cy.get('[data-test="array-item-textarea-0"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"$addFields"').and('contain', '"full_name"')
      cy.get('[data-test="array-panel-title-1"]').eq(0).should('be.visible').click()
      cy.get('[data-test="array-item-textarea-1"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"first_name"').and('contain', '"last_name"')
      cy.get('[data-test="array-panel-title-2"]').eq(0).should('be.visible').click()
      cy.get('[data-test="array-item-textarea-2"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"$out"').and('contain', `"${collectionName}"`)
    })

    it('adds an index', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)
      
      // Add the fullName index
      cy.get('[data-test="add-index-btn"]').should('be.visible').click()
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)')
        .clear()
        .type('{"name": "fullNameIndex", "key": { "full_name": 1 }, "options": { "unique": true }}'
          , { parseSpecialCharSequences: false }
        )
      cy.get('[data-test="save-index-btn"]').should('be.visible').click()
      cy.get('[data-test="step5-indexes-content"]').should('be.visible').should('contain', 'fullNameIndex')

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="step5-indexes-content"]').should('be.visible').should('contain', 'fullNameIndex')
    })

    it('creates some test data', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="test-data-file-chip"]').should('be.visible').click()
      cy.url().should('include', `${collectionName}.${Version2}.${EnumeratorsVersion2}.json`)

      // Add the first test data document
      var test_document = {
        "_id": {"$oid": "000000000000000000000004"},
        "full_name": "Dr. James Earl Ray II",
        "status": "suspended",
        "last_saved": {
          "from_ip": "127.0.0.1", 
          "by_user": "john.doe", 
          "at_time": {"$date": "2021-01-01T01:23:45.678Z"}, 
          "correlation_id": "1234567890"
        }
      }
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false })

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="array-panel-title-0"] i').eq(1).should('be.visible').click()
      cy.get('[data-test="array-item-textarea-0"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000004"')
        .should('contain', '"full_name"').and('contain', '"Dr. James Earl Ray II"')
    })

    it('re-configures the collection', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="configure-collection-btn"]').should('be.visible').click()

      cy.url().should('include', '/event-viewer')
      cy.get('body').should('not.contain', 'Loading...')

      // Find the Load Test Data event and verify 2 documents were loaded
      cy.get('[data-test="card-header"]').should('be.visible').should('contain', 'CFG-09-PROCESS_ONE_CONFIGURATION').within(() => {
        cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
      })

      cy.get('[data-test="expanded-sub-events"]').eq(0).should('be.visible').within(() => {
        cy.get('[data-test="card-header"]:contains("CFG-05-Journey1.yaml")').should('be.visible').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })

      cy.get('[data-test="expanded-sub-events"]').eq(1).should('be.visible').within(() => {
        cy.get('[data-test="card-header"]:contains("PROCESS_VERSION-1.0.0.1")').should('be.visible').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })

      cy.get('[data-test="expanded-sub-events"]').eq(2).should('be.visible').within(() => {
        cy.get('[data-test="card-header"]:contains("PRO-06-LOAD_TEST_DATA")').should('be.visible').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })

      cy.get('[data-test="sub-event-card-MON-11"]').should('be.visible').within(() => {
        cy.get('[data-test="event-data-json"]').should('be.visible').should('contain', '"documents_loaded": 1')
      })
    })
  })
})
