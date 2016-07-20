/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

jest.mock('invariant')

jest.mock('../src/reducer')

import invariant from 'invariant'
import WP from 'wpapi'

import Pepperoni from '../src/index'
import { makeReducer } from '../src/reducer'

describe('Pepperoni', () => {
  beforeEach(() => {
    invariant.mockClear()
    makeReducer.mockClear()
  })

  it('exports a function', () => {
    expect(typeof Pepperoni).toEqual('function')
  })

  it('throws an invariant violation when `host` is not a string', () => {
    Pepperoni({ host: 11111 })

    expect(invariant).toBeCalledWith(
      false,
      'Expecting host to be a string, got "%s".',
      'number'
    )
  })

  it('throws when `host` is not given', () => {
    expect(() => Pepperoni())
      .toThrowError('Expecting host in options')
  })

  it('accepts a plugin and includes its saga', () => {
    const saga = () => {}

    const { pepperoniSagas } = Pepperoni({
      host: 'host',
      plugins: [[() => ({ sagas: [saga] })]]
    })

    expect(pepperoniSagas.indexOf(saga) !== -1).toEqual(true)
  })

  it('returns an instance of node-wpapi', () => {
    const result = Pepperoni({ host: 'host' })
    expect(result.api instanceof WP).toEqual(true)
  })
})
