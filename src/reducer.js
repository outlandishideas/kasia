import merge from 'lodash.merge'

import normalise from './normalise'
import { REQUEST, INVALIDATE } from './ActionTypes'
import { getContentType } from './contentTypes'

const initialState = {
  _queries: {},
  entities: {}
}

export default function makeReducer (options, pluginReducers = []) {
  const { entityKeyPropName } = options

  const reducer = merge({}, pluginReducers, {
    // On `REQUEST.Put`: place a record of the query in the store
    [REQUEST.Put]: (state, action) => {
      return merge({}, state, {
        _queries: {
          [action.id]: {
            complete: false,
            OK: null,
            id: action.id,
            contentType: action.contentType
          }
        }
      })
    },
    // On `REQUEST.Complete`: place entity on the store, update query record
    [REQUEST.Complete]: (state, action) => {
      const contentType = state._queries[action.id].contentType
      const contentTypeOptions = getContentType(contentType)
      const normalisedData = normalise(contentTypeOptions, action.data, entityKeyPropName)

      return merge({}, state, {
        entities: normalisedData.entities,
        _queries: {
          [action.id]: {
            complete: true,
            OK: true
          }
        }
      })
    },
    // On `REQUEST.Fail`: update query record only
    [REQUEST.Fail]: (state, action) => {
      return merge({}, state, {
        _queries: {
          [action.id]: {
            complete: true,
            OK: false
          }
        }
      })
    }
  })

  return {
    wordpress: function pepperoniReducer (state = initialState, action) {
      const [ actionNamespace ] = action.type.split('/')

      if (actionNamespace === 'pepperoni' && action.type in reducer) {
        return reducer[action.type](state, action)
      }

      return state
    }
  }
}
