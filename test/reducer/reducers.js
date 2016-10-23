/* global jest:false */

jest.disableAutomock()

import merge from 'lodash.merge'

import postJson from '../mocks/fixtures/wp-api-responses/post'

import { INITIAL_STATE, completeReducer, failReducer } from '../../src/redux/reducer'

describe('Reducers', () => {
  const id = '0'

  describe('completeAction', () => {
    const reducer = completeReducer((data) => data)
    const store = reducer(INITIAL_STATE, { id, data: postJson })

    it('returns an object', () => {
      expect(typeof store).toEqual('object')
    })

    it('sets entity ids from response in query object', () => {
      expect(store.queries[id].entities).toEqual([postJson.id])
    })

    it('sets complete to true in query object', () => {
      expect(store.queries[id].complete).toEqual(true)
    })

    it('sets OK to true in query object', () => {
      expect(store.queries[id].OK).toEqual(true)
    })
  })

  describe('failAction', () => {
    const error = 'Wuh-oh!'

    let store = {
      queries: {
        [id]: {
          id,
          complete: false
        }
      }
    }

    it('returns a new object', () => {
      const newStore = failReducer(merge(INITIAL_STATE, store), { id, error })
      expect(newStore === store).toEqual(false)
      store = newStore
    })

    it('set error in the query object', () => {
      expect(store.queries[id].error).toEqual(error)
    })

    it('sets complete to true in query object', () => {
      expect(store.queries[id].complete).toEqual(true)
    })

    it('sets OK to false in query object', () => {
      expect(store.queries[id].OK).toEqual(false)
    })
  })
})
