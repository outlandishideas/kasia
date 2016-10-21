import merge from 'lodash.merge'
import pickToArray from 'pick-to-array'

import { ContentTypesWithoutId } from '../constants/ContentTypes'
import contentTypes from '../util/contentTypes'
import ActionTypes from '../constants/ActionTypes'
import normalise from '../normalise'

export const INITIAL_STATE = {
  // Record query requests to the WP-API here
  queries: {},
  // Entities are normalised and stored here
  entities: {}
}

/**
 * Pick all entity identifiers from a raw WP-API response.
 * @param {Object} data Raw WP-API JSON
 * @returns {Array} Entity identifiers
 */
export function pickEntityIds (data) {
  const entityIdentifiers = pickToArray(data, 'id')

  // Accommodate content types that do not have an `id` property
  data.forEach((entity) => {
    const type = contentTypes.derive(entity)
    if (ContentTypesWithoutId[type]) {
      entityIdentifiers.push(...pickToArray(entity, 'slug'))
    }
  })

  return entityIdentifiers
}

// COMPLETE
// Place entity on the store; update query record
export const completeReducer = (normaliseData) => (state, action) => {
  const data = [].concat(action.data)
  const queryId = action.id

  return ({
    entities: normaliseData(data),
    queries: {
      [queryId]: {
        id: queryId,
        entities: pickEntityIds(data),
        paging: action.data._paging || null,
        prepared: action.prepared,
        complete: true,
        OK: true
      }
    }
  })
}

// FAIL
// Update query record only
export const failReducer = (state, action) => ({
  queries: {
    [action.id]: {
      id: action.id,
      error: String(action.error),
      prepare: action.prepared,
      complete: true,
      OK: false
    }
  }
})

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
    [ActionTypes.RequestComplete]: completeReducer(normaliseData),
    [ActionTypes.RequestFail]: failReducer
  })

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
