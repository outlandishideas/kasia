import merge from 'lodash.merge'
import isNode from 'is-node-fn'

import pickEntityIds from '../util/pick-entity-ids'
import normalise from '../util/normalise'
import { ActionTypes } from '../constants'

export const INITIAL_STATE = {
  // WP-API request/response metadata are stored here
  queries: {},
  // Entities are normalised and stored here
  entities: {}
}

/**
 * Merge all native and plugin reducers such that a single function reduces for a single action type.
 * @param {Object} reducers Plugin reducers
 * @param {Function} normaliser Function to normalise response data
 * @returns {Object} Reducer object
 */
function mergeNativeAndThirdPartyReducers (reducers, normaliser) {
  const baseReducer = {
    [ActionTypes.RequestAck]: [acknowledgeReducer],
    [ActionTypes.RequestComplete]: [completeReducer(normaliser)],
    [ActionTypes.RequestFail]: [failReducer]
  }

  // Group reducers by their action type
  const reducersByActionType = Object.keys(reducers)
    .reduce(function groupByActionType (reducer, actionType) {
      reducer[actionType] = [].concat(
        reducer[actionType] || [],
        reducers[actionType] || []
      )
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

// ACKNOWLEDGE
// Place record of request on store
export function acknowledgeReducer (state, action) {
  return merge({}, state, {
    queries: {
      [action.id]: {
        id: action.id,
        prepared: isNode(),
        complete: false,
        OK: null
      }
    }
  })
}

// COMPLETE
// Place entity on the store; update query record if for component (has an id)
export function completeReducer (normalise) {
  return (state_, action) => {
    const state = merge({}, state_)
    const query = state.queries[action.id]

    // action.id === null when created via util/preloadQuery
    if (action.id !== null && !query) {
      throw new Error('cannot complete non-existent query')
    }

    state.entities = merge(
      state.entities,
      normalise(action.data)
    )

    // The action id would be null if the preloadQuery method has initiated
    // the completeRequest action as they do not need a query in the store
    // (there is no component to pick it up).
    if (typeof action.id === 'number') {
      let updated = {
        id: action.id,
        prepared: isNode(),
        complete: true,
        OK: true
      }

      if (query.preserve) {
        updated.result = action.data
        updated.paging = null
      } else {
        updated.entities = pickEntityIds(action.data)
        updated.paging = action.data._paging || {}
      }

      state.queries[action.id] = updated
    }

    return state
  }
}

// FAIL
// Update query record only
export function failReducer (state, action) {
  return merge({}, state, {
    queries: {
      [action.id]: {
        id: action.id,
        error: action.error,
        prepared: isNode(),
        complete: true,
        OK: false
      }
    }
  })
}

/**
 * Create the aggregate reducer for an instance of Kasia.
 * @param {Object} keyEntitiesBy Entity property used as key in store
 * @param {Object} reducers Plugin reducers
 * @returns {Object} Kasia reducer
 */
export default function createReducer ({ keyEntitiesBy, reducers }) {
  const normaliser = (data) => normalise(data, keyEntitiesBy)
  const reducer = mergeNativeAndThirdPartyReducers(reducers, normaliser)
  const initialState = Object.assign({}, INITIAL_STATE, { keyEntitiesBy })

  return {
    wordpress: function kasiaReducer (state = initialState, action) {
      const [ actionNamespace ] = action.type.split('/')

      if (actionNamespace === 'kasia' && action.type in reducer) {
        return reducer[action.type](state, action)
      }

      return state
    }
  }
}
