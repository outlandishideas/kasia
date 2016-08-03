import merge from 'lodash.merge'
import pickToArray from 'pick-to-array'

import normalise from './normalise'
import { ContentTypesWithoutId, deriveContentType } from './contentTypes'
import { Request } from './constants/ActionTypes'

/**
 * Pick all entity identifiers from a raw WP-API response.
 * @param {Object} data Raw WP-API JSON
 * @returns {Array} Entity identifiers
 */
export function pickEntityIds (data) {
  const entityIdentifiers = pickToArray(data, 'id')

  // Accommodate content types that do not have an `id` property
  data.forEach((entity) => {
    const type = deriveContentType(entity)
    if (ContentTypesWithoutId[type]) {
      entityIdentifiers.push(pickToArray(entity, 'slug'))
    }
  })

  return entityIdentifiers
}

// COMPLETE
// Place entity on the store; update query record
// The entities are normalised by the `keyEntitiesBy` parameter passed in during
// creation of the action fn, however entities are recorded in the query by their IDs
// (or slugs if they do not have an ID property) and resolved later within the HOC.
export const completeReducer = (keyEntitiesBy) => (state, action) => {
  const data = action.data instanceof Array ? action.data : [action.data]
  const entities = normalise(data, keyEntitiesBy)

  return merge({}, state, {
    entities,
    queries: {
      [action.id]: {
        id: action.id,
        entities: pickEntityIds(data),
        paging: action.data._paging || false,
        complete: true,
        OK: true
      }
    }
  })
}

// FAIL
// Update query record only
export const failReducer = (state, action) => {
  return merge({}, state, {
    queries: {
      [action.id]: {
        id: action.id,
        error: String(action.error),
        complete: true,
        OK: false
      }
    }
  })
}

/**
 * Make the reducer for Kasia.
 * @param {Object} options Options object
 * @param {Object} plugins Plugin configurations, e.g. sagas/config
 * @returns {Object} Kasia reducer
 */
export default function makeReducer (options, plugins) {
  const { keyEntitiesBy } = options

  const reducer = merge({}, plugins.reducers, {
    [Request.Complete]: completeReducer(keyEntitiesBy),
    [Request.Fail]: failReducer
  })

  const initialState = {
    // Record query requests to the WP-API here
    queries: {},
    // Entities are normalised and stored here
    entities: {}
  }

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
