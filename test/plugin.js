/* global jest:false */

jest.disableAutomock()

import WP from 'wpapi'
import { combineReducers, createStore } from 'redux'
import { spawn } from 'redux-saga/effects'

import Kasia from '../src/Kasia'

const testActionType = 'kasia/TEST_ACTION'

let didHitPluginReducer = false

function pluginSaga () {}

function setup () {
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

  const { kasiaReducer, kasiaSagas } = Kasia({
    WP: new WP({ endpoint: 'wow-so-much-endpoint' }),
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
    const actual = kasiaSagas.toString()
    const expected = spawn(pluginSaga).toString()
    expect(actual).toContain(expected)
  })
})
