import merge from 'lodash.merge'
import isNode from 'is-node-fn'

import ActionTypes from '../constants/ActionTypes'
import { pickEntityIds, normalise } from '../util'

const __IS_NODE__ = isNode()

export const INITIAL_STATE = {
  // WP-API request/response metadata are stored here
  queries: {},
  // Entities are normalised and stored here
  entities: {}
}

/**
 * Merge all native and plugin reducers such that a single function reduces for a single action type.
 * @param {Object} plugins Merged plugin configurations
 * @param {Function} normaliser Function to normalise response data
 * @returns {Object} Reducer object
 */
function mergeNativeAndThirdPartyReducers (plugins, normaliser) {
  const baseReducer = {
    [ActionTypes.RequestComplete]: [completeReducer(normaliser)],
    [ActionTypes.RequestFail]: [failReducer],
    [ActionTypes.DeleteQueries]: [deleteReducer]
  }

  // Group reducers by their action type
  const reducersByActionType = Object.keys(plugins.reducers)
    .reduce(function groupByActionType (reducer, actionType) {
      reducer[actionType] = [].concat(reducer[actionType] || [], plugins.reducers[actionType] || [])
      return reducer
    }, baseReducer)

  const reducer = {}

  // Produce a single function for each action type
  for (const actionType in reducersByActionType) {
    if (reducersByActionType[actionType].length > 1) {
      // Call each reducer function in succession, passing the state returned from each to the next
      reducer[actionType] = (state, action) => {
        return reducersByActionType[actionType].reduce((state, fn) => fn(state, action), state)
      }
    } else {
      // Take the first and only function as the whole reducer
      reducer[actionType] = reducersByActionType[actionType][0]
    }
  }

  return reducer
}

// COMPLETE
// Place entity on the store; update query record
export function completeReducer (normalise) {
  return (state, action) => merge({}, state, {
    entities: Object.assign({},
      state.entities,
      normalise(action.data)
    ),
    queries: {
      [action.id]: {
        id: action.id,
        entities: pickEntityIds(action.data),
        paging: action.data._paging || {},
        prepared: __IS_NODE__,
        complete: true,
        OK: true
      }
    }
  })
}

// FAIL
// Update query record only
export function failReducer (state, action) {
  return merge({}, state, {
    queries: {
      [action.id]: {
        id: action.id,
        error: String(action.error),
        prepared: __IS_NODE__,
        complete: true,
        OK: false
      }
    }
  })
}

// DELETE QUERIES
// Remove query objects from `state.wordpress.queries`
export function deleteReducer (state, action) {
  const queries = Object
    .values(state.wordpress.queries)
    .reduce((queries, query) => {
      if (query.id in action.ids) return queries
      queries[query.id] = query
      return queries
    }, {})

  return merge({}, state, { queries })
}

/**
 * Create the aggregate reducer for an instance of Kasia.
 * @param {Object} options Options object
 * @param {Object} plugins Plugin configurations
 * @returns {Object} Kasia reducer
 */
export default function createReducer (options, plugins) {
  const normaliser = (data) => normalise(data, options.keyEntitiesBy)
  const reducer = mergeNativeAndThirdPartyReducers(plugins, normaliser)

  return {
    wordpress: function kasiaReducer (state = INITIAL_STATE, action) {
      const [ actionNamespace ] = action.type.split('/')

      if (actionNamespace === 'kasia' && action.type in reducer) {
        return reducer[action.type](state, action)
      }

      return state
    }
  }
}
