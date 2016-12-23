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
 * Merge all native and plugin reducers such that a single
 * function reduces for a single action type.
 * @param {Object} options Consumer options object
 * @param {Object} plugins Merged plugin configurations
 * @returns {Object} Reducer object
 */
function mergeNativeAndThirdPartyReducers (options, plugins) {
  const normaliseData = (data) => normalise(data, options.keyEntitiesBy)

  const baseReducer = {
    [ActionTypes.RequestComplete]: [completeReducer(normaliseData)],
    [ActionTypes.RequestFail]: [failReducer],
    [ActionTypes.DeleteQueries]: [deleteReducer]
  }

  // Group reducers by their action type
  const reducersByActionType = Object.keys(plugins.reducers)
    .reduce(function groupByActionType (reducer, actionType) {
      reducer[actionType] = [].concat(reducer[actionType] || [], plugins.reducers[actionType] || [])
      return reducer
    }, baseReducer)

  // Produce a single function for each action type
  return Object.keys(reducersByActionType)
    .reduce(function collapseToAggregateReducerFn (reducer, actionType) {
      if (reducersByActionType[actionType].length > 1) {
        // Call each reducer function in succession, passing the state returned from each to the next
        reducer[actionType] = (state, action) => {
          return reducersByActionType[actionType].reduce((state, fn) => fn(state, action), state)
        }
      } else {
        // Take the first and only function as the whole reducer
        reducer[actionType] = reducersByActionType[actionType][0]
      }
      return reducer
    }, {})
}

// COMPLETE
// Place entity on the store; update query record
export function completeReducer (normalise) {
  return (state, action) => merge({}, state, {
    wordpress: {
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
    }
  })
}

// FAIL
// Update query record only
export function failReducer (state, action) {
  return merge({}, state, {
    wordpress: {
      queries: {
        [action.id]: {
          id: action.id,
          error: String(action.error),
          prepared: __IS_NODE__,
          complete: true,
          OK: false
        }
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

  return merge({}, state, {
    wordpress: { queries }
  })
}

/**
 * Create the aggregate reducer for an instance of Kasia.
 * @param {Object} options Options object
 * @param {Object} plugins Plugin configurations
 * @returns {Object} Kasia reducer
 */
export default function createReducer (options, plugins) {
  const reducer = mergeNativeAndThirdPartyReducers(options, plugins)

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
