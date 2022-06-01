// beforeEach(() => {
//     cy.server()
//   })

describe('Core app functionality', () => {
    it('Loads fixtures and form', () => {
        cy.server()
        cy.intercept('/matches/**', { fixture: 'Matches.json' }).as('getMatches')
        cy.intercept('/formtodaysFixtures', { fixture: 'allForm.json' }).as('getTodaysFixtures')
        cy.intercept('/leagueList', { fixture: 'leagueList.json' }).as('getLeagueList')

        cy.visit("http://localhost:3000")

        cy.get('.HeaderContainer')
        cy.contains("XG Tipping")
        cy.get('[data-cy="Today"]')
        cy.contains("Today").click()
        cy.wait('@getMatches').should('have.property', 'state', "Complete")
        cy.get('[data-cy="2096923"]').should('contain', 'Northampton Town')
        cy.get('[data-cy="2096923"] > .HomeOdds').should('contain', '/')
        cy.get('[data-cy="2096923"] > .AwayOdds').should('contain', '/')

        cy.get('[data-cy="2096923"]').click()
        cy.get('.Home').should('be.visible')
        cy.get('.Away').should('be.visible')

        cy.get('[data-cy="2096923"]').click()
        cy.get('.Home').should('not.be.visible')
        cy.get('.Away').should('not.be.visible')
    })

    it('Loads resulted fixtures and prediction results', () => {
        cy.server()
        cy.intercept('/matches/**', { fixture: 'MatchesResulted.json' }).as('getCompletedMatches')
        cy.intercept('/formtodaysFixtures', { fixture: 'allFormResulted.json' }).as('getTodaysFixtures')
        cy.intercept('/leagueList', { fixture: 'leagueList.json' }).as('getLeagueList')        
        
        cy.visit("http://localhost:3000")

        cy.get('.HeaderContainer')
        cy.contains("XG Tipping")
        cy.get('[data-cy="Yesterday"]')
        cy.contains("Yesterday").click()
        cy.wait('@getCompletedMatches').should('have.property', 'state', "Complete")

        cy.get('[data-cy="Generate predictions"]').click()
        cy.get('.SuccessMeasure').should('contain','68.88%')
        cy.get('.Insights').click()
        cy.get('.InsightsHome').should('be.visible')
        cy.get('.InsightsAway').should('be.visible')
    })

    it('Displays league tables', () => {
        cy.server()
        cy.intercept('/matches/**', { fixture: 'MatchesResulted.json' }).as('getMatches')
        cy.intercept('/formtodaysFixtures', { fixture: 'allFormResulted.json' }).as('getTodaysFixtures')
        cy.intercept('/leagueList', { fixture: 'leagueList.json' }).as('getLeagueList')        
        
        cy.visit("http://localhost:3000")
    })
  })