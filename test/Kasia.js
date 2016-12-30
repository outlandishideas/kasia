/* global jest:false */

jest.disableAutomock()

import './__mocks__/WP'
import Kasia from '../src/Kasia'
import getWP, { setWP } from '../src/wpapi'

const WP = getWP()

describe('Kasia', () => {
  afterEach(() => setWP(null))

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
      Kasia({ WP, keyEntitiesBy: 0 })
    }).toThrowError(/Expecting keyEntitiesBy to be string/)
  })

  it('throws with bad contentTypes value', () => {
    expect(() => {
      Kasia({ WP, contentTypes: '' })
    }).toThrowError(/Expecting contentTypes to be array/)
  })
})
