describe('Dictionary Object Editor - Non-Root', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary to test with
  beforeEach(() => {
    dictionaryName = `TestDictionary-object-${Date.now()}`
    dictionaryFileName = `${dictionaryName}.yaml`

    cy.visit('/dictionaries')
    cy.get('h3').should('contain', 'Dictionaries')
    cy.get('[data-test^="file-card-"]').should('exist')
    cy.contains('button', 'New').should('be.visible').click()
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Create New Dictionary')
    cy.get('.v-dialog input').type(dictionaryName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    cy.get('.v-dialog').should('not.exist')
    cy.wait(200)
    cy.url().should('include', `/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'Object')
    cy.visit('/dictionaries')
    cy.get(`[data-test="file-card-${dictionaryName}.yaml"]`).should('be.visible')
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // Unlock the dictionary
    cy.request({
      method: 'PUT',    
      url: `/api/dictionaries/${dictionaryFileName}/`,
      headers: {"Content-Type": "application/json"},
      body: {"_locked": false, "root":{"name":""}},
      failOnStatusCode: false
    })
    
    // Delete the dictionary
    cy.request({
      method: 'DELETE',
      url: `/api/dictionaries/${dictionaryFileName}/`,
      failOnStatusCode: false
    })

    // Verify the dictionary is deleted
    cy.visit('/dictionaries')
    cy.url().should('include', '/dictionaries')
    cy.get('[data-test^="file-card-"]').should('not.contain', dictionaryFileName)
  })

  it('can persist name/description edits', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click().click()

    cy.get('[data-test="property-name-input"]').eq(0).click()
    cy.get('[data-test="property-name-input"]').eq(0).find('input').type('firstTestProperty')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="property-name-input"]').eq(0).find('input').should('have.value', 'firstTestProperty')

    cy.get('[data-test="description-input"]').eq(0).click()
    cy.get('[data-test="description-input"]').eq(0).find('input').type('One property for testing object properties')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="description-input"]').eq(0).find('input').should('have.value', 'One property for testing object properties')

    cy.get('[data-test="property-name-input"]').eq(1).click()
    cy.get('[data-test="property-name-input"]').eq(1).find('input').type('secondTestProperty')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')

    cy.get('[data-test="description-input"]').eq(1).click()
    cy.get('[data-test="description-input"]').eq(1).find('input').type('Two property for testing object properties')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
    cy.get('[data-test="description-input"]').eq(1).find('input').should('have.value', 'Two property for testing object properties')
  })

  it('has the correct type picker', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip-picker"] [data-test="type-chip"]').first().click()

    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-types-category"] i').should('have.length', 7)
    cy.get('[data-test="built-in-type-array"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible')
    cy.get('[data-test="built-in-type-one_of"]').should('be.visible')
    cy.get('[data-test="built-in-type-ref"]').should('be.visible')
    cy.get('[data-test="built-in-type-constant"]').should('be.visible')
    cy.get('[data-test="built-in-type-enum"]').should('be.visible')
    cy.get('[data-test="built-in-type-enum_array"]').should('be.visible')

    // verify type picker has Custom Types section
    cy.get('[data-test="custom-types-category"]').should('be.visible')
    cy.get('[data-test="custom-types-category"] i').should('have.length.greaterThan', 10)
  })

  it('can change type to array', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()

    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-array"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Array')
  })

  it('can change type to one_of', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()

    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'One Of')
  })

  it('can change type to word', () => {
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()

    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="custom-type-name-word.yaml"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'word')
  })

  it('displays object action icons', () => {
    // Setup a non-root object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    // verify add property button is visible and enabled (second one for the non-root object)
    cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="add-property-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_add')
    
    // verify allow-additional-properties button is visible and enabled
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt')
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).click()
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_check')
    
    // verify show-hide-properties button is visible and enabled
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
    
    // verify required toggle works
    cy.get('[data-test="required-toggle-btn"]').first().should('exist')
    cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
    cy.get('[data-test="required-toggle-btn"]').first().click()
    cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

    // verify delete property button works
    cy.get('[data-test="delete-property-btn"]').first().should('exist').click()
    cy.get('[data-test="no-object-properties-text"]').should('exist')
  })

  it('persists object additional properties', () => {
    // Setup a non-root object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt')
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).click()
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt_check')

    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).click()
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="additional-props-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'list_alt')
  })

  it('persists required properties', () => {
    // Setup a non-root object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    // verify required toggle works
    cy.get('[data-test="required-toggle-btn"]').first().should('exist')
    cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')

    cy.get('[data-test="required-toggle-btn"]').first().click()
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_on')

    cy.get('[data-test="required-toggle-btn"]').first().click()
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="required-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'toggle_off')
  })

  it('can add/delete properties to object', () => {
    // Setup a non-root object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    // add three properties to the object
    cy.get('[data-test="add-property-btn"]').eq(1).click().click().click()
    cy.get('[data-test="property-name-input"]').eq(1).click()
    cy.get('[data-test="property-name-input"]').eq(1).find('input').type('firstTestProperty')
    cy.get('[data-test="property-name-input"]').eq(2).click()
    cy.get('[data-test="property-name-input"]').eq(2).find('input').type('secondTestProperty')
    cy.get('[data-test="property-name-input"]').eq(3).click()
    cy.get('[data-test="property-name-input"]').eq(3).find('input').type('thirdTestProperty')

    // verify the properties were added
    cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
    cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'secondTestProperty')
    cy.get('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')

    // delete the second property
    cy.get('[data-test="delete-property-btn"]').eq(2).click()
    cy.get('[data-test="property-name-input"]').should('have.length', 3)
    cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
    cy.get('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

    // delete the first property
    cy.get('[data-test="delete-property-btn"]').eq(1).click()
    cy.get('[data-test="property-name-input"]').should('have.length', 2)
    cy.get('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

    // delete the last property
    cy.get('[data-test="delete-property-btn"]').eq(1).click()
    cy.get('[data-test="property-name-input"]').should('have.length', 1)
    cy.get('[data-test="object-property-body"]').eq(1).should('contain', 'No properties defined')
  })
  
  it('can arrange properties', () => {
    // Setup a non-root object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    expect(true, 'Not Yet Implemented').to.equal(false)
  })

  it('can show/hide empty properties', () => {
    // Setup a non-root object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')

    // verify show-hide-properties button is visible and enabled
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
    cy.get('[data-test="object-property-body"]').eq(1).should('contain', 'No properties defined')

    cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
    cy.get('[data-test="property-body"]').eq(1).should('be.empty')

    cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
    cy.get('[data-test="object-property-body"]').eq(1).should('contain', 'No properties defined')
  })

  it('can show/hide some properties', () => {
    // Setup a non-root object
    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="add-property-btn"]').should('be.visible').click()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').wait(200)
    cy.get('[data-test="type-chip"]').eq(1).click()
    cy.get('[data-test="type-picker-card"]').should('be.visible')
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="type-picker-card"]').should('not.exist')
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.wait(250)
    cy.reload()
    cy.get('[data-test="type-chip"]').eq(1).should('be.visible').should('contain', 'Object')
    cy.get('[data-test="add-property-btn"]').eq(1).should('be.visible').click().click()
    cy.get('[data-test="property-name-input"]').should('have.length', 3)

    // verify show-hide-properties button is visible and enabled
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
    cy.get('[data-test="property-name-input"]').should('have.length', 3)

    cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'expand_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'collapse_content')
    cy.get('[data-test="property-name-input"]').should('have.length', 1)
    cy.get('[data-test="property-body"]').eq(1).should('be.empty')

    cy.get('[data-test="collapse-toggle-btn"]').eq(1).click()
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).should('be.visible').and('not.be.disabled')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('contain', 'collapse_content')
    cy.get('[data-test="collapse-toggle-btn"]').eq(1).find('.material-symbols-outlined').should('not.contain', 'expand_content')
    cy.get('[data-test="property-name-input"]').should('have.length', 3)
  })
})

