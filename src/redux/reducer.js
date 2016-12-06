import merge from 'lodash.merge'
import isNode from 'is-node-fn'

import ActionTypes from '../constants/ActionTypes'
import pickEntityIds from '../util/pickEntityIds'
import normalise from '../util/normalise'

const __IS_NODE__ = isNode()

export const INITIAL_STATE = {
  // WP-API request/response metadata are stored here
  queries: {},
  // Entities are normalised and stored here
  entities: {}
}

// COMPLETE
// Place entity on the store; update query record
export const completeReducer = (normalise) => (state, action) => {
  return merge({}, state, ({
    wordpress: {
      entities: Object.assign({},
        state.entities,
        normalise(action.data)
      ),
      queries: {
        [action.id]: {
          id: action.id,
          entities: pickEntityIds(action.data),
          paging: action.data._paging || null,
          prepared: __IS_NODE__,
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
export const deleteReducer = (state, action) => {
  return merge({}, state, {
    wordpress: {
      queries: Object.values(state.wordpress.queries).reduce((queries, query) => {
        if (query.id in action.ids) return queries
        queries[query.id] = query
        return queries
      }, {})
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
  const normaliseData = (data) => normalise(data, options.index)

  const reducer = {
    ...plugins.reducers,
    [ActionTypes.RequestComplete]: completeReducer(normaliseData),
    [ActionTypes.RequestFail]: failReducer,
    [ActionTypes.DeleteQueries]: deleteReducer
  }

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
