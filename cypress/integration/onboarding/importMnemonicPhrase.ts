/* eslint-disable no-param-reassign */

describe('Create wallet on first visit', () => {
  const testWallet = {
    id: '123',
    name: 'test wallet name',
    cryptos: ['ATOM'],
  }
  const mnemonic =
    'scan surprise tide guilt industry antenna legal bulb transfer tonight topple start file lumber shift museum humble hawk ivory horse embrace cheese spend raise'
  it('successfully loads and click Get Started', () => {
    cy.visit('http://localhost:3000', {
      onBeforeLoad(win: any) {
        win.chrome = win.chrome || {}
        win.chrome.runtime = {
          sendMessage(_id, msg, callback) {
            callback(msg.event === 'ping' ? { isFirstTimeUser: true } : { wallet: testWallet })
          },
        }
      },
    })
    cy.contains('Get Started').should('be.visible')
    cy.wait(1000)
    cy.contains('Get Started').click()
    cy.get('input').should('be.visible')
  })
  it('sets a unlock password', () => {
    cy.get('input').type('123123').should('have.value', '123123')
    cy.contains('Next').click()
    cy.contains('Confirm Password').should('be.visible')
  })
  it('confirms the unlock password', () => {
    cy.get('input').type('123123').should('have.value', '123123')
    cy.get('button').contains('Confirm').click()
  })
  it('import mnemonic phrase', () => {
    cy.contains('12 / 24 word mnemonic phrase').click()
    cy.contains('Import Mnemonic Phrase').click()
    cy.get('#mnemonic-0').type(mnemonic)
    cy.contains('Next').click()
  })
  it('sets a secure security password', () => {
    cy.get('input').type('123qweASD!@#').should('have.value', '123qweASD!@#')
    cy.contains('Strong').should('be.visible')
    cy.get('button').contains('Next').click()
  })
  it('sets wallet name and select cryptos', () => {
    cy.get('input').type('test wallet name').should('have.value', testWallet.name)
    cy.get('button').contains(testWallet.cryptos[0]).click()
    cy.get('button').contains('Import').click()
    cy.contains(testWallet.name).should('be.visible')
  })
})