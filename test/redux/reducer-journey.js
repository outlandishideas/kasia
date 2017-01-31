/* global jest:false, expect:false */

jest.disableAutomock()

jest.mock('redux-saga')

import { combineReducers, createStore } from 'redux'
import Wpapi from 'wpapi'

import postJson from '../__fixtures__/wp-api-responses/post'
import initialState from '../__mocks__/states/initial'

import kasia from '../../src'
import normalise from '../../src/util/normalise'
import queryCounter from '../../src/util/queryCounter'
import pickEntityIds from '../../src/util/pickEntityIds'
import schemasManager from '../../src/util/schemasManager'
import { ContentTypes } from '../../src/constants'
import { createPostRequest, completeRequest, failRequest } from '../../src/redux/actions'

function setup (keyEntitiesBy) {
  const { kasiaReducer } = kasia({
    wpapi: new Wpapi({ endpoint: '123' }),
    keyEntitiesBy
  })
  const rootReducer = combineReducers(kasiaReducer)
  const store = createStore(rootReducer)
  return { store, initialState: initialState(keyEntitiesBy) }
}

describe('reducer journey', () => {
  const error = new Error('Request failed').stack

  const tests = [
    ['id', 16],
    ['slug', 'architecto-enim-omnis-repellendus']
  ]

  beforeEach(() => {
    queryCounter.reset()
    schemasManager.__flush__()
  })

  tests.forEach(([ keyEntitiesBy, param ]) => {
    describe('keyEntitiesBy = ' + keyEntitiesBy, () => {
      const { store, initialState } = setup(keyEntitiesBy)

      it('has initial state on store', () => {
        expect(store.getState()).toEqual(initialState)
      })

      it('does not modify store without action namespace', () => {
        store.dispatch({ type: 'REQUEST_COMPLETE', id: 0, entities: [''] })
        expect(store.getState()).toEqual(initialState)
      })

      it('can Request*Create', () => {
        store.dispatch(createPostRequest(ContentTypes.Post, param))
      })

      it('can RequestComplete', () => {
        store.dispatch(completeRequest(0, postJson))
        const expected = normalise(postJson, keyEntitiesBy)
        const actual = store.getState().wordpress.entities
        expect(actual).toEqual(expected)
      })

      it('places query on store', () => {
        const entities = pickEntityIds(postJson)
        const expected = { id: 0, complete: true, OK: true, paging: {}, entities, prepared: true }
        const actual = store.getState().wordpress.queries[0]
        expect(actual).toEqual(expected)
      })

      it('can RequestFail', () => {
        store.dispatch(createPostRequest(ContentTypes.Post, param))
        store.dispatch(failRequest(1, error))
        const expected = { id: 1, complete: true, OK: false, error, prepared: true }
        const actual = store.getState().wordpress.queries[1]
        expect(actual).toEqual(expected)
      })
    })
  })
})
