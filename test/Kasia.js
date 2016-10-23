/* global jest:false */

jest.disableAutomock()

import './mocks/WP'
import Kasia from '../src/Kasia'
import getWP from '../src/wpapi'

describe('Kasia', () => {
  const WP = getWP()

  it('exports a function', () => {
    expect(typeof Kasia).toEqual('function')
  })

  it('throws with bad WP value', () => {
    expect(() => {
      Kasia({ WP: '' })
    }).toThrowError(/Expecting WP to be instance of `node-wpapi`/)
  })

  it('throws with bad plugins value', () => {
    expect(() => {
      Kasia({ WP, plugins: '' })
    }).toThrowError(/Expecting plugins to be array/)
  })

  it('throws with bad index value', () => {
    expect(() => {
      Kasia({ WP, index: 0 })
    }).toThrowError(/Expecting index to be string/)
  })

  it('throws with bad contentTypes value', () => {
    expect(() => {
      Kasia({ WP, contentTypes: '' })
    }).toThrowError(/Expecting contentTypes to be array/)
  })
})
