/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import { combineReducers, createStore } from 'redux'
import WP from 'wpapi'

import Kasia from '../src'

const testActionType = 'kasia/TEST_ACTION'

let didHitPluginReducer = false

function pluginSaga () {}

const pluginReducer = {
  [testActionType]: (action, state) => {
    didHitPluginReducer = true
    return state
  }
}

const plugin = () => {
  return {
    reducers: pluginReducer,
    sagas: [pluginSaga]
  }
}

function setup () {
  const { kasiaReducer, kasiaSagas } = Kasia({
    WP: new WP({ endpoint: 'http://localhost' }),
    plugins: [plugin]
  })

  const rootReducer = combineReducers(kasiaReducer)
  const store = createStore(rootReducer)

  return { store, kasiaSagas }
}

describe('Plugin', () => {
  const { store, kasiaSagas } = setup()

  it('should call plugin action handler when type is matched', () => {
    store.dispatch({ type: testActionType })
    expect(didHitPluginReducer).toEqual(true)
  })

  it('should add the plugin saga to sagas array', () => {
    expect(kasiaSagas.indexOf(pluginSaga)).toEqual(1)
  })
})
