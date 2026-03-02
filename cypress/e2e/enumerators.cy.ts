describe('Enumerators cards and detail pages', () => {
  let enumeratorFileName: string = 'enumerations.3.yaml'

  // Helper to verify cards page
  const verifyCardsPage = () => {
    cy.get('[data-test="enumerator-version-pill"]').should('be.visible')
    cy.get('[data-test="delete-enumerator-btn"]').should('exist')
    cy.get('[data-test="lock-btn"]').should('exist')
    cy.get('[data-test="enumerations-grid"]').should('exist')
  }

  // Helper to verify default_status detail page seed data
  const verifyDefaultStatusDetail = () => {
    cy.get('[data-test="enumeration-name-input"]').find('input').should('have.value', 'default_status')
    cy.get('[data-test="enum-value-input-0"]').find('input').should('have.value', 'draft')
    cy.get('[data-test="enum-description-input-0"]').find('input').should('have.value', 'Draft')
    cy.get('[data-test="enum-value-input-1"]').find('input').should('have.value', 'active')
    cy.get('[data-test="enum-description-input-1"]').find('input').should('have.value', 'Not Deleted')
    cy.get('[data-test="enum-value-input-2"]').find('input').should('have.value', 'archived')
    cy.get('[data-test="enum-description-input-2"]').find('input').should('have.value', 'Soft Delete Indicator')
  }

  const deleteNonSeedData = () => {
    const filesToDelete = ['enumerations.3.yaml', 'enumerations.4.yaml', 'enumerations.5.yaml', 'enumerations.6.yaml', 'enumerations.7.yaml', 'enumerations.8.yaml']
    filesToDelete.forEach((file) => {
      cy.request({ method: 'PUT', url: `/api/enumerators/${file}/`, body: { _locked: false }, failOnStatusCode: false }).then((unlockResponse) => {
        if (unlockResponse.status === 200) {
          cy.request({ method: 'DELETE', url: `/api/enumerators/${file}/`, failOnStatusCode: false })
        }
      })
    })
  }

  beforeEach(() => {
    deleteNonSeedData()
    cy.visit('/enumerators/enumerations.3.yaml')
    cy.get('[data-test="enumerator-version-pill"]').should('be.visible').and('contain', '3')
  })

  afterEach(() => {
    deleteNonSeedData()
  })

  describe('Enumerator access', () => {
    it('redirects /enumerators to enumerator cards page', () => {
      cy.visit('/enumerators')
      cy.url().should('include', '/enumerators/')
      cy.get('[data-test="enumerator-version-pill"]').should('be.visible')
    })
  })

  describe('Enumerator Cards Page', () => {
    it('can open and view enumerator cards page', () => {
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.url().should('contain', '/enumerators/enumerations.3.yaml')
      verifyCardsPage()
      cy.get('[data-test="enumeration-card-default_status"]').should('be.visible')
      cy.get('[data-test="enumeration-card-test_enum"]').should('be.visible')
    })

    it('navigates to detail when clicking a card', () => {
      cy.visit(`/enumerators/${enumeratorFileName}`)
      cy.get('[data-test="enumeration-card-default_status"]').click()
      cy.url().should('include', '/default_status')
      verifyDefaultStatusDetail()
    })
  })

  describe('Enumerator Detail Page', () => {
    it('can add and edit values in default_status enumeration', () => {
      cy.visit(`/enumerators/${enumeratorFileName}/default_status`)
      verifyDefaultStatusDetail()

      cy.get('[data-test="add-enum-value-btn"]').click()
      cy.get('[data-test="enum-value-input-3"]').find('input').clear().type('TestValue1')
      cy.get('[data-test="enum-description-input-3"]').find('input').clear().type('Test Description')

      cy.wait(500)
      cy.reload()
      cy.get('[data-test="enum-value-input-3"]').find('input').should('have.value', 'TestValue1')
      cy.get('[data-test="enum-description-input-3"]').find('input').should('have.value', 'Test Description')

      cy.get('[data-test="delete-enum-value-btn-3"]').click()
      cy.get('[data-test="enum-value-input-3"]').should('not.exist')
    })
  })

  describe('Version Navigation', () => {
    it('displays correct newest version navigator icons on cards page', () => {
      cy.visit(`/enumerators/${enumeratorFileName}`)
      cy.get('[data-test="enumerator-version-pill"]').should('contain', '3')
      cy.get('[data-test="lock-btn"]').should('exist').and('not.be.disabled')
      cy.get('[data-test="delete-enumerator-btn"]').should('exist').and('not.be.disabled')
      cy.get('[data-test="previous-version-btn"]').should('exist').and('not.be.disabled')
      cy.get('[data-test="next-version-btn"]').should('not.exist')
      cy.get('[data-test="add-version-btn"]').should('exist').and('not.be.disabled')
    })

    it('displays correct first version navigator icons on cards page', () => {
      cy.visit('/enumerators/enumerations.0.yaml')
      cy.get('[data-test="enumerator-version-pill"]').should('contain', '0')
      cy.get('[data-test="unlock-btn"]').should('exist')
      cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
      cy.get('[data-test="previous-version-btn"]').should('not.exist')
      cy.get('[data-test="next-version-btn"]').should('exist').and('not.be.disabled')
      cy.get('[data-test="add-version-btn"]').should('exist')
    })
  })

  describe('Locking Business Rules', () => {
    it('can not unlock v0, v1, v2', () => {
      const enumeratorFiles = ['enumerations.0.yaml', 'enumerations.1.yaml', 'enumerations.2.yaml']
      enumeratorFiles.forEach((file) => {
        cy.visit(`/enumerators/${file}`)
        cy.get('[data-test="enumeration-card-default_status"]').click()
        cy.get('[data-test="unlock-btn"]').should('exist').click()
        cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist')
        cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
        cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist').click()
      })
    })

    it('can lock/unlock v3', () => {
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.get('[data-test="delete-enumerator-btn"]').should('exist')
      cy.get('[data-test="lock-btn"]').should('exist').click()
      cy.get('[data-test="lock-btn"]').should('not.exist')
      cy.get('[data-test="add-enumeration-btn"]').should('not.exist')

      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist').click()
    })
  })

  describe('New Version Rules', () => {
    it('can create a new version from v3', () => {
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.get('[data-test="add-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="enumeration-card-default_status"]').should('be.visible')
    })

    it('can create a new version from v0 unlock dialog', () => {
      cy.visit('/enumerators/enumerations.0.yaml')
      cy.get('[data-test="enumeration-card-default_status"]').click()
      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
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
    it('can not delete locked files', () => {
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.get('[data-test="delete-enumerator-btn"]').should('be.visible')
      cy.get('[data-test="lock-btn"]').click()
      cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
    })

    it('deletes with a warning', () => {
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.get('[data-test="delete-enumerator-btn"]').should('be.visible').click()
      cy.get('[data-test="delete-warning-dialog"]').should('be.visible')
      cy.get('[data-test="delete-warning-title"]').should('contain', 'Warning: Delete Enumerator')
      cy.get('[data-test="delete-dialog-cancel-btn"]').should('be.visible')
      cy.get('[data-test="delete-dialog-delete-btn"]').should('be.visible').click()
      cy.url().should('include', '/dictionaries')
    })
  })
})
