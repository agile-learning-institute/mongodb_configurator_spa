# Implement Cypress E2E Testing
- [ ] Install cypress, add npm scripts to run cypress tests and cypress dev mode.

Then we can build the following tests
- [ ] migrations.cy.ts
    - open http://localhost:8082/migrations
    - click New - enter test-migration
    - assert path http://localhost:8082/migrations/test-migration.json
    - assert empty list
    - click [Add Migration] and enter {"foo":"bar"}
    - assert data displayed
    - click [Add Migration] and enter {"far":"boo"}
    - assert data displayed
    - click [delete] on migration 1
    - assert only {"far":"boo"} displayed
    - refresh page
    - assert data displayed
    - click delete
    - assert path http://localhost:8082/migrations
    - assert test-migration.json not in list

- [ ] test_data.cy.ts
    - open http://localhost:8082/test_data
    - click New - enter test-data
    - assert path http://localhost:8082/test_data/test-data.json
    - assert empty list
    - click [Add Document] and enter {"foo":"bar"}
    - assert data displayed
    - click [Add Document] and enter {"far":"boo"}
    - assert data displayed
    - click [delete] on migration 1
    - assert only {"far":"boo"} displayed
    - refresh page
    - assert data displayed
    - click delete
    - assert path http://localhost:8082/test_data
    - assert test-data.json not in list

- [ ] enumerators.cy.ts
    - test basic functionality
        - open http://localhost:8082/enumerators
        - click New
        - assert path
        - assert Version 3
        - assert unlocked
        - click add_value
        - enter test-name
        - enter test-description
        - assert displayed
        - click add enumeration and add values
        - assert new enumeration 
        - refresh page
        - assert data
        - lock
        - assert locked
        - unlock
        - assert unlocked
        - click Delete and confirm
        - assert path http://localhost:8082/enumerators
        - assert enumerations.3.yaml not in list

    - test new version locks old version
    - test can't delete old version
    - test can't unlock old version
    - test new version from unlock dialog

- [ ] types.cy.ts
    - open http://localhost:8082/types

- [ ] dictionary.cy.ts
    - open http://localhost:8082/dictionaries

- [ ] configuration.cy.ts
    - open http://localhost:8082/configurations
