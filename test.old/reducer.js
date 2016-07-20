/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import { combineReducers, createStore } from 'redux'

import postJson from './fixtures/wp-api-responses/post'
import ContentTypes from '../src/constants/ContentTypes'
import Pepperoni, { defaultConfig } from '../src/index'
import { baseState } from '../src/reducer'
import { normalise } from '../src/normalise'
import { completeRequest } from '../src/creators'

const { pepperoniReducer } = Pepperoni({ host: 'test' })
const rootReducer = combineReducers(pepperoniReducer)
const store = createStore(rootReducer)

baseState.config = defaultConfig
baseState.config.host = 'test'

describe('Reducer basics', () => {
  const initialStore = { wordpress: baseState }

  it('has namespaced "wordpress" object on store', () => {
    expect(store.getState()).toEqual(initialStore)
  })

  it('does not modify store if action type is not namespaced "pepperoni"', () => {
    store.dispatch({ type: 'someOtherNamespace/' })
    expect(store.getState()).toEqual(initialStore)
  })
})

describe('Reduce REQUEST_COMPLETE', () => {
  it('normalises the WP-API response and places result in the store', () => {
    const normalisedData = normalise(ContentTypes.POST, postJson, 'id')
    store.dispatch(completeRequest(ContentTypes.POST, postJson))
    expect(store.getState().wordpress.entities).toEqual(normalisedData.entities)
  })
})
