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
    cy.get('[data-test=array-editor-empty').should('be.visible')
  })

  it('can add test data', () => {
    cy.visit(`/test_data/${fileName}`)

    // Add first test data document
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Document 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"name":"John","age":30}', { parseSpecialCharSequences: false }).blur()

    // Add second test data document
    cy.get('[data-test="add-item-btn"]').click()
    cy.get('[data-test="array-panel-1"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Document 2')
    cy.get('[data-test="remove-item-btn-1"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"name":"Jane","age":25}', { parseSpecialCharSequences: false }).blur()

    // Verify first added
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(0).should('contain', 'Document 1')
    cy.get('[data-test="remove-item-btn-0"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"John"').and('contain', '"age"').and('contain', '30')

    // Verify second added
    cy.get('[data-test="array-panel-1"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(1).should('contain', 'Document 2')
    cy.get('[data-test="remove-item-btn-1"]').should('be.enabled')
    cy.get('[data-test="array-item-textarea-1"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first()
      .invoke('val').should('contain', '"name"').and('contain', '"Jane"').and('contain', '"age"').and('contain', '25')
  })

  it('can persist test data with ejson', () => {
    cy.visit(`/test_data/${fileName}`)

    // Add first test data document
    cy.get('[data-test="add-item-btn"]').should('be.visible').click()
    cy.get('[data-test="array-panel-0"]').should('be.visible')
    cy.get('[data-test="array-item-label"]').eq(0).should('be.visible').should('contain', 'Document 1')
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"_id":{"$oid":"000000000000000000000001"}}', { parseSpecialCharSequences: false }).blur()
    
    cy.reload()
    cy.get('[data-test="array-panel-title-0"]').should('be.visible').click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"_id"').and('contain', '"$oid"').and('contain', '"000000000000000000000001"')
  })
  
  it('can show/hide test data', () => {
    cy.visit(`/test_data/${fileName}`)
    
    // Add first test data documents
    cy.get('[data-test="add-item-btn"]').should('be.visible').click().click()
    cy.reload()

    cy.get('[data-test="array-panel-title-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').should('not.exist')

    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    
    cy.get('[data-test="array-panel-title-0"]').click()
    cy.get('[data-test="array-item-textarea-0"]').should('not.exist')
  })

  it('can delete test data', () => {
    cy.visit(`/test_data/${fileName}`)
    cy.get('[data-test="add-item-btn"]').should('be.visible').click().click()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first().type('{"foo":"bar"}', { parseSpecialCharSequences: false }).blur()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().clear()
    cy.get('[data-test="array-item-textarea-1"]').find('textarea').first().type('{"boo":"far"}', { parseSpecialCharSequences: false }).blur()

    // Delete first entry (trash can button)
    cy.get('[data-test="remove-item-btn-0"]').should('be.visible').click()

    // Reload and verify persistence what was 2 is now 1
    cy.reload()
    cy.get('[data-test="array-panel-title-0"]').should('be.visible').click()
    cy.get('[data-test="array-item-textarea-0"]').should('be.visible')
    cy.get('[data-test="array-item-textarea-0"]').find('textarea').first()
      .invoke('val').should('contain', '"boo"').and('contain', '"far"')

  })

  it('can delete the test data file', () => {
    cy.visit(`/test_data/${fileName}`)

    // Delete the test data file (header Delete) within the specific BaseCard for this file
    cy.get(`[data-test="delete-file-btn"]`).click()
    cy.get(`[data-test="confirm-delete-btn"]`).click()
    cy.wait(250)
    cy.url().should('contain', 'test_data')
    cy.get(`[data-test="file-card-${fileName}"]`).should('not.exist')
    cy.get('[data-test^="file-card-"]').should('have.length', 2)
  })
})
