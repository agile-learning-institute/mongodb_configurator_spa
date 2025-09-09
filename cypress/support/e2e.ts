import './commands'

// In dev mode, we assume `npm run api` + `npm run dev` are running.
// Avoid resetting containers automatically; specs can visit('/') directly.

// Ignore ResizeObserver errors that are common with Vuetify components
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false
  }
  return true
})
