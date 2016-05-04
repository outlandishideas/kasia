import ActionTypes from './ActionTypes'

export const fetchMenus = () =>
  ({ type: ActionTypes.REQUEST_MENUS })

export const fetchMenu = (id) =>
  ({ type: ActionTypes.REQUEST_MENU, id })

export const fetchThemeLocations = () =>
  ({ type: ActionTypes.REQUEST_LOCATIONS })

export const fetchThemeLocation = (id) =>
  ({ type: ActionTypes.REQUEST_LOCATION, id })
