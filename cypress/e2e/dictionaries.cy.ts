describe('Dictionaries page flow', () => {
  let createdDictionaryName: string

  // Clean up any dictionaries created during tests
  afterEach(() => {
    if (createdDictionaryName) {
      cy.log(`Cleaning up created dictionary: ${createdDictionaryName}`)

      // Delete via API
      cy.request({
        method: 'DELETE',
        url: `/api/dictionaries/${createdDictionaryName}.yaml/`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          cy.log(`Successfully deleted ${createdDictionaryName}`)
        } else {
          cy.log(`Failed to delete ${createdDictionaryName}: ${response.status}`)
        }
      })

      createdDictionaryName = ''
    }
  })

  it('loads dictionaries page and shows basic elements', () => {
    // Visit dictionaries page
    cy.visit('/dictionaries')

    // Verify basic page elements
    cy.get('h3').should('contain', 'Dictionaries')
    cy.contains('button', 'New').should('be.visible')
    
    // Wait for any existing dictionaries to load
    cy.get('[data-test^="file-card-"]').should('exist')
  })

  it('can create a new dictionary via dialog', () => {
    // Visit dictionaries page
    cy.visit('/dictionaries')

    // Click New button to open dialog
    cy.contains('button', 'New').click()

    // Verify dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Create New Dictionary')

    // Type a name
    const dictionaryName = `TestDictionary-${Date.now()}`
    cy.get('.v-dialog input').type(dictionaryName)

    // Click Create button
    cy.get('.v-dialog').contains('button', 'Create').click()

    // Verify dialog is closed
    cy.get('.v-dialog').should('not.exist')

    // Store the dictionary name for cleanup
    createdDictionaryName = dictionaryName

    // Wait a moment for the API call to complete
    cy.wait(1000)

    // After creation, we should be redirected to the detail page
    cy.url().should('include', `/dictionaries/${dictionaryName}.yaml`)

    // Navigate back to the dictionaries list to verify the dictionary was created
    cy.visit('/dictionaries')

    // Wait for the dictionary to appear in the list using the correct selector
    cy.get(`[data-test="file-card-${dictionaryName}.yaml"]`).should('be.visible')
  })

  it('can navigate to newly created dictionary detail page and verify elements', () => {
    // First create a dictionary
    cy.visit('/dictionaries')
    cy.contains('button', 'New').click()

    const dictionaryName = `TestDictionary-${Date.now()}`
    cy.get('.v-dialog input').type(dictionaryName)
    cy.get('.v-dialog').contains('button', 'Create').click()

    // After creation, we should be on the detail page
    cy.url().should('include', `/dictionaries/${dictionaryName}.yaml`)

    // Store the dictionary name for cleanup
    createdDictionaryName = dictionaryName

    // Verify basic page elements exist
    cy.get('h2.text-h4').should('be.visible')
    cy.get('h2.text-h4').should('contain', `${dictionaryName}.yaml`)

    // Check for the specific elements that should be visible on a newly created dictionary
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Delete').should('be.visible')
  })

  it('can lock and unlock a newly created dictionary', () => {
    // First create a dictionary
    cy.visit('/dictionaries')
    cy.contains('button', 'New').click()

    const dictionaryName = `TestDictionary-${Date.now()}`
    cy.get('.v-dialog input').type(dictionaryName)
    cy.get('.v-dialog').contains('button', 'Create').click()

    // After creation, we should be on the detail page
    cy.url().should('include', `/dictionaries/${dictionaryName}.yaml`)

    // Store the dictionary name for cleanup
    createdDictionaryName = dictionaryName

    // Newly created dictionaries should be unlocked by default, so we should see Lock button
    cy.contains('button', 'Lock').should('be.visible')

    // Lock the dictionary
    cy.contains('button', 'Lock').click()

    // Verify it's now locked (Lock button should be replaced with Unlock)
    cy.contains('button', 'Unlock').should('be.visible')
    cy.contains('button', 'Lock').should('not.exist')

    // Unlock the dictionary - this opens a confirmation dialog
    cy.contains('button', 'Unlock').click()

    // Verify unlock confirmation dialog is open
    cy.get('.v-dialog').should('be.visible')
    cy.get('.v-dialog .v-card-title').should('contain', 'Unlock Dictionary?')

    // Click Unlock button in dialog
    cy.get('.v-dialog').contains('button', 'Unlock').click()

    // Verify it's now unlocked (Unlock button should be replaced with Lock)
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Unlock').should('not.exist')
  })

  it('can delete a dictionary with confirmation', () => {
    // First create a dictionary to ensure we have one to delete
    cy.visit('/dictionaries')
    cy.contains('button', 'New').click()
    const dictionaryName = `DictionaryToDelete-${Date.now()}`
    cy.get('.v-dialog input').type(dictionaryName)
    cy.get('.v-dialog').contains('button', 'Create').click()
    cy.url().should('include', `/dictionaries/${dictionaryName}.yaml`)
    createdDictionaryName = dictionaryName // Ensure this is set for cleanup

    // Check if the dictionary is locked - if so, we need to unlock it first to delete
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Unlock")').length > 0) {
        // Dictionary is locked, unlock it first - this opens a confirmation dialog
        cy.contains('button', 'Unlock').click()

        // Verify unlock confirmation dialog is open
        cy.get('.v-dialog').should('be.visible')
        cy.get('.v-dialog .v-card-title').should('contain', 'Unlock Dictionary?')

        // Click Unlock button in dialog
        cy.get('.v-dialog').contains('button', 'Unlock').click()

        cy.wait(1000) // Wait for unlock to complete
      }

      // Now click Delete button
      cy.contains('button', 'Delete').click()

      // Verify delete confirmation dialog is open
      cy.get('.v-dialog').should('be.visible')
      cy.get('.v-dialog .v-card-title').should('contain', 'Delete Dictionary?')

      // Click Delete button in dialog
      cy.get('.v-dialog').contains('button', 'Delete').click()

      // Verify dialog is closed and we're redirected to dictionaries list
      cy.get('.v-dialog').should('not.exist')
      cy.url().should('match', /\/dictionaries\/?$/)
    })
  })
})
