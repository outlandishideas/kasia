/* global jest:false */

jest.disableAutomock()

import { setWP } from '../../src/wpapi'
import { queryBuilder } from '../../src/util'

setWP({
  posts: () => ({
    id: (id) => ({
      embed: () => ({
        get: () => {
          output = id
        }
      })
    })
  })
})

const input = 16
const queryFn = queryBuilder._deriveQuery('posts', input)

let output

describe('util/queryBuilder', () => {
  describe('_deriveQuery', () => {
    it('returns a function', () => {
      expect(typeof queryFn).toEqual('function')
    })

    it('that calls chain with correct method name and identifier', () => {
      queryFn()
      expect(output).toEqual(input)
    })
  })
})
