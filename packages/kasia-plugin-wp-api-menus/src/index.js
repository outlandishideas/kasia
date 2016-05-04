/* global fetch:false */

import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import merge from 'lodash.merge'

import ActionTypes from './ActionTypes'

const defaultConfig = {
  route: '/wp-json/menus'
}

const routes = {
  [ActionTypes.REQUEST_MENUS]: '/menus',
  [ActionTypes.REQUEST_MENU]: '/menus/:id',
  [ActionTypes.REQUEST_LOCATIONS]: '/menu-locations',
  [ActionTypes.REQUEST_LOCATION]: '/menu-locations/:id'
}

function * doFetch (endpoint) {
  yield fetch(endpoint)
    .then(response => response.json())
    .then(data => ({ data }))
    .catch(error => ({ data: { error } }))
}

export function * fetchResource (action, pepperoniConfig, pluginConfig) {
  const { id } = action

  const preparedRoute = routes[action.type]
    .replace(':id', id || '')

  const endpoint = [pepperoniConfig.host, pluginConfig.route, preparedRoute].join('/');

  const { data } = yield call(doFetch, endpoint)

  yield put({ type: ActionTypes.RECEIVE_DATA, dataType: action.type, data, id })
}

export default function (pluginConfig, pepperoniConfig) {
  const config = merge({},
    defaultConfig,
    pluginConfig
  )

  const reducer = {
    [ActionTypes.REQUEST_MENU]: (state, action) =>
      merge({}, state, { menus: { [action.id]: action.data } }),

    [ActionTypes.REQUEST_MENUS]: (state, action) =>
      merge({}, state, { menus: action.data }),

    [ActionTypes.REQUEST_LOCATION]: (state, action) =>
      merge({}, state, { menuLocations: { [action.id]: action.data } }),

    [ActionTypes.REQUEST_LOCATIONS]: (state, action) =>
      merge({}, state, { menuLocations: action.data })
  }

  const sagas = [function * () {
    yield * takeEvery(
      action => action.type === ActionTypes.RECEIVE_DATA,
      fetchResource, pepperoniConfig, pluginConfig
    )
  }]

  return {
    name: 'menus',
    reducer,
    sagas,
    config
  }
}
