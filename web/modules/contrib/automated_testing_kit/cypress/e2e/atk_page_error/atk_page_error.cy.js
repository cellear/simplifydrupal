/**
 * atk_page_error.cy.js
 *
 * Page error tests such as 4xx, 5xx, etc.
 *
 */

/** ESLint directives */
/* eslint-disable import/first */

/// <reference types='Cypress' />

import * as atkCommands from '../../support/atk_commands'; // eslint-disable-line no-unused-vars
import * as atkUtilities from '../../support/atk_utilities';

// atkConfig gets its own file.
import atkConfig from '../../../cypress.atk.config'; // eslint-disable-line no-unused-vars

// Standard accounts that use user accounts created
// by QA Accounts. QA Accounts are created when the QA
// Accounts module is enabled.
import qaUserAccounts from '../../data/qaUsers.json';

describe('Page error tests.', () => {
  //
  // Validate that 403 page appears.
  // Assumes:
  // Create a basic page with the title of "403 error page" that has the
  // text "403 error page".
  // In admin/config/system/site-information, set Default 403 (access denied) page = /node/x
  // where x is the new node ID.
  it('(ATK-CY-1060) Validate that 403 page appears.', { tags: ['@ATK-CY-1060', '@page-error', '@smoke'] }, () => {
    const testId = 'ATK-CY-1060'; // eslint-disable-line no-unused-vars
    const badAnonymousUrl = 'admin';

    cy.logOutViaUi();

    cy.visit(badAnonymousUrl, { failOnStatusCode: false });
    cy.contains('403 Error Page');
  });

  //
  // Validate that 404 page appears.
  // Assumes:
  // Create a basic page with alias of "404-error-page" that has text content below.
  // admin/config/system/site-information: Default Default 404 (not found) page = /404-error-page
  //
  it('(ATK-CY-1061) Validate that 404 page appears.', { tags: ['@ATK-CY-1061', '@page-error', '@smoke'] }, () => {
    const testId = 'ATK-CY-1061';
    const randomString = atkUtilities.createRandomString(6);
    const badAnonymousUrl = `${testId}-BadAnonymousPage-${randomString}`;
    const badAuthenticatedUrl = `${testId}-BadAuthenticatedPage-${randomString}`;

    cy.logOutViaUi();

    cy.visit(badAnonymousUrl, { failOnStatusCode: false });
    cy.contains('404 Error Page');

    cy.logOutViaUi();
    cy.logInViaForm(qaUserAccounts.authenticated);

    cy.visit(badAuthenticatedUrl, { failOnStatusCode: false });
    cy.contains('404 Error Page');
  });
});
