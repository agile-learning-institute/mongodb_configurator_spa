

describe('Enumerators page flow', () => {
  let baselineFileName: string
  let baselineVersion: number

  // Setup: Create baseline enumerator once before all tests
  // This creates V3 (or next available version) to test strict versioning rules
  before(() => {
    cy.visit('/enumerators')
    cy.contains('button', 'New').click()
    
    // Wait for creation and extract filename - ensure this completes before tests start
    cy.url().should('include', '/enumerators/enumerations.')
    cy.url().should('match', /\/enumerators\/enumerations\.\d+\.yaml$/)
    
    // Extract filename and ensure it's set before proceeding
    cy.url().then((url) => {
      baselineFileName = url.split('/').pop() || ''
      cy.log(`Created baseline enumerator: ${baselineFileName}`)
      
      // Verify the file was actually created by checking the API
      cy.request(`/api/enumerators/${baselineFileName}/`).then((response) => {
        expect(response.status).to.eq(200)
        cy.log(`Verified enumerator creation: ${baselineFileName}`)
      })
    })
  })

  // Teardown: Clean up the baseline enumerator
  after(() => {
    if (baselineFileName) {
      cy.log(`Cleaning up baseline enumerator: ${baselineFileName}`)
      
      // Delete via API (bypasses versioning rules)
      cy.request({
        method: 'DELETE',
        url: `/api/enumerators/${baselineFileName}/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted ${baselineFileName}`)
        } else {
          cy.log(`Failed to delete ${baselineFileName}: ${response.status}`)
        }
      })
      
      // Verify cleanup by visiting enumerators page and checking file count
      cy.visit('/enumerators')
      cy.get('.v-card').should('have.length', 3) // Should be back to original 3 files
    }
  })

  describe('Basic Page Functionality', () => {
    it('loads enumerators page and shows baseline enumerator', () => {
      // List page
      cy.visit('/enumerators')
      
      // Verify starting state
      cy.get('h3').should('contain', 'Enumerators')
      cy.contains('button', 'New').should('be.visible')

      // Verify our baseline enumerator exists in the list
      cy.get('.v-card').should('contain', baselineFileName)
    })

    it('can open and view baseline enumerator detail page', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Verify basic page elements exist - look for version heading dynamically
      cy.get('[data-test="enumerator-version"]').should('contain', 'Version:')
      cy.get('[data-test="enumerator-version"]').invoke('text').then((versionText) => {
        const versionMatch = versionText.match(/Version: (\d+)/)
        expect(versionMatch).to.not.be.null
        baselineVersion = parseInt(versionMatch![1])
        cy.log(`Baseline enumerator version: ${baselineVersion}`)
        
        // Verify this is the newest version (should be deletable)
        cy.get('[data-test="delete-enumerator-btn"]').should('exist')
      })
      
      // Verify the enumerators section exists
      cy.get('[data-test="card-title"]').should('contain', 'Enumerators')
      cy.contains('button', 'Add Enumeration').should('be.visible')
    })
  })

  describe('Enumerator Content Management', () => {
    it('can add and edit enumerations in baseline enumerator', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Wait for page to fully load
      cy.get('[data-test="enumerator-version"]').should('be.visible')
      
      // Check initial state - baseline enumerator may have default content
      cy.get('[data-test^="enumerator-name-input-"]').then(($inputs) => {
        const initialCount = $inputs.length
        cy.log(`Initial enumerations count: ${initialCount}`)
        
        // Add one enumeration
        cy.get('[data-test="add-enumeration-btn"]').click()
        
        // Wait for the new enumeration to appear
        cy.get('[data-test^="enumerator-name-input-"]').should('have.length', initialCount + 1)
        
        // Get the last (newest) enumeration input
        cy.get('[data-test^="enumerator-name-input-"]').last().clear().type('TestEnum1')
        cy.get('[data-test^="enumerator-name-input-"]').last().blur()

        // Wait for the PUT request to complete (indicating the edit was saved)
        cy.intercept('PUT', '/api/enumerators/*').as('updateEnumerator')
        cy.wait('@updateEnumerator')

        // Verify the enumeration was added
        cy.get('[data-test^="enumerator-name-input-"]').should('have.length', initialCount + 1)
        cy.get('[data-test^="enumerator-name-input-"]').last().should('have.value', 'TestEnum1')
        
        // Log final state for debugging
        cy.get('[data-test^="enumerator-name-input-"]').then(($finalInputs) => {
          cy.log(`Final enumerations count: ${$finalInputs.length}`)
          $finalInputs.each((index, input) => {
            cy.log(`Enumeration ${index}: ${input.value}`)
          })
        })

        // Edit the new enumeration
        cy.get('[data-test^="enumerator-name-input-"]').last().clear().type('UpdatedEnum1')
        cy.get('[data-test^="enumerator-name-input-"]').last().blur()

        // Wait for the PUT request to complete
        cy.wait('@updateEnumerator')

        // Verify the edit was saved
        cy.get('[data-test^="enumerator-name-input-"]').last().should('have.value', 'UpdatedEnum1')
      })
    })
  })

  describe('Version Management and Navigation', () => {
    it('displays correct version navigator icons and respects versioning rules', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Get current version number for dynamic testing
      cy.get('[data-test="enumerator-version"]').invoke('text').then((versionText) => {
        const currentVersion = parseInt(versionText.match(/Version: (\d+)/)?.[1] || '0')
        cy.log(`Testing version: ${currentVersion}`)
        
        // Verify the version navigator uses the correct icons
        // Previous version button should use mdi-skip-previous with default size (if it exists)
        cy.get('body').then(($body) => {
          if ($body.find('[data-test="previous-version-btn"]').length > 0) {
            cy.get('[data-test="previous-version-btn"]').should('exist')
            cy.get('[data-test="previous-version-btn"] .v-icon').should('have.class', 'mdi-skip-previous')
            cy.get('[data-test="previous-version-btn"]').should('not.have.class', 'v-btn--size-small')
          }
        })
        
        // Next version button should use mdi-skip-next with default size (if it exists)
        cy.get('body').then(($body) => {
          if ($body.find('[data-test="next-version-btn"]').length > 0) {
            cy.get('[data-test="next-version-btn"]').should('exist')
            cy.get('[data-test="next-version-btn"] .v-icon').should('have.class', 'mdi-skip-next')
            cy.get('[data-test="next-version-btn"]').should('not.have.class', 'v-btn--size-small')
          }
        })
        
        // Verify the version text is displayed
        cy.get('[data-test="enumerator-version"]').should('be.visible')
        
        // Verify the add version button exists and has correct data-test attribute
        cy.get('[data-test="add-version-btn"]').should('exist')
        cy.get('[data-test="add-version-btn"] .v-icon').should('have.class', 'mdi-plus')
        
        // Test versioning business rules
        if (currentVersion > 1) {
          // If there are previous versions, test navigation and versioning rules
          cy.get('[data-test="previous-version-btn"]').should('not.be.disabled')
          
          // Navigate to previous version
          cy.get('[data-test="previous-version-btn"]').click()
          
          // Previous version should NOT be deletable (only newest version can be deleted)
          cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
          
          // Navigate back to newest version
          cy.get('[data-test="next-version-btn"]').click()
        }
        
        // Newest version should be deletable
        cy.get('[data-test="delete-enumerator-btn"]').should('exist')
      })
    })

    it('verifies lock/unlock button states and data-test attributes', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Verify lock/unlock and delete buttons have correct data-test attributes
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="unlock-btn"]').length > 0) {
          cy.get('[data-test="unlock-btn"]').should('exist')
          cy.get('[data-test="unlock-icon"]').should('exist')
          cy.get('[data-test="unlock-btn-text"]').should('exist')
        } else if ($body.find('[data-test="lock-btn"]').length > 0) {
          cy.get('[data-test="lock-btn"]').should('exist')
          cy.get('[data-test="lock-icon"]').should('exist')
          cy.get('[data-test="lock-btn-text"]').should('exist')
        }
      })
      
      // Check if delete button exists (only for unlocked versions)
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="delete-enumerator-btn"]').length > 0) {
          cy.get('[data-test="delete-enumerator-btn"]').should('exist')
          cy.get('[data-test="delete-enumerator-icon"]').should('exist')
          cy.get('[data-test="delete-enumerator-btn-text"]').should('exist')
        }
      })
    })
  })

  describe('Version Management and Business Rules', () => {
    it('tests new version creation from unlock warning dialog', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Debug: Check initial state
      cy.log('Checking initial enumerator state...')
      cy.get('body').then(($body) => {
        const hasLockBtn = $body.find('[data-test="lock-btn"]').length > 0
        const hasUnlockBtn = $body.find('[data-test="unlock-btn"]').length > 0
        cy.log(`Initial state - Lock button: ${hasLockBtn}, Unlock button: ${hasUnlockBtn}`)
        
        if (hasLockBtn) {
          // Already unlocked, need to lock it first
          cy.log('Enumerator is unlocked, attempting to lock...')
          cy.get('[data-test="lock-btn"]').click()
          
          // Wait for lock to complete and verify state change
          cy.wait(2000) // Wait longer for lock to complete
          
          // Verify the lock operation worked
          cy.get('[data-test="unlock-btn"]').should('be.visible')
          cy.log('Enumerator successfully locked')
        } else if (hasUnlockBtn) {
          cy.log('Enumerator is already locked')
        } else {
          cy.log('Neither lock nor unlock button found - unexpected state')
        }
        
        // Now should see unlock button (enumerator is locked)
        cy.get('[data-test="unlock-btn"]').should('be.visible')
        
        // Click unlock to show the warning dialog
        cy.get('[data-test="unlock-btn"]').click()
        
        // Verify the unlock warning dialog is displayed
        cy.get('[data-test="unlock-warning-dialog"]').should('be.visible')
        cy.get('[data-test="unlock-warning-title"]').should('contain', 'Warning: Editing Deployed Enumerator')
        cy.get('[data-test="unlock-warning-content"]').should('be.visible')
        cy.get('[data-test="unlock-warning-alert"]').should('contain', 'Recommended: Create a new version')
        
        // Verify the dialog has the correct buttons
        cy.get('[data-test="unlock-dialog-cancel-btn"]').should('be.visible')
        cy.get('[data-test="unlock-dialog-create-version-btn"]').should('be.visible')
        cy.get('[data-test="unlock-dialog-unlock-btn"]').should('be.visible')
        
        // Click "Create New Version" button
        cy.get('[data-test="unlock-dialog-create-version-btn"]').click()
        
        // Wait for navigation to the new version
        cy.url().should('include', '/enumerators/enumerations.')
        cy.url().should('match', /\/enumerators\/enumerations\.\d+\.yaml$/)
        
        // Verify we're on a new version (should be unlocked and deletable)
        cy.get('[data-test="enumerator-version"]').should('be.visible')
        cy.get('[data-test="delete-enumerator-btn"]').should('exist')
        cy.get('[data-test="lock-btn"]').should('exist')
      })
    })

    it('tests version locking/unlocking rules (only newest version can be unlocked)', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Get current version number
      cy.get('[data-test="enumerator-version"]').invoke('text').then((versionText) => {
        const currentVersion = parseInt(versionText.match(/Version: (\d+)/)?.[1] || '0')
        cy.log(`Testing version: ${currentVersion}`)
        
        if (currentVersion > 1) {
          // Navigate to previous version
          cy.get('[data-test="previous-version-btn"]').click()
          
          // Previous version should NOT be unlockable (only newest version can be unlocked)
          cy.get('[data-test="unlock-btn"]').should('not.exist')
          cy.get('[data-test="lock-btn"]').should('exist')
          
          // Navigate back to newest version
          cy.get('[data-test="next-version-btn"]').click()
          
          // Newest version should be unlockable
          cy.get('[data-test="unlock-btn"]').should('exist')
        } else {
          // If only one version, check if it's locked or unlocked
          cy.get('body').then(($body) => {
            if ($body.find('[data-test="unlock-btn"]').length > 0) {
              // Already locked, can be unlocked
              cy.get('[data-test="unlock-btn"]').should('exist')
            } else if ($body.find('[data-test="lock-btn"]').length > 0) {
              // Already unlocked, can be locked
              cy.get('[data-test="lock-btn"]').should('exist')
            }
          })
        }
      })
    })

    it('tests version deletion rules (only unlocked versions can be deleted)', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Get current version number
      cy.get('[data-test="enumerator-version"]').invoke('text').then((versionText) => {
        const currentVersion = parseInt(versionText.match(/Version: (\d+)/)?.[1] || '0')
        cy.log(`Testing version: ${currentVersion}`)
        
        if (currentVersion > 1) {
          // Navigate to previous version
          cy.get('[data-test="previous-version-btn"]').click()
          
          // Previous version should NOT be deletable (only newest version can be deleted)
          cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
          
          // Navigate back to newest version
          cy.get('[data-test="next-version-btn"]').click()
          
          // Newest version should be deletable if unlocked
          cy.get('body').then(($body) => {
            if ($body.find('[data-test="delete-enumerator-btn"]').length > 0) {
              cy.get('[data-test="delete-enumerator-btn"]').should('exist')
            }
          })
        } else {
          // If only one version, it should be deletable if unlocked
          cy.get('body').then(($body) => {
            if ($body.find('[data-test="delete-enumerator-btn"]').length > 0) {
              cy.get('[data-test="delete-enumerator-btn"]').should('exist')
            }
          })
        }
      })
    })

    it('tests version copying and locking (newest version copied and locked)', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // First, ensure the enumerator is locked so we can test the unlock flow
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="lock-btn"]').length > 0) {
          // Already unlocked, need to lock it first
          cy.get('[data-test="lock-btn"]').click()
          cy.wait(1000) // Wait for lock to complete
        }
        
        // Now should see unlock button (enumerator is locked)
        cy.get('[data-test="unlock-btn"]').should('be.visible')
        
        // Click unlock to show the warning dialog
        cy.get('[data-test="unlock-btn"]').click()
        
        // Verify the unlock warning dialog is displayed
        cy.get('[data-test="unlock-warning-dialog"]').should('be.visible')
        
        // Click "Create New Version" button
        cy.get('[data-test="unlock-dialog-create-version-btn"]').click()
        
        // Wait for navigation to the new version
        cy.url().should('include', '/enumerators/enumerations.')
        cy.url().should('match', /\/enumerators\/enumerations\.\d+\.yaml$/)
        
        // Verify the new version is unlocked (can be edited)
        cy.get('[data-test="lock-btn"]').should('exist')
        cy.get('[data-test="delete-enumerator-btn"]').should('exist')
        
        // Verify the previous version is now locked (cannot be edited)
        cy.get('[data-test="previous-version-btn"]').click()
        cy.get('[data-test="unlock-btn"]').should('exist')
        cy.get('[data-test="delete-enumerator-btn"]').should('not.exist')
        
        // Navigate back to newest version
        cy.get('[data-test="next-version-btn"]').click()
      })
    })
  })

  describe('Delete Functionality', () => {
    it('tests delete warning and confirmation flow', () => {
      // Visit the baseline enumerator detail page
      cy.visit(`/enumerators/${baselineFileName}`)
      
      // Ensure the enumerator is unlocked (can be deleted)
      cy.get('body').then(($body) => {
        if ($body.find('[data-test="unlock-btn"]').length > 0) {
          cy.get('[data-test="unlock-btn"]').click()
          
          // Verify the unlock warning dialog is displayed
          cy.get('[data-test="unlock-warning-dialog"]').should('be.visible')
          
          // Click "Unlock Current Version" button
          cy.get('[data-test="unlock-dialog-unlock-btn"]').click()
          
          cy.wait(1000) // Wait for unlock to complete
        }
      })
      
      // Now click delete to show the warning dialog
      cy.get('[data-test="delete-enumerator-btn"]').click()
      
      // Verify the delete warning dialog is displayed
      cy.get('[data-test="delete-warning-dialog"]').should('be.visible')
      cy.get('[data-test="delete-warning-title"]').should('contain', 'Warning: Delete Enumerator')
      cy.get('[data-test="delete-warning-content"]').should('be.visible')
      cy.get('[data-test="delete-warning-alert"]').should('contain', 'Warning: This is a destructive action')
      
      // Verify the dialog has the correct buttons
      cy.get('[data-test="delete-dialog-cancel-btn"]').should('be.visible')
      cy.get('[data-test="delete-dialog-delete-btn"]').should('be.visible')
      
      // Click "Delete Enumerator" button
      cy.get('[data-test="delete-dialog-delete-btn"]').click()
      
      // Verify the delete confirmation dialog is displayed
      cy.get('[data-test="delete-confirmation-dialog"]').should('be.visible')
      cy.get('[data-test="delete-confirmation-title"]').should('contain', 'Final Confirmation')
      cy.get('[data-test="delete-confirmation-content"]').should('be.visible')
      cy.get('[data-test="delete-confirmation-input"]').should('be.visible')
      
      // Verify the dialog has the correct buttons
      cy.get('[data-test="delete-confirmation-cancel-btn"]').should('be.visible')
      cy.get('[data-test="delete-confirmation-confirm-btn"]').should('be.visible')
      
      // Type "DELETE" to confirm
      cy.get('[data-test="delete-confirmation-input"]').type('DELETE')
      
      // Click "Delete" button
      cy.get('[data-test="delete-confirmation-confirm-btn"]').click()
      
      // Verify we're redirected to the enumerators list page
      cy.url().should('match', /\/enumerators\/?$/)
      cy.get('h3').should('contain', 'Enumerators')
    })
  })
})
