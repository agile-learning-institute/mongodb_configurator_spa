describe('Migrations detail page', () => {
  const name = `e2e-migration-${Date.now()}`
  const fileName = `${name}.json`

  beforeEach(() => {
    cy.visit('/migrations')
    cy.get('[data-test="new-migration-btn"]').click()
    cy.get('[data-test="new-migration-dialog"]').should('be.visible')
    cy.get('[data-test="new-migration-name-input"]').type(name)
    cy.get('[data-test="new-migration-create-btn"]').click()

    cy.wait(250)
    cy.url().should('include', `/migrations/${fileName}`)

    // Set up initial structure with 2 migrations
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"foo":"bar"}', { parseSpecialCharSequences: false }).blur()

    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"boo":"far"}', { parseSpecialCharSequences: false }).blur()
  })

  afterEach(() => {
    cy.request({
      method: 'DELETE',
      url: `/api/migrations/${fileName}/`,
      failOnStatusCode: false
    })
  })

  it('has default values', () => {
    cy.visit(`/migrations/${fileName}`)

    cy.url().should('include', `/migrations/${fileName}`)
    cy.get('[data-test="card-title"]').should('contain', fileName)
    cy.get('[data-test="delete-file-btn"]').should('be.enabled')
    cy.get('[data-test="array-editor-title"]').should('contain', 'Migrations')
    cy.get('[data-test="add-item-btn"]').should('be.enabled')
  })

  it('can create a migrations file', () => {
    // Create a new migrations file for this test
    const testName = `e2e-migration-create-${Date.now()}`
    const testFileName = `${testName}.json`

    cy.visit('/migrations')
    cy.get('[data-test="new-migration-btn"]').click()
    cy.get('[data-test="new-migration-dialog"]').should('be.visible')
    cy.get('[data-test="new-migration-name-input"]').type(testName)
    cy.get('[data-test="new-migration-create-btn"]').click()

    // Verify the migrations file was created
    cy.url().should('include', `/migrations/${testFileName}`)
    cy.get('[data-test="card-title"]').should('contain', testFileName)
    cy.get('[data-test="delete-file-btn"]').should('be.enabled')
    cy.get('[data-test="array-editor-title"]').should('contain', 'Migrations')
    cy.get('[data-test="add-item-btn"]').should('be.enabled')
    cy.get('[data-test=array-editor-empty').should('be.visible')

    // Clean up
    cy.request({
      method: 'DELETE',
      url: `/api/migrations/${testFileName}/`,
      failOnStatusCode: false
    })
  })

  it('can add migrations', () => {
    cy.visit(`/migrations/${fileName}`)

    // Add third migration
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-2"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Migration 3')
    cy.get('[data-test="remove-item-btn-2"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-2"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().type('{"baz":"qux"}', { parseSpecialCharSequences: false }).blur()

    // Reload and verify persistence
    cy.reload()
    cy.wait(500)

    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-panel-title-0"]').click() // Show panel
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"foo"').and('contain', '"bar"')
    
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="remove-item-btn-1"]').should('be.enabled')
    cy.get('[data-test="array-panel-title-1"]').click() // Show panel
    cy.get('[data-test="array-panel-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"boo"').and('contain', '"far"')

    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Migration 3')
    cy.get('[data-test="array-panel-title-2"]').click() // Show panel
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first()
      .invoke('val').should('contain', '"baz"').and('contain', '"qux"')
  })

  it('can show/hide migrations', () => {
    cy.visit(`/migrations/${fileName}`)

    // Test hide/show functionality using expansion panel title
    cy.get('[data-test="array-panel-title-0"]').click() // Show panel
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-panel-title-0"]').click() // Hide panel
    cy.get('[data-test="array-item-textarea-0"]').should('not.exist')
  })

  it('can delete a migration', () => {
    cy.visit(`/migrations/${fileName}`)

    // Delete first migration
    cy.get('[data-test="remove-item-btn-0"]').click()

    // Confirm the 2nd migration is now the first one
    cy.get('[data-test="array-panel-title-0"]').click() // Show panel
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"boo"').and('contain', '"far"')
  })

  it('can delete the migrations file', () => {
    cy.visit(`/migrations/${fileName}`)

    // Delete the migrations file
    cy.get('[data-test="delete-file-btn"]').click()
    cy.get('[data-test="confirm-delete-btn"]').click()
    cy.wait(250)
    cy.url().should('contain', 'migrations')
    cy.get(`[data-test="file-card-${fileName}"]`).should('not.exist')
  })

  it('can reorder migrations with drag and drop', () => {
    cy.visit(`/migrations/${fileName}`)

    // Update existing migrations with identifiable content for drag and drop test
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"step":1,"action":"first"}', { parseSpecialCharSequences: false }).blur()

    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"step":2,"action":"second"}', { parseSpecialCharSequences: false }).blur()

    // Add third migration - new items auto-expand
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().type('{"step":3,"action":"third"}', { parseSpecialCharSequences: false }).blur()

    // Verify initial order
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Migration 3')

    // Drag the 2nd migration (index 1) to before the 1st migration (index 0)
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
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"step"').and('contain', '2').and('contain', '"action"').and('contain', '"second"')

    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"step"').and('contain', '1').and('contain', '"action"').and('contain', '"first"')

    // Reload and verify persistence
    cy.reload()
    cy.wait(500)

    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"step"').and('contain', '2').and('contain', '"action"').and('contain', '"second"')

    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"step"').and('contain', '1').and('contain', '"action"').and('contain', '"first"')
  })
})
