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
    it('returns a new object', assertState(() => acknowledgeReducer(INITIAL_STATE, { id })))
    it('sets query on state', () => expect(query).toEqual({ id, prepared: true, complete: false, OK: null }))
  })

  describe('complete', () => {
    it('returns a new object', assertState(() => completeReducer((data) => data)(state, { id, data: [postJson] })))
    it('sets entity ids', () => expect(query.entities).toEqual([postJson.id]))
    it('sets complete', () => expect(query.complete).toEqual(true))
    it('sets OK', () => expect(query.OK).toEqual(true))
  })

  describe('fail', () => {
    const error = new Error('Wuh-oh!').stack

    it('returns a new object', assertState(() => failReducer(state, { id, error })))
    it('sets error', () => expect(query.error).toEqual(error))
    it('sets complete', () => expect(query.complete).toEqual(true))
    it('sets OK', () => expect(query.OK).toEqual(false))
  })
})
