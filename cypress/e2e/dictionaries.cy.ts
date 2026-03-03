import { createDictionary } from '../support/helpers'

describe('Dictionary Details Page', () => {
  let dictionaryFileName: string
  let dictionaryName: string

  // Setup a dictionary to test with
  beforeEach(() => {
    const result = createDictionary(`TestDictionary-${Date.now()}`)
    dictionaryName = result.dictionaryName
    dictionaryFileName = result.dictionaryFileName
  })

  // Clean up any dictionaries created during tests
  afterEach(() => {
    cy.unlockAndDeleteFile('dictionaries', dictionaryFileName)
  })

  describe('Dictionary Page Basics', () => {
    it('loads the default dictionary page for a versioned dictionary', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="app-title"]').should('contain', 'Dictionary')
      cy.get('[data-test="dictionary-header-name"]').should('be.visible').and('contain', dictionaryName)
      // Versioned dictionaries are managed via configurations; lock/delete controls are not shown here
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="root-property-card"]').should('exist').should('be.visible')
      cy.get('[data-test="card-header"]').should('exist').should('be.visible')
      cy.get('[data-test="root-description-input"]').should('exist').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'Object')
    })

    it('has the correct root type picker', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').click()
      cy.get('[data-test="type-picker-card"]').should('be.visible')
      cy.get('[data-test="built-in-types-category"]').should('be.visible')
      cy.get('[data-test="built-in-type-array"]').should('be.visible')
      cy.get('[data-test="built-in-type-object"]').should('be.visible')
      cy.get('[data-test="built-in-type-one_of"]').should('be.visible')
      cy.get('[data-test="custom-types-category"]').should('not.exist')
      cy.get('header').first().click()
    })

    it('persists description edits', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.get('[data-test="root-description-input"]').find('input').clear().type('Test description{enter}')
      cy.reload()
      cy.get('[data-test="root-description-input"]').find('input').should('have.value', 'Test description')
    })

    it('can delete a referenced (non-versioned) dictionary', () => {
      const referencedDictionaryName = `deleteRef-${Date.now()}`
      const referencedDictionaryFileName = `${referencedDictionaryName}.yaml`

      // Create a referenced dictionary directly via API
      cy.request('PUT', `/api/dictionaries/${referencedDictionaryFileName}/`, {
        file_name: referencedDictionaryFileName,
        _locked: false,
        root: {
          name: 'root',
          description: '',
          type: 'object',
          required: true,
          properties: [],
        },
      })

      cy.visit(`/dictionaries/${referencedDictionaryFileName}`)
      cy.get('[data-test="dictionary-header-name"]').should('contain', referencedDictionaryName)
      cy.get('[data-test="lock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dictionary-btn"]').should('not.exist')
      cy.get('[data-test="delete-dictionary-btn"]').should('be.visible').click()

      // Verify delete confirmation dialog is open
      cy.get('.v-dialog').should('be.visible')
      cy.get('.v-dialog .v-card-title').should('exist').should('contain', 'Delete Dictionary?')
      cy.get('.v-dialog .v-card-text').find('p').eq(0).should('exist').should('contain', 'Are you sure you want to delete')
      cy.get('.v-dialog .v-card-text').find('p').eq(1).should('contain', 'This action cannot be undone')
      cy.get('[data-test="delete-dialog-cancel-btn"]').should('be.visible')
      cy.get('[data-test="delete-dialog-confirm-btn"]').should('be.visible').click()
      cy.get('.v-dialog').should('not.exist')
      cy.url().should('include', '/dictionaries')
    })
  })
})
