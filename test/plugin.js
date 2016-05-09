/* eslint-env jasmine */
/* global jest:false */

jest.disableAutomock()

import merge from 'lodash.merge'

import configureStore from './util/configureStore'

let didHitPluginReducer = false

const testPluginName = 'testPluginName'
const config = { foo: 'bar' }
const testActionType = 'pepperoni/TEST_ACTION'

const pluginSaga = jest.fn()

const pluginReducer = {
  [testActionType]: (action, state) => {
    didHitPluginReducer = true
    return state
  }
}

const plugin = (pluginConfig) => {
  return {
    name: testPluginName,
    reducer: pluginReducer,
    sagas: [pluginSaga],
    config: merge({}, config, pluginConfig)
  }
}

const { store, pepperoniSagas } = configureStore({
  host: 'test',
  plugins: [
    [plugin, { userPluginOption: true }]
  ]
})

describe('Pepperoni plugin', () => {
  it('should add plugin config to the default state', () => {
    const state = store.getState()
    expect(typeof state.wordpress.config.plugins[testPluginName]).toEqual('object')
    expect(state.wordpress.config.plugins[testPluginName].foo).toEqual('bar')
    expect(state.wordpress.config.plugins[testPluginName].userPluginOption).toEqual(true)
  })

  it('should call plugin reducer action handler when action type is matched', () => {
    store.dispatch({ type: testActionType })
    expect(didHitPluginReducer).toEqual(true)
  })

  it('should add the plugin saga to internal sagas array', () => {
    expect(pepperoniSagas.indexOf(pluginSaga)).toEqual(1)
  })
})
