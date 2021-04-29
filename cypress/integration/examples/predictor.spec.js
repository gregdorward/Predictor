import * as React from 'react'
import { mount } from '@cypress/react'
import Header from '../../../src/components/Header';
/* eslint-disable jest/valid-expect */
/// <reference types="cypress" />

require("dotenv").config();

// describe("Predictor", () => {
//   const staticResponse = { statusCode: 201 };

//   beforeEach(() => {
//     cy.intercept(
//       "GET",
//       `https://safe-caverns-99679.herokuapp.com/https://api.footystats.org/league-list?key=${process.env.API_KEY}&chosen_leagues_only=true`,
//       { fixture: "leagueList.json" }
//     );
//     cy.intercept(
//       "GET",
//       `https://safe-caverns-99679.herokuapp.com/https://api.footystats.org/todays-matches*`,
//       { fixture: "yesterdaysFixtures.json" }
//     );
//     cy.intercept("POST", `/allForm*`, staticResponse).as("allForm");
//     cy.intercept("POST", `/leagueData*`, staticResponse);
//     cy.intercept("GET", `http://localhost:5000/formtodaysFixtures`, {
//       fixture: "formTodaysFixtures.json",
//     });
//     cy.intercept("GET", `http://localhost:5000/formyesterdaysFixtures`, {
//       fixture: "formYesterdaysFixtures.json",
//     });
//     cy.intercept("GET", `/leagueData*`, { fixture: "leagueData.json" });
//     cy.intercept("POST", `/leagueData*`, staticResponse);

//     cy.visit("/");
//   });

//   it("contains the correct page title", () => {
//     cy.visit("/");

//     cy.get("h1").contains("Predictor");
//   });

//   it("contains three radio buttons for form options", () => {
//     cy.get('[data-cy="5"]');
//     cy.get('[data-cy="6"]');
//     cy.get('[data-cy="10"]');
//   });

//   it("contains buttons for fetching yesterdays. todays and tomorrows fixtures", () => {
//     cy.get('[data-cy="Get Yesterday\'s Fixtures"]');
//     cy.get('[data-cy="Get Today\'s Fixtures"]');
//     cy.get('[data-cy="Get Tomorrow\'s Fixtures"]');
//   });

//   it("renders a list of fixtures", () => {
//     cy.get('[data-cy="Get Yesterday\'s Fixtures"]').click();
//     cy.get('[data-cy="1056669"]');
//   });

//   it("displays results for resulted fixtures", () => {

//     cy.get('[data-cy="Get Yesterday\'s Fixtures"]').click();
//     cy.get('[data-cy="1056669"]');
//     cy.get('[data-cy="result-1056669"]').contains("2 - 0");
//   });

//   // it("displays todays fixtures", () => {


//   //   cy.get('[data-cy="Get Today\'s Fixtures"]').click();
//   //   // eslint-disable-next-line jest/valid-expect-in-promise
//   //   cy.wait("@allForm").then((interception) => {
//   //     let requestBody = interception.request.body.allForm;
//   //     expect(requestBody[0].home[0]).to.have.property("XG", 0.95);
//   //     expect(requestBody[0].home[0]).to.have.property("XGHome", 0.84);
//   //   });

//   //   cy.get('[data-cy="1079077"]');
//   //   cy.get('[data-cy="divider-1079077"]').contains("V");
//   // });

//   it("contains an expandable stats section for each fixture", () => {
//     cy.get('[data-cy="Get Yesterday\'s Fixtures"]').click();
//     cy.get('[data-cy="StatsContainer-1056669"]').should("not.be.visible");
//     cy.get('[data-cy="1056669"]').click();
//     cy.get('[data-cy="StatsContainer-1056669"]').should("be.visible");
//     cy.get('[data-cy="ChelseateamScored"]').should(
//       "contain.text",
//       "Average goals scored - 1.00"
//     );
//   });
//   it("returns predictions for incomplete matches", () => {
//     cy.intercept(
//         "GET",
//         `https://safe-caverns-99679.herokuapp.com/https://api.footystats.org/todays-matches?key=${process.env.API_KEY}*`,
//         { fixture: "yesterdaysFixtures.json" }
//       );
  
//       cy.get('[data-cy="Get Yesterday\'s Fixtures"]').click();
//       cy.get('[data-cy="Get Predictions"]').click();
      
//   })
// });

describe('Component tests', () => {
  it('executes a test against a component in isolation, in the browser', () => {
    mount(<Header />)
    cy.get("h1").contains("Testing")
  });
});
