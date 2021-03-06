import { take, call, put } from 'redux-saga/effects'
import merge from 'lodash.merge'

import ActionTypes from './constants/ActionTypes'

export * from './actions'

export default kasiaPluginWpApiMenus

// The default wp-api-menus namespace in the WP-API.
const defaultRoute = 'wp-api-menus/v2'

// Set of action type names that is used to capture
// only actions of these type in the reducer.
const requestTypes = [
  ActionTypes.REQUEST_MENU,
  ActionTypes.REQUEST_MENUS,
  ActionTypes.REQUEST_LOCATION,
  ActionTypes.REQUEST_LOCATIONS
]

const reducer = {
  // RECEIVE DATA
  // Place data in the store according to the type of data that was requested.
  [ActionTypes.RECEIVE_DATA]: (state, action) => {
    switch (action.request) {
      case ActionTypes.REQUEST_MENU:
        return merge({}, state, { menus: { [action.id]: action.data } })
      case ActionTypes.REQUEST_MENUS:
        return merge({}, state, { menus: action.data })
      case ActionTypes.REQUEST_LOCATION:
        return merge({}, state, { menuLocations: { [action.id]: action.data } })
      case ActionTypes.REQUEST_LOCATIONS:
        return merge({}, state, { menuLocations: action.data })
      default:
        return state
    }
  }
}

/**
 * Perform the actual request for data from wp-api-menus.
 * @param {Object} WP Instance of `wpapi`
 * @param {Object} action Action object
 * @returns {Promise} Resolves to response data
 */
function fetch (WP, action) {
  switch (action.type) {
    case ActionTypes.REQUEST_MENU:
      return typeof action.id === 'string'
        ? WP.menus().slug(action.id).get()
        : WP.menus().id(action.id).get()
    case ActionTypes.REQUEST_MENUS:
      return WP.menus().get()
    case ActionTypes.REQUEST_LOCATION:
      return WP.locations().id(action.id).get()
    case ActionTypes.REQUEST_LOCATIONS:
      return WP.locations().get()
    default:
      throw new Error(`Unknown request type "${action.request}".`)
  }
}

/**
 * Produce the plugin's own sagas array.
 * A single saga that deals with requests for wp-api-menus data.
 * @param {Object} WP Instance of `wpapi`
 * @returns {Array} Array of sagas
 */
function makeSagas (WP) {
  return [function * fetchSaga () {
    while (true) {
      const action = yield take((action) => requestTypes.indexOf(action.type) !== -1)
      yield fetchResource(WP, action)
    }
  }]
}

/**
 * Orchestrate a request for wp-api-menus data.
 * @param {Object} WP Instance of `wpapi`
 * @param {Object} action Action object
 */
function * fetchResource (WP, action) {
  const { id, type } = action
  const data = yield call(fetch, WP, action)
  yield put({ type: ActionTypes.RECEIVE_DATA, request: type, data, id })
}

/**
 * Initialise the plugin, returning the plugins own reducer and sagas.
 * @param {Object} WP Instance of `wpapi`
 * @param {Object} config User's plugin configuration
 * @returns {Object} Plugin reducer and sagas
 */
function kasiaPluginWpApiMenus (WP, config) {
  config.route = config.route || defaultRoute

  WP.menus = WP.registerRoute(config.route, '/menus/(?P<id>)')
  WP.locations = WP.registerRoute(config.route, '/menu-locations/(?P<id>)')

  return {
    reducers: reducer,
    sagas: makeSagas(WP)
  }
}

kasiaPluginWpApiMenus.preload = function (WP, action) {
  return function * () {
    yield * fetchResource(WP, action)
  }
}
