/* global jest:false */

jest.unmock('../../src/sagas')
jest.unmock('../../src/wpapi')

import { derivedQueryFn } from '../../src/sagas'
import { setWP } from '../../src/wpapi'

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
