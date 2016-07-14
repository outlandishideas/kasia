import merge from 'lodash.merge'

import Plurality from './constants/Plurality'
import { normalise, normaliseFailed } from './normalise'
import { REQUEST, INVALIDATE } from './constants/ActionTypes'

export const baseState = {
  entities: {},
  failedEntities: {},
  config: {}
}

export default function makeReducer (config, plugins) {
  const { contentTypes, entityKeyPropName } = config

  const initialState = merge({},
    baseState,
    { config }
  )

  const pluginReducers = plugins
    .reduce((obj, plugin) => merge(obj, plugin.reducer), {})

  const reducer = merge({}, pluginReducers, {
    [REQUEST.COMPLETE]: (state, action) => {
      const contentTypeOptions = contentTypes[action.contentType]
      const normalisedData = normalise(contentTypeOptions, action.data, entityKeyPropName)
      return merge({}, state, { entities: normalisedData.entities })
    },
    [REQUEST.FAIL]: (state, action) => {
      const contentTypeOptions = contentTypes[action.contentType]
      const normalisedData = normaliseFailed(contentTypeOptions, entityKeyPropName, action.subject, action.error)
      return merge({}, state, { failedEntities: normalisedData.entities })
    },
    [INVALIDATE]: (state, action) => {
      const namePlural = contentTypes[action.contentType].name[Plurality.PLURAL]
      delete state.entities[namePlural][action.id]
      return merge({}, state)
    }
  })

  return {
    wordpress: function pepperoniReducer (state = initialState, action) {
      const [actionNamespace] = action.type.split('/')

      if (actionNamespace !== 'pepperoni') {
        return state
      }

      if (action.type in reducer) {
        return reducer[action.type](state, action)
      }

      return state
    }
  }
}
