import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import merge from 'lodash.merge'

// ---
// Configuration
// ---

const defaultConfig = {
  route: '/wp-json/menus'
}

const ActionTypes = {
  REQUEST_MENUS: 'pepperoni/REQUEST_MENUS',
  REQUEST_MENU: 'pepperoni/REQUEST_MENU',
  REQUEST_LOCATIONS: 'pepperoni/REQUEST_LOCATIONS',
  REQUEST_LOCATION: 'pepperoni/REQUEST_LOCATION',
  RECEIVE_DATA: 'pepperoni/RECEIVE_DATA'
}

const actionTypeNames = Object.keys(ActionTypes)

const routes = {
  [ActionTypes.REQUEST_MENUS]: '/menus',
  [ActionTypes.REQUEST_MENU]: '/menus/:id',
  [ActionTypes.REQUEST_LOCATIONS]: '/menu-locations',
  [ActionTypes.REQUEST_LOCATION]: '/menu-locations/:id'
}

// ---
// Action creators
// ---

export const fetchMenus = () =>
  ({ type: ActionTypes.REQUEST_MENUS })

export const fetchMenu = (id) =>
  ({ type: ActionTypes.REQUEST_MENU, id })

export const fetchThemeLocations = () =>
  ({ type: ActionTypes.REQUEST_MENU })

export const fetchThemeLocation = (id) =>
  ({ type: ActionTypes.REQUEST_MENU, id })

// ---
// Plugin
// ---

export default function (pluginConfig, pepperoniConfig) {
  const config = merge({},
    defaultConfig,
    pluginConfig
  )

  const reducer = {
    [ActionTypes.REQUEST_MENU]: (state, action) =>
        merge({}, state, { menus: { [action.id]: action.data }}),
    
    [ActionTypes.REQUEST_MENUS]: (state, action) =>
      merge({}, state, { menus: action.data }),
    
    [ActionTypes.REQUEST_LOCATION]: (state, action) =>
      merge({}, state, { menuLocations: { [action.id]: action.data }}),
    
    [ActionTypes.REQUEST_LOCATIONS]: (state, action) =>
      merge({}, state, { menuLocations: action.data })
  }

  const fetchResource = function* (action) {
    const { id } = action

    const preparedRoute = routes[action.type]
      .replace(':id', id || '')

    const endpoint = pepperoniConfig.host + pluginConfig.route + preparedRoute

    const { data } = yield fetch(endpoint)
      .then(response => response.json())
      .then(data => ({ data }))
      .catch(error => ({ data: { error }}))

    yield put({ type: ActionTypes.RECEIVE_DATA, dataType: action.type, data, id })
  }

  const sagas = [function* () {
    yield* takeEvery(
      action => actionTypeNames.indexOf(action.type) !== -1,
      fetchResource
    )
  }]

  return {
    name: 'menus',
    reducer,
    sagas,
    config
  }
}
