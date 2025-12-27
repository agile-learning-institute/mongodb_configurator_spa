describe('Test Data detail page', () => {
  const name = `e2e-test-data-${Date.now()}`
  const fileName = `${name}.json`

  beforeEach(() => {
    cy.visit('/test_data')
    cy.get('[data-test="new-test-data-btn"]').click()
    cy.get('[data-test="new-test-data-dialog"]').should('be.visible')
    cy.get('[data-test="new-test-data-name-input"]').type(name)
    cy.get('[data-test="new-test-data-create-btn"]').click()

    cy.wait(250)
    cy.url().should('include', `/test_data/${fileName}`)

    // Set up initial structure with 2 test data documents
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"name":"John","age":30}', { parseSpecialCharSequences: false }).blur()

    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"name":"Jane","age":25}', { parseSpecialCharSequences: false }).blur()
  })

  afterEach(() => {
    cy.request({
      method: 'DELETE',
      url: `/api/test_data/${fileName}/`,
      failOnStatusCode: false
    })
  })

  it('has default values', () => {
    cy.visit(`/test_data/${fileName}`)

    cy.url().should('include', `/test_data/${fileName}`)
    cy.get('[data-test="card-title"]').should('contain', fileName)
    cy.get('[data-test="delete-file-btn"]').should('be.enabled')
    cy.get('[data-test="array-editor-title"]').should('contain', 'Test Data')
    cy.get('[data-test="add-item-btn"]').should('be.enabled')
    // File should have 2 documents from beforeEach
    cy.get('[data-test="array-item-label"]').should('have.length', 2)
  })

  it('can add test data', () => {
    cy.visit(`/test_data/${fileName}`)

    // Add third test data document
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-2"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Document 3')
    cy.get('[data-test="remove-item-btn-2"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-2"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().type('{"name":"Bob","age":35}', { parseSpecialCharSequences: false }).blur()

    // Reload and verify persistence
    cy.reload()
    cy.wait(500)

    // Verify all three documents exist
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Document 1')
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"John"').and('contain', '"age"').and('contain', '30')

    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Document 2')
    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"Jane"').and('contain', '"age"').and('contain', '25')

    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Document 3')
    cy.get('[data-test="array-panel-title-2"]').click()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"Bob"').and('contain', '"age"').and('contain', '35')
  })

  it('can persist test data with ejson', () => {
    cy.visit(`/test_data/${fileName}`)

    // Update first test data document with ejson
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"_id":{"$oid":"000000000000000000000001"},"name":"John","age":30}', { parseSpecialCharSequences: false }).blur()
    
    cy.reload()
    cy.get('[data-test="array-panel-title-0"]').should('be.visible').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000001"')
  })
  
  it('can show/hide test data', () => {
    cy.visit(`/test_data/${fileName}`)
    
    // Test hide/show functionality using expansion panel title
    cy.get('[data-test="array-panel-title-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').should('not.exist')

    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').should('not.exist')
  })

  it('can delete test data', () => {
    cy.visit(`/test_data/${fileName}`)

    // Delete first entry (trash can button)
    cy.get('[data-test="remove-item-btn-0"]').should('be.visible').click()

    // Reload and verify persistence - what was 2 is now 1
    cy.reload()
    cy.get('[data-test="array-panel-title-0"]').should('be.visible').click()
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"Jane"').and('contain', '"age"').and('contain', '25')
  })

  it('can delete the test data file', () => {
    cy.visit(`/test_data/${fileName}`)

    // Delete the test data file (header Delete) within the specific BaseCard for this file
    cy.get(`[data-test="delete-file-btn"]`).click()
    cy.get(`[data-test="confirm-delete-btn"]`).click()
    cy.wait(250)
    cy.url().should('contain', 'test_data')
    cy.get(`[data-test="file-card-${fileName}"]`).should('not.exist')
  })

  it('can reorder test data documents with drag and drop', () => {
    cy.visit(`/test_data/${fileName}`)

    // Update existing documents with identifiable content for drag and drop test
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"name":"First","order":1}', { parseSpecialCharSequences: false }).blur()

    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"name":"Second","order":2}', { parseSpecialCharSequences: false }).blur()

    // Add third test data document
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().type('{"name":"Third","order":3}', { parseSpecialCharSequences: false }).blur()

    // Verify initial order
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Document 1')
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Document 2')
    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Document 3')

    // Drag the 2nd document (index 1) to before the 1st document (index 0)
    cy.get('[data-test="array-drag-handle-1"]').then(($dragHandle) => {
      const dragHandle = $dragHandle[0]
      const dataTransfer = new DataTransfer()
      dataTransfer.setData('text/plain', '1')

      // Create a proper drag and drop sequence
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      })

      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      })

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      })

      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true,
        cancelable: true
      })

      dragHandle.dispatchEvent(dragStartEvent)
      cy.get('[data-test="array-drop-zone-0"]').then(($dropZone) => {
        const dropZoneEl = $dropZone[0]
        dropZoneEl.dispatchEvent(dragOverEvent)
        dropZoneEl.dispatchEvent(dropEvent)
        dragHandle.dispatchEvent(dragEndEvent)
      })
    })

    // Wait for the drag operation to complete
    cy.wait(500)

    // Verify the order has changed: Second should now be first
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Document 1')
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"Second"').and('contain', '"order"').and('contain', '2')

    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Document 2')
    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"First"').and('contain', '"order"').and('contain', '1')

    // Reload and verify persistence
    cy.reload()
    cy.wait(500)

    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"Second"')

    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"First"')
  })
})
