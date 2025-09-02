

describe('Enumerators page flow', () => {
  let enumeratorFileName: string = 'enumerations.3.yaml'

  // Helper function to verify seed data
  const verifySeedData = () => {
    cy.get('[data-test="enumerator-version"]').should('be.visible')
    cy.get('[data-test="enumerator-version"]').should('contain', 'Version:')
    cy.get('[data-test="delete-enumerator-btn"]').should('exist')
    cy.get('[data-test="lock-btn"]').should('exist')
    cy.get('[data-test="card-title"]').should('contain', 'Enumerators')
    cy.contains('button', 'Add Enumeration').should('be.visible')

    cy.get('[data-test="enumerator-name-input-0"]').should('have.value', 'default_status')
    cy.get('[data-test="enum-value-input-0-0"]').find('input').should('have.value', 'draft')
    cy.get('[data-test="enum-description-input-0-0"]').find('input').should('have.value', 'Draft')
    cy.get('[data-test="enum-value-input-0-1"]').find('input').should('have.value', 'active')
    cy.get('[data-test="enum-description-input-0-1"]').find('input').should('have.value', 'Not Deleted')
    cy.get('[data-test="enum-value-input-0-2"]').find('input').should('have.value', 'archived')
    cy.get('[data-test="enum-description-input-0-2"]').find('input').should('have.value', 'Soft Delete Indicator')
  }

  // Helper function to delete non-seed data
  const deleteNonSeedData = () => {
    const filesToDelete = ["enumerations.3.yaml", "enumerations.4.yaml", "enumerations.5.yaml", "enumerations.6.yaml", "enumerations.7.yaml", "enumerations.8.yaml"]
    filesToDelete.forEach((file) => {
      cy.request({
        method: 'PUT',
        url: `/api/enumerators/${file}/`,
        body: {"_locked": false},
        failOnStatusCode: false
      }).then((unlockResponse) => {
        if (unlockResponse.status === 200) {
          cy.log(`Successfully unlocked ${file}`)
          cy.request({
            method: 'DELETE',
            url: `/api/enumerators/${file}/`,
            failOnStatusCode: false
          }).then((deleteResponse) => {
            if (deleteResponse.status === 200) {
              cy.log(`Successfully deleted ${file}`)
            } else {
              cy.log(`Failed to delete ${file}: ${deleteResponse.status}`)
            }
          })
        } else {
          cy.log(`Failed to unlock ${file}: ${unlockResponse.status}`)
        }
      })
    })
  }

  // Setup: Create a new working version before each test
  // This ensures each test starts with a clean, unlocked version to work with
  beforeEach(() => {
    deleteNonSeedData()
    cy.visit('/enumerators')
    cy.contains('button', 'New').click()
    cy.get(`[data-test="enumerator-version"]`).should('be.visible')
    cy.get(`[data-test="enumerator-version"]`).should('contain', `Version: 3`)
  })

  // Teardown: Clean up the working version and any higher versions after each test
  afterEach(() => {
    // Clean up any versions that might have been created 
    deleteNonSeedData()

    // Verify cleanup by visiting enumerators page and checking file count
    cy.visit('/enumerators')
    cy.get('.v-card').should('have.length', 3)
  })

  describe('List Page Functionality', () => {
    it('loads enumerators list page and shows working version enumerator', () => {
      // List page
      cy.visit('/enumerators')
      
      // Verify starting state
      cy.get('h3').should('contain', 'Enumerators')
      cy.contains('button', 'New').should('be.visible')
      cy.contains('button', 'Lock All').should('be.visible')
      cy.get('.v-card').should('have.length', 4)
      cy.get('.v-card').last().should('contain', `enumerations.3.yaml`)
    })
  })

  describe('Enumerator Detail Page Base Functionality', () => {
    it('can open and view enumerator detail page', () => {
      // Visit the working version enumerator detail page
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.url().should('contain', '/enumerators/enumerations.3.yaml')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
    })

    it('can add and edit enumerations in working version enumerator', () => {
      // Visit the working version enumerator detail page
      cy.visit(`/enumerators/${enumeratorFileName}`)
      
      // Verify starting state (should contain seed data from V2)
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
             
      // Add new enumeration
      cy.get('[data-test="add-enumeration-btn"]').click()
      cy.get('[data-test="enumerator-name-input-1"]').clear().type('TestEnum1')
      
      // Add first value to the new enumeration
      cy.get('[data-test="add-enum-value-btn-1"]').click()
      cy.get('[data-test="enum-value-input-1-0"]').type('TestValue1')
      cy.get('[data-test="enum-description-input-1-0"]').type('Test Description One')
      
      // Add second value to the new enumeration
      cy.get('[data-test="add-enum-value-btn-1"]').click()
      cy.get('[data-test="enum-value-input-1-1"]').type('TestValue2')
      cy.get('[data-test="enum-description-input-1-1"]').type('Test Description Two')

      // Wait for the enumeration to be saved and reload the page
      cy.get('[data-test^="enumerator-name-input-"]').should('have.length', 2)
      cy.wait(1000)
      cy.reload()

      // Verify all values on the page after reload
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()

      // Verify new enumeration and its values
      cy.get('[data-test="enumerator-name-input-1"]').should('have.value', 'TestEnum1')
      cy.get('[data-test="enum-value-count-1"]').should('contain', '2 values')
      cy.get('[data-test="toggle-enumerator-btn-1"]').should('exist').click()
      cy.get('[data-test="enum-value-input-1-0"]').find('input').should('have.value', 'TestValue1')
      cy.get('[data-test="enum-description-input-1-0"]').find('input').should('have.value', 'Test Description One')
      cy.get('[data-test="enum-value-input-1-1"]').find('input').should('have.value', 'TestValue2')
      cy.get('[data-test="enum-description-input-1-1"]').find('input').should('have.value', 'Test Description Two')

      // Delete the second value from the new enumeration
      cy.get('[data-test="delete-enum-value-btn-1-1"]').click()
      cy.get('[data-test="enum-value-count-1"]').should('contain', '1 values')
      cy.get('[data-test="enum-value-input-1-1"]').should('not.exist')

      // Delete the new enumeration
      cy.get('[data-test="delete-enumeration-btn-1"]').click()
      cy.get('[data-test="enumerator-name-input-1"]').should('not.exist')
      
      // Verify original seed data still exists
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
    })
  })

  describe('Version Navigation', () => {
    it('displays correct newest version navigator icons', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${enumeratorFileName}`)
      
      // Assert version is 3, previous version button exists, next version is not visible, Add Version button exists and is visible and enabled
      cy.get('[data-test="enumerator-version"]').should('contain', 'Version: 3')
      cy.get('[data-test="lock-btn"]').should('exist')
      cy.get('[data-test="lock-btn"]').should('be.visible')
      cy.get('[data-test="delete-enumerator-btn"]').should('exist')
      cy.get('[data-test="delete-enumerator-btn"]').should('be.visible')
      cy.get('[data-test="delete-enumerator-btn"]').should('not.be.disabled')
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"]').should('be.visible')
      cy.get('[data-test="previous-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="next-version-btn"]').should('exist')
      cy.get('[data-test="next-version-btn"]').should('be.visible')
      cy.get('[data-test="next-version-btn"]').should('be.disabled')
      cy.get('[data-test="add-version-btn"]').should('exist')
      cy.get('[data-test="add-version-btn"]').should('be.visible')
      cy.get('[data-test="add-version-btn"]').should('not.be.disabled')
    })
    
    it('displays correct first version navigator icons', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/enumerations.0.yaml`)
      
      // Assert version is 0, previous disabled, next works, add version button doesn't exist
      cy.get('[data-test="enumerator-version"]').should('contain', 'Version: 0')
      cy.get('[data-test="unlock-btn"]').should('exist')
      cy.get('[data-test="unlock-btn"]').should('be.visible')
      cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"]').should('be.visible')
      cy.get('[data-test="previous-version-btn"]').should('be.disabled')
      cy.get('[data-test="next-version-btn"]').should('exist')
      cy.get('[data-test="next-version-btn"]').should('be.visible')
      cy.get('[data-test="next-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="add-version-btn"]').should('not.exist')
    })
    
    it('displays correct middle version navigator icons', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/enumerations.1.yaml`)
      
      // Assert version is 1, previous and next work, add version button doesn't exist
      cy.get('[data-test="enumerator-version"]').should('contain', 'Version: 1')
      cy.get('[data-test="unlock-btn"]').should('exist')
      cy.get('[data-test="unlock-btn"]').should('be.visible')
      cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
      cy.get('[data-test="previous-version-btn"]').should('exist')
      cy.get('[data-test="previous-version-btn"]').should('be.visible')
      cy.get('[data-test="previous-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="next-version-btn"]').should('exist')
      cy.get('[data-test="next-version-btn"]').should('be.visible')
      cy.get('[data-test="next-version-btn"]').should('not.be.disabled')
      cy.get('[data-test="add-version-btn"]').should('not.exist')
    })

  })

  describe('Locking Business Rules', () => {
    it('can not unlock v0, v1, v2', () => {
      // Visit the baseline enumerator detail page and lock it.
      const enumeratorFiles = ["enumerations.0.yaml", "enumerations.1.yaml", "enumerations.2.yaml"]
      enumeratorFiles.forEach((file) => {
        cy.visit(`/enumerators/${file}`)
        cy.get('[data-test="unlock-btn"]').should('exist').click()
        cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist')
        cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
        cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist').click()
      })
    })

    it('can lock/unlock v3', () => {
      // Visit the baseline enumerator detail page and lock it.
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.get('[data-test="delete-enumerator-btn"]').should('exist')
      cy.get('[data-test="lock-btn"]').should('exist').click()
      cy.get('[data-test="lock-btn"]').should('not.exist')
      cy.get('[data-test="add-enumeration-btn"]').should('not.exist')
      cy.get('[data-test="delete-enumeration-btn-1"]').should('not.exist')
      cy.get('[data-test="add-enum-value-btn-"]').should('have.length', 0)
      cy.get('[data-test="delete-enum-value-btn-"]').should('have.length', 0)

      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist').click()
    })

  })

  describe('New Version Rules', () => {
    it('can create a new version from v3', () => {
      // Visit the baseline enumerator detail page and lock it.
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.get('[data-test="add-version-btn"]').should('exist').click()

      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
    })

    it('can create a new version from v0 unlock dialog', () => {
      cy.visit(`/enumerators/enumerations.0.yaml`)
      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
    })

    it('can create a new version from v1 unlock dialog', () => {
      cy.visit(`/enumerators/enumerations.1.yaml`)
      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
    })

    it('can create a new version from v2 unlock dialog', () => {
      cy.visit(`/enumerators/enumerations.2.yaml`)
      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
    })

    it('can create a new version from v3 unlock dialog', () => {
      cy.visit(`/enumerators/enumerations.3.yaml`)
      cy.get('[data-test="lock-btn"]').should('exist').click()
      cy.get('[data-test="lock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-btn"]').should('exist').click()
      cy.get('[data-test="unlock-dialog-unlock-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-cancel-btn"]').should('exist')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('exist').click()
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '3 values')
      verifySeedData()
    })

    it('creates a new version with new version button', () => {
      cy.visit('/enumerators/enumerations.3.yaml')

      // Add a value to the new default status enumeration
      cy.get('[data-test="add-enum-value-btn-0"]').click()
      cy.get('[data-test="enum-value-input-0-3"]').type('TestNewValue1')
      cy.get('[data-test="enum-description-input-0-3"]').type('Test New Description')

      // Create the new version
      cy.wait(1000)
      cy.get('[data-test="add-version-btn"]').should('exist').click()
      
      // Wait for navigation to complete
      cy.wait(1000)
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      
      // Now check the version
      cy.get('[data-test="enumerator-version"]').should('be.visible')
      cy.get('[data-test="enumerator-version"]').should('contain', 'Version: 4')

      // Verify the new data is present
      cy.get('[data-test="enum-value-input-0-3"]').find('input').should('have.value', 'TestNewValue1')
      cy.get('[data-test="enum-description-input-0-3"]').find('input').should('have.value', 'Test New Description')
      cy.get('[data-test="enumerator-name-input-1"]').should('not.exist')
      cy.get('[data-test="enum-value-count-0"]').should('contain', '4 values')
      verifySeedData()      

    })

    it('locks when new list new button', () => {
      // Visit the current version enumerator detail page
      cy.visit('/enumerators')
      cy.contains('button', 'New').click()
        
      // Wait for navigation to the new version
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="lock-btn"]').should('exist')

      // Verify V3 is locked
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="lock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-btn"]').should('exist')
    })

    it('locks when new from current version unlock warning dialog', () => {
      // Visit the current version enumerator detail page
      cy.visit('/enumerators/enumerations.3.yaml')
      
      // Try to lock and unlock the current version (should show warning dialog)
      cy.get('[data-test="lock-btn"]').click()
      cy.get('[data-test="unlock-btn"]').click()
      cy.get('[data-test="unlock-warning-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('be.visible').click()
      
      // Wait for navigation to the new version
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="lock-btn"]').should('exist')

      // Verify the current version is locked
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="lock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-btn"]').should('exist')
    })

    it('locks when new from old version unlock warning dialog', () => {
      // Visit the current version enumerator detail page
      cy.visit('/enumerators/enumerations.1.yaml')
      
      // Try to unlock and add new version
      cy.get('[data-test="unlock-btn"]').click()
      cy.get('[data-test="unlock-warning-dialog"]').should('be.visible')
      cy.get('[data-test="unlock-dialog-create-version-btn"]').should('be.visible').click()
      
      // Wait for navigation to the new version
      cy.url().should('contain', '/enumerators/enumerations.4.yaml')
      cy.get('[data-test="lock-btn"]').should('exist')

      // Verify the current version is locked
      cy.visit('/enumerators/enumerations.3.yaml')
      cy.get('[data-test="lock-btn"]').should('not.exist')
      cy.get('[data-test="unlock-btn"]').should('exist')
    })

  })

  describe('Delete Functionality', () => {
    it('can not delete locked files)', () => {
      // Visit the working version enumerator detail page
      cy.visit(`/enumerators/enumerations.3.yaml`)
    
      // Try to delete the version (should show warning dialog)
      cy.get('[data-test="delete-enumerator-btn"]').should('be.visible')
      cy.get('[data-test="lock-btn"]').click()
      cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
    })

    it('deletes with a warning', () => {
      // Visit the working version enumerator detail page (should already be unlocked)
      cy.visit(`/enumerators/enumerations.3.yaml`)
      
      // Now click delete to show the warning dialog
      cy.get('[data-test="delete-enumerator-btn"]').should('be.visible').click()
      cy.get('[data-test="delete-warning-dialog"]').should('be.visible')
      cy.get('[data-test="delete-warning-title"]').should('contain', 'Warning: Delete Enumerator')
      cy.get('[data-test="delete-dialog-cancel-btn"]').should('be.visible')
      cy.get('[data-test="delete-dialog-delete-btn"]').should('be.visible').click()
      cy.url().should('contain', '/enumerators')
    })
  })
})
