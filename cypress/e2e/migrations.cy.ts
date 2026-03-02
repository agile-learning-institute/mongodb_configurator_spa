describe('Migrations detail page', () => {
  const name = `e2e-migration-${Date.now()}`
  const fileName = name.endsWith('.json') ? name : `${name}.json`

  beforeEach(() => {
    // Create migration via API, then visit detail page directly (reachable from Configuration detail)
    cy.request('PUT', `/api/migrations/${fileName}/`, [])
    cy.visit(`/migrations/${fileName}`)
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
    cy.request({ method: 'DELETE', url: `/api/migrations/${fileName}/`, failOnStatusCode: false })
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
    const testName = `e2e-migration-create-${Date.now()}`
    const testFileName = testName.endsWith('.json') ? testName : `${testName}.json`

    cy.request('PUT', `/api/migrations/${testFileName}/`, [])
    cy.visit(`/migrations/${testFileName}`)

    cy.url().should('include', `/migrations/${testFileName}`)
    cy.get('[data-test="card-title"]').should('contain', testFileName)
    cy.get('[data-test="delete-file-btn"]').should('be.enabled')
    cy.get('[data-test="array-editor-title"]').should('contain', 'Migrations')
    cy.get('[data-test="add-item-btn"]').should('be.enabled')
    cy.get('[data-test="array-editor-empty"]').should('be.visible')

    cy.request({ method: 'DELETE', url: `/api/migrations/${testFileName}/`, failOnStatusCode: false })
  })

  it('can add migrations', () => {
    cy.visit(`/migrations/${fileName}`)

    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-2"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Migration 3')
    cy.get('[data-test="remove-item-btn-2"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-2"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().type('{"baz":"qux"}', { parseSpecialCharSequences: false }).blur()

    cy.reload()
    cy.wait(500)

    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"foo"').and('contain', '"bar"')

    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="remove-item-btn-1"]').should('be.enabled')
    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-panel-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"boo"').and('contain', '"far"')

    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Migration 3')
    cy.get('[data-test="array-panel-title-2"]').click()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first()
      .invoke('val').should('contain', '"baz"').and('contain', '"qux"')
  })

  it('can show/hide migrations', () => {
    cy.visit(`/migrations/${fileName}`)

    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').should('not.exist')
  })

  it('can delete a migration', () => {
    cy.visit(`/migrations/${fileName}`)

    cy.get('[data-test="remove-item-btn-0"]').click()

    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').should('contain', 'Migration 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"boo"').and('contain', '"far"')
  })

  it('can delete the migrations file', () => {
    cy.visit(`/migrations/${fileName}`)

    cy.get('[data-test="delete-file-btn"]').click()
    cy.get('[data-test="confirm-delete-btn"]').click()
    cy.wait(250)
    cy.url().should('include', '/dictionaries')
    cy.request({ url: `/api/migrations/${fileName}/`, failOnStatusCode: false }).then((res) => {
      expect(res.status).to.be.oneOf([404, 500])
    })
  })

  it('can reorder migrations with drag and drop', () => {
    cy.visit(`/migrations/${fileName}`)

    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"step":1,"action":"first"}', { parseSpecialCharSequences: false }).blur()

    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"step":2,"action":"second"}', { parseSpecialCharSequences: false }).blur()

    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-2"]').find('textarea').first().type('{"step":3,"action":"third"}', { parseSpecialCharSequences: false }).blur()

    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="array-item-label"]').eq(2).should('contain', 'Migration 3')

    cy.get('[data-test="array-drag-handle-1"]').then(($dragHandle) => {
      const dragHandle = $dragHandle[0]
      const dataTransfer = new DataTransfer()
      dataTransfer.setData('text/plain', '1')

      const dragStartEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer })
      const dragOverEvent = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer })
      const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer })
      const dragEndEvent = new DragEvent('dragend', { bubbles: true, cancelable: true })

      dragHandle.dispatchEvent(dragStartEvent)
      cy.get('[data-test="array-drop-zone-0"]').then(($dropZone) => {
        const dropZoneEl = $dropZone[0]
        dropZoneEl.dispatchEvent(dragOverEvent)
        dropZoneEl.dispatchEvent(dropEvent)
        dragHandle.dispatchEvent(dragEndEvent)
      })
    })

    cy.wait(500)

    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Migration 1')
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"step"').and('contain', '2').and('contain', '"action"').and('contain', '"second"')

    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Migration 2')
    cy.get('[data-test="array-panel-title-1"]').click()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"step"').and('contain', '1').and('contain', '"action"').and('contain', '"first"')

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
