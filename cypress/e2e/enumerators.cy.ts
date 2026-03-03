import { resetEnumeratorsToV0, createEnumeratorVersion, deleteEnumeratorVersions } from '../support/helpers'

describe('Enumerators cards and detail pages', () => {
  describe('Enumerator access', () => {
    beforeEach(() => {
      resetEnumeratorsToV0()
    })

    it('redirects /enumerators to enumerator cards page', () => {
      cy.visit('/enumerators')
      cy.url().should('match', /\/enumerators\/enumerations\.\d+\.yaml/)
      cy.get('[data-test="enumerator-version-pill"]').should('be.visible')
    })
  })

  describe('Enumerator Cards Page', () => {
    const testFileName = 'enumerations.1.yaml'

    beforeEach(() => {
      resetEnumeratorsToV0()
      createEnumeratorVersion(1, {
        version: 1,
        file_name: testFileName,
        _locked: false,
        enumerators: [
          {
            name: 'default_status',
            values: [
              { value: 'draft', description: 'Draft' },
              { value: 'active', description: 'Not Deleted' },
              { value: 'archived', description: 'Soft Delete Indicator' }
            ]
          },
          {
            name: 'test_enum',
            values: [{ value: 'foo', description: 'bar' }]
          }
        ]
      })
    })

    afterEach(() => {
      deleteEnumeratorVersions([1])
    })

    it('can open and view enumerator cards page', () => {
      cy.visit(`/enumerators/${testFileName}`)
      cy.url().should('contain', `/enumerators/${testFileName}`)
      cy.get('[data-test="enumerator-version-pill"]').should('be.visible')
      cy.get('[data-test="enumerations-grid"]').should('exist')
      cy.get('[data-test="enumeration-card-default_status"]').should('be.visible')
      cy.get('[data-test="enumeration-card-test_enum"]').should('be.visible')
    })

    it('navigates to detail when clicking a card', () => {
      cy.visit(`/enumerators/${testFileName}`)
      cy.get('[data-test="enumeration-card-default_status"]').click()
      cy.url().should('include', '/default_status')
      cy.get('[data-test="enumeration-name-input"]').find('input').should('have.value', 'default_status')
      cy.get('[data-test="enum-value-input-0"]').find('input').should('have.value', 'draft')
      cy.get('[data-test="enum-value-input-1"]').find('input').should('have.value', 'active')
      cy.get('[data-test="enum-value-input-2"]').find('input').should('have.value', 'archived')
    })
  })

  describe('Enumerator Detail Page', () => {
    const testFileName = 'enumerations.1.yaml'

    beforeEach(() => {
      resetEnumeratorsToV0()
      createEnumeratorVersion(1, {
        version: 1,
        file_name: testFileName,
        _locked: false,
        enumerators: [
          {
            name: 'default_status',
            values: [
              { value: 'draft', description: 'Draft' },
              { value: 'active', description: 'Not Deleted' },
              { value: 'archived', description: 'Soft Delete Indicator' }
            ]
          }
        ]
      })
    })

    afterEach(() => {
      deleteEnumeratorVersions([1])
    })

    it('can add and edit values in default_status enumeration', () => {
      cy.visit(`/enumerators/${testFileName}/default_status`)
      cy.get('[data-test="enum-value-input-0"]').find('input').should('have.value', 'draft')
      cy.get('[data-test="enum-value-input-1"]').find('input').should('have.value', 'active')
      cy.get('[data-test="enum-value-input-2"]').find('input').should('have.value', 'archived')

      cy.get('[data-test="add-enum-value-btn"]').click()
      cy.get('[data-test="enum-value-input-3"]').find('input').clear().type('TestValue1')
      cy.get('[data-test="enum-description-input-3"]').find('input').clear().type('Test Description')
      cy.get('[data-test="enum-value-input-0"]').click()

      cy.wait(500)
      cy.reload()
      cy.get('[data-test="enum-value-input-3"]').find('input').should('have.value', 'TestValue1')
      cy.get('[data-test="enum-description-input-3"]').find('input').should('have.value', 'Test Description')

      cy.get('[data-test="delete-enum-value-btn-3"]').click()
      cy.get('[data-test="enum-value-input-3"]').should('not.exist')
    })

    it('persists value and description edits on reload (beforeunload saves on real reload)', () => {
      cy.visit(`/enumerators/${testFileName}/default_status`)
      cy.get('[data-test="enum-value-input-0"]').find('input').should('have.value', 'draft')
      cy.get('[data-test="enum-description-input-0"]').find('input').should('have.value', 'Draft')

      // Edit value and description
      cy.get('[data-test="enum-value-input-0"]').find('input').clear().type('draft_value')
      cy.get('[data-test="enum-description-input-0"]').find('input').clear().type('Draft status')

      // Click elsewhere to blur (triggers save) - beforeunload does the same on real reload
      cy.get('[data-test="enum-value-input-0"]').click()
      cy.wait(400) // debounce
      cy.reload()

      cy.get('[data-test="enum-value-input-0"]').find('input').should('have.value', 'draft_value')
      cy.get('[data-test="enum-description-input-0"]').find('input').should('have.value', 'Draft status')
    })
  })

  describe('Version Navigation', () => {
    beforeEach(() => {
      resetEnumeratorsToV0()
      createEnumeratorVersion(1)
      createEnumeratorVersion(2)
      createEnumeratorVersion(3, {
        version: 3,
        file_name: 'enumerations.3.yaml',
        _locked: false,
        enumerators: [{ name: 'default_status', values: [{ value: 'active', description: 'Active' }] }]
      })
    })

    afterEach(() => {
      deleteEnumeratorVersions([1, 2, 3])
    })

    it('displays correct newest version navigator icons on cards page', () => {
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="enumerator-version-pill"]').should('contain', '3')
      cy.get('[data-test="lock-btn"]').should('exist')
      cy.get('[data-test="delete-enumerator-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="next-version-btn"]').should('not.exist')
      cy.get('[data-test="add-version-btn"]').should('exist')
    })

    it('displays correct first version navigator icons on cards page', () => {
      cy.visit('/enumerators/enumerations.0.yaml')
      cy.get('[data-test="enumerator-version-pill"]').should('contain', '0')
      cy.get('[data-test="unlock-btn"]').should('exist')
      cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
      cy.get('[data-test="previous-version-btn"]').should('not.exist')
      cy.get('[data-test="next-version-btn"]').should('exist')
    })
  })

  describe('Locking Business Rules', () => {
    beforeEach(() => {
      resetEnumeratorsToV0()
      createEnumeratorVersion(1)
      createEnumeratorVersion(2)
      createEnumeratorVersion(3, {
        version: 3,
        file_name: 'enumerations.3.yaml',
        _locked: false,
        enumerators: [{ name: 'default_status', values: [{ value: 'active', description: 'Active' }] }]
      })
    })

    afterEach(() => {
      deleteEnumeratorVersions([1, 2, 3])
    })

    it('can not unlock v0, v1, v2 – unlock dialog offers create version only', () => {
      ;[0, 1, 2].forEach((v) => {
        cy.visit(`/enumerators/enumerations.${v}.yaml`)
        cy.get('[data-test="unlock-btn"]').should('exist').click()
        cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist')
        cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
        cy.get('[data-test="unlock-dialog-cancel-btn"]').click()
      })
    })

    it('can lock/unlock v3', () => {
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="delete-enumerator-btn"]').should('exist')
      cy.get('[data-test="lock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-btn"]', { timeout: 8000 }).should('exist')
      cy.get('[data-test="add-enumeration-btn"]').should('not.exist', { timeout: 3000 })

      cy.get('[data-test="unlock-btn"]').click()
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-cancel-btn"]').click()
    })
  })

  describe('New Version Rules', () => {
    beforeEach(() => {
      resetEnumeratorsToV0()
      createEnumeratorVersion(1)
      createEnumeratorVersion(3, {
        version: 3,
        file_name: 'enumerations.3.yaml',
        _locked: false,
        enumerators: [{ name: 'default_status', values: [{ value: 'active', description: 'Active' }] }]
      })
    })

    afterEach(() => {
      deleteEnumeratorVersions([1, 3, 4])
    })

    it('can create a new version from v3', () => {
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="add-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="enumeration-card-default_status"]').should('be.visible')
    })

    it('can create a new version from v0 unlock dialog', () => {
      cy.visit('/enumerators/enumerations.0.yaml')
      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.')
    })

    it('locks when new from add version button', () => {
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="add-version-btn"]').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="lock-btn"]').should('exist')

      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="lock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-btn"]').should('exist')
    })
  })

  describe('Delete Functionality', () => {
    beforeEach(() => {
      resetEnumeratorsToV0()
      createEnumeratorVersion(3, {
        version: 3,
        file_name: 'enumerations.3.yaml',
        _locked: false,
        enumerators: [{ name: 'default_status', values: [{ value: 'active', description: 'Active' }] }]
      })
    })

    afterEach(() => {
      deleteEnumeratorVersions([3])
    })

    it('can not delete locked files', () => {
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="delete-enumerator-btn"]').should('be.visible')
      cy.get('[data-test="lock-btn"]').click()
      cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
    })

    it('deletes with a warning', () => {
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="delete-enumerator-btn"]').should('be.visible').click()
      cy.get('[data-test="delete-warning-dialog"]').should('be.visible')
      cy.get('[data-test="delete-warning-title"]').should('contain', 'Warning: Delete Enumerator')
      cy.get('[data-test="delete-dialog-cancel-btn"]').should('be.visible')
      cy.get('[data-test="delete-dialog-delete-btn"]').should('be.visible').click()
      cy.url().should('include', '/dictionaries')
    })
  })
})
