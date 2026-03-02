import { resetEnumeratorsToV0 } from '../support/helpers'

describe('User Journey - Create, configure, revise, and re-configure a new collection', () => {
  let collectionName: string
  let Version1: string
  let EnumeratorsVersion1: string
  let Version2: string
  let EnumeratorsVersion2: string

  // Reset enumerators to v0 and remove Journey1 if it exists (allows re-run; assumes API is already running)
  before(() => {
    resetEnumeratorsToV0()
    // Remove Journey1 from a previous run so create can succeed
    cy.request({ method: 'DELETE', url: '/api/configurations/Journey1.yaml/', failOnStatusCode: false })
    cy.request({ method: 'DELETE', url: '/api/dictionaries/Journey1.1.0.0.yaml/', failOnStatusCode: false })
    cy.request({ method: 'DELETE', url: '/api/test_data/Journey1.1.0.0.0.json/', failOnStatusCode: false })
    cy.request({ method: 'DELETE', url: '/api/dictionaries/Journey1.2.0.0.yaml/', failOnStatusCode: false })
    cy.request({ method: 'DELETE', url: '/api/test_data/Journey1.2.0.0.1.json/', failOnStatusCode: false })
    cy.request({ method: 'DELETE', url: '/api/migrations/names_to_full_name.json/', failOnStatusCode: false })
  })

  describe('User Journey Part 1 - Create and configure a new collection', () => {
    it('creates a new configuration', () => {
      collectionName = 'Journey1'
      Version1 = '1.0.0'
      EnumeratorsVersion1 = '0'
      Version2 = '2.0.0'
      EnumeratorsVersion2 = '1'

      cy.visit('/dictionaries')
      cy.get('[data-test="new-collection-btn"]').click()
      cy.get('[data-test="new-collection-name-input"]').find('input').type(collectionName)
      cy.get('[data-test="new-collection-description-input"]').find('input').type('User Journey 1 Collection')
      cy.get('[data-test="new-collection-create-btn"]').click()
      cy.url().should('include', `/dictionaries/${collectionName}.${Version1}.yaml`)
      cy.get('[data-test="root-description-input"]').find('input').should('have.value', 'User Journey 1 Collection')
    })
    
    it('updates the dictionary', () => {
      // Follow the dictionary link
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="dictionary-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/dictionaries/${collectionName}.${Version1}.yaml`)

      // api_playground template: _id, name, description, status, created, last_saved (6 props). Add last_name (7 total).
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
      cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'Object')
      cy.get('[data-test="add-property-btn"]').should('be.visible').click()
      cy.get('[data-test="property-name-input"]').should('have.length.at.least', 7)

      // 0: _id (identifier)
      cy.get('[data-test="property-name-input"]').eq(0).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(0).find('input').clear().type('_id')
      cy.get('[data-test="description-input"]').eq(0).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(0).find('input').clear().type('Unique identifier for the document')
      cy.get('[data-test="type-chip"]').eq(1).should('be.visible').click()
      cy.get('[data-test="custom-type-name-identifier.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(1).should('contain', 'identifier')
      cy.get('[data-test="required-toggle-btn"]').eq(0).should('be.visible').click()
      cy.get('[data-test="required-toggle-btn"]').eq(0).find('.material-symbols-outlined').invoke('text').then((text) => {
        expect(text).to.match(/toggle_on|toggle_off/)
      })

      // 1: name -> first_name (template has name/word)
      cy.get('[data-test="property-name-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('first_name')
      cy.get('[data-test="description-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('First Name of the person')

      // 2: description (template has sentence) - keep
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'description')

      // 3: status (template has enum default_status)
      cy.get('[data-test="property-name-input"]').eq(3).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(3).find('input').clear().type('status')
      cy.get('[data-test="description-input"]').eq(3).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(3).find('input').clear().type('Status of the person')
      cy.get('[data-test="type-chip"]').eq(4).should('be.visible').click()
      cy.get('[data-test="built-in-type-enum"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(4).should('contain', 'Enum')
      cy.get('[data-test="enum-type-chip"]').should('be.visible').click()
      cy.get('[data-test="enum-type-option-name-default_status"]').should('be.visible').click()
      cy.get('[data-test="enum-type-chip"]').should('contain', 'default_status')

      // 4: created (template has breadcrumb) - keep
      cy.get('[data-test="property-name-input"]').eq(4).find('input').should('have.value', 'created')

      // 5: last_saved (template has breadcrumb)
      cy.get('[data-test="property-name-input"]').eq(5).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(5).find('input').clear().type('last_saved')
      cy.get('[data-test="description-input"]').eq(5).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(5).find('input').clear().type('Last Saved Breadcrumb')
      cy.get('[data-test="type-chip"]').eq(6).should('be.visible').click()
      cy.get('[data-test="custom-type-name-breadcrumb.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-chip"]').eq(6).should('contain', 'breadcrumb')

      // 6: last_name (new property)
      cy.get('[data-test="property-name-input"]').eq(6).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(6).find('input').clear().type('last_name')
      cy.get('[data-test="description-input"]').eq(6).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(6).find('input').clear().type('Last Name of the person')
      cy.get('[data-test="type-chip"]').eq(7).should('be.visible').click()
      cy.get('[data-test="custom-type-name-word.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(7).should('contain', 'word')

      // Verify persistence
      cy.reload()
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'Object')
      cy.get('[data-test="type-chip"]').eq(1).should('contain', 'identifier')
      cy.get('[data-test="type-chip"]').eq(2).should('contain', 'word')
      cy.get('[data-test="type-chip"]').eq(4).should('contain', 'Enum')
      cy.get('[data-test="enum-type-value"]').eq(0).should('contain', 'default_status')
      cy.get('[data-test="type-chip"]').eq(6).should('contain', 'breadcrumb')
      cy.get('[data-test="type-chip"]').eq(7).should('contain', 'word')
      cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', '_id')
      cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'first_name')
      cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'description')
      cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'status')
      cy.get('[data-test="property-name-input"]').eq(4).find('input').should('have.value', 'created')
      cy.get('[data-test="property-name-input"]').eq(5).find('input').should('have.value', 'last_saved')
      cy.get('[data-test="property-name-input"]').eq(6).find('input').should('have.value', 'last_name')
    })

    it('updates the enumerators', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="enumerators-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/enumerators/enumerations.${EnumeratorsVersion1}`)

      // Unlock the enumerator if locked (must do before opening detail - Add button is hidden when locked)
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="unlock-btn"]').length > 0) {
          cy.get('[data-test="unlock-btn"]').click()
          cy.get('[data-test="unlock-dialog-unlock-btn"]').should('exist').click()
        }
      })

      // Open default_status enumeration (cards page -> detail page)
      cy.get('[data-test="enumeration-card-default_status"]').should('be.visible').click()
      cy.url().should('include', '/enumerators/')
      cy.url().should('include', '/default_status')

      // Add a new value (enumerations.0 default_status has active, archived; we add draft at index 2)
      cy.get('[data-test="add-enum-value-btn"], [data-test="add-enum-value-empty-btn"]').first().click()
      cy.get('[data-test="enum-value-input-2"]').should('be.visible').find('input').clear().type('draft')
      cy.get('[data-test="enum-value-input-2"] input').should('have.value', 'draft')
      cy.get('[data-test="enum-description-input-2"]').should('be.visible').find('input').clear().type('A Draft Status')
      cy.get('[data-test="enum-description-input-2"] input').should('have.value', 'A Draft Status')

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="enum-value-input-2"] input').should('have.value', 'draft')
      cy.get('[data-test="enum-description-input-2"] input').should('have.value', 'A Draft Status')
    })

    it('adds indexes', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)

      // Template has nameIndex (name: 1) but we renamed name->first_name. Edit to compound first_name+last_name.
      cy.get('[data-test="index-chip"]').contains('nameIndex').should('be.visible').click()
      cy.get('[data-test="step5-index-json-textarea"] textarea:not(.v-textarea__sizer)')
        .clear()
        .type('{"name": "nameIndex", "key": { "first_name": 1, "last_name": 1 }, "options": { "unique": true }}'
          , { parseSpecialCharSequences: false }
        )
      cy.get('[data-test="save-index-btn"]').should('be.visible').click()
      cy.get('[data-test="step5-indexes-content"]').should('be.visible').should('contain', 'nameIndex')

      // Verify persistence (template also has statusIndex, createdIndex, savedIndex)
      cy.reload()
      cy.get('[data-test="step5-indexes-content"]').should('contain', 'nameIndex')
      cy.get('[data-test="step5-indexes-content"]').should('contain', 'statusIndex')
    })

    it('creates some test data', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="test-data-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/test_data/${collectionName}.${Version1}.${EnumeratorsVersion1}.json`)

      // Template requires created, last_saved (breadcrumbs). Add test data conforming to schema.
      var test_document = {
        "_id": {"$oid": "000000000000000000000001"},
        "first_name": "John",
        "last_name": "Doe",
        "status": "active",
        "created": { from_ip: "127.0.0.1", by_user: "john.doe", at_time: { $date: "2021-01-01T01:23:45.678Z" }, correlation_id: "1234567890" },
        "last_saved": { from_ip: "127.0.0.1", by_user: "john.doe", at_time: { $date: "2021-01-01T01:23:45.678Z" }, correlation_id: "1234567890" }
      }
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false }).blur()
      cy.wait(300)

      // Add the second test data document
      test_document = {
        "_id": {"$oid": "000000000000000000000002"},
        "first_name": "Jane",
        "last_name": "Doe",
        "status": "archived",
        "created": { from_ip: "127.0.0.1", by_user: "jane.doe", at_time: { $date: "2021-01-02T01:23:45.678Z" }, correlation_id: "0987654321" },
        "last_saved": { from_ip: "127.0.0.1", by_user: "jane.doe", at_time: { $date: "2021-01-02T01:23:45.678Z" }, correlation_id: "0987654321" }
      }

      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false }).blur()
      cy.wait(300)

      // Add the third test data document
      test_document = {
        "_id": {"$oid": "000000000000000000000003"},
        "first_name": "Foo",
        "last_name": "Bar",
        "status": "draft",
        "created": { from_ip: "127.0.0.1", by_user: "jane.doe", at_time: { $date: "2021-01-02T01:23:45.678Z" }, correlation_id: "0987654321" },
        "last_saved": { from_ip: "127.0.0.1", by_user: "jane.doe", at_time: { $date: "2021-01-02T01:23:45.678Z" }, correlation_id: "0987654321" }
      }
      
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false }).blur()
      cy.wait(300)

      // Verify persistence
      cy.wait(500)
      cy.reload()
      cy.wait(500)
      
      // Expand and verify first document
      cy.get('[data-test="array-panel-title-0"]').should('be.visible').click()
      cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
      cy.get('[data-test="array-item-textarea-0"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000001"')
        .should('contain', '"first_name"').and('contain', '"John"')
      
      // Expand and verify second document
      cy.get('[data-test="array-panel-title-1"]').should('be.visible').click()
      cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
      cy.get('[data-test="array-item-textarea-1"]')
        .find('textarea')
        .first()
        .invoke('val')
        .should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000002"')
        .should('contain', '"first_name"').and('contain', '"Jane"')

      // Expand and verify third document
      cy.get('[data-test="array-panel-title-2"]').should('be.visible').click()
      cy.get('[data-test="array-item-textarea-2"]').should('be.visible')
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
      // Verify processing succeeded
      cy.get('body').should('satisfy', ($el) => {
        const text = $el.text()
        return /Processing Complete|Configuration Processed|Configuration processing completed/.test(text)
      })
      // Drill in to confirm 3 documents loaded
      cy.get('[data-test="card-header"]').should('be.visible').should('contain', 'CFG-09-PROCESS_ONE_CONFIGURATION').within(() => {
        cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
      })
      cy.get('[data-test="expanded-sub-events"]').eq(0).should('be.visible').within(() => {
        cy.contains('[data-test="card-header"]', 'CFG-05-Journey1.yaml').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })
      cy.get('[data-test="sub-event-card-PROCESS_VERSION-1.0.0.0"]').then(($card) => {
        if ($card.find('[data-test="expand-collapse-icon"]').length) {
          cy.wrap($card).find('[data-test="expand-collapse-icon"]').click()
        }
      })
      cy.get('[data-test="sub-event-card-PRO-06-LOAD_TEST_DATA"]').first().within(() => {
        cy.get('[data-test="expand-collapse-icon"]').click()
      })
      cy.get('[data-test="sub-event-card-MON-11"]').first().should('be.visible').within(() => {
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
      cy.contains('.v-chip', 'nameIndex').first().should('be.visible').click()
      cy.get('[data-test="drop-indexes-content"]').should('be.visible').should('contain', 'nameIndex')
    })

    it('updates the dictionary', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)
      cy.get('[data-test="dictionary-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/dictionaries/${collectionName}.${Version2}.yaml`)

      // Change first_name to full_name (index 1: _id, first_name, description, status, created, last_saved, last_name)
      cy.get('[data-test="property-name-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="property-name-input"]').eq(1).find('input').clear().type('full_name')
      cy.get('[data-test="description-input"]').eq(1).should('be.visible').click()
      cy.get('[data-test="description-input"]').eq(1).find('input').clear().type('A User Full Name')
      cy.get('[data-test="type-chip"]').eq(2).should('be.visible').click()
      cy.get('[data-test="custom-type-name-sentence.yaml"]').should('be.visible').click()
      cy.get('[data-test="type-chip"]').eq(2).should('contain', 'sentence')

      // Delete last_name (index 6)
      cy.get('[data-test="delete-property-btn"]').eq(6).should('be.visible').click()
    })

    it('updates the enumerators', () => {
      cy.visit(`/configurations/${collectionName}.yaml`)
      cy.url().should('include', `/configurations/${collectionName}.yaml`)
      cy.get('[data-test="active-version"]').should('contain', `${Version2}.${EnumeratorsVersion2}`)
      cy.get('[data-test="enumerators-file-chip"]').should('be.visible').click()
      cy.url().should('include', `/enumerators/enumerations.${EnumeratorsVersion2}`)

      // Unlock if locked (enumerations.1 is created locked when we create new version)
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="unlock-btn"]').length > 0) {
          cy.get('[data-test="unlock-btn"]').click()
          cy.get('[data-test="unlock-dialog-unlock-btn"]').should('exist').click()
        }
      })

      // Open default_status enumeration (enumerations.1 has active, archived, draft from copy; we add suspended at index 3)
      cy.get('[data-test="enumeration-card-default_status"]').should('be.visible').click()
      cy.url().should('include', '/enumerators/')
      cy.url().should('include', '/default_status')

      cy.get('[data-test="add-enum-value-btn"], [data-test="add-enum-value-empty-btn"]').first().click()
      cy.get('[data-test="enum-value-input-3"]').should('be.visible').find('input').clear().type('suspended')
      cy.get('[data-test="enum-value-input-3"] input').should('have.value', 'suspended')
      cy.get('[data-test="enum-description-input-3"]').should('be.visible').find('input').clear().type('A Suspended Account')
      cy.get('[data-test="enum-description-input-3"] input').should('have.value', 'A Suspended Account')

      // Verify persistence
      cy.wait(250)
      cy.reload()
      cy.get('[data-test="enum-value-input-3"] input').should('have.value', 'suspended')
      cy.get('[data-test="enum-description-input-3"] input').should('have.value', 'A Suspended Account')
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

      // Part 2 schema: _id, full_name, description, status, created, last_saved (last_name removed)
      var test_document = {
        "_id": {"$oid": "000000000000000000000004"},
        "full_name": "Dr. James Earl Ray II",
        "status": "suspended",
        "created": { from_ip: "127.0.0.1", by_user: "john.doe", at_time: { $date: "2021-01-01T01:23:45.678Z" }, correlation_id: "1234567890" },
        "last_saved": { from_ip: "127.0.0.1", by_user: "john.doe", at_time: { $date: "2021-01-01T01:23:45.678Z" }, correlation_id: "1234567890" }
      }
      cy.get('[data-test="add-item-btn"]').click()
      cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
        .type(JSON.stringify(test_document), { parseSpecialCharSequences: false }).blur()
      cy.wait(300)

      // Verify persistence
      cy.wait(500)
      cy.reload()
      cy.wait(500)
      
      // Expand and verify document
      cy.get('[data-test="array-panel-title-0"]').should('be.visible').click()
      cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
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
      // Verify processing succeeded
      cy.get('body').should('satisfy', ($el) => {
        const text = $el.text()
        return /Processing Complete|Configuration Processed|Configuration processing completed/.test(text)
      })
      // Drill in to confirm 1 document loaded (version 2.0.0.1)
      cy.get('[data-test="card-header"]').should('be.visible').should('contain', 'CFG-09-PROCESS_ONE_CONFIGURATION').within(() => {
        cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
      })
      cy.get('[data-test="expanded-sub-events"]').eq(0).should('be.visible').within(() => {
        cy.contains('[data-test="card-header"]', 'CFG-05-Journey1.yaml').within(() => {
          cy.get('[data-test="expand-collapse-icon"]').should('be.visible').click()
        })
      })
      cy.get('[data-test="sub-event-card-PROCESS_VERSION-2.0.0.1"]').then(($card) => {
        if ($card.find('[data-test="expand-collapse-icon"]').length) {
          cy.wrap($card).find('[data-test="expand-collapse-icon"]').click()
        }
      })
      cy.get('[data-test="sub-event-card-PRO-06-LOAD_TEST_DATA"]').eq(1).within(() => {
        cy.get('[data-test="expand-collapse-icon"]').click()
      })
      cy.get('[data-test="sub-event-card-MON-11"]').eq(1).should('be.visible').within(() => {
        cy.get('[data-test="event-data-json"]').should('be.visible').should('contain', '"documents_loaded": 1')
      })
    })
  })
})
