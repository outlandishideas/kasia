/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import { combineReducers, createStore } from 'redux'
import WP from 'wpapi'
import modify from 'wp-api-response-modify'

import postJson from './../fixtures/wp-api-responses/post'
import Kasia from '../../src/index'
import normalise from '../../src/normalise'
import { ContentTypes } from '../../src/contentTypes'

import {
  createPostRequest,
  completeRequest,
  failRequest
} from '../../src/actions'

function setup () {
  const { kasiaReducer } = Kasia({
    WP: new WP({ endpoint: '123' })
  })

  const rootReducer = combineReducers(kasiaReducer)
  const store = createStore(rootReducer)

  const initialState = {
    wordpress: {
      queries: {},
      entities: {}
    }
  }

  return { store, initialState }
}

describe('Reducer journey', () => {
  const { store, initialState } = setup()

  let queryId1 = 'mockId1'
  let queryId2 = 'mockId2'

  it('has initial state on store', () => {
    expect(store.getState()).toEqual(initialState)
  })

  it('does not modify store without action namespace', () => {
    store.dispatch({ type: 'someOtherNamespace/' })
    expect(store.getState()).toEqual(initialState)
  })

  it('can REQUEST_CREATE', () => {
    const action = createPostRequest(queryId1, {
      contentType: ContentTypes.Post,
      identifier: 16
    })

    store.dispatch(action)
  })

  it('can REQUEST_COMPLETE', () => {
    const entities = normalise([modify(postJson)], 'id')

    store.dispatch(completeRequest(queryId1, postJson))

    expect(store.getState().wordpress.entities).toEqual(entities)
  })

  it('can REQUEST_FAIL', () => {
    const action = createPostRequest(queryId2, {
      contentType: ContentTypes.Post,
      identifier: 16
    })

    store.dispatch(action)
    store.dispatch(failRequest(queryId2, new Error('Request failed')))

    expect(store.getState().wordpress.queries[queryId2]).toEqual({
      id: queryId2,
      complete: true,
      OK: false,
      error: 'Error: Request failed'
    })
  })
})
