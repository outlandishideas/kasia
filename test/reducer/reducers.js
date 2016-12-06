/* global jest:false */

jest.disableAutomock()

import merge from 'lodash.merge'

import '../mocks/WP'
import postJson from '../mocks/fixtures/wp-api-responses/post'

import { INITIAL_STATE, completeReducer, failReducer } from '../../src/redux/reducer'

describe('Reducers', () => {
  const id = '0'
  const initialState = { wordpress: INITIAL_STATE }

  describe('completeAction', () => {
    const payload = { id, data: [postJson] }
    const reducer = completeReducer((data) => data)
    const store = reducer(initialState, payload)

    it('returns an object', () => {
      expect(typeof store).toEqual('object')
    })

    it('sets entity ids from response in query object', () => {
      expect(store.wordpress.queries[id].entities).toEqual([postJson.id])
    })

    it('sets complete to true in query object', () => {
      expect(store.wordpress.queries[id].complete).toEqual(true)
    })

    it('sets OK to true in query object', () => {
      expect(store.wordpress.queries[id].OK).toEqual(true)
    })
  })

  describe('failAction', () => {
    const error = new Error('Wuh-oh!')

    let store = {
      wordpress: {
        queries: {
          [id]: {
            id,
            complete: false
          }
        }
      }
    }

    it('returns a new object', () => {
      const newStore = failReducer(merge(initialState, store), { id, error })
      expect(newStore === store).toEqual(false)
      store = newStore
    })

    it('set error in the query object', () => {
      expect(store.wordpress.queries[id].error).toEqual(String(error))
    })

    it('sets complete to true in query object', () => {
      expect(store.wordpress.queries[id].complete).toEqual(true)
    })

    it('sets OK to false in query object', () => {
      expect(store.wordpress.queries[id].OK).toEqual(false)
    })
  })
})
