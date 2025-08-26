

describe('Enumerators page flow', () => {
  let baselineFileName: string

  // Setup: Create baseline enumerator once before all tests
  before(() => {
    // Reset database to ensure clean state
    // cy.exec('npm run api')
    
    // Wait for the API to be ready - give database more time to start
    // cy.wait(2000)
    
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
    
    // Verify basic page elements exist - look for version heading
    cy.get('.text-h4').first().should('contain', 'Version: 3')
    cy.contains('button', 'Lock').should('be.visible')
    cy.contains('button', 'Delete').should('be.visible')
    
    // Verify the enumerators section exists
    cy.get('[data-test="card-title"]').should('contain', 'Enumerators')
    cy.contains('button', 'Add Enumeration').should('be.visible')
  })

  it('can add and edit enumerations in baseline enumerator', () => {
    // Visit the baseline enumerator detail page
    cy.visit(`/enumerators/${baselineFileName}`)
    
    // Add first enumeration
    cy.contains('button', 'Add Enumeration').click()
    
                    // Wait for the new enumeration to appear
                cy.get('.enumerator-name-input').should('be.visible')
                
                // Type the name
                cy.get('.enumerator-name-input').first().clear().type('TestEnum1')
                cy.get('.enumerator-name-input').first().blur()

                // Wait for the PUT request to complete (indicating the edit was saved)
                cy.intercept('PUT', '/api/enumerators/*').as('updateEnumerator')
                cy.wait('@updateEnumerator')

                // Refresh the page to see the persisted state
                cy.reload()

                // Verify the name is visible in the input's value attribute
                cy.get('.enumerator-name-input').first().should('have.value', 'TestEnum1')
  })
})
