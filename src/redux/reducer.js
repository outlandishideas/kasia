import merge from 'lodash.merge'

import ActionTypes from '../constants/ActionTypes'
import pickEntityIds from '../util/pickEntityIds'
import normalise from '../normalise'

export const INITIAL_STATE = {
  // Record query requests to the WP-API here
  queries: {},
  // Entities are normalised and stored here
  entities: {}
}

// COMPLETE
// Place entity on the store; update query record
export const completeReducer = (normalise) => {
  return (state, action) => merge({}, state, ({
    wordpress: {
      entities: {
        ...state.entities,
        ...normalise(action.data)
      },
      queries: {
        [action.id]: {
          id: action.id,
          entities: pickEntityIds(action.data),
          paging: action.data._paging || null,
          prepared: action.prepared,
          complete: true,
          OK: true
        }
      }
    }
  }))
}

// FAIL
// Update query record only
export const failReducer = (state, action) => {
  return merge({}, state, {
    wordpress: {
      queries: {
        [action.id]: {
          id: action.id,
          error: String(action.error),
          prepare: action.prepared,
          complete: true,
          OK: false
        }
      }
    }
  })
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
