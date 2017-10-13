/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest

import '../__mocks__/WP'
import postJson from '../__fixtures__/wp-api-responses/post'
import { INITIAL_STATE, acknowledgeReducer, completeReducer, failReducer } from '../../src/redux/reducer'

jest.disableAutomock()

describe('redux/reducer', () => {
  const id = 0

  let state
  let query

  function assertState (fn) {
    return () => {
      const newState = fn()
      expect(typeof newState).toEqual('object')
      expect(newState === state).toEqual(false)
      state = newState
      query = state.queries[id]
    }
  }

  describe('acknowledge', () => {
    it('returns a new object', assertState(() => {
      return acknowledgeReducer(INITIAL_STATE, {
        request: { id }
      })
    }))

    it('sets query on state', () => {
      const action = {
        id,
        prepared: true,
        complete: false,
        OK: null
      }
      expect(query).toEqual(action)
    })
  })

  describe('complete', () => {
    it('returns a new object', assertState(() => {
      const complete = completeReducer((data) => data)
      const action = {
        request: {
          id,
          result: [postJson]
        }
      }
      return complete(state, action)
    }))

    it('sets entity ids', () => {
      expect(query.entities).toEqual([postJson.id])
    })

    it('sets complete', () => {
      expect(query.complete).toEqual(true)
    })

    it('sets OK', () => {
      expect(query.OK).toEqual(true)
    })
  })

  describe('fail', () => {
    const error = new Error('Wuh-oh!').stack

    it('returns a new object', assertState(() => {
      return failReducer(state, {
        request: { id, error }
      })
    }))

    it('sets error', () => {
      expect(query.error).toEqual(error)
    })

    it('sets complete', () => {
      expect(query.complete).toEqual(true)
    })

    it('sets OK', () => {
      expect(query.OK).toEqual(false)
    })
  })
})
