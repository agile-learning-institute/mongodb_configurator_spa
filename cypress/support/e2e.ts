import './commands'

before(() => {
  // Optionally ensure service is up before tests; relying on npm run e2e for full reset
})

beforeEach(() => {
  cy.resetApp()
})


