/* eslint-env jasmine */
/* global jest:false */

jest.unmock('../../src/sagas')
jest.unmock('../../src/wpapi')

import { chain, derivedQueryFn } from '../../src/sagas'
import { setWP } from '../../src/wpapi'

describe('chain', () => {
  const mockApi = {
    feedOnce: () => ({
      feedTwice: (result) => result
    })
  }

  it('correctly chains method calls', () => {
    const result = chain(mockApi, [
      ['feedOnce'],
      ['feedTwice', 'result']
    ])

    expect(result).toEqual('result')
  })
})

describe('derivedQuery', () => {
  const fn = derivedQueryFn('posts', 16)

  let success = false

  setWP({
    posts: () => ({
      id: () => ({
        embed: () => ({
          then: () => {
            success = true
          }
        })
      })
    })
  })

  it('returns a function', () => {
    expect(typeof fn).toEqual('function')
  })

  it('calls chain with correct method name and identifier', () => {
    fn()
    expect(success).toEqual(true)
  })
})
