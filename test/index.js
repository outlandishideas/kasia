/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import { wpapi } from './__mocks__/WP'
import kasia, { preloadComponents, preloadQuery } from '../src'

jest.disableAutomock()

describe('Kasia', () => {
  it('exports a function', () => {
    expect(typeof kasia).toEqual('function')
  })

  it('returns the right things', () => {
    const { kasiaActions, kasiaReducer, kasiaSagas } = kasia({ wpapi })
    expect(typeof kasiaActions).toEqual('object')
    expect(typeof kasiaActions.createQueryRequest).toEqual('function')
    expect(typeof kasiaActions.createPostRequest).toEqual('function')
    expect(typeof kasiaReducer).toEqual('object')
    expect(typeof kasiaReducer.wordpress).toEqual('function')
    expect(typeof kasiaSagas).toEqual('object')
  })

  it('exports preloaders', () => {
    expect(typeof preloadComponents).toEqual('function')
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

  it('throws with bad keyEntitiesBy value', () => {
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
