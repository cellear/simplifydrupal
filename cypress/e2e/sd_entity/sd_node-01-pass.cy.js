/**
 * atk_node.cy.js
 *
 * Validate node entities.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

/// <reference types='Cypress' />

// Set up ATK.
import * as atkCommands from '../../support/atk_commands'; // eslint-disable-line no-unused-vars
import * as atkUtilities from '../../support/atk_utilities'; // eslint-disable-line no-unused-vars
import atkConfig from '../../../cypress.atk.config';

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
// import qaUserAccounts from '../../data/qaUsers.json';

describe('Entity tests.', () => {
  //
  // Create a page with an image, confirm it, update it, confirm update then delete it via the UI.
  //
  it('(LM-001) visit a page via the UI.', { tags: ['@ATK-CY-1110', '@node', '@smoke', 'alters-db'] }, () => {
    const testId = 'LM-001';
    const bodyText = 'Simplifying';

    
    cy.visit("/");

    //
    // Confirm content appears.
    //
    cy.get('.view-header').invoke('text').then((text) => {
      expect(text).to.include(bodyText);
    });
  });
});
