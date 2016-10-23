/* global jest:false */

jest.unmock('../../src/sagas')
jest.unmock('../../src/wpapi')

import { derivedQueryFn } from '../../src/redux/sagas'
import { setWP } from '../../src/wpapi'

describe('derivedQuery', () => {
  const id = 16
  const fn = derivedQueryFn('posts', id)

  let success = false

  setWP({
    posts: () => ({
      id: (id) => ({
        embed: () => ({
          then: () => {
            success = id
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
    expect(success).toEqual(id)
  })
})
