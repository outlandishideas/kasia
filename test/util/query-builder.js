/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import getWP, { setWP } from '../../src/wpapi'
import { deriveQueryFunction } from '../../src/util/query-builder'

jest.disableAutomock()

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
const queryFn = deriveQueryFunction('posts', input)

let output

describe('util/queryBuilder', () => {
  describe('#_deriveQuery', () => {
    it('returns a function', () => {
      expect(typeof queryFn).toEqual('function')
    })

    it('that calls chain with correct method name and identifier', () => {
      queryFn(getWP())
      expect(output).toEqual(input)
    })
  })
})
