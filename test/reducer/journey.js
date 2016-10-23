/* global jest:false */

jest.disableAutomock()

import { combineReducers, createStore } from 'redux'
import WPapi from 'wpapi'
import modify from 'wp-api-response-modify'

import postJson from '../mocks/fixtures/wp-api-responses/post'
import initialState from '../mocks/states/initial'

import Kasia from '../../src/Kasia'
import normalise from '../../src/normalise'
import ContentTypes from '../../src/constants/ContentTypes'
import { createPostRequest, completeRequest, failRequest } from '../../src/redux/actions'

function setup () {
  const WP = new WPapi({ endpoint: '123' })
  const { kasiaReducer } = Kasia({ WP })
  const rootReducer = combineReducers(kasiaReducer)
  const store = createStore(rootReducer)
  return { store, initialState }
}

describe('Reducer journey', () => {
  const { store, initialState } = setup()

  it('has initial state on store', () => {
    expect(store.getState()).toEqual(initialState)
  })

  it('does not modify store without action namespace', () => {
    store.dispatch({ type: 'someOtherNamespace/' })
    expect(store.getState()).toEqual(initialState)
  })

  it('can REQUEST_CREATE', () => {
    store.dispatch(createPostRequest({
      contentType: ContentTypes.Post,
      identifier: 16
    }))
  })

  it('can REQUEST_COMPLETE', () => {
    const entities = normalise([modify(postJson)], 'id')

    store.dispatch(completeRequest({
      id: 0,
      data: postJson
    }))

    expect(store.getState().wordpress.entities).toEqual(entities)
  })

  it('can REQUEST_FAIL', () => {
    store.dispatch(createPostRequest({
      contentType: ContentTypes.Post,
      identifier: 16
    }))

    store.dispatch(failRequest({
      id: 1,
      error: new Error('Request failed')
    }))

    expect(store.getState().wordpress.queries[1]).toEqual({
      id: 1,
      complete: true,
      OK: false,
      error: 'Error: Request failed',
      target: null
    })
  })
})
