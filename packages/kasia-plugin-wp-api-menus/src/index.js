/* global fetch:false */

import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import merge from 'lodash.merge'

import ActionTypes, { ActionTypeNamespace } from './ActionTypes'

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

  const preparedRoute = routes[action.type.replace(ActionTypeNamespace, '')]
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
    [ActionTypes.RECEIVE_DATA]: (state, action) => {
      switch (action.dataType) {
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

  const sagas = [function * () {
    yield * takeEvery(
      action => action.type.replace(ActionTypeNamespace, '') === ActionTypes.RECEIVE_DATA,
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
