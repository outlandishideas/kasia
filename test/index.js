/* global jest:false, expect:false */

jest.disableAutomock()

import { wpapi } from './__mocks__/WP'
import kasia, { preload, preloadQuery } from '../src'

describe('Kasia', () => {
  it('exports a function', () => {
    expect(typeof kasia).toEqual('function')
  })

  it('exports preloaders', () => {
    expect(typeof preload).toEqual('function')
    expect(typeof preloadQuery).toEqual('function')
  })

  it('throws with bad WP value', () => {
    expect(() => {
      kasia({ wpapi: '' })
    }).toThrowError(/Expecting WP to be instance of `node-wpapi`/)
  })

  it('throws with bad plugins value', () => {
    expect(() => {
      kasia({ wpapi, plugins: '' })
    }).toThrowError(/Expecting plugins to be array/)
  })

  it('throws with bad index value', () => {
    expect(() => {
      kasia({ wpapi, keyEntitiesBy: 0 })
    }).toThrowError(/Expecting keyEntitiesBy/)
  })

  it('throws with bad contentTypes value', () => {
    expect(() => {
      kasia({ wpapi, contentTypes: '' })
    }).toThrowError(/Expecting contentTypes to be array/)
  })
})
