/* global jest:false */

jest.disableAutomock()

import { setWP } from '../../src/wpapi'
import queryBuilder from '../../src/util/queryBuilder'

const WP = {
  posts: () => ({
    id: (id) => ({
      embed: () => ({
        then: () => {
          success = id
        }
      })
    })
  })
}

setWP(WP)

const id = 16
const fn = queryBuilder.deriveQuery(WP, 'posts', id)

let success = false

describe('derivedQuery', () => {
  it('returns a function', () => {
    expect(typeof fn).toEqual('function')
  })

  it('calls chain with correct method name and identifier', () => {
    fn()
    expect(success).toEqual(id)
  })
})
