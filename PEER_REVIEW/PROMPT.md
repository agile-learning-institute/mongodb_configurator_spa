# Prompt
Review @mongodb_configurator/README.md for system context, and @mongodb_configurator_spa/README.md for application context.

I'd like you to conduct a peer review of the entire SPA code base. The extent of the code base far exceeds available context window, so we should create a plan that allows us to break this work down into more manageable components and create agents to perform each step. I'd like you to start by creating a PEER_REVIEW.md document that contains our plans for the review. The review plans should include a review of the system architecture and documentation, followed by a systematic review of code within specific domains, and of the cypress tests. In addition to domain specific reviews, provide an executive overview of the reviews, that includes prompts to address all critical or high priority issues. My interest is to ensure the following aspects of the system meet best practices.
- Architecture, have we identified appropriate separation of concerns, and clearly defined reusable components, and standardized API interactions.
- Consistency, does the code base always solve the same problem in the same way?
- Simplicity - does the code use unnecessarily complex patterns? For example can we remove the click-to-edit pattern and replace it with a more standard input element to significantly simplify the code base and testing?
- Docker packaging best practices, NGINX and API Port Forwarding configurations.
- Cypress testing - review the general approach and the specific tests. Plans for improvements in re-usable code, or more consistent pattern use are expected to be part of that review. Testing use of data-test attributes is the preferred approach due to the fact that it tags code as "sacred" meaning a change to this code will require updates to automated testing... not that it can't be done, but that it has 2 parts.
## Deliverables

You should only create the peer review markdown documents, you should not proceed with execution of any remediation plans.
## Upcoming issues 

The following issues will be undertaken after this review and remediation. Any refactoring suggestions should take these into account, hopefully making these changes easy:
- Cypress Refactor - Implement best practices for structure and code re-use
- Enumerators Editor - Enumerator Name truncated both in edit and display
- Constant Property Editor - Constant Value input is mapped to property name
- Property Name input seem to loose focus after a very short time-out.
- Improve schema rendering error messaging
- Configuration Editor - Input edit-mode width of description is very narrow
- Implement a full Read-Only mode based on the Config Item BUILT_AT
- Add drag-and-drop ordering of Migrations and Test Data
- Several dialog's and help screens need copy edits and small function changes