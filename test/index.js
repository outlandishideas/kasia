/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import WP from 'wpapi'

import Kasia from '../src/index'

describe('Kasia', () => {
  const wpapi = new WP({ endpoint: 'http://localhost' })

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
      Kasia({ WP: wpapi, plugins: '' })
    }).toThrowError(/Expecting plugins to be array/)
  })

  it('throws with bad keyEntitiesBy value', () => {
    expect(() => {
      Kasia({ WP: wpapi, keyEntitiesBy: 0 })
    }).toThrowError(/Expecting keyEntitiesBy to be string/)
  })

  it('throws with bad contentTypes value', () => {
    expect(() => {
      Kasia({ WP: wpapi, contentTypes: '' })
    }).toThrowError(/Expecting contentTypes to be array/)
  })
})
