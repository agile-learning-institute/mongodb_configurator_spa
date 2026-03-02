import { createDictionary } from '../support/helpers'

describe('Dictionary Details Page', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary to test with
  beforeEach(() => {
    const result = createDictionary(`TestDictionary-object-${Date.now()}`)
    dictionaryName = result.dictionaryName
    dictionaryFileName = result.dictionaryFileName

    cy.visit(`/dictionaries/${dictionaryFileName}`)
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
    cy.get('[data-test="built-in-type-object"]').should('be.visible').click()
    cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').should('contain', 'Object')
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    // force a blur of the active input fields
    cy.visit('/dictionaries')
    cy.unlockAndDeleteFile('dictionaries', dictionaryFileName)
  })

  describe('Root Object Property Editor', () => {
    it('can persist description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-display-name"]').should('contain', 'Object')
      
      // enter description
      cy.get('[data-test="root-description-input"]').find('input').clear().type('Root object description{enter}')
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="root-description-input"]').find('input').should('have.value', 'Root object description')
    })

    it('has the correct type picker', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="type-chip"]').eq(0).should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"] i').should('have.length', 3)
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible')
    })

    it('can change type to array', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'Array')

      cy.reload()
      cy.wait(100)
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'Array')
    })

    it('can change type to one_of', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible').click()
      cy.get('[data-test="type-picker-card"]').should('not.exist')
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'One Of')

      cy.reload()
      cy.wait(100)
      cy.get('[data-test="type-display-name"]').should('be.visible').should('contain', 'One Of')
    })

    it('displays object action icons', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="add-property-btn"]').first().should('be.visible').and('not.be.disabled')
      cy.get('[data-test="add-property-btn"]').first().find('.material-symbols-outlined').should('contain', 'list_alt_add')
      cy.get('[data-test="additional-props-toggle-btn"]').first().should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'list_alt')
      cy.get('[data-test="collapse-toggle-btn"]').first().should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').first().find('.material-symbols-outlined').should('not.contain', 'expand_content')
    })

    it('persists object additional properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')

      cy.get('[data-test="additional-props-toggle-btn"]').click()
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt_check')

      cy.get('[data-test="additional-props-toggle-btn"]').click()
      cy.reload()
      cy.wait(100)
      cy.get('[data-test="additional-props-toggle-btn"]').should('be.visible').and('not.be.disabled')
      cy.get('[data-test="additional-props-toggle-btn"]').find('.material-symbols-outlined').should('contain', 'list_alt')
    })

    it('can add/delete properties to object', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      const rootBody = () => cy.get('[data-test="object-property-body"]').first().find('[data-test="object-properties-section"]')
      // add three properties (root has _id at 0, so new props at 1,2,3)
      cy.get('[data-test="add-property-btn"]').first().should('be.visible').click().click().click()
      cy.wait(300)
      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').clear().type('firstTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(2).find('input').clear().type('secondTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(3).find('input').clear().type('thirdTestProperty')

      // delete the second property (secondTestProperty)
      rootBody().find('[data-test="delete-property-btn"]').eq(2).click()
      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'thirdTestProperty')

      // delete the first added property
      rootBody().find('[data-test="delete-property-btn"]').eq(1).click()
      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'thirdTestProperty')

      // delete the last added property
      rootBody().find('[data-test="delete-property-btn"]').eq(1).click()
    })
    
    it('can arrange properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      const rootBody = () => cy.get('[data-test="object-property-body"]').first().find('[data-test="object-properties-section"]')
      cy.get('[data-test="add-property-btn"]').first().click().click().click()
      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').clear().type('firstTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(2).find('input').clear().type('secondTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(3).find('input').clear().type('thirdTestProperty')

      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'secondTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')
      
      // Drag the 2nd added property to before the 1st and verify: secondTestProperty, firstTestProperty, thirdTestProperty
      rootBody().find('[data-test="property-drag-handle"]').eq(2).then(($dragHandle) => {
        const dragHandle = $dragHandle[0]
        
        // Create a proper drag and drop sequence
        const dragStartEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        dragStartEvent.dataTransfer?.setData('text/plain', 'secondTestProperty')
        
        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        dropEvent.dataTransfer?.setData('text/plain', 'secondTestProperty')
        
        const dragEndEvent = new DragEvent('dragend', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        
        // Trigger the events
        dragHandle.dispatchEvent(dragStartEvent)
        rootBody().find('[data-test="drop-zone-1"]').then(($dropZone) => {
          const dropZoneEl = $dropZone[0]
          dropZoneEl.dispatchEvent(dragOverEvent)
          dropZoneEl.dispatchEvent(dropEvent)
          dropZoneEl.dispatchEvent(dragEndEvent)
        })
      })
      
      // Wait for the drag operation to complete
      cy.wait(1000)
      
      // Verify new order: _id, secondTestProperty, firstTestProperty, thirdTestProperty (drop-zone-0 is before first)
      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'secondTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'firstTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')
    })

    it('can show/hide empty properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      
      cy.get('[data-test="collapse-toggle-btn"]').first().should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'collapse_content')
      cy.get('[data-test="collapse-toggle-btn"]').first().find('.material-symbols-outlined').should('not.contain', 'expand_content')

      cy.get('[data-test="collapse-toggle-btn"]').first().click()
      cy.get('[data-test="collapse-toggle-btn"]').first().should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'expand_content')
      cy.get('[data-test="property-body"]').first().should('be.empty')

      cy.get('[data-test="collapse-toggle-btn"]').first().click()
      cy.get('[data-test="collapse-toggle-btn"]').first().should('be.visible').and('not.be.disabled')
      cy.get('[data-test="collapse-toggle-btn"]').first().find('.material-symbols-outlined').should('contain', 'collapse_content')
    })

    it('can show/hide some properties', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      const rootBody = () => cy.get('[data-test="object-property-body"]').first().find('[data-test="object-properties-section"]')
      cy.get('[data-test="add-property-btn"]').first().click().click().click()
      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').clear().type('firstTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(2).find('input').clear().type('secondTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(3).find('input').clear().type('thirdTestProperty')

      rootBody().find('[data-test="property-name-input"]').eq(1).find('input').should('have.value', 'firstTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(2).find('input').should('have.value', 'secondTestProperty')
      rootBody().find('[data-test="property-name-input"]').eq(3).find('input').should('have.value', 'thirdTestProperty')
     
      cy.get('[data-test="collapse-toggle-btn"]').first().click()
      cy.get('[data-test="object-property-body"]').should('not.exist')
      
      cy.get('[data-test="collapse-toggle-btn"]').first().click()
      cy.get('[data-test="object-property-body"]').should('be.visible')
    })
  })
})
