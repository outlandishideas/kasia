import merge from 'lodash.merge'
import isNode from 'is-node-fn'

import pickEntityIds from '../util/pick-entity-ids'
import normalise from '../util/normalise'
import { ActionTypes, PreloadQueryId } from '../constants'

export const INITIAL_STATE = {
  __nextQueryId: 0,
  __keyEntitiesBy: 'id',
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
    [ActionTypes.RequestComplete]: [createCompleteReducer(normaliser)],
    [ActionTypes.RequestFail]: [failReducer],
    [ActionTypes.RewindQueryCounter]: [rewindReducer],
    [ActionTypes.IncrementNextQueryId]: [incrementNextQueryIdReducer]
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
    if (!reducersByActionType.hasOwnProperty(actionType)) {
      continue
    }
    
    if (reducersByActionType[actionType].length > 1) {
      // Call each reducer function in succession, passing the state returned from each to the next
      reducer[actionType] = (state, action, kasiaPluginUtils) => {
        return reducersByActionType[actionType].reduce((state, fn) => {
          return fn(state, action, kasiaPluginUtils)
        }, state)
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
export function acknowledgeReducer (state, {request}) {
  return merge({}, state, {
    __nextQueryId: request.id + 1,
    queries: {
      [request.id]: {
        id: request.id,
        prepared: isNode(),
        complete: false,
        OK: null
      }
    }
  })
}

// COMPLETE
// Place entity on the store; update query record if for component (has an id)
export function createCompleteReducer (normalise) {
  return (state, {request}) => {
    const {__keyEntitiesBy: idAttribute} = state
    const query = state.queries[request.id]
    const newState = merge({}, state)

    if (request.id !== PreloadQueryId && !query) {
      console.log('[kasia] ignoring attempt to complete non-existent request:', request)
      return newState
    }

    const mergeInNormalised = () => {
      newState.entities = merge(
        newState.entities,
        normalise(request.result, {idAttribute})
      )
    }

    if (request.id === PreloadQueryId) {
      mergeInNormalised()
      return newState
    }

    const newQuery = {
      id: request.id,
      prepared: isNode(),
      complete: true,
      OK: true
    }

    if (query.preserve) {
      newQuery.result = request.result
      newQuery.paging = null
    } else {
      mergeInNormalised()
      newQuery.entities = pickEntityIds(request.result)
      newQuery.paging = request.result._paging || {}
    }

    newState.queries[request.id] = newQuery

    return newState
  }
}

// FAIL
// Update query record only
export function failReducer (state, {request}) {
  return merge({}, state, {
    queries: {
      [request.id]: {
        id: request.id,
        error: request.error,
        prepared: isNode(),
        complete: true,
        OK: false
      }
    }
  })
}

export function rewindReducer (state) {
  return merge({}, state, {
    __nextQueryId: 0
  })
}

export function incrementNextQueryIdReducer (state) {
  return merge({}, state, {
    __nextQueryId: state.__nextQueryId + 1
  })
}

/**
 * Create the aggregate reducer for an instance of Kasia.
 * @param {Object} keyEntitiesBy Entity property used as key in store
 * @param {Object} reducers Plugin reducers
 * @returns {Object} Kasia reducer
 */
export default function createReducer ({ keyEntitiesBy, reducers }) {
  const normaliser = (data) => normalise(data, {idAttribute: keyEntitiesBy})
  const reducer = mergeNativeAndThirdPartyReducers(reducers, normaliser)

  const initialState = Object.assign({},
    INITIAL_STATE,
    { __keyEntitiesBy: keyEntitiesBy }
  )

  return {
    wordpress: function kasiaReducer (state = initialState, action) {
      const [ actionNamespace ] = action.type.split('/')

      if (actionNamespace === 'kasia' && action.type in reducer) {
        return reducer[action.type](state, action, {
          normaliseEntities: normaliser
        })
      }

      return state
    }
  }
}
