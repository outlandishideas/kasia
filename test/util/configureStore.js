/* global jest:false */

jest.disableAutomock()

import merge from 'lodash.merge'
import { combineReducers, createStore } from 'redux'

import Pepperoni from '../../src/index'

export default function configureStore (options) {
  const interceptReducer = jest.fn()
  const pepperoniReducer = Pepperoni(options)

  interceptReducer.mockReturnValue({})

  const rootReducer = combineReducers({
    intercept: interceptReducer,
    ...pepperoniReducer
  })

  const store = createStore(rootReducer)
  const initialState = merge({}, store)

  return {
    interceptReducer,
    store,
    initialState
  }
}
