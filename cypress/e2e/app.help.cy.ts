describe('App Help Pages', () => {
  // Reset backend
  before(() => {
    // cy.exec('npm run service', { failOnNonZeroExit: true, timeout: 120000 })
    cy.wait(1000)
  })

  it('loads the welcome carousel and navigation', () => {
    cy.visit('/')
    cy.getByTest('help-carousel').should('be.visible')
    cy.getByTest('carousel-title-text').should('contain.text', 'Welcome')
  })

  it('has help content for each page', () => {
    cy.visit('/')
    cy.getByTest('help-carousel').should('be.visible')
    cy.getByTest('carousel-title-text').should('contain.text', 'Welcome')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Collection Configuration')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Dictionary')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Type')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Enumerator')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Test Data')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Migration')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Admin')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Configuration Processing Events')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Locking')

    cy.get('[data-test="carousel-next-btn"]').should('be.visible').click()
    cy.getByTest('carousel-title-text').should('contain.text', 'Welcome')
  })

  it('can navigate to the help page from configuration pages', () => {
    cy.visit('/dictionaries')
    cy.wait(100)
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Dictionary')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="page-title"]').should('contain.text', 'Dictionaries')

    cy.visit('/configurations/sample.yaml')
    cy.wait(100)
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Collection Configuration')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="card-header"]').should('contain.text', 'Version')
  })

  it('can navigate to the help page from dictionary pages', () => {
    cy.visit('/dictionaries')
    cy.wait(100)
    cy.get('[data-test="page-title"]').should('contain.text', 'Dictionaries')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Dictionary')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="page-title"]').should('contain.text', 'Dictionaries')

    cy.visit('/dictionaries/sample.1.0.1.yaml')
    cy.wait(100)
    cy.get('header').should('contain.text', 'sample.1.0.1')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Dictionary')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('header').should('contain.text', 'sample.1.0.1')
  })

  it('can navigate to the help page from type pages', () => {
    cy.visit('/types')
    cy.wait(100)
    cy.get('[data-test="page-title"]').should('contain.text', 'Types')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Type')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="page-title"]').should('contain.text', 'Types')

    cy.visit('/types/word.yaml')
    cy.wait(100)
    cy.get('header').should('contain.text', 'Type: word')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Type')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('header').should('contain.text', 'Type: word')
  })

  it('can navigate to the help page from enumerators pages', () => {
    cy.visit('/enumerators/enumerations.0.yaml')
    cy.wait(100)
    cy.get('[data-test="enumerator-version"]').should('contain.text', 'Version: 0')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Enumerator')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="enumerator-version"]').should('contain.text', 'Version: 0')
  })

  it('can navigate to the help page from Test Data pages', () => {
    cy.visit('/test_data/sample.1.0.0.1.json')
    cy.wait(100)
    cy.get('[data-test="card-title"]').should('contain.text', 'sample.1.0.0.1.json')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Test Data')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="card-title"]').should('contain.text', 'sample.1.0.0.1.json')
  })

  it('can navigate to the help page from Migration pages', () => {
    cy.visit('/migrations/first_last_to_full_name.json')
    cy.wait(100)
    cy.get('[data-test="card-title"]').should('contain.text', 'first_last_to_full_name.json')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Migration')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="card-title"]').should('contain.text', 'first_last_to_full_name.json')
  })

  it('can navigate to the help page from Event Viewer page', () => {
    cy.visit('/configurations/sample.yaml')
    cy.wait(100)
    cy.get('[data-test="configure-collection-btn"]').click()

    cy.url().should('include', '/event-viewer')
    cy.get('h1').first().should('be.visible')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('[data-test="carousel-title-text"]').should('contain.text', 'Configuration Processing Events')
    cy.get('[data-test="help-btn"]').should('be.visible').click()
    cy.get('h1').first().should('be.visible')
  })
})


