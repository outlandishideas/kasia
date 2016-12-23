/* global jest:false */

jest.disableAutomock()

jest.mock('redux-saga')

import { combineReducers, createStore } from 'redux'
import Wpapi from 'wpapi'

import postJson from '../__fixtures__/wp-api-responses/post'
import initialState from '../__mocks__/states/initial'

import Kasia from '../../src/Kasia'
import { normalise, pickEntityIds } from '../../src/util'
import { ContentTypes } from '../../src/constants/ContentTypes'
import { createPostRequest, completeRequest, failRequest } from '../../src/redux/actions'

function setup () {
  const WP = new Wpapi({ endpoint: '123' })
  const { kasiaReducer } = Kasia({ WP })
  const rootReducer = combineReducers(kasiaReducer, {
    someOtherNamespace: () => ({}) // Should never get hit
  })
  const store = createStore(rootReducer)
  return { store, initialState }
}

describe('redux/reducer journey', () => {
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

  describe('can REQUEST_COMPLETE', () => {
    it('places normalised data on store', () => {
      store.dispatch(completeRequest({
        id: 0,
        data: postJson
      }))

      const expected = normalise(postJson, 'id')
      const actual = store.getState().wordpress.entities

      console.log(actual)

      expect(actual).toEqual(expected)
    })

    it('places query on store', () => {
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

    const expected = { id: 1, complete: true, OK: false, error: 'Error: Request failed', prepared: true }
    const actual = store.getState().wordpress.queries[1]

    expect(actual).toEqual(expected)
  })
})
