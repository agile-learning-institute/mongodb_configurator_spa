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
    it('loads the default dictionary page', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      cy.get('h2').should('be.visible')
      cy.get('h2').should('contain', 'Dictionary:')
      cy.get('h2').should('contain', `${dictionaryName}`)
      cy.contains('button', 'Lock').should('be.visible')
      cy.contains('button', 'Delete').should('be.visible')
      cy.get('[data-test="root-property-card"]').should('exist').should('be.visible')
      cy.get('[data-test="card-header"]').should('exist').should('be.visible')
      cy.get('[data-test="root-description-input"]').should('exist').should('be.visible')
      cy.get('[data-test="root-type-chip-picker"] [data-test="type-chip"]').should('be.visible').and('contain', 'void')
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
    
    it('can delete a dictionary', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.contains('button', 'Lock').should('be.visible')
      cy.contains('button', 'Delete').click()
  
      // Verify delete confirmation dialog is open
      cy.get('.v-dialog').should('be.visible')
      cy.get('.v-dialog .v-card-title').should('exist').should('contain', 'Delete Dictionary?')
      cy.get('.v-dialog .v-card-text').find('p').eq(0).should('exist').should('contain', 'Are you sure you want to delete')
      cy.get('.v-dialog .v-card-text').find('p').eq(1).should('contain', 'This action cannot be undone')
      cy.get('[data-test="delete-dialog-cancel-btn"]').should('be.visible')
      cy.get('[data-test="delete-dialog-confirm-btn"]').should('be.visible').click()
      cy.get('.v-dialog').should('not.exist')
      cy.url().should('include', '/dictionaries')
      cy.get('[data-test^="file-card-"]').should('not.contain', dictionaryFileName)
    })
  })

  describe('Dictionary Page Basic Locking', () => {
    it('can lock all dictionaries', () => {
      cy.visit(`/dictionaries`)
      cy.contains('button', 'Lock All').should('be.visible').click()
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.contains('button', 'Unlock').should('be.visible')
      cy.contains('button', 'Delete').should('not.exist')
      cy.contains('button', 'Lock').should('not.exist')
    })

    it('can lock a dictionary', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)

      // Verify the dictionary is unlocked and lock it
      cy.contains('button', 'Unlock').should('not.exist')
      cy.contains('button', 'Delete').should('exist')
      cy.contains('button', 'Lock').should('be.visible').click()

      // Verify it's now locked (Lock button should be replaced with Unlock)
      cy.contains('button', 'Unlock').should('be.visible')
      cy.contains('button', 'Delete').should('not.exist')
      cy.contains('button', 'Lock').should('not.exist')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('not.exist')
    })

    it('can unlock a dictionary', () => {
      cy.visit(`/dictionaries/${dictionaryFileName}`)
      cy.contains('button', 'Lock').should('be.visible').click()

      // Unlock the dictionary
      cy.contains('button', 'Unlock').should('be.visible').click()
      cy.contains('button', 'Delete').should('not.exist')
      cy.get('[data-test="unlock-dictionary-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-confirmation-message"]').should('contain', `Are you sure you want to unlock "${dictionaryName}"?`)
      cy.get('[data-test="unlock-warning-message"]').should('contain', 'This will allow the dictionary to be modified. Changes will be saved automatically.')
      cy.get('[data-test="unlock-cancel-btn"]').should('be.visible')
      cy.get('[data-test="unlock-confirm-btn"]').should('be.visible').click()

      cy.contains('button', 'Lock').should('be.visible')
      cy.contains('button', 'Delete').should('exist')
      cy.contains('button', 'Unlock').should('not.exist')
      cy.get('[data-test="root-type-chip-picker"] [data-test="dropdown-icon"]').should('be.visible')
    })
  })
})
