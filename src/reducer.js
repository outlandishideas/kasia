import merge from 'lodash.merge'
import pickToArray from 'pick-to-array'

import { Request, SubtractPreparedQueries } from './constants/ActionTypes'
import { ContentTypesWithoutId, deriveContentType } from './contentTypes'
import normalise from './normalise'

function updateStateWithNextQueryId (state, action, stateUpdateFn) {
  const queryId = state._nextQueryId

  let _numPreparedQueries = action.prepared
    ? state._numPreparedQueries + 1
    : state._numPreparedQueries

  return merge({}, state, stateUpdateFn(queryId), {
    _numPreparedQueries,
    _nextQueryId: queryId + 1
  })
}

/**
 * Pick all entity identifiers from a raw WP-API response.
 * @param {Object} data Raw WP-API JSON
 * @returns {Array} Entity identifiers
 */
export function pickEntityIds (data) {
  let entityIdentifiers = pickToArray(data, 'id')

  // Accommodate content types that do not have an `id` property
  data.forEach((entity) => {
    const type = deriveContentType(entity)
    if (ContentTypesWithoutId[type]) {
      entityIdentifiers = entityIdentifiers.concat(pickToArray(entity, 'slug'))
    }
  })

  return entityIdentifiers
}

// COMPLETE
// Place entity on the store; update query record
export const completeReducer = (normaliseData) => (state, action) => {
  const data = [].concat(action.data)

  return updateStateWithNextQueryId(state, action, (queryId) => ({
    entities: normaliseData(data),
    queries: {
      [queryId]: {
        id: queryId,
        entities: pickEntityIds(data),
        paging: action.data._paging || null,
        complete: true,
        OK: true
      }
    }
  }))
}

// FAIL
// Update query record only
export const failReducer = (state, action) => {
  return updateStateWithNextQueryId(state, action, (queryId) => ({
    queries: {
      [queryId]: {
        id: queryId,
        error: String(action.error),
        complete: true,
        OK: false
      }
    }
  }))
}

// SUBTRACT PREPARED QUERIES
// Remove the first element of the prepared query IDs array
export const subtractPreparedQueries = (state) => {
  return merge({}, state, {
    _numPreparedQueries: state._numPreparedQueries - 1
  })
}

export const initialState = {
  // The next query identifier
  _nextQueryId: 0,
  // Query identifiers that were created by queries made on the server
  _numPreparedQueries: 0,
  // Record query requests to the WP-API here
  queries: {},
  // Entities are normalised and stored here
  entities: {}
}

/**
 * Make the reducer for Kasia.
 * @param {Object} options Options object
 * @param {Object} plugins Plugin configurations
 * @returns {Object} Kasia reducer
 */
export default function makeReducer (options, plugins) {
  const { keyEntitiesBy } = options

  const normaliseData = (data) => normalise(data, keyEntitiesBy)

  const reducer = merge({}, plugins.reducers, {
    [Request.Complete]: completeReducer(normaliseData),
    [Request.Fail]: failReducer,
    [SubtractPreparedQueries]: subtractPreparedQueries
  })

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
