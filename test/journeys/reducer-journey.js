/* global jest:false, expect:false */

// jest.disableAutomock() hoisted here by babel-jest
// jest.mock('redux-saga') hoisted here by babel-jest

import { combineReducers, createStore } from 'redux'
import Wpapi from 'wpapi'

import postJson from '../__fixtures__/wp-api-responses/post'
import initialState from '../__mocks__/states/initial'

import kasia from '../../src'
import normalise from '../../src/util/normalise'
import pickEntityIds from '../../src/util/pick-entity-ids'
import schemasManager from '../../src/util/schemas-manager'
import { ContentTypes } from '../../src/constants'
import { createPostRequest, acknowledgeRequest, completeRequest, failRequest } from '../../src/redux/actions'

jest.disableAutomock()

jest.mock('redux-saga')

function setup (keyEntitiesBy) {
  const { kasiaReducer } = kasia({
    wpapi: new Wpapi({ endpoint: '123' }),
    keyEntitiesBy
  })
  const rootReducer = combineReducers(kasiaReducer)
  return {
    store: createStore(rootReducer),
    initialState: initialState(keyEntitiesBy)
  }
}

describe('reducer journey', () => {
  const error = new Error('Request failed').stack

  const tests = [
    ['id', 16],
    ['slug', 'architecto-enim-omnis-repellendus']
  ]

  beforeEach(() => {
    schemasManager.__flush__()
  })

  tests.forEach(([ keyEntitiesBy, param ]) => {
    describe('keyEntitiesBy = ' + keyEntitiesBy, () => {
      const { store, initialState } = setup(keyEntitiesBy)
      let request

      it('has initial state on store', () => {
        expect(store.getState()).toEqual(initialState)
      })

      it('does not modify store without action namespace', () => {
        store.dispatch({
          type: 'REQUEST_COMPLETE',
          request: {
            id: 0,
            entities: ['']
          }
        })
        expect(store.getState()).toEqual(initialState)
      })

      it('can Request*Create', () => {
        const action = createPostRequest({
          contentType: ContentTypes.Post,
          identifier: param
        })
        request = action.request
        store.dispatch(action)
      })

      it('can RequestAck', () => {
        request.id = 0
        store.dispatch(acknowledgeRequest(request))
      })

      it('places query on store', () => {
        const expected = {
          id: 0,
          complete: false,
          OK: null,
          prepared: true
        }
        const actual = store.getState().wordpress.queries[0]
        expect(actual).toEqual(expected)
      })

      it('can RequestComplete', () => {
        store.dispatch(completeRequest({
          id: 0,
          result: postJson
        }))
        const expected = normalise(postJson, {idAttribute: keyEntitiesBy})
        const actual = store.getState().wordpress.entities
        expect(actual).toEqual(expected)
      })

      it('updates query on store', () => {
        const expected = {
          id: 0,
          complete: true,
          OK: true,
          paging: {},
          entities: pickEntityIds(postJson),
          prepared: true
        }
        const actual = store.getState().wordpress.queries[0]
        expect(actual).toEqual(expected)
      })

      it('can RequestFail', () => {
        store.dispatch(createPostRequest({
          contentType: ContentTypes.Post,
          identifier: param
        }))
        store.dispatch(failRequest({ id: 1, error }))
        const expected = { id: 1, complete: true, OK: false, error, prepared: true }
        const actual = store.getState().wordpress.queries[1]
        expect(actual).toEqual(expected)
      })
    })
  })
})
